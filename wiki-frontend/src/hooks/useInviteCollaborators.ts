import { useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';
import { userService } from '../services/user.service';
import { User as UserType } from '../types';

export interface User extends UserType {}

export interface UseInviteCollaboratorsReturn {
  followedUsers: User[];
  selectedUserIds: string[];
  loading: boolean;
  currentUserId: string | null;
  toggleSelectUser: (userId: string) => void;
  sendInvitations: (resourceId: string) => Promise<void>;
  loadCurrentUser: () => Promise<void>;
  fetchFollowedUsers: () => Promise<void>;
}

export const useInviteCollaborators = (): UseInviteCollaboratorsReturn => {
  const [followedUsers, setFollowedUsers] = useState<User[]>([]);
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const loadCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);
    } catch (error) {
      Alert.alert('Error', 'No se pudo obtener el usuario actual');
    }
  };

  const fetchFollowedUsers = async () => {
    if (!currentUserId) return;
    setLoading(true);
    try {
      const response = await userService.getFollowing(currentUserId);
      if (response.data) {
        setFollowedUsers(response.data);
      } else {
        setFollowedUsers([]);
      }
    } catch (error) {
      Alert.alert('Error', 'No se pudieron cargar los usuarios seguidos');
    } finally {
      setLoading(false);
    }
  };

  const toggleSelectUser = (userId: string) => {
    setSelectedUserIds(prev => {
      if (prev.includes(userId)) {
        return prev.filter(id => id !== userId);
      } else {
        return [...prev, userId];
      }
    });
  };

  const sendInvitations = async (resourceId: string) => {
    if (!currentUserId) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }
    if (selectedUserIds.length === 0) {
      Alert.alert('Error', 'Selecciona al menos un usuario para invitar');
      return;
    }
    setLoading(true);
    try {
      const response = await userService.invite(currentUserId, selectedUserIds, resourceId);
      if (response.data?.message) {
        Alert.alert('Éxito', response.data.message);
        setSelectedUserIds([]);
      } else {
        Alert.alert('Error', 'No se pudieron enviar las invitaciones');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al enviar las invitaciones');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (currentUserId) {
      fetchFollowedUsers();
    }
  }, [currentUserId]);

  return {
    followedUsers,
    selectedUserIds,
    loading,
    currentUserId,
    toggleSelectUser,
    sendInvitations,
    loadCurrentUser,
    fetchFollowedUsers,
  };
};
