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
  if (hours === 0) return `${remainingMinutes} 分`;
  if (remainingMinutes === 0) return `${hours} 小时`;
  return `${hours} 小时 ${remainingMinutes} 分`;
}

const DashboardStats: React.FC<DashboardStatsProps> = ({ stats }) => {
  const items: StatItem[] = [
    {
      label: '累计学习天数',
      value: `${stats.totalDays} 天`,
      detail: '有学习记录的日期',
    },
    {
      label: '累计学习时长',
      value: formatDuration(stats.totalMinutes),
      detail: '老友记、阅读及其他',
    },
    {
      label: '最长单日',
      value: formatDuration(stats.peakMinutes),
      detail: stats.peakDate ? formatDisplayDate(stats.peakDate) : '等待第一次打卡',
    },
    {
      label: '当前连续天数',
      value: `${stats.currentStreak} 天`,
      detail: '今天或昨天仍在连续',
    },
    {
      label: '最长连续天数',
      value: `${stats.longestStreak} 天`,
      detail: '你的历史最佳纪录',
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
      aria-label="学习统计"
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
