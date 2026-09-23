import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen } from 'lucide-react';
import ActivityHeatmap from '../client/src/pages/checkins/ActivityHeatmap';
import DashboardStats from '../client/src/pages/checkins/DashboardStats';
import ProgressPanels from '../client/src/pages/checkins/ProgressPanels';
import WeeklyStudyChart from '../client/src/pages/checkins/WeeklyStudyChart';
import { calculateStats, getShanghaiToday } from '../client/src/pages/checkins/date-utils';
import type { StudyCheckin } from '../shared/api.interface';
import records from './records.json';
import avatar from '../client/src/assets/profile-avatar.jpg';
import '../client/src/index.css';
import './public.css';

const items: StudyCheckin[] = records.days.map(day => ({
  id: day.date, studyDate: day.date,
  friendsMinutes: day.friendsMinutes, readingMinutes: day.readingMinutes,
  otherMinutes: day.otherMinutes, friendsProgress: day.progress,
  bookTitle: null, readingProgress: null, takeaway: day.takeaway, notes: null,
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
          <div className="brand-mark"><img src={avatar} alt="nan's avatar" /></div>
          <p className="profile-kicker">MY ENGLISH ARCHIVE</p>
          <h1>nan</h1>
          <p className="profile-subtitle"><BookOpen /> Friends × English Originals</p>
          <span className="public-status">IN PROGRESS</span>
        </header>
        <ActivityHeatmap items={items} year={year} onYearChange={setYear} onSelectDate={setSelected} readOnly />
        {selected && <p className="selected-day" role="status">{selected} · {selectedItem ? `${selectedItem.friendsMinutes + selectedItem.readingMinutes + selectedItem.otherMinutes} min studied` : 'No check-in yet'}</p>}
        <WeeklyStudyChart items={items} />
        <DashboardStats stats={stats} />
        <section className="dashboard-panel history-panel" aria-label="Historical study total">
          <div><p className="eyebrow">BEFORE THE DAILY LOG</p><h2>Historical total</h2></div>
          <strong>{Math.floor(records.history.minutes / 60)}h {records.history.minutes % 60}m</strong>
          <p>Season 1 (25 episodes) plus the first 11 episodes of Season 2, estimated at four passes per episode; two English-subtitle passes in Season 2 at 1.2× speed.</p>
          <small>Through {records.history.asOf} · Included in the total; daily tracking begins afterwards.</small>
        </section>
        <ProgressPanels items={items} onEdit={() => {}} readOnly />
        <footer className="dashboard-footer">Every input makes English feel more natural.<br /><span>Updated {records.updatedOn}</span></footer>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><PublicPage /></React.StrictMode>);
