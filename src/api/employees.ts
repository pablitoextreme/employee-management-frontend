import { apiClient } from './client';
import type { EmployeeRequest, EmployeeResponse, EmployeeSearchParams, PageResponse } from './types';

export async function listEmployees(params: EmployeeSearchParams): Promise<PageResponse<EmployeeResponse>> {
  const { data } = await apiClient.get<PageResponse<EmployeeResponse>>('/employees', { params });
  return data;
}

export async function getEmployee(id: string): Promise<EmployeeResponse> {
  const { data } = await apiClient.get<EmployeeResponse>(`/employees/${id}`);
  return data;
}

// Requiere rol ADMIN en el backend (@PreAuthorize) — un usuario USER recibirá 403.
export async function createEmployee(payload: EmployeeRequest): Promise<EmployeeResponse> {
  const { data } = await apiClient.post<EmployeeResponse>('/employees', payload);
  return data;
}

export async function updateEmployee(id: string, payload: EmployeeRequest): Promise<EmployeeResponse> {
  const { data } = await apiClient.put<EmployeeResponse>(`/employees/${id}`, payload);
  return data;
}

export async function deleteEmployee(id: string): Promise<void> {
  await apiClient.delete(`/employees/${id}`);
}
