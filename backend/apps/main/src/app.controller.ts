import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';

@Controller('characters')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getCharacters(
    @Query('page') page: string = '1',
    @Query('limit') limit: string = '20',
    @Query('name') name?: string,
  ) {
    return this.appService.findAll(Number(page), Number(limit), name);
  }
}