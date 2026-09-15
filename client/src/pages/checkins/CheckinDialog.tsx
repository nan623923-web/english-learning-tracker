import { useEffect, useMemo, useState } from 'react';
import { CalendarIcon, Clock3, Trash2 } from 'lucide-react';
import { zhCN } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Textarea } from '@/components/ui/textarea';

import type { StudyCheckin, StudyCheckinInput } from '@shared/api.interface';
import {
  calendarDateToString,
  formatDisplayDate,
  fromDateString,
} from './date-utils';

interface CheckinDialogProps {
  open: boolean;
  selectedDate: string;
  items: StudyCheckin[];
  saving: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (studyDate: string, input: StudyCheckinInput) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface CheckinDraft {
  friendsMinutes: string;
  readingMinutes: string;
  otherMinutes: string;
  friendsProgress: string;
  bookTitle: string;
  readingProgress: string;
  takeaway: string;
  notes: string;
}

const EMPTY_DRAFT: CheckinDraft = {
  friendsMinutes: '',
  readingMinutes: '',
  otherMinutes: '',
  friendsProgress: '',
  bookTitle: '',
  readingProgress: '',
  takeaway: '',
  notes: '',
};

function draftFromCheckin(checkin: StudyCheckin | null): CheckinDraft {
  if (!checkin) return { ...EMPTY_DRAFT };
  return {
    friendsMinutes: String(checkin.friendsMinutes || ''),
    readingMinutes: String(checkin.readingMinutes || ''),
    otherMinutes: String(checkin.otherMinutes || ''),
    friendsProgress: checkin.friendsProgress ?? '',
    bookTitle: checkin.bookTitle ?? '',
    readingProgress: checkin.readingProgress ?? '',
    takeaway: checkin.takeaway ?? '',
    notes: checkin.notes ?? '',
  };
}

const CheckinDialog: React.FC<CheckinDialogProps> = ({
  open,
  selectedDate,
  items,
  saving,
  onOpenChange,
  onSave,
  onDelete,
}) => {
  const [studyDate, setStudyDate] = useState<string>(selectedDate);
  const currentCheckin: StudyCheckin | null = useMemo(
    (): StudyCheckin | null =>
      items.find((item: StudyCheckin): boolean => item.studyDate === studyDate)
        ?? null,
    [items, studyDate],
  );
  const [draft, setDraft] = useState<CheckinDraft>(() =>
    draftFromCheckin(currentCheckin),
  );
  const [validationError, setValidationError] = useState<string>('');

  useEffect((): void => {
    setStudyDate(selectedDate);
    const selectedCheckin: StudyCheckin | null = items.find(
      (item: StudyCheckin): boolean => item.studyDate === selectedDate,
    ) ?? null;
    setDraft(draftFromCheckin(selectedCheckin));
    setValidationError('');
  }, [items, open, selectedDate]);

  const updateDraft = (field: keyof CheckinDraft, value: string): void => {
    setDraft((previous: CheckinDraft): CheckinDraft => ({
      ...previous,
      [field]: value,
    }));
  };

  const chooseDate = (date: Date | undefined): void => {
    if (!date) return;
    const value: string = calendarDateToString(date);
    setStudyDate(value);
    const selectedCheckin: StudyCheckin | null = items.find(
      (item: StudyCheckin): boolean => item.studyDate === value,
    ) ?? null;
    setDraft(draftFromCheckin(selectedCheckin));
    setValidationError('');
  };

  const handleSave = async (): Promise<void> => {
    const parseMinutes = (value: string): number =>
      value.trim() === '' ? 0 : Number(value);
    const input: StudyCheckinInput = {
      friendsMinutes: parseMinutes(draft.friendsMinutes),
      readingMinutes: parseMinutes(draft.readingMinutes),
      otherMinutes: parseMinutes(draft.otherMinutes),
      friendsProgress: draft.friendsProgress,
      bookTitle: draft.bookTitle,
      readingProgress: draft.readingProgress,
      takeaway: draft.takeaway,
      notes: draft.notes,
    };
    const values: number[] = [
      input.friendsMinutes,
      input.readingMinutes,
      input.otherMinutes,
    ];
    const isInvalid: boolean = values.some(
      (value: number): boolean =>
        !Number.isInteger(value) || value < 0 || value > 1440,
    );
    if (isInvalid) {
      setValidationError('学习时长请输入 0 到 1440 的整数');
      return;
    }
    if (values.reduce((sum: number, value: number): number => sum + value, 0) === 0) {
      setValidationError('请至少记录 1 分钟学习时长');
      return;
    }
    setValidationError('');
    await onSave(studyDate, input);
  };

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent className="checkin-dialog max-h-[90vh] max-w-2xl overflow-y-auto">
        <DialogHeader>
          <div className="dialog-kicker"><Clock3 /> DAILY CHECK-IN</div>
          <DialogTitle>{currentCheckin ? '编辑学习记录' : '记录今天的进步'}</DialogTitle>
          <DialogDescription>
            时长用于生成热力图；进度与收获会保留在最近记录中。
          </DialogDescription>
        </DialogHeader>

        <div className="checkin-fields">
          <div className="field-group field-wide">
            <Label>学习日期</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button className="date-picker" variant="outline">
                  <CalendarIcon />
                  {formatDisplayDate(studyDate)}
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" className="w-auto p-0">
                <Calendar
                  locale={zhCN}
                  mode="single"
                  onSelect={chooseDate}
                  selected={fromDateString(studyDate)}
                />
              </PopoverContent>
            </Popover>
          </div>

          <MinuteField
            label="老友记"
            onChange={(value: string): void => updateDraft('friendsMinutes', value)}
            value={draft.friendsMinutes}
          />
          <MinuteField
            label="原著阅读"
            onChange={(value: string): void => updateDraft('readingMinutes', value)}
            value={draft.readingMinutes}
          />
          <MinuteField
            label="其他英语"
            onChange={(value: string): void => updateDraft('otherMinutes', value)}
            value={draft.otherMinutes}
          />

          <TextField
            label="老友记进度"
            onChange={(value: string): void => updateDraft('friendsProgress', value)}
            placeholder="例如：S2 E11 · 第4遍 · 无字幕"
            value={draft.friendsProgress}
          />
          <TextField
            label="正在读的书"
            onChange={(value: string): void => updateDraft('bookTitle', value)}
            placeholder="英文书名"
            value={draft.bookTitle}
          />
          <TextField
            label="阅读进度"
            onChange={(value: string): void => updateDraft('readingProgress', value)}
            placeholder="例如：Chapter 5 / p.86"
            value={draft.readingProgress}
          />

          <div className="field-group field-wide">
            <Label htmlFor="takeaway">今日收获</Label>
            <Textarea
              id="takeaway"
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>): void =>
                updateDraft('takeaway', event.target.value)
              }
              placeholder="记下一句地道表达、一个生词，或今天读懂的内容"
              value={draft.takeaway}
            />
          </div>
          <div className="field-group field-wide">
            <Label htmlFor="notes">备注</Label>
            <Textarea
              id="notes"
              onChange={(event: React.ChangeEvent<HTMLTextAreaElement>): void =>
                updateDraft('notes', event.target.value)
              }
              placeholder="可选"
              value={draft.notes}
            />
          </div>
        </div>

        {validationError && <p className="form-error">{validationError}</p>}
        <DialogFooter className="items-center sm:justify-between">
          {currentCheckin ? (
            <Button
              className="delete-button"
              disabled={saving}
              onClick={(): Promise<void> => onDelete(currentCheckin.id)}
              variant="ghost"
            >
              <Trash2 /> 删除记录
            </Button>
          ) : <span />}
          <Button
            className="save-button"
            data-ai-section-type="button"
            disabled={saving}
            onClick={handleSave}
          >
            {saving ? '保存中…' : '保存打卡'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface MinuteFieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
}

const MinuteField: React.FC<MinuteFieldProps> = ({ label, value, onChange }) => (
  <div className="field-group">
    <Label>{label}<span className="field-unit">分钟</span></Label>
    <Input
      inputMode="numeric"
      min={0}
      onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
        onChange(event.target.value)
      }
      placeholder="0"
      type="number"
      value={value}
    />
  </div>
);

interface TextFieldProps {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
}

const TextField: React.FC<TextFieldProps> = ({
  label,
  value,
  placeholder,
  onChange,
}) => (
  <div className="field-group">
    <Label>{label}</Label>
    <Input
      onChange={(event: React.ChangeEvent<HTMLInputElement>): void =>
        onChange(event.target.value)
      }
      placeholder={placeholder}
      value={value}
    />
  </div>
);

export default CheckinDialog;
