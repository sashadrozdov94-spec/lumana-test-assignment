import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Character } from '@app/shared';
import axios from 'axios';
import * as JSONStream from 'JSONStream';
import { pipeline } from 'stream/promises';

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class AppService implements OnModuleInit {
  private readonly API_URL = 'https://rickandmortyapi.com/api/character';
  private readonly BATCH_SIZE = 50;

  constructor(
    @InjectModel(Character.name) private readonly characterModel: Model<Character>,
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.characterModel.countDocuments();
    
    if (count === 0) {
      await this.downloadAndStreamData();
    }
  }

  private async downloadAndStreamData(): Promise<void> {
    try {
      const { data } = await axios.get(this.API_URL, { responseType: 'stream' });
      const jsonStream = JSONStream.parse('results.*');
      
      let batch: Partial<Character>[] = [];

      jsonStream.on('data', async (characterData: Partial<Character>) => {
        batch.push(characterData);

        if (batch.length >= this.BATCH_SIZE) {
          jsonStream.pause();
          await this.saveBatchToDB(batch);
          batch = [];
          jsonStream.resume();
        }
      });

      jsonStream.on('end', async () => {
        if (batch.length > 0) {
          await this.saveBatchToDB(batch);
        }
      });

      await pipeline(data, jsonStream);
    } catch (error) {
      // Intentionally suppressed logging per strict requirements
    }
  }

  private async saveBatchToDB(batch: Partial<Character>[]): Promise<void> {
    try {
      await this.characterModel.insertMany(batch, { ordered: false });
    } catch (error: any) {
      // Ignore E11000 duplicate key errors
      if (error.code !== 11000) {
        throw error;
      }
    }
  }

  /**
   * Retrieves a paginated list of characters.
   */
  async getCharacters(page: number, limit: number, search?: string): Promise<PaginatedResult<Character>> {
    const skip = (page - 1) * limit;
    
    // Utilize MongoDB $text search if search query is provided
    const query = search ? { $text: { $search: search } } : {};

    const [data, total] = await Promise.all([
      this.characterModel.find(query).skip(skip).limit(limit).exec(),
      this.characterModel.countDocuments(query),
    ]);

    return {
      data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }
}