import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
} from 'react-native';
// @ts-ignore
import Icon from 'react-native-vector-icons/MaterialIcons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { ENDPOINTS } from '../src/constants/endpoints';

interface User {
  _id: string;
  username: string;
  email: string;
  role: string;
  followers: string[];
  following: string[];
  profileImage?: string;
}

export default function UsersScreen() {
  // const navigation = useNavigation();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [followingStatus, setFollowingStatus] = useState<{ [key: string]: boolean }>({});
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const initialize = async () => {
      const userId = await loadCurrentUser();
      if (userId) {
        await fetchUsers();
      } else {
        router.replace('/');
      }
    };
    initialize();
  }, []);

  useEffect(() => {
    if (currentUserId && users.length > 0) {
      loadFollowingStatus(users);
    }
  }, [currentUserId, users]);

  useEffect(() => {
    const filtered = users.filter(user =>
      user.username.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredUsers(filtered);
  }, [users, searchQuery]);

  const loadCurrentUser = async (): Promise<string | null> => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);
      return userId;
    } catch (error) {
      console.error('Error loading current user:', error);
      return null;
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch(ENDPOINTS.USERS);
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        Alert.alert('Error', 'No se pudieron cargar los usuarios');
      }
    } catch (error) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const loadFollowingStatus = async (usersList: User[]) => {
    if (!currentUserId) return;

    try {
      const response = await fetch(`http://localhost:4000/api/usuarios/following/${currentUserId}`);
      if (response.ok) {
        const following = await response.json();
        const followingIds = following.map((user: any) => user._id);

        const status: { [key: string]: boolean } = {};
        usersList.forEach(user => {
          status[user._id] = followingIds.includes(user._id);
        });
        setFollowingStatus(status);
      } else {
        console.error('Error loading following status:', response.status);
        // If API call fails, initialize all as false
        const status: { [key: string]: boolean } = {};
        usersList.forEach(user => {
          status[user._id] = false;
        });
        setFollowingStatus(status);
      }
    } catch (error) {
      console.error('Error loading following status:', error);
      // If API call fails, initialize all as false
      const status: { [key: string]: boolean } = {};
      usersList.forEach(user => {
        status[user._id] = false;
      });
      setFollowingStatus(status);
    }
  };

  const handleFollow = async (userId: string) => {
    if (!currentUserId) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    const isFollowing = followingStatus[userId] || false;
    const url = isFollowing
      ? `http://localhost:4000/api/usuarios/${userId}/unfollow`
      : `http://localhost:4000/api/usuarios/${userId}/follow`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUserId }),
      });

      if (response.ok) {
        setFollowingStatus(prev => ({
          ...prev,
          [userId]: !isFollowing,
        }));

        // Update local user counts
        setUsers(prev => prev.map(user =>
          user._id === userId
            ? {
                ...user,
                followers: isFollowing
                  ? user.followers.filter(id => id !== currentUserId)
                  : [...user.followers, currentUserId]
              }
            : user
        ));
      } else {
        Alert.alert('Error', 'No se pudo actualizar el estado de seguimiento');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al actualizar el estado de seguimiento');
    }
  };

  const renderUser = ({ item }: { item: User }) => {
    const isCurrentUser = item._id === currentUserId;
    const isFollowing = followingStatus[item._id] || false;

    return (
      <View style={styles.userCard}>
        <View style={styles.userInfo}>
          {item.profileImage ? (
            <Image source={{ uri: `data:image/jpeg;base64,${item.profileImage}` }} style={styles.avatarImage} />
          ) : (
            <View style={styles.avatar}>
              <IconSymbol name="person.fill" size={30} color="#666" />
            </View>
          )}
          <View style={styles.userDetails}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.role}>{item.role === 'admin' ? 'Administrador' : 'Contribuidor'}</Text>
            <Text style={styles.stats}>
              {item.followers?.length || 0} seguidores • {item.following?.length || 0} siguiendo
            </Text>
          </View>
        </View>

        {!isCurrentUser && (
          <TouchableOpacity
            style={[styles.followButton, isFollowing && styles.followingButton]}
            onPress={() => handleFollow(item._id)}
          >
            <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
              {isFollowing ? 'Siguiendo' : 'Seguir'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.push('/home')}>
          <IconSymbol name="arrow.left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Usuarios</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <Icon name="search" size={24} color="#666" style={styles.searchIcon} />
        <TextInput
          placeholder="Buscar usuarios..."
          style={styles.searchInput}
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      <FlatList
        data={filteredUsers}
        renderItem={renderUser}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContainer}
        showsVerticalScrollIndicator={false}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.2,
    borderBottomColor: '#ccc',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    marginVertical: 12,
    backgroundColor: '#f1f3f4',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: '#333',
  },
  listContainer: {
    padding: 20,
  },
  userCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 15,
    marginBottom: 10,
    backgroundColor: '#f8f8f8',
    borderRadius: 10,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0e0e0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 15,
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 2,
  },
  role: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  stats: {
    fontSize: 12,
    color: '#888',
  },
  followButton: {
    backgroundColor: '#2e61ff',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  followingButton: {
    backgroundColor: '#28a745',
  },
  followButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: 'bold',
  },
  followingButtonText: {
    color: '#fff',
  },
});
