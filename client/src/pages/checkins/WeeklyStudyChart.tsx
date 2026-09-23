import type { StudyCheckin } from '@shared/api.interface';

import { getShanghaiToday, shiftDate, totalMinutes } from './date-utils';

interface WeeklyStudyChartProps {
  items: StudyCheckin[];
}

function weekdayLabel(date: string): string {
  return new Intl.DateTimeFormat('en-US', {
    weekday: 'short',
    timeZone: 'UTC',
  }).format(new Date(`${date}T00:00:00Z`));
}

const WeeklyStudyChart: React.FC<WeeklyStudyChartProps> = ({ items }) => {
  const today: string = getShanghaiToday();
  const itemMap: Map<string, StudyCheckin> = new Map(
    items.map((item: StudyCheckin): [string, StudyCheckin] => [item.studyDate, item]),
  );
  const days = Array.from({ length: 7 }, (_value: unknown, index: number) => {
    const date: string = shiftDate(today, index - 6);
    const checkin: StudyCheckin | undefined = itemMap.get(date);
    return { date, minutes: checkin ? totalMinutes(checkin) : 0 };
  });
  const peak: number = Math.max(...days.map((day: { minutes: number }): number => day.minutes), 1);
  const weeklyTotal: number = days.reduce(
    (sum: number, day: { minutes: number }): number => sum + day.minutes,
    0,
  );

  return (
    <section className="dashboard-panel weekly-chart-panel" aria-labelledby="weekly-chart-title">
      <div className="section-heading compact-heading">
        <div>
          <p className="eyebrow">WEEKLY FOCUS</p>
          <h2 id="weekly-chart-title">Last 7 days</h2>
        </div>
        <span className="muted-total">{weeklyTotal} min total</span>
      </div>
      <div className="weekly-bars" role="img" aria-label={`Last 7 days: ${weeklyTotal} minutes studied`}>
        {days.map((day: { date: string; minutes: number }) => {
          const height: number = day.minutes > 0
            ? Math.max(10, Math.round(day.minutes / peak * 100))
            : 0;
          return (
            <div className="weekly-bar-item" key={day.date}>
              <span className="weekly-bar-value">{day.minutes > 0 ? `${day.minutes}m` : '—'}</span>
              <div className="weekly-bar-track">
                <span className="weekly-bar-fill" style={{ height: `${height}%` }} />
              </div>
              <strong>{weekdayLabel(day.date)}</strong>
              <small>{day.date.slice(5).replace('-', '/')}</small>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WeeklyStudyChart;
