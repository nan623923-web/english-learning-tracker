import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Put,
  Query,
  Req,
} from '@nestjs/common';
import { NeedLogin } from '@lark-apaas/fullstack-nestjs-core';
import type { Request } from 'express';

import type {
  DeleteStudyCheckinResponse,
  StudyCheckinInput,
  StudyCheckinListResponse,
  StudyCheckinResponse,
} from '@shared/api.interface';

import { CheckinsService } from './checkins.service';

@Controller('api/checkins')
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @NeedLogin()
  @Get()
  async list(
    @Req() req: Request,
    @Query('year') year?: string,
  ): Promise<StudyCheckinListResponse> {
    const parsedYear: number | undefined = year
      ? Number.parseInt(year, 10)
      : undefined;
    return this.checkinsService.list(req.userContext.userId, parsedYear);
  }

  @NeedLogin()
  @Put(':studyDate')
  async save(
    @Req() req: Request,
    @Param('studyDate') studyDate: string,
    @Body() input: StudyCheckinInput,
  ): Promise<StudyCheckinResponse> {
    return this.checkinsService.save(
      req.userContext.userId,
      studyDate,
      input,
    );
  }

  @NeedLogin()
  @Delete(':id')
  async remove(
    @Req() req: Request,
    @Param('id') id: string,
  ): Promise<DeleteStudyCheckinResponse> {
    return this.checkinsService.remove(req.userContext.userId, id);
  }
}
