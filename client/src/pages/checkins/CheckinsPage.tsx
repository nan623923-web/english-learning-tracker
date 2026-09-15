import { useEffect, useMemo, useState } from 'react';
import { BookOpen, Plus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { checkins as checkinsApi } from '@/api';

import type { StudyCheckin, StudyCheckinInput } from '@shared/api.interface';
import ActivityHeatmap from './ActivityHeatmap';
import CheckinDialog from './CheckinDialog';
import DashboardStats from './DashboardStats';
import type { DashboardStats as DashboardStatsValue } from './date-utils';
import { calculateStats, getShanghaiToday } from './date-utils';
import ProgressPanels from './ProgressPanels';

const CheckinsPage: React.FC = () => {
  const today: string = getShanghaiToday();
  const [items, setItems] = useState<StudyCheckin[]>([]);
  const [year, setYear] = useState<number>(Number(today.slice(0, 4)));
  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [error, setError] = useState<string>('');
  const stats: DashboardStatsValue = useMemo(
    (): DashboardStatsValue => calculateStats(items),
    [items],
  );

  const loadData = async (): Promise<void> => {
    setLoading(true);
    setError('');
    try {
      const response: { items: StudyCheckin[] } = await checkinsApi.listCheckins();
      setItems(response.items);
    } catch (_error: unknown) {
      setError('暂时无法读取打卡记录，请稍后重试。');
    } finally {
      setLoading(false);
    }
  };

  useEffect((): void => {
    void loadData();
  }, []);

  const openDate = (date: string): void => {
    setSelectedDate(date);
    setDialogOpen(true);
  };

  const handleSave = async (
    studyDate: string,
    input: StudyCheckinInput,
  ): Promise<void> => {
    setSaving(true);
    try {
      const response: { item: StudyCheckin } = await checkinsApi.saveCheckin(
        studyDate,
        input,
      );
      setItems((previous: StudyCheckin[]): StudyCheckin[] => {
        const remaining: StudyCheckin[] = previous.filter(
          (item: StudyCheckin): boolean => item.id !== response.item.id,
        );
        return [...remaining, response.item].sort(
          (a: StudyCheckin, b: StudyCheckin): number =>
            a.studyDate.localeCompare(b.studyDate),
        );
      });
      setYear(Number(studyDate.slice(0, 4)));
      setDialogOpen(false);
      toast.success('英语学习打卡已保存');
    } catch (_error: unknown) {
      toast.error('保存失败，请检查后重试');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string): Promise<void> => {
    setSaving(true);
    try {
      await checkinsApi.deleteCheckin(id);
      setItems((previous: StudyCheckin[]): StudyCheckin[] =>
        previous.filter((item: StudyCheckin): boolean => item.id !== id),
      );
      setDialogOpen(false);
      toast.success('打卡记录已删除');
    } catch (_error: unknown) {
      toast.error('删除失败，请稍后重试');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="learning-dashboard">
      <div className="ambient-glow ambient-glow-left" />
      <div className="ambient-glow ambient-glow-right" />
      <div className="dashboard-shell">
        <header className="dashboard-header">
          <div className="brand-mark" aria-hidden="true">
            <span>EN</span>
          </div>
          <p className="profile-kicker">MY ENGLISH ARCHIVE</p>
          <h1>nan</h1>
          <p className="profile-subtitle">
            <BookOpen /> Friends × English Originals
          </p>
          <Button
            className="primary-checkin"
            data-ai-section-type="button"
            onClick={(): void => openDate(today)}
            size="lg"
          >
            <Plus /> 今日打卡
          </Button>
        </header>

        {error && (
          <div className="error-banner" role="alert">
            <span>{error}</span>
            <Button onClick={loadData} size="sm" variant="ghost">
              <RefreshCw /> 重试
            </Button>
          </div>
        )}

        <DashboardStats stats={stats} />

        {loading ? (
          <div className="dashboard-panel loading-panel">
            <span className="loading-dot" /> 正在读取学习记录…
          </div>
        ) : (
          <>
            <ActivityHeatmap
              items={items}
              onSelectDate={openDate}
              onYearChange={setYear}
              year={year}
            />
            <ProgressPanels items={items} onEdit={openDate} />
          </>
        )}

        <footer className="dashboard-footer">
          每一次输入，都在让英语变得更自然。
        </footer>
      </div>

      <CheckinDialog
        items={items}
        onDelete={handleDelete}
        onOpenChange={setDialogOpen}
        onSave={handleSave}
        open={dialogOpen}
        saving={saving}
        selectedDate={selectedDate}
      />
    </main>
  );
};

export default CheckinsPage;
