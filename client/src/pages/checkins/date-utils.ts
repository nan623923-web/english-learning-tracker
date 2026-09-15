import type { StudyCheckin } from '@shared/api.interface';

export interface DashboardStats {
  totalDays: number;
  totalMinutes: number;
  peakMinutes: number;
  peakDate: string | null;
  currentStreak: number;
  longestStreak: number;
}

export interface HeatmapCell {
  date: string;
  inYear: boolean;
  totalMinutes: number;
  intensity: number;
  checkin: StudyCheckin | null;
}

export interface HeatmapWeek {
  key: string;
  cells: HeatmapCell[];
}

export interface MonthMarker {
  label: string;
  column: number;
}

const DAY_MS: number = 86_400_000;

export function toDateString(date: Date): string {
  const year: number = date.getUTCFullYear();
  const month: string = String(date.getUTCMonth() + 1).padStart(2, '0');
  const day: string = String(date.getUTCDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function fromDateString(date: string): Date {
  return new Date(`${date}T00:00:00Z`);
}

export function shiftDate(date: string, amount: number): string {
  const value: Date = fromDateString(date);
  value.setUTCDate(value.getUTCDate() + amount);
  return toDateString(value);
}

export function getShanghaiToday(): string {
  const parts: Intl.DateTimeFormatPart[] = new Intl.DateTimeFormat('en-US', {
    timeZone: 'Asia/Shanghai',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).formatToParts(new Date());
  const getPart = (type: Intl.DateTimeFormatPartTypes): string =>
    parts.find((part: Intl.DateTimeFormatPart): boolean => part.type === type)
      ?.value ?? '';
  return `${getPart('year')}-${getPart('month')}-${getPart('day')}`;
}

export function formatDisplayDate(date: string): string {
  const value: Date = fromDateString(date);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'short',
    day: 'numeric',
    weekday: 'short',
    timeZone: 'UTC',
  }).format(value);
}

export function totalMinutes(checkin: StudyCheckin): number {
  return checkin.friendsMinutes
    + checkin.readingMinutes
    + checkin.otherMinutes;
}

export function getIntensity(minutes: number): number {
  if (minutes <= 0) return 0;
  if (minutes <= 20) return 1;
  if (minutes <= 45) return 2;
  if (minutes <= 90) return 3;
  return 4;
}

export function calculateStats(items: StudyCheckin[]): DashboardStats {
  const activeItems: StudyCheckin[] = items.filter(
    (item: StudyCheckin): boolean => totalMinutes(item) > 0,
  );
  const sortedDates: string[] = activeItems
    .map((item: StudyCheckin): string => item.studyDate)
    .sort((a: string, b: string): number => a.localeCompare(b));
  const uniqueDates: string[] = Array.from(new Set<string>(sortedDates));
  let longestStreak: number = uniqueDates.length > 0 ? 1 : 0;
  let runningStreak: number = longestStreak;
  for (let index: number = 1; index < uniqueDates.length; index += 1) {
    runningStreak = uniqueDates[index] === shiftDate(uniqueDates[index - 1], 1)
      ? runningStreak + 1
      : 1;
    longestStreak = Math.max(longestStreak, runningStreak);
  }

  const latestDate: string | undefined = uniqueDates.at(-1);
  const today: string = getShanghaiToday();
  const currentEligible: boolean = latestDate === today
    || latestDate === shiftDate(today, -1);
  let currentStreak: number = currentEligible && latestDate ? 1 : 0;
  if (currentEligible && latestDate) {
    let cursor: string = latestDate;
    for (let index: number = uniqueDates.length - 2; index >= 0; index -= 1) {
      if (uniqueDates[index] !== shiftDate(cursor, -1)) break;
      currentStreak += 1;
      cursor = uniqueDates[index];
    }
  }

  let peakMinutes: number = 0;
  let peakDate: string | null = null;
  let accumulatedMinutes: number = 0;
  activeItems.forEach((item: StudyCheckin): void => {
    const minutes: number = totalMinutes(item);
    accumulatedMinutes += minutes;
    if (minutes > peakMinutes) {
      peakMinutes = minutes;
      peakDate = item.studyDate;
    }
  });

  return {
    totalDays: uniqueDates.length,
    totalMinutes: accumulatedMinutes,
    peakMinutes,
    peakDate,
    currentStreak,
    longestStreak,
  };
}

export function buildHeatmap(
  year: number,
  items: StudyCheckin[],
): { weeks: HeatmapWeek[]; monthMarkers: MonthMarker[] } {
  const itemMap: Map<string, StudyCheckin> = new Map(
    items.map(
      (item: StudyCheckin): [string, StudyCheckin] => [item.studyDate, item],
    ),
  );
  const yearStart: Date = new Date(Date.UTC(year, 0, 1));
  const calendarStart: Date = new Date(yearStart.getTime());
  calendarStart.setUTCDate(calendarStart.getUTCDate() - calendarStart.getUTCDay());
  const yearEnd: Date = new Date(Date.UTC(year, 11, 31));
  const totalDaysCount: number = Math.ceil(
    (yearEnd.getTime() - calendarStart.getTime() + DAY_MS) / DAY_MS,
  );
  const weekCount: number = Math.ceil(totalDaysCount / 7);
  const weeks: HeatmapWeek[] = [];
  for (let weekIndex: number = 0; weekIndex < weekCount; weekIndex += 1) {
    const cells: HeatmapCell[] = [];
    for (let dayIndex: number = 0; dayIndex < 7; dayIndex += 1) {
      const date: Date = new Date(
        calendarStart.getTime() + (weekIndex * 7 + dayIndex) * DAY_MS,
      );
      const dateString: string = toDateString(date);
      const checkin: StudyCheckin | null = itemMap.get(dateString) ?? null;
      const minutes: number = checkin ? totalMinutes(checkin) : 0;
      cells.push({
        date: dateString,
        inYear: date.getUTCFullYear() === year,
        totalMinutes: minutes,
        intensity: getIntensity(minutes),
        checkin,
      });
    }
    weeks.push({ key: cells[0].date, cells });
  }

  const monthMarkers: MonthMarker[] = Array.from(
    { length: 12 },
    (_value: unknown, monthIndex: number): MonthMarker => {
      const firstDay: Date = new Date(Date.UTC(year, monthIndex, 1));
      const column: number = Math.floor(
        (firstDay.getTime() - calendarStart.getTime()) / DAY_MS / 7,
      ) + 1;
      return { label: `${monthIndex + 1}月`, column };
    },
  );
  return { weeks, monthMarkers };
}

export function calendarDateToString(date: Date): string {
  const year: number = date.getFullYear();
  const month: string = String(date.getMonth() + 1).padStart(2, '0');
  const day: string = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}
