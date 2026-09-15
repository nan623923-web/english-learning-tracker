import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen } from 'lucide-react';
import ActivityHeatmap from '../client/src/pages/checkins/ActivityHeatmap';
import DashboardStats from '../client/src/pages/checkins/DashboardStats';
import ProgressPanels from '../client/src/pages/checkins/ProgressPanels';
import { calculateStats, getShanghaiToday } from '../client/src/pages/checkins/date-utils';
import type { StudyCheckin } from '../shared/api.interface';
import records from './records.json';
import '../client/src/index.css';
import './public.css';

const items: StudyCheckin[] = records.days.map(day => ({
  id: day.date, studyDate: day.date,
  friendsMinutes: day.friendsMinutes, readingMinutes: day.readingMinutes,
  otherMinutes: day.otherMinutes, friendsProgress: day.progress,
  bookTitle: null, readingProgress: null, takeaway: null, notes: null,
  createdAt: `${day.date}T00:00:00Z`, updatedAt: `${day.date}T00:00:00Z`,
}));

function PublicPage() {
  const [year, setYear] = useState(Number(getShanghaiToday().slice(0, 4)));
  const [selected, setSelected] = useState('');
  const dailyStats = calculateStats(items);
  const stats = { ...dailyStats, totalMinutes: dailyStats.totalMinutes + records.history.minutes };
  const selectedItem = items.find(item => item.studyDate === selected);
  return (
    <main className="learning-dashboard">
      <div className="ambient-glow ambient-glow-left" />
      <div className="ambient-glow ambient-glow-right" />
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="brand-mark" aria-hidden="true"><span>EN</span></div>
          <p className="profile-kicker">MY ENGLISH ARCHIVE</p>
          <h1>nan</h1>
          <p className="profile-subtitle"><BookOpen /> Friends × English Originals</p>
          <span className="public-status">持续学习中</span>
        </header>
        <DashboardStats stats={stats} />
        <section className="dashboard-panel history-panel" aria-label="历史学习累计">
          <div><p className="eyebrow">BEFORE THE DAILY LOG</p><h2>历史学习累计</h2></div>
          <strong>{Math.floor(records.history.minutes / 60)} 小时 {records.history.minutes % 60} 分</strong>
          <p>{records.history.description}</p>
          <small>截至 {records.history.asOf} · 已计入总时长，按日统计从后续打卡开始。</small>
        </section>
        <ActivityHeatmap items={items} year={year} onYearChange={setYear} onSelectDate={setSelected} readOnly />
        {selected && <p className="selected-day" role="status">{selected} · {selectedItem ? `学习 ${selectedItem.friendsMinutes + selectedItem.readingMinutes + selectedItem.otherMinutes} 分钟` : '暂无打卡记录'}</p>}
        <ProgressPanels items={items} onEdit={() => {}} readOnly />
        <footer className="dashboard-footer">每一次输入，都在让英语变得更自然。<br /><span>记录更新于 {records.updatedOn}</span></footer>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><PublicPage /></React.StrictMode>);
