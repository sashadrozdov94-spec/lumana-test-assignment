import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class SharedService implements OnModuleInit, OnModuleDestroy {
  private client: RedisClientType;

  async onModuleInit(): Promise<void> {
    // Resolve correct internal Docker network hostname dynamically ('lumana-redis')
    const redisHost = process.env.REDIS_HOST || 'lumana-redis';
    const defaultRedisUrl = `redis://${redisHost}:6379`;

    this.client = createClient({
      url: process.env.REDIS_URL || defaultRedisUrl,
    });

    try {
      await this.client.connect();
    } catch (error) {
      // Fallback to localhost if running outside Docker in a hybrid development environment
      try {
        this.client = createClient({
          url: 'redis://localhost:6379',
        });
        await this.client.connect();
      } catch (fallbackError) {
        // Suppress fallback connection errors per criteria
      }
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