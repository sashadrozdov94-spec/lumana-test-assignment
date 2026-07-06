import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ICharacter } from './app.service';

export interface CharacterFilter {
  name?: { $regex: string; $options: string };
}

@Injectable()
export class CharacterRepository {
  constructor(
    @InjectModel('Character') private readonly characterModel: Model<ICharacter>,
  ) {}

  async countAll(): Promise<number> {
    return this.characterModel.countDocuments();
  }

  async insertBatch(characters: Partial<ICharacter>[]): Promise<void> {
    await this.characterModel.insertMany(characters);
  }

  async findWithPagination(filter: CharacterFilter, skip: number, limit: number): Promise<ICharacter[]> {
    return this.characterModel.find(filter).skip(skip).limit(limit).exec();
  }

  async countWithFilter(filter: CharacterFilter): Promise<number> {
    return this.characterModel.countDocuments(filter);
  }
}