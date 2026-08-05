import { apiClient } from './client';
import type { DepartmentResponse } from './types';

export async function listDepartments(): Promise<DepartmentResponse[]> {
  const { data } = await apiClient.get<DepartmentResponse[]>('/departments');
  return data;
}
