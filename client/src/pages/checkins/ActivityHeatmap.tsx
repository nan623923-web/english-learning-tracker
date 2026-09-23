import { useEffect, useRef } from 'react';
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
  const lastActiveDate: string | undefined = activeDates.at(-1);
  const today: string = getShanghaiToday();
  const latestVisibleDate: string = lastActiveDate ?? (
    year === Number(today.slice(0, 4)) ? today : `${year}-12-31`
  );
  const lastVisibleWeekIndex: number = latestVisibleDate
    ? weeks.findIndex((week: HeatmapWeek): boolean => (
      week.cells.some((cell: HeatmapCell): boolean => cell.date === latestVisibleDate)
    ))
    : weeks.length - 1;
  const firstVisibleWeek: number = 0;
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
  const heatmapScrollRef = useRef<HTMLDivElement>(null);

  useEffect((): void => {
    const element: HTMLDivElement | null = heatmapScrollRef.current;
    if (element) element.scrollLeft = element.scrollWidth;
  }, [year, lastVisibleWeek]);

  return (
    <section className="dashboard-panel heatmap-panel" aria-labelledby="activity-title">
      <div className="section-heading">
        <div>
          <p className="eyebrow">DAILY RHYTHM</p>
          <h2 id="activity-title">Study activity</h2>
        </div>
        <div className="year-switcher">
          <Button
            aria-label="Previous year"
            className="year-button"
            onClick={(): void => onYearChange(year - 1)}
            size="icon"
            variant="ghost"
          >
            <ChevronLeft />
          </Button>
          <span>{year}</span>
          <Button
            aria-label="Next year"
            className="year-button"
            onClick={(): void => onYearChange(year + 1)}
            size="icon"
            variant="ghost"
          >
            <ChevronRight />
          </Button>
        </div>
      </div>

      <div className="heatmap-scroll" ref={heatmapScrollRef}>
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
              <span>S</span><span /><span>T</span><span /><span>T</span><span /><span>S</span>
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
                          aria-label={`${cell.date}, ${cell.totalMinutes} minutes studied`}
                          className={`heat-cell intensity-${cell.intensity}${isFuture ? ' heat-cell-future' : ''}`}
                          disabled={!cell.inYear || isFuture}
                          onClick={(): void => onSelectDate(cell.date)}
                          type="button"
                        />
                      </TooltipTrigger>
                      {cell.inYear && !isFuture && (
                        <TooltipContent sideOffset={8}>
                          {formatDisplayDate(cell.date)} · {cell.totalMinutes} min
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
        <span>Less</span>
        {[0, 1, 2, 3, 4].map((level: number) => (
          <span className={`heat-cell intensity-${level}`} key={level} />
        ))}
        <span>More</span>
        <span className="ml-auto">{readOnly ? 'Hover or select a date to view study time' : 'Select a date to add or edit a check-in'}</span>
      </div>
    </section>
  );
};

export default ActivityHeatmap;
