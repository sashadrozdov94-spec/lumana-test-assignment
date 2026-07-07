import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { SystemLog } from '@app/shared';

export interface LogFilter {
  type?: string;
  createdAt?: { $gte?: Date; $lte?: Date };
}

@Injectable()
export class LogRepository {
  constructor(
    @InjectModel(SystemLog.name) private readonly logModel: Model<SystemLog>,
  ) {}

  async createLog(payload: Partial<SystemLog>): Promise<void> {
    await this.logModel.create(payload);
  }

  async findFilteredLogs(query: LogFilter): Promise<SystemLog[]> {
    return this.logModel.find(query).sort({ createdAt: -1 }).exec();
  }

  async findRecentSearchLogs(limit: number): Promise<SystemLog[]> {
    return this.logModel.find({ type: 'SEARCH' }).sort({ createdAt: -1 }).limit(limit).exec();
  }
}