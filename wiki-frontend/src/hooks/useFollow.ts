import { useState, useCallback } from 'react';
import { User, FollowState } from '../types';
import { userService } from '../services/user.service';

export const useFollow = (currentUserId: string | null) => {
  const [followStates, setFollowStates] = useState<Record<string, FollowState>>({});

  const checkFollowStatus = useCallback(async (targetUserId: string) => {
    if (!currentUserId) return;

    setFollowStates(prev => ({
      ...prev,
      [targetUserId]: { ...prev[targetUserId], isLoading: true }
    }));

    try {
      const response = await userService.getFollowing(currentUserId);
      if (response.data) {
        const isFollowing = response.data.some((user: User) => user._id === targetUserId);
        setFollowStates(prev => ({
          ...prev,
          [targetUserId]: { isFollowing, isLoading: false }
        }));
      } else {
        setFollowStates(prev => ({
          ...prev,
          [targetUserId]: { isFollowing: false, isLoading: false }
        }));
      }
    } catch (error) {
      setFollowStates(prev => ({
        ...prev,
        [targetUserId]: { isFollowing: false, isLoading: false }
      }));
    }
  }, [currentUserId]);

  const followUser = async (targetUserId: string) => {
    if (!currentUserId) return { success: false, error: 'Not authenticated' };

    setFollowStates(prev => ({
      ...prev,
      [targetUserId]: { ...prev[targetUserId], isLoading: true }
    }));

    try {
      const response = await userService.follow(targetUserId, currentUserId);
      if (!response.error) {
        setFollowStates(prev => ({
          ...prev,
          [targetUserId]: { isFollowing: true, isLoading: false }
        }));
        return { success: true };
      } else {
        setFollowStates(prev => ({
          ...prev,
          [targetUserId]: { ...prev[targetUserId], isLoading: false }
        }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      setFollowStates(prev => ({
        ...prev,
        [targetUserId]: { ...prev[targetUserId], isLoading: false }
      }));
      return { success: false, error: 'Failed to follow user' };
    }
  };

  const unfollowUser = async (targetUserId: string) => {
    if (!currentUserId) return { success: false, error: 'Not authenticated' };

    setFollowStates(prev => ({
      ...prev,
      [targetUserId]: { ...prev[targetUserId], isLoading: true }
    }));

    try {
      const response = await userService.unfollow(targetUserId, currentUserId);
      if (!response.error) {
        setFollowStates(prev => ({
          ...prev,
          [targetUserId]: { isFollowing: false, isLoading: false }
        }));
        return { success: true };
      } else {
        setFollowStates(prev => ({
          ...prev,
          [targetUserId]: { ...prev[targetUserId], isLoading: false }
        }));
        return { success: false, error: response.error };
      }
    } catch (error) {
      setFollowStates(prev => ({
        ...prev,
        [targetUserId]: { ...prev[targetUserId], isLoading: false }
      }));
      return { success: false, error: 'Failed to unfollow user' };
    }
  };

  const toggleFollow = async (targetUserId: string) => {
    const currentState = followStates[targetUserId];
    if (currentState?.isFollowing) {
      return await unfollowUser(targetUserId);
    } else {
      return await followUser(targetUserId);
    }
  };

  const getFollowState = (targetUserId: string): FollowState => {
    return followStates[targetUserId] || { isFollowing: false, isLoading: false };
  };

  return {
    checkFollowStatus,
    followUser,
    unfollowUser,
    toggleFollow,
    getFollowState,
  };
};
