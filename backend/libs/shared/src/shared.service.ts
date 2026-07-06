import { Injectable, OnModuleDestroy, OnModuleInit, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SharedService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;
  private readonly logger = new Logger(SharedService.name);

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

    this.client = createClient({
      url: redisUrl,
    });

    try {
      await this.client.connect();
      this.logger.log('Successfully connected to Redis instance');
    } catch (error: unknown) {
      const trace = error instanceof Error ? error.stack : String(error);
      this.logger.error('Failed to establish connection to Redis', trace);
    }
  }

  async addTimeSeriesEntry(key: string, value: number): Promise<void> {
    if (!this.client?.isOpen) return;

    try {
      await this.client.sendCommand(['TS.ADD', key, '*', value.toString()]);
    } catch (error: unknown) {
      const isKeyMissingError = error instanceof Error && error.message.includes('ERR TSDB: key does not exist');

      if (isKeyMissingError) {
        try {
          await this.client.sendCommand(['TS.CREATE', key]);
          await this.client.sendCommand(['TS.ADD', key, '*', value.toString()]);
        } catch (retryError: unknown) {
          const trace = retryError instanceof Error ? retryError.stack : String(retryError);
          this.logger.error(`Failed to create and push to TSDB key: ${key}`, trace);
        }
      } else {
        const trace = error instanceof Error ? error.stack : String(error);
        this.logger.error(`Redis TimeSeries command failed for key: ${key}`, trace);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.disconnect();
    }
  }
}