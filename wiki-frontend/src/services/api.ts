import { ApiResponse, PaginatedResponse } from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

// Base API configuration
export class ApiClient {
    private baseURL: string;

    constructor(baseURL?: string) {
        this.baseURL = baseURL || (Platform.OS === 'web' ? 'http://localhost:4000/api' : 'http://localhost:4000/api');
    }

    private async getAuthHeaders(): Promise<Record<string, string>> {
        try {
            const userId = await AsyncStorage.getItem('userId');
            return userId ? { userId } : {};
        } catch (error) {
            return {};
        }
    }

    private async request<T>(
        endpoint: string,
        options: RequestInit = {},
        requireAuth: boolean = false
    ): Promise<ApiResponse<T>> {
        try {
            const authHeaders = requireAuth ? await this.getAuthHeaders() : {};
            const response = await fetch(`${this.baseURL}${endpoint}`, {
                ...options,
                headers: {
                    'Content-Type': 'application/json',
                    ...authHeaders,
                    ...options.headers,
                },
            });

            const data = await response.json();

            if (!response.ok) {
                return {
                    error: data.message || data.error || `HTTP ${response.status}: ${response.statusText}`,
                };
            }

            return { data };
        } catch (error) {
            return {
                error: error instanceof Error ? error.message : 'Network error',
            };
        }
    }

    async get<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'GET' }, false);
    }

    async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'POST',
            body: data ? JSON.stringify(data) : undefined,
        }, true);
    }

    async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, {
            method: 'PUT',
            body: data ? JSON.stringify(data) : undefined,
        }, true);
    }

    async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
        return this.request<T>(endpoint, { method: 'DELETE' }, true);
    }
}

// Singleton instance
export const apiClient = new ApiClient();
