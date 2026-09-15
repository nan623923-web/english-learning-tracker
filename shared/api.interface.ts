export interface StudyCheckin {
  id: string;
  studyDate: string;
  friendsMinutes: number;
  readingMinutes: number;
  otherMinutes: number;
  friendsProgress: string | null;
  bookTitle: string | null;
  readingProgress: string | null;
  takeaway: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface StudyCheckinInput {
  friendsMinutes: number;
  readingMinutes: number;
  otherMinutes: number;
  friendsProgress?: string;
  bookTitle?: string;
  readingProgress?: string;
  takeaway?: string;
  notes?: string;
}

export interface StudyCheckinListResponse {
  items: StudyCheckin[];
}

export interface StudyCheckinResponse {
  item: StudyCheckin;
}

export interface DeleteStudyCheckinResponse {
  success: boolean;
}
