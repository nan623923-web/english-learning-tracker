import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import {
  DRIZZLE_DATABASE,
  type PostgresJsDatabase,
} from '@lark-apaas/fullstack-nestjs-core';
import { and, asc, eq, gte, lte } from 'drizzle-orm';

import { studyCheckins } from '@server/database/schema';
import type {
  DeleteStudyCheckinResponse,
  StudyCheckin,
  StudyCheckinInput,
  StudyCheckinListResponse,
  StudyCheckinResponse,
} from '@shared/api.interface';

type StudyCheckinRow = typeof studyCheckins.$inferSelect;

@Injectable()
export class CheckinsService {
  private readonly logger: Logger = new Logger(CheckinsService.name);

  constructor(
    @Inject(DRIZZLE_DATABASE)
    private readonly db: PostgresJsDatabase,
  ) {}

  async list(
    ownerUserId: string,
    year?: number,
  ): Promise<StudyCheckinListResponse> {
    this.validateOwner(ownerUserId);
    if (year !== undefined && (year < 2000 || year > 2100)) {
      throw new BadRequestException('年份必须在 2000 到 2100 之间');
    }

    const rows: StudyCheckinRow[] = year === undefined
      ? await this.db
          .select()
          .from(studyCheckins)
          .where(eq(studyCheckins.ownerUserId, ownerUserId))
          .orderBy(asc(studyCheckins.studyDate))
      : await this.db
          .select()
          .from(studyCheckins)
          .where(
            and(
              eq(studyCheckins.ownerUserId, ownerUserId),
              gte(studyCheckins.studyDate, `${year}-01-01`),
              lte(studyCheckins.studyDate, `${year}-12-31`),
            ),
          )
          .orderBy(asc(studyCheckins.studyDate));

    const items: StudyCheckin[] = rows.map(
      (row: StudyCheckinRow): StudyCheckin => this.toApiItem(row),
    );
    return { items };
  }

  async save(
    ownerUserId: string,
    studyDate: string,
    input: StudyCheckinInput,
  ): Promise<StudyCheckinResponse> {
    this.validateOwner(ownerUserId);
    this.validateInput(studyDate, input);
    const now: Date = new Date();
    const values: typeof studyCheckins.$inferInsert = {
      ownerUserId,
      studyDate,
      friendsMinutes: input.friendsMinutes,
      readingMinutes: input.readingMinutes,
      otherMinutes: input.otherMinutes,
      friendsProgress: this.normalizeText(input.friendsProgress),
      bookTitle: this.normalizeText(input.bookTitle),
      readingProgress: this.normalizeText(input.readingProgress),
      takeaway: this.normalizeText(input.takeaway),
      notes: this.normalizeText(input.notes),
      updatedAt: now,
    };

    try {
      const rows: StudyCheckinRow[] = await this.db
        .insert(studyCheckins)
        .values(values)
        .onConflictDoUpdate({
          target: [studyCheckins.ownerUserId, studyCheckins.studyDate],
          set: {
            friendsMinutes: input.friendsMinutes,
            readingMinutes: input.readingMinutes,
            otherMinutes: input.otherMinutes,
            friendsProgress: this.normalizeText(input.friendsProgress),
            bookTitle: this.normalizeText(input.bookTitle),
            readingProgress: this.normalizeText(input.readingProgress),
            takeaway: this.normalizeText(input.takeaway),
            notes: this.normalizeText(input.notes),
            updatedAt: now,
          },
        })
        .returning();
      const row: StudyCheckinRow | undefined = rows[0];
      if (!row) {
        throw new Error('保存打卡后未返回记录');
      }
      return { item: this.toApiItem(row) };
    } catch (error: unknown) {
      this.logger.error(
        `保存英语学习打卡失败: ${error instanceof Error ? error.stack : String(error)}`,
      );
      throw error;
    }
  }

  async remove(
    ownerUserId: string,
    id: string,
  ): Promise<DeleteStudyCheckinResponse> {
    this.validateOwner(ownerUserId);
    const rows: Array<{ id: string }> = await this.db
      .delete(studyCheckins)
      .where(
        and(
          eq(studyCheckins.id, id),
          eq(studyCheckins.ownerUserId, ownerUserId),
        ),
      )
      .returning({ id: studyCheckins.id });
    if (rows.length === 0) {
      throw new NotFoundException('打卡记录不存在');
    }
    return { success: true };
  }

  private validateOwner(ownerUserId: string): void {
    if (!ownerUserId) {
      throw new BadRequestException('无法识别当前用户');
    }
  }

  private validateInput(
    studyDate: string,
    input: StudyCheckinInput,
  ): void {
    if (!/^\d{4}-\d{2}-\d{2}$/u.test(studyDate)) {
      throw new BadRequestException('日期格式必须为 YYYY-MM-DD');
    }
    const date: Date = new Date(`${studyDate}T00:00:00+08:00`);
    if (Number.isNaN(date.getTime())) {
      throw new BadRequestException('日期无效');
    }
    const minutes: number[] = [
      input.friendsMinutes,
      input.readingMinutes,
      input.otherMinutes,
    ];
    const invalidMinutes: boolean = minutes.some(
      (value: number): boolean =>
        !Number.isInteger(value) || value < 0 || value > 1440,
    );
    if (invalidMinutes) {
      throw new BadRequestException('学习时长必须是 0 到 1440 的整数');
    }
    const totalMinutes: number = minutes.reduce(
      (total: number, value: number): number => total + value,
      0,
    );
    if (totalMinutes <= 0) {
      throw new BadRequestException('请至少填写 1 分钟学习时长');
    }
  }

  private normalizeText(value?: string): string | null {
    const normalized: string = value?.trim() ?? '';
    return normalized.length > 0 ? normalized : null;
  }

  private toApiItem(row: StudyCheckinRow): StudyCheckin {
    return {
      id: row.id,
      studyDate: row.studyDate,
      friendsMinutes: row.friendsMinutes,
      readingMinutes: row.readingMinutes,
      otherMinutes: row.otherMinutes,
      friendsProgress: row.friendsProgress,
      bookTitle: row.bookTitle,
      readingProgress: row.readingProgress,
      takeaway: row.takeaway,
      notes: row.notes,
      createdAt: row.createdAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
    };
  }
}
