import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SharedService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit(): Promise<void> {
    // Connect to Redis container (using localhost for local dev)
    this.client = createClient({
      url: 'redis://localhost:6379',
    });

    try {
      await this.client.connect();
    } catch (error) {
    }
  }

  /**
   * Publishes a metric event to RedisTimeSeries using TS.ADD
   */
  async addTimeSeriesEntry(key: string, value: number): Promise<void> {
    if (!this.client?.isOpen) return;

    try {
      // TS.ADD key timestamp value. '*' means use current server timestamp
      await this.client.sendCommand(['TS.ADD', key, '*', value.toString()]);
    } catch (error: any) {
      // If the time series key doesn't exist, create it and retry
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