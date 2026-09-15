import { BookOpen, Clock3, MessageCircle, Pencil, Sparkles } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from '@/components/ui/empty';

import type { StudyCheckin } from '@shared/api.interface';
import { formatDisplayDate, totalMinutes } from './date-utils';

interface ProgressPanelsProps {
  items: StudyCheckin[];
  onEdit: (date: string) => void;
  readOnly?: boolean;
}

interface CompositionItem {
  key: string;
  label: string;
  minutes: number;
  colorClass: string;
}

function formatMinutes(minutes: number): string {
  if (minutes < 60) return `${minutes} 分钟`;
  const hours: number = Math.floor(minutes / 60);
  const remainder: number = minutes % 60;
  return remainder > 0 ? `${hours} 小时 ${remainder} 分` : `${hours} 小时`;
}

const ProgressPanels: React.FC<ProgressPanelsProps> = ({ items, onEdit, readOnly = false }) => {
  const recentItems: StudyCheckin[] = [...items]
    .sort((a: StudyCheckin, b: StudyCheckin): number =>
      b.studyDate.localeCompare(a.studyDate),
    )
    .slice(0, 6);
  const composition: CompositionItem[] = [
    {
      key: 'friends',
      label: '老友记',
      minutes: items.reduce(
        (sum: number, item: StudyCheckin): number => sum + item.friendsMinutes,
        0,
      ),
      colorClass: 'composition-blue',
    },
    {
      key: 'reading',
      label: '英语原著',
      minutes: items.reduce(
        (sum: number, item: StudyCheckin): number => sum + item.readingMinutes,
        0,
      ),
      colorClass: 'composition-cyan',
    },
    {
      key: 'other',
      label: '其他英语',
      minutes: items.reduce(
        (sum: number, item: StudyCheckin): number => sum + item.otherMinutes,
        0,
      ),
      colorClass: 'composition-violet',
    },
  ];
  const grandTotal: number = composition.reduce(
    (sum: number, item: CompositionItem): number => sum + item.minutes,
    0,
  );

  return (
    <div className="lower-grid">
      <section className="dashboard-panel" aria-labelledby="composition-title">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">FOCUS</p>
            <h2 id="composition-title">学习构成</h2>
          </div>
          <span className="muted-total">共 {formatMinutes(grandTotal)}</span>
        </div>
        <div className="composition-list">
          {composition.map((item: CompositionItem) => {
            const percentage: number = grandTotal > 0
              ? Math.round(item.minutes / grandTotal * 100)
              : 0;
            return (
              <div className="composition-item" key={item.key}>
                <div className="composition-meta">
                  <span>{item.label}</span>
                  <span>{formatMinutes(item.minutes)} · {percentage}%</span>
                </div>
                <div className="composition-track">
                  <span
                    className={item.colorClass}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      <section className="dashboard-panel" aria-labelledby="recent-title">
        <div className="section-heading compact-heading">
          <div>
            <p className="eyebrow">RECENT NOTES</p>
            <h2 id="recent-title">最近打卡</h2>
          </div>
          <span className="muted-total">最近 {recentItems.length} 条</span>
        </div>
        {recentItems.length === 0 ? (
          <Empty className="recent-empty">
            <EmptyHeader>
              <EmptyMedia className="empty-media" variant="icon">
                <Sparkles />
              </EmptyMedia>
              <EmptyTitle>第一格还等着你点亮</EmptyTitle>
              <EmptyDescription>
                完成今天的老友记或原著阅读后，记下一次打卡。
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div className="recent-list" data-ai-section-type="card-list">
            {recentItems.map((item: StudyCheckin) => (
              <article className="recent-item" key={item.id}>
                <div className="recent-date">
                  <span>{formatDisplayDate(item.studyDate)}</span>
                  <strong>{formatMinutes(totalMinutes(item))}</strong>
                </div>
                <div className="recent-copy">
                  <div className="recent-badges">
                    {item.friendsMinutes > 0 && (
                      <Badge className="study-badge" variant="outline">
                        <MessageCircle /> 老友记 {item.friendsMinutes} 分
                      </Badge>
                    )}
                    {item.readingMinutes > 0 && (
                      <Badge className="study-badge" variant="outline">
                        <BookOpen /> 阅读 {item.readingMinutes} 分
                      </Badge>
                    )}
                    {item.otherMinutes > 0 && (
                      <Badge className="study-badge" variant="outline">
                        <Clock3 /> 其他 {item.otherMinutes} 分
                      </Badge>
                    )}
                  </div>
                  <p className="recent-title">
                    {item.friendsProgress || item.bookTitle || item.readingProgress
                      || '完成一次英语学习'}
                  </p>
                  {(item.takeaway || item.notes) && (
                    <p className="recent-note">{item.takeaway || item.notes}</p>
                  )}
                </div>
                {!readOnly && <Button
                  aria-label={`编辑 ${item.studyDate} 的打卡`}
                  className="edit-button"
                  onClick={(): void => onEdit(item.studyDate)}
                  size="icon"
                  variant="ghost"
                >
                  <Pencil />
                </Button>}
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default ProgressPanels;
