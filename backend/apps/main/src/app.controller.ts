import { Controller, Get, Query } from '@nestjs/common';
import { AppService } from './app.service';
import { PaginationQueryDto } from './dto/pagination.dto';

@Controller('characters')
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  async getCharacters(@Query() query: PaginationQueryDto) {
    return this.appService.findAll(query.page, query.limit, query.name);
  }
}