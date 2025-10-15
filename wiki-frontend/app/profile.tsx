import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Alert, ActivityIndicator, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { IconSymbol } from '@/components/ui/icon-symbol';
import { useAuth } from '@/src/hooks/useAuth';

interface User {
  _id: string;
  dni: string;
  username: string;
  email: string;
  role: string;
  followers?: string[];
  following?: string[];
  likes?: string[];
}

interface Recurso {
  _id: string;
  title: string;
  viewCount: number;
  category: { name: string };
}

export default function ProfileScreen() {
  const { user: authUser, logout } = useAuth();
  const [user, setUser] = useState<User | null>(null);
  const [userRecursos, setUserRecursos] = useState<Recurso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const userId = await AsyncStorage.getItem('userId');
        if (!userId) {
          Alert.alert('Error', 'No user logged in');
          router.push('/');
          return;
        }

        // Load user data
        const userResponse = await fetch(`https://wiki-project-back.vercel.app/api/usuarios/${userId}`);
        if (!userResponse.ok) {
          Alert.alert('Error', 'Failed to load user data');
          return;
        }
        const userData = await userResponse.json();
        setUser(userData);

        // Load user's recursos
        const recursosResponse = await fetch('https://wiki-project-back.vercel.app/api/recursos');
        if (recursosResponse.ok) {
          const allRecursos = await recursosResponse.json();
          const userRecursos = allRecursos.filter((recurso: any) => recurso.author._id === userId);
          setUserRecursos(userRecursos);
        }
      } catch (error) {
        Alert.alert('Error', 'Error loading user data');
      } finally {
        setLoading(false);
      }
    };
    loadUserData();
  }, []);

  const handleLogout = () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que quieres cerrar sesión?',
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Cerrar sesión',
          style: 'destructive',
          onPress: async () => {
            await logout();
            router.push('/');
          },
        },
      ]
    );
  };

  const getTopArticles = () => {
    return userRecursos
      .sort((a, b) => b.viewCount - a.viewCount)
      .slice(0, 3);
  };

  const getMaxViews = () => {
    if (userRecursos.length === 0) return 1;
    return Math.max(...userRecursos.map(r => r.viewCount));
  };

  if (loading) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (!user) {
    return (
      <ThemedView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ThemedText>No user data available</ThemedText>
      </ThemedView>
    );
  }

  const topArticles = getTopArticles();
  const maxViews = getMaxViews();

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <IconSymbol name="arrow.left" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Perfil de usuario</Text>
        <TouchableOpacity onPress={handleLogout}>
          <IconSymbol name="rectangle.portrait.and.arrow.right" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Profile Picture & Name */}
        <View style={styles.profileSection}>
          <View style={styles.profilePicContainer}>
            <View style={styles.profilePic}>
              <IconSymbol name="person.fill" size={50} color="#666" />
            </View>
            <TouchableOpacity style={styles.cameraIcon}>
              <IconSymbol name="camera.fill" size={18} color="#555" />
            </TouchableOpacity>
          </View>
          <View style={styles.nameEdit}>
            <Text style={styles.name}>{user.username}</Text>
            <TouchableOpacity>
              <IconSymbol name="pencil" size={18} color="#555" />
            </TouchableOpacity>
          </View>
          <Text style={styles.subtitle}>{user.role === 'admin' ? 'Administrador' : 'Contribuidor'}</Text>
        </View>

        {/* Dashboard */}
        <View style={styles.dashboard}>
          <Text style={styles.dashboardTitle}>Dashboard</Text>
          <View style={styles.stats}>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.followers?.length || 0}</Text>
              <Text style={styles.statLabel}>Seguidores</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{userRecursos.length}</Text>
              <Text style={styles.statLabel}>Artículos creados</Text>
            </View>
            <View style={styles.stat}>
              <Text style={styles.statNumber}>{user.likes?.length || 0}</Text>
              <Text style={styles.statLabel}>Likes dados</Text>
            </View>
          </View>
        </View>

        {/* Top Artículos */}
        <View style={styles.topArticles}>
          <Text style={styles.topTitle}>Top artículos</Text>
          {topArticles.length > 0 ? (
            topArticles.map((article, index) => {
              const progressWidth = maxViews > 0 ? (article.viewCount / maxViews) * 100 : 0;
              return (
                <View key={article._id} style={styles.articleRow}>
                  <Text style={styles.articleName} numberOfLines={1}>
                    {article.title}
                  </Text>
                  <View style={styles.progressBarBackground}>
                    <View
                      style={[
                        styles.progressBar,
                        {
                          width: `${progressWidth}%`,
                          backgroundColor: progressWidth > 50 ? '#287bff' : '#c4c4c4'
                        }
                      ]}
                    />
                  </View>
                  <Text style={styles.articleScore}>{article.viewCount}</Text>
                </View>
              );
            })
          ) : (
            <Text style={styles.noArticles}>No hay artículos creados aún</Text>
          )}
        </View>
      </ScrollView>

      {/* Bottom Navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/home')}>
          <IconSymbol name="house.fill" size={28} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={() => router.push('/create')}>
          <IconSymbol name="plus.circle.fill" size={40} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton}>
          <IconSymbol name="person.fill" size={28} color="#287bff" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderBottomWidth: 0.2,
    borderBottomColor: '#ccc'
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 20,
  },
  profilePicContainer: {
    position: 'relative',
  },
  profilePic: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#f0f0f0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cameraIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#eee',
    borderRadius: 15,
    padding: 3,
    borderWidth: 1,
    borderColor: '#999'
  },
  nameEdit: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  name: {
    fontSize: 20,
    fontWeight: '600',
    marginRight: 8,
  },
  subtitle: {
    color: '#888',
    fontSize: 14,
  },
  dashboard: {
    margin: 20,
    padding: 15,
  },
  dashboardTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#287bff',
    marginBottom: 10,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stat: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  statLabel: {
    fontSize: 12,
    color: '#666',
  },
  topArticles: {
    marginHorizontal: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#f8f8f8',
    marginBottom: 80, // Space for bottom nav
  },
  topTitle: {
    fontWeight: '600',
    fontSize: 16,
    color: '#287bff',
    marginBottom: 15,
  },
  articleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  articleName: {
    width: 100,
    fontSize: 14,
  },
  progressBarBackground: {
    flex: 1,
    height: 12,
    backgroundColor: '#dcdcdc',
    borderRadius: 6,
    marginHorizontal: 10,
  },
  progressBar: {
    height: 12,
    borderRadius: 6,
  },
  articleScore: {
    width: 30,
    textAlign: 'right',
    fontWeight: '600',
    fontSize: 12,
    color: '#555',
  },
  noArticles: {
    textAlign: 'center',
    color: '#666',
    fontStyle: 'italic',
  },
  bottomNav: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingVertical: 15,
    borderTopWidth: 0.5,
    borderTopColor: '#ddd',
    backgroundColor: '#fff',
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
