import { Injectable, OnModuleInit } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model, Document } from 'mongoose';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { SharedService } from '@app/shared';

export interface ICharacter extends Document {
  id: number;
  name: string;
  status: string;
  species: string;
  type: string;
  heading: string;
  gender: string;
  origin: { name: string; url: string; };
  location: { name: string; url: string; };
  image: string;
  episode: string[];
  url: string;
  created: string;
}

export interface IApiResponse {
  info: { count: number; pages: number; next: string | null; prev: string | null; };
  results: ICharacter[];
}

@Injectable()
export class AppService implements OnModuleInit {
  private readonly filePath = path.join(process.cwd(), 'characters-data.json');

  constructor(
    @InjectModel('Character') private readonly characterModel: Model<ICharacter>,
    private readonly sharedService: SharedService
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.characterModel.countDocuments();
    if (count === 0) {
      await this.fetchAndSaveToFile();
      await this.parseAndInsertToMongo();
    }
  }

  private async fetchAndSaveToFile(): Promise<void> {
    let nextUrl: string | null = 'https://rickandmortyapi.com/api/character';
    const allCharacters: any[] = [];
    
    while (nextUrl) {
      try {
        const response = await axios.get<IApiResponse>(nextUrl);
        const { info, results } = response.data;
        allCharacters.push(...results);
        nextUrl = info.next;
        if (nextUrl) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error) {
        break;
      }
    }
    await fs.writeFile(this.filePath, JSON.stringify(allCharacters), 'utf8');
  }

  private async parseAndInsertToMongo(): Promise<void> {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf8');
      const characters = JSON.parse(fileContent);
      await this.characterModel.insertMany(characters);
    } catch (error) {
      throw error;
    }
  }

  async findAll(page: number, limit: number, name?: string) {
    const filter = name ? { name: { $regex: name, $options: 'i' } } : {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.characterModel.find(filter).skip(skip).limit(limit).exec(),
      this.characterModel.countDocuments(filter)
    ]);

    if (this.sharedService['client']?.isOpen) {
      // 1. Isolated TimeSeries execution. Failure here won't crash the event chain.
      try {
        await this.sharedService['client'].sendCommand([
          'TS.ADD', 'api:requests', '*', '1'
        ]);
      } catch (tsError) {
        // Suppressed: handles case where RedisTimeSeries module is missing
      }

      // 2. Isolated Microservice Event Publication.
      try {
        const logPayload = {
          type: 'SEARCH',
          message: `User executed search query with filter: ${name || 'none'}`,
          meta: { timestamp: Date.now() }
        };

        const nestJsMessageEnvelope = {
          pattern: 'api_request_event',
          data: logPayload
        };

        await this.sharedService['client'].publish('api_request_event', JSON.stringify(nestJsMessageEnvelope));
      } catch (pubSubError) {
      }
    }

    return {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
      data
    };
  }
}