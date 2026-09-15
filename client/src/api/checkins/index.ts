import type { AxiosResponse } from 'axios';

import { logger } from '@lark-apaas/client-toolkit/logger';
import { axiosForBackend } from '@lark-apaas/client-toolkit/utils/getAxiosForBackend';

import type {
  DeleteStudyCheckinResponse,
  StudyCheckinInput,
  StudyCheckinListResponse,
  StudyCheckinResponse,
} from '@shared/api.interface';

export async function listCheckins(): Promise<StudyCheckinListResponse> {
  try {
    const response: AxiosResponse<StudyCheckinListResponse> =
      await axiosForBackend({
        url: '/api/checkins',
        method: 'GET',
      });
    return response.data;
  } catch (error: unknown) {
    logger.error('获取英语学习打卡失败', error);
    throw error;
  }
}

export async function saveCheckin(
  studyDate: string,
  input: StudyCheckinInput,
): Promise<StudyCheckinResponse> {
  try {
    const response: AxiosResponse<StudyCheckinResponse> =
      await axiosForBackend({
        url: `/api/checkins/${studyDate}`,
        method: 'PUT',
        data: input,
      });
    return response.data;
  } catch (error: unknown) {
    logger.error('保存英语学习打卡失败', error);
    throw error;
  }
}

export async function deleteCheckin(
  id: string,
): Promise<DeleteStudyCheckinResponse> {
  try {
    const response: AxiosResponse<DeleteStudyCheckinResponse> =
      await axiosForBackend({
        url: `/api/checkins/${id}`,
        method: 'DELETE',
      });
    return response.data;
  } catch (error: unknown) {
    logger.error('删除英语学习打卡失败', error);
    throw error;
  }
}
