import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SharedService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  constructor(private readonly configService: ConfigService) {}

  async onModuleInit(): Promise<void> {
    const redisUrl = this.configService.get<string>('REDIS_URL') || 'redis://localhost:6379';

    this.client = createClient({
      url: redisUrl,
    });

    try {
      await this.client.connect();
    } catch (error) {}
  }

  async addTimeSeriesEntry(key: string, value: number): Promise<void> {
    if (!this.client?.isOpen) return;

    try {
      await this.client.sendCommand(['TS.ADD', key, '*', value.toString()]);
    } catch (error: any) {
      if (error.message?.includes('ERR TSDB: key does not exist')) {
        await this.client.sendCommand(['TS.CREATE', key]);
        await this.client.sendCommand(['TS.ADD', key, '*', value.toString()]);
      }
    }
  }

  async onModuleDestroy(): Promise<void> {
    if (this.client?.isOpen) {
      await this.client.disconnect();
    }
  }
}