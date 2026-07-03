import { Controller, Get, Header, Query, Res } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { Response } from 'express';
import { ServiceBService } from './service-b.service';
import { SystemLog } from '@app/shared';
import { GrpcMethod } from '@nestjs/microservices';

@Controller()
export class ServiceBController {
  constructor(private readonly serviceBService: ServiceBService) {}

  /**
   * Microservice Event Observers (Subscribers)
   */
  @EventPattern('character_imported_event')
  async handleCharacterImport(@Payload() data: any): Promise<void> {
    await this.serviceBService.handleIncomingEvent(data);
  }

  @EventPattern('api_request_event')
  async handleApiRequest(@Payload() data: any): Promise<void> {
    await this.serviceBService.handleIncomingEvent(data);
  }

  /**
   * HTTP REST Endpoints
   */
  @Get('logs')
  async getLogs(
    @Query('type') type?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ): Promise<SystemLog[]> {
    return this.serviceBService.getLogs(type, startDate, endDate);
  }

  @Get('report/pdf')
  @Header('Content-Type', 'application/pdf')
  @Header('Content-Disposition', 'attachment; filename=report.pdf')
  async getReport(@Res() res: Response): Promise<void> {
    const pdfBuffer = await this.serviceBService.generatePdfReport();
    res.end(pdfBuffer);
  }
  /**
   * gRPC Endpoint 
   */
  @GrpcMethod('ReportService', 'GenerateReport')
  async generateReportGrpc(): Promise<{ pdfBuffer: Buffer }> {
    const pdfBuffer = await this.serviceBService.generatePdfReport();
    return { pdfBuffer };
  }
}