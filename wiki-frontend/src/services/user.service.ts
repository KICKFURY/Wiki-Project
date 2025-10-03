import { User, ApiResponse } from '../types';
import { apiClient } from './api';
import { ENDPOINTS } from '../constants/endpoints';

export class UserService {
  async getById(id: string): Promise<ApiResponse<User>> {
    return apiClient.get(ENDPOINTS.USER_BY_ID(id));
  }

  async follow(targetUserId: string, followerId: string): Promise<ApiResponse<void>> {
    return apiClient.post(ENDPOINTS.USER_FOLLOW(targetUserId), { followerId });
  }

  async unfollow(targetUserId: string, followerId: string): Promise<ApiResponse<void>> {
    return apiClient.post(ENDPOINTS.USER_UNFOLLOW(targetUserId), { followerId });
  }

  async getFollowers(userId: string): Promise<ApiResponse<User[]>> {
    // Note: This endpoint might need to be added to ENDPOINTS if it exists
    return apiClient.get(`${ENDPOINTS.USERS}/followers/${userId}`);
  }

  async getFollowing(userId: string): Promise<ApiResponse<User[]>> {
    return apiClient.get(ENDPOINTS.USER_FOLLOWING(userId));
  }

  async invite(fromUserId: string, toUserIds: string[], resourceId: string): Promise<ApiResponse<{ message: string }>> {
    return apiClient.post(ENDPOINTS.USER_INVITE, { fromUserId, toUserIds, resourceId });
  }
}

export const userService = new UserService();
