import { ConfigService } from '@nestjs/config';
import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import axios from 'axios';
import * as fs from 'fs/promises';
import * as path from 'path';
import { IApiResponse, ICharacter, SharedService } from '@app/shared';
import { CharacterRepository, CharacterFilter } from './character.repository';

@Injectable()
export class AppService implements OnModuleInit {
  private readonly filePath = path.join(process.cwd(), 'characters-data.json');
  private readonly logger = new Logger(AppService.name);

  constructor(
    private readonly characterRepository: CharacterRepository,
    private readonly sharedService: SharedService,
    private readonly configService: ConfigService
  ) {}

  async onModuleInit(): Promise<void> {
    const count = await this.characterRepository.countAll();
    if (count === 0) {
      await this.fetchAndSaveToFile();
      await this.parseAndInsertToMongo();
    }
  }

  private async fetchAndSaveToFile(): Promise<void> {
    let nextUrl: string | null = this.configService.get<string>('RICK_AND_MORTY_API_URL');
    const allCharacters: ICharacter[] = [];
    
    while (nextUrl) {
      try {
        const response = await axios.get<IApiResponse>(nextUrl);
        const { info, results } = response.data;
        allCharacters.push(...results);
        nextUrl = info.next;
        if (nextUrl) {
          await new Promise(resolve => setTimeout(resolve, 300));
        }
      } catch (error: any) {
        this.logger.error('Failed to fetch characters from external API', error.stack);
        break;
      }
    }
    await fs.writeFile(this.filePath, JSON.stringify(allCharacters), 'utf8');
  }

  private async parseAndInsertToMongo(): Promise<void> {
    try {
      const fileContent = await fs.readFile(this.filePath, 'utf8');
      const characters: ICharacter[] = JSON.parse(fileContent);
      await this.characterRepository.insertBatch(characters);
      this.logger.log('Successfully seeded MongoDB with character data');
    } catch (error: any) {
      this.logger.error('Failed to parse and insert data to MongoDB', error.stack);
      throw error;
    }
  }

  async findAll(page: number, limit: number, name?: string) {
    const filter: CharacterFilter = name ? { name: { $regex: name, $options: 'i' } } : {};
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.characterRepository.findWithPagination(filter, skip, limit),
      this.characterRepository.countWithFilter(filter)
    ]);

    if (this.sharedService['client']?.isOpen) {
      try {
        await this.sharedService['client'].sendCommand([
          'TS.ADD', 'api:requests', '*', '1'
        ]);
      } catch (tsError: any) {
        this.logger.error('Failed to add metric to Redis TimeSeries', tsError.stack);
      }

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
      } catch (pubSubError: any) {
        this.logger.error('Failed to publish search event to Redis', pubSubError.stack);
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

export { ICharacter };