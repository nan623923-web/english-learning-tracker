import React, { useState } from 'react';
import { createRoot } from 'react-dom/client';
import { BookOpen, Leaf, Sprout } from 'lucide-react';
import ActivityHeatmap from '../client/src/pages/checkins/ActivityHeatmap';
import DashboardStats from '../client/src/pages/checkins/DashboardStats';
import ProgressPanels from '../client/src/pages/checkins/ProgressPanels';
import WeeklyStudyChart from '../client/src/pages/checkins/WeeklyStudyChart';
import CheckinPasses from '../client/src/pages/checkins/CheckinPasses';
import { calculateCheckinPasses, calculateStats, getShanghaiToday } from '../client/src/pages/checkins/date-utils';
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
  isMakeup: 'isMakeup' in day && day.isMakeup === true,
  createdAt: `${day.date}T00:00:00Z`, updatedAt: `${day.date}T00:00:00Z`,
}));

function SummerForest() {
  return (
    <svg className="forest-art" viewBox="0 0 600 380" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id="forest-sky" x2="0" y2="380" gradientUnits="userSpaceOnUse">
          <stop stopColor="#e6edd4" /><stop offset="1" stopColor="#f3f2e3" />
        </linearGradient>
        <linearGradient id="forest-light" x1="370" y1="60" x2="180" y2="380" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fff9ce" stopOpacity=".85" /><stop offset="1" stopColor="#fff9ce" stopOpacity="0" />
        </linearGradient>
        <g id="forest-tree">
          <path d="M0 335L5 112L11 112L16 335Z" fill="currentColor" />
          <path d="M8 192L-20 150M9 159L34 125M8 139L-8 112" stroke="currentColor" strokeWidth="3" />
          <path d="M-44 92C-55 60-26 26-1 35C11 5 48 20 51 50C79 56 88 83 71 108C67 135 31 151 8 132C-17 148-47 126-44 92Z" fill="currentColor" />
        </g>
      </defs>
      <rect width="600" height="380" rx="5" fill="url(#forest-sky)" />
      <circle cx="395" cy="86" r="42" fill="#fcf6cc" />
      <path d="M0 259Q84 212 178 244T361 227T600 239V380H0Z" fill="#b9ccb0" />
      <g color="#a2bfa0">
        <use href="#forest-tree" transform="translate(78 21) scale(.88)" />
        <use href="#forest-tree" transform="translate(230 20) scale(.8)" />
        <use href="#forest-tree" transform="translate(455 -6) scale(.94)" />
        <use href="#forest-tree" transform="translate(538 37) scale(.83)" />
      </g>
      <path d="M0 294Q96 241 204 289T401 265T600 291V380H0Z" fill="#739b7c" />
      <g color="#568467">
        <use href="#forest-tree" transform="translate(32 -12) scale(1.18)" />
        <use href="#forest-tree" transform="translate(171 -20) scale(1.12)" />
        <use href="#forest-tree" transform="translate(483 -55) scale(1.28)" />
        <use href="#forest-tree" transform="translate(579 -30) scale(1.17)" />
      </g>
      <path d="M345 57L211 380H320L420 55Z" fill="url(#forest-light)" />
      <path d="M380 61L354 380H387L429 58Z" fill="url(#forest-light)" opacity=".5" />
      <path d="M0 334Q86 295 185 327T375 325T600 316V380H0Z" fill="#305d48" />
      <path d="M318 271C344 294 258 327 262 380H358C316 331 387 300 343 271Z" fill="#dde0bc" />
      <g color="#234c3a">
        <use href="#forest-tree" transform="translate(7 -60) scale(1.42)" />
        <use href="#forest-tree" transform="translate(567 -98) scale(1.48)" />
      </g>
      <g fill="#b5c890">
        <path d="M97 336Q72 300 65 314Q57 338 97 336Z" /><path d="M97 336Q113 301 124 317Q126 338 97 336Z" />
        <path d="M428 356Q400 317 393 337Q393 357 428 356Z" /><path d="M428 356Q440 325 454 335Q455 354 428 356Z" />
      </g>
      <g stroke="#7fa07a" strokeWidth="2" strokeLinecap="round">
        <path d="M95 354L97 329M429 372L427 349" />
        <path d="M300 157q6-6 12 0q6-6 12 0M345 181q5-5 10 0q5-5 10 0" />
      </g>
      <g fill="#fff7c7"><circle cx="232" cy="203" r="2" /><circle cx="392" cy="236" r="2" /><circle cx="197" cy="310" r="1.5" /></g>
    </svg>
  );
}

function PublicPage() {
  const [year, setYear] = useState(Number(getShanghaiToday().slice(0, 4)));
  const [selected, setSelected] = useState('');
  const dailyStats = calculateStats(items);
  const stats = { ...dailyStats, totalMinutes: dailyStats.totalMinutes + records.history.minutes };
  const passes = calculateCheckinPasses(items);
  const selectedItem = items.find(item => item.studyDate === selected);
  return (
    <main className="learning-dashboard forest-journal">
      <div className="dashboard-shell">
        <div className="journal-topline">
          <a className="journal-brand" href="#journal"><Leaf aria-hidden="true" /><span>nan’s English journal</span></a>
          <span className="journal-edition">A PERSONAL LEARNING ARCHIVE</span>
          <span className="public-status"><span /> IN PROGRESS</span>
        </div>
        <header className="dashboard-header">
          <div className="journal-intro" id="journal">
            <div className="journal-owner"><div className="brand-mark"><img src={avatar} alt="nan's avatar" /></div><p className="profile-kicker">SMALL STEPS, DEEP ROOTS</p></div>
            <h1>A little English.<br />A little <em>growth.</em></h1>
            <p className="journal-description">A quiet place to learn, listen, and grow.<br />One day, one page, one episode at a time.</p>
            <p className="profile-subtitle"><BookOpen aria-hidden="true" /> Friends × English Originals</p>
          </div>
          <figure className="forest-postcard">
            <SummerForest />
            <span className="forest-seal" lang="ja">夏の森</span>
            <figcaption><span>KOMOREBI</span><span>Light through the leaves</span></figcaption>
          </figure>
        </header>
        <ActivityHeatmap items={items} year={year} onYearChange={setYear} onSelectDate={setSelected} readOnly />
        {selected && <p className="selected-day" role="status">{selected} · {selectedItem ? `${selectedItem.friendsMinutes + selectedItem.readingMinutes + selectedItem.otherMinutes} min studied${selectedItem.isMakeup ? ' · Make-up check-in (1 pass used)' : ''}` : 'No check-in yet'}</p>}
        <DashboardStats stats={stats} />
        <div className="journal-rhythm-grid">
          <WeeklyStudyChart items={items} />
          <div className="journal-rewards">
            <CheckinPasses passes={passes} />
            <div className="journal-thought"><Sprout aria-hidden="true" /><p>Growth is quiet.<br /><em>Keep showing up.</em></p><span lang="ja">日々、少しずつ。</span></div>
          </div>
        </div>
        <section className="dashboard-panel history-panel" aria-label="Historical study total">
          <div><p className="eyebrow">BEFORE THE DAILY LOG</p><h2>Historical total</h2></div>
          <strong>{Math.floor(records.history.minutes / 60)}h {records.history.minutes % 60}m</strong>
          <p>Season 1 (25 episodes) plus the first 11 episodes of Season 2, estimated at four passes per episode; two English-subtitle passes in Season 2 at 1.2× speed.</p>
          <small>Through {records.history.asOf} · Included in the total; daily tracking begins afterwards.</small>
        </section>
        <ProgressPanels items={items} onEdit={() => {}} readOnly />
        <footer className="dashboard-footer"><Leaf aria-hidden="true" /><p>Rooted in small, everyday moments.</p><span>nan’s English journal · Updated {records.updatedOn}</span></footer>
      </div>
    </main>
  );
}

createRoot(document.getElementById('root')!).render(<React.StrictMode><PublicPage /></React.StrictMode>);
