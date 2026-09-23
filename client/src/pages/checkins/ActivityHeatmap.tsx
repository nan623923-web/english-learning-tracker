import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@/components/ui/tooltip';

import type { HeatmapCell, HeatmapWeek, MonthMarker } from './date-utils';
import { buildHeatmap, formatDisplayDate, getShanghaiToday, totalMinutes } from './date-utils';
import type { StudyCheckin } from '@shared/api.interface';

interface ActivityHeatmapProps {
  year: number;
  items: StudyCheckin[];
  onYearChange: (year: number) => void;
  onSelectDate: (date: string) => void;
  readOnly?: boolean;
}

const ActivityHeatmap: React.FC<ActivityHeatmapProps> = ({
  year,
  items,
  onYearChange,
  onSelectDate,
  readOnly = false,
}) => {
  const { weeks, monthMarkers }: {
    weeks: HeatmapWeek[];
    monthMarkers: MonthMarker[];
  } = buildHeatmap(year, items);
  const activeDates: string[] = items
    .filter((item: StudyCheckin): boolean => (
      item.studyDate.startsWith(`${year}-`) && totalMinutes(item) > 0
    ))
    .map((item: StudyCheckin): string => item.studyDate)
    .sort((left: string, right: string): number => left.localeCompare(right));
  const firstActiveDate: string | undefined = activeDates[0];
  const lastActiveDate: string | undefined = activeDates.at(-1);
  const visibleStartDate: string | undefined = firstActiveDate
    ? `${firstActiveDate.slice(0, 7)}-01`
    : undefined;
  const firstVisibleWeek: number = visibleStartDate
    ? Math.max(0, weeks.findIndex((week: HeatmapWeek): boolean => (
      week.cells.some((cell: HeatmapCell): boolean => cell.date >= visibleStartDate)
    )))
    : 0;
  const lastVisibleWeekIndex: number = lastActiveDate
    ? weeks.findIndex((week: HeatmapWeek): boolean => (
      week.cells.some((cell: HeatmapCell): boolean => cell.date === lastActiveDate)
    ))
    : weeks.length - 1;
  const lastVisibleWeek: number = lastVisibleWeekIndex >= firstVisibleWeek
    ? lastVisibleWeekIndex
    : weeks.length - 1;
  const visibleWeeks: HeatmapWeek[] = weeks.slice(firstVisibleWeek, lastVisibleWeek + 1);
  const visibleMonthMarkers: MonthMarker[] = monthMarkers
    .filter((marker: MonthMarker): boolean => (
      marker.column - 1 >= firstVisibleWeek && marker.column - 1 <= lastVisibleWeek
    ))
    .map((marker: MonthMarker): MonthMarker => ({
      ...marker,
      column: marker.column - firstVisibleWeek,
    }));
  const today: string = getShanghaiToday();

  return (
    <section className="dashboard-panel heatmap-panel" aria-labelledby="activity-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DAILY RHYTHM</p>
          <h2 id="activity-title">英语学习活动</h2>
        </div>
        <div className="year-switcher">
          <Button
            aria-label="上一年"
            className="year-button"
            onClick={(): void => onYearChange(year - 1)}
            size="icon"
            variant="ghost"
          >
            <ChevronLeft />
          </Button>
          <span>{year}</span>
          <Button
            aria-label="下一年"
            className="year-button"
            onClick={(): void => onYearChange(year + 1)}
            size="icon"
            variant="ghost"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="heatmap-scroll">
        <div className="heatmap-content">
          <div className="month-row" style={{ gridTemplateColumns: `repeat(${visibleWeeks.length}, 13px)` }}>
            {visibleMonthMarkers.map((marker: MonthMarker) => (
              <span
                key={marker.label}
                style={{ gridColumnStart: marker.column }}
              >
                {marker.label}
              </span>
            ))}
          </div>
          <div className="heatmap-body">
            <div className="weekday-labels" aria-hidden="true">
              <span>日</span><span /><span>二</span><span /><span>四</span><span /><span>六</span>
            </div>
            <div className="heatmap-grid">
              {visibleWeeks.map((week: HeatmapWeek) => (
                <div className="heatmap-week" key={week.key}>
                  {week.cells.map((cell: HeatmapCell) => {
                    const isFuture: boolean = readOnly && cell.date > today;
                    return (
                    <Tooltip key={cell.date}>
                      <TooltipTrigger asChild>
                        <button
                          aria-label={`${cell.date}，学习 ${cell.totalMinutes} 分钟`}
                          className={`heat-cell intensity-${cell.intensity}${isFuture ? ' heat-cell-future' : ''}`}
                          disabled={!cell.inYear || isFuture}
                          onClick={(): void => onSelectDate(cell.date)}
                          type="button"
                        />
                      </TooltipTrigger>
                      {cell.inYear && !isFuture && (
                        <TooltipContent sideOffset={8}>
                          {formatDisplayDate(cell.date)} · {cell.totalMinutes} 分钟
                        </TooltipContent>
                      )}
                    </Tooltip>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="heatmap-legend">
        <span>少</span>
        {[0, 1, 2, 3, 4].map((level: number) => (
          <span className={`heat-cell intensity-${level}`} key={level} />
        ))}
        <span>多</span>
        <span className="ml-auto">{readOnly ? '悬停或点击日期查看学习时长' : '点击任意日期即可补记或编辑'}</span>
      </div>
    </section>
  );
};

export default ActivityHeatmap;
