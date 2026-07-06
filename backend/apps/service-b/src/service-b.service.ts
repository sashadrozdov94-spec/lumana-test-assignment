import { Injectable, Logger } from '@nestjs/common';
import { SystemLog, SharedService, LogPayload, RedisTsItem } from '@app/shared';
import PDFDocument = require('pdfkit');
import { LogRepository, LogFilter } from '../log.repository';

@Injectable()
export class ServiceBService {
  private readonly logger = new Logger(ServiceBService.name);

  constructor(
    private readonly logRepository: LogRepository,
    private readonly sharedService: SharedService,
  ) {}

  async handleIncomingEvent(payload: LogPayload): Promise<void> {
    try {
      await this.logRepository.createLog(payload);
    } catch (error: any) {
      this.logger.error('Failed to save incoming log event to database', error.stack);
    }
  }

  async getLogs(type?: string, startDate?: string, endDate?: string): Promise<SystemLog[]> {
    const query: LogFilter = {};
    if (type) query.type = type;
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }
    return this.logRepository.findFilteredLogs(query);
  }

  async generatePdfReport(): Promise<Buffer> {
    const rawMetrics: RedisTsItem[] = [];

    if (this.sharedService['client']?.isOpen) {
      try {
        const tsResult = await this.sharedService['client'].sendCommand([
          'TS.REVRANGE', 'api:requests', '-', '+'
        ]) as Array<[string | number, string | number]>;

        if (tsResult && tsResult.length > 0) {
          tsResult.forEach(([ts, val]) => {
            rawMetrics.push({
              timestamp: parseInt(ts.toString(), 10),
              value: parseInt(val.toString(), 10)
            });
          });
        }
      } catch (e: any) {
        this.logger.warn('Could not fetch metrics from Redis TimeSeries, falling back to MongoDB logs', e.stack);
      }
    }

    if (rawMetrics.length === 0) {
      try {
        const backupLogs = await this.logRepository.findRecentSearchLogs(100);
        if (backupLogs && backupLogs.length > 0) {
          backupLogs.forEach(log => {
            const logDoc = log as SystemLog & { createdAt?: Date };
            rawMetrics.push({
              timestamp: logDoc.createdAt ? new Date(logDoc.createdAt).getTime() : Date.now(),
              value: 1
            });
          });
        }
      } catch (mongoError: any) {
        this.logger.error('Failed to retrieve backup logs from MongoDB', mongoError.stack);
      }
    }

    const metrics: RedisTsItem[] = [];
    if (rawMetrics.length > 0) {
      const timeBuckets = new Map<number, number>();

      rawMetrics.forEach(item => {
        const minuteBucket = Math.floor(item.timestamp / 60000) * 60000;
        timeBuckets.set(minuteBucket, (timeBuckets.get(minuteBucket) || 0) + item.value);
      });

      Array.from(timeBuckets.entries())
        .sort((a, b) => a[0] - b[0])
        .slice(-5)
        .forEach(([ts, count]) => {
          metrics.push({ timestamp: ts, value: count });
        });
    }

    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ size: 'A4', margin: 50 });
      const chunks: Buffer[] = [];

      doc.on('data', (chunk: Buffer) => chunks.push(chunk));
      doc.on('end', () => resolve(Buffer.concat(chunks)));
      doc.on('error', (err: Error) => reject(err));

      doc.fillColor('#0F172A').font('Helvetica-Bold').fontSize(24).text('System Analytics & Performance Report', 50, 50);
      doc.fillColor('#64748B').font('Helvetica').fontSize(10).text(`Generated on: ${new Date().toUTCString()}`, 50, 85, { align: 'right' });
      doc.moveTo(50, 110).lineTo(545, 110).strokeColor('#E2E8F0').lineWidth(1).stroke();
      doc.fillColor('#1E293B').font('Helvetica-Bold').fontSize(14).text('User Search Activity (Requests per Interval)', 50, 135);
      doc.fillColor('#475569').font('Helvetica').fontSize(10).text('This chart displays the exact number of character searches performed on the platform. Higher bars indicate peak user activity during those specific timeframes, helping teams easily track user engagement trends.', 50, 155, { width: 495 });

      if (metrics.length === 0) {
        doc.rect(50, 230, 495, 180).fill('#F8FAFC');
        doc.fillColor('#94A3B8').font('Helvetica-Bold').fontSize(12).text('No activity recorded yet. Start searching for characters on the website to generate data.', 50, 310, { width: 495, align: 'center' });
      } else {
        const chartX = 90;
        const chartY = 390;
        const chartWidth = 400;
        const chartHeight = 160;

        doc.lineWidth(1).strokeColor('#F1F5F9');
        for (let i = 0; i <= 4; i++) {
          const yGrid = chartY - (chartHeight / 4) * i;
          doc.moveTo(chartX, yGrid).lineTo(chartX + chartWidth, yGrid).stroke();
        }

        doc.moveTo(chartX, chartY).lineTo(chartX + chartWidth, chartY).strokeColor('#CBD5E1').lineWidth(1.5).stroke();

        const maxVal = Math.max(...metrics.map(m => m.value), 1);
        const barWidth = 38;
        const gap = (chartWidth - barWidth * metrics.length) / (metrics.length + 1);

        metrics.forEach((item, index) => {
          const x = chartX + gap + index * (barWidth + gap);
          const barHeight = (item.value / maxVal) * (chartHeight - 24);
          const y = chartY - barHeight;

          doc.rect(x, y, barWidth, barHeight).fill('#2563EB');

          const date = new Date(item.timestamp);
          const timeLabel = `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;

          doc.fillColor('#64748B').font('Helvetica').fontSize(8).text(timeLabel, x - 12, chartY + 10, { width: barWidth + 24, align: 'center' });
          doc.fillColor('#FFFFFF').font('Helvetica-Bold').fontSize(9).text(item.value.toString(), x, y + 4, { width: barWidth, align: 'center' });
        });
      }

      doc.end();
    });
  }
}