import { CalendarDays, Clock3, Flame, Trophy } from 'lucide-react';

import type { DashboardStats as DashboardStatsValue } from './date-utils';
import { formatDisplayDate } from './date-utils';

interface DashboardStatsProps {
  stats: DashboardStatsValue;
}

interface StatItem {
  label: string;
  value: string;
  detail: string;
}

function formatDuration(minutes: number): string {
  const hours: number = Math.floor(minutes / 60);
  const remainingMinutes: number = minutes % 60;
  if (hours === 0) return `${remainingMinutes}m`;
  if (remainingMinutes === 0) return `${hours}h`;
  return `${hours}h ${remainingMinutes}m`;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const items: StatItem[] = [
    {
      label: 'Study days',
      value: `${stats.totalDays} days`,
      detail: 'Dates with a check-in',
    },
    {
      label: 'Total study time',
      value: formatDuration(stats.totalMinutes),
      detail: 'Friends, reading, and more',
    },
    {
      label: 'Best day',
      value: formatDuration(stats.peakMinutes),
      detail: stats.peakDate ? formatDisplayDate(stats.peakDate) : 'Waiting for the first check-in',
    },
    {
      label: 'Current streak',
      value: `${stats.currentStreak} days`,
      detail: 'Today or yesterday keeps it alive',
    },
    {
      label: 'Best streak',
      value: `${stats.longestStreak} days`,
      detail: 'Your all-time best',
    },
  ];
  const icons: React.ReactNode[] = [
    <CalendarDays key="calendar" />,
    <Clock3 key="clock" />,
    <Trophy key="trophy" />,
    <Flame key="current" />,
    <Flame key="longest" />,
  ];

  return (
    <section
      className="stats-strip"
      data-ai-section-type="card-stat"
      aria-label="Study statistics"
    >
      {items.map((item: StatItem, index: number) => (
        <div className="stat-item" key={item.label}>
          <div className="stat-icon">{icons[index]}</div>
          <div className="min-w-0">
            <div className="stat-value">{item.value}</div>
            <div className="stat-label">{item.label}</div>
            <div className="stat-detail">{item.detail}</div>
          </div>
        </div>
      ))}
    </section>
  );
};

export default DashboardStats;
