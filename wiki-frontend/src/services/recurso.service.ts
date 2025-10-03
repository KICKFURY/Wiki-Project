import { Recurso, RecursoForm, ApiResponse, PaginatedResponse } from '../types';
import { apiClient } from './api';
import { ENDPOINTS } from '../constants/endpoints';

export class RecursoService {
  async getAll(): Promise<ApiResponse<Recurso[]>> {
    return apiClient.get(ENDPOINTS.RECURSOS);
  }

  async getById(id: string): Promise<ApiResponse<Recurso>> {
    return apiClient.get(ENDPOINTS.RECURSO_BY_ID(id));
  }

  async create(recursoData: RecursoForm): Promise<ApiResponse<Recurso>> {
    return apiClient.post(ENDPOINTS.RECURSOS, recursoData);
  }

  async update(id: string, recursoData: Partial<RecursoForm>): Promise<ApiResponse<Recurso>> {
    return apiClient.put(ENDPOINTS.RECURSO_BY_ID(id), recursoData);
  }

  async delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(ENDPOINTS.RECURSO_BY_ID(id));
  }
}

export const recursoService = new RecursoService();
