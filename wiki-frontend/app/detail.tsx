import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  ActivityIndicator,
  Alert,
  TouchableOpacity,
  TextInput,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';

interface Recurso {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: { _id: string; username: string };
  image: string;
  tags: string[];
}

interface Comment {
  _id: string;
  author: { _id: string; username: string };
  content: string;
  likes: string[];
  isLikedByCurrentUser: boolean;
}

export default function DetailScreen() {
  const { id } = useLocalSearchParams();
  const [recurso, setRecurso] = useState<Recurso | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isFollowing, setIsFollowing] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  // Comments state
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [commentsLoading, setCommentsLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchRecurso();
      loadCurrentUser();
    }
  }, [id]);

  useEffect(() => {
    if (recurso && currentUserId) {
      checkFollowStatus();
      fetchComments();
    }
  }, [recurso, currentUserId]);

  const fetchRecurso = async () => {
    try {
      const response = await fetch(`http://172.16.185.197:4000/api/recursos/${id}`, { mode: 'cors' });
      if (!response.ok) {
        setError('Error al cargar el recurso');
        return;
      }
      const data = await response.json();
      setRecurso(data);
    } catch (err) {
      setError('Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const loadCurrentUser = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      setCurrentUserId(userId);
    } catch (error) {
      console.error('Error loading current user:', error);
    }
  };

  const checkFollowStatus = async () => {
    if (!recurso || !currentUserId || !recurso.author) return;

    try {
      const response = await fetch(`http://172.16.185.197:4000/api/usuarios/following/${currentUserId}`, { mode: 'cors' });
      if (response.ok) {
        const following = await response.json();
        const isFollowingAuthor = following.some((user: any) => user._id === recurso.author._id);
        setIsFollowing(isFollowingAuthor);
      }
    } catch (error) {
      console.error('Error checking follow status:', error);
    }
  };

  const fetchComments = async () => {
    if (!id) return;
    setCommentsLoading(true);
    try {
      const response = await fetch(`http://172.16.185.197:4000/api/comments/recurso/${id}`, { mode: 'cors' });
      if (response.ok) {
        const data = await response.json();
        // Mark if current user liked each comment
        const commentsWithLikeStatus = data.map((comment: any) => ({
          ...comment,
          isLikedByCurrentUser: currentUserId ? comment.likes.includes(currentUserId) : false,
        }));
        setComments(commentsWithLikeStatus);
      }
    } catch (error) {
      console.error('Error fetching comments:', error);
    } finally {
      setCommentsLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!newComment.trim()) {
      Alert.alert('Error', 'El comentario no puede estar vacío');
      return;
    }
    if (!currentUserId || !id) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }
    try {
      const response = await fetch('http://172.16.185.197:4000/api/comments', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': currentUserId
        },
        body: JSON.stringify({
          recursoId: id,
          content: newComment.trim(),
        }),
      });
      if (response.ok) {
        const savedComment = await response.json();
        // Add new comment to state
        setComments(prev => [
          ...prev,
          {
            ...savedComment,
            author: savedComment.author,
            likes: [],
            isLikedByCurrentUser: false,
          },
        ]);
        setNewComment('');
      } else {
        Alert.alert('Error', 'No se pudo agregar el comentario');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al agregar el comentario');
    }
  };

  const handleLikeComment = async (commentId: string) => {
    if (!currentUserId) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }
    try {
      const response = await fetch(`http://172.16.185.197:4000/api/comments/${commentId}/like`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'userId': currentUserId
        },
      });
      if (response.ok) {
        setComments(prev =>
          prev.map(comment => {
            if (comment._id === commentId) {
              const isLiked = comment.isLikedByCurrentUser;
              const likesCount = comment.likes.length;
              return {
                ...comment,
                isLikedByCurrentUser: !isLiked,
                likes: isLiked ? comment.likes.filter(id => id !== currentUserId) : [...comment.likes, currentUserId],
              };
            }
            return comment;
          })
        );
      } else {
        Alert.alert('Error', 'No se pudo actualizar el like');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al actualizar el like');
    }
  };

  const handleFollow = async () => {
    if (!currentUserId || !recurso) return;
    try {
      const url = isFollowing
        ? `http://172.16.185.197:4000/api/usuarios/${recurso.author._id}/unfollow`
        : `http://172.16.185.197:4000/api/usuarios/${recurso.author._id}/follow`;
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ followerId: currentUserId }),
      });
      if (response.ok) {
        setIsFollowing(!isFollowing);
      } else {
        Alert.alert('Error', 'No se pudo actualizar el estado de seguimiento');
      }
    } catch (error) {
      Alert.alert('Error', 'Error al actualizar el estado de seguimiento');
    }
  };

  if (loading) {
    return (
      <ThemedView style={styles.centered}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (!recurso) {
    return (
      <ThemedView style={styles.centered}>
        <ThemedText>Recurso no encontrado</ThemedText>
      </ThemedView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        <View style={styles.authorContainer}>
          <View>
            <Text style={styles.title}>{recurso.title}</Text>
            <Text style={styles.category}>{recurso.category}</Text>
            <Text style={styles.author}>Por {recurso.author.username}</Text>
          </View>
          {currentUserId && recurso.author._id !== currentUserId && (
            <TouchableOpacity style={[styles.followButton, isFollowing && styles.followingButton]} onPress={handleFollow}>
              <Text style={[styles.followButtonText, isFollowing && styles.followingButtonText]}>
                {isFollowing ? 'Siguiendo' : 'Seguir'}
              </Text>
            </TouchableOpacity>
          )}
        </View>
        {recurso.image && (
          <Image source={{ uri: recurso.image }} style={styles.image} />
        )}
        <Text style={styles.content}>{recurso.content}</Text>
        {recurso.tags && recurso.tags.length > 0 && (
          <View style={styles.tagsContainer}>
            <Text style={styles.tagsTitle}>Etiquetas:</Text>
            <View style={styles.tags}>
              {recurso.tags.map((tag, index) => (
                <Text key={index} style={styles.tag}>{tag}</Text>
              ))}
            </View>
          </View>
        )}

        {/* Comments Section */}
        <View style={styles.commentsSection}>
          <Text style={styles.commentsTitle}>Comentarios</Text>
          {commentsLoading ? (
            <ActivityIndicator size="small" />
          ) : (
            comments.map(comment => (
              <View key={comment._id} style={styles.commentContainer}>
                <Text style={styles.commentAuthor}>{comment.author.username}</Text>
                <Text style={styles.commentContent}>{comment.content}</Text>
                <View style={styles.commentActions}>
                  <TouchableOpacity onPress={() => handleLikeComment(comment._id)}>
                    <Text style={[styles.likeButton, comment.isLikedByCurrentUser && styles.liked]}>
                      {comment.isLikedByCurrentUser ? '❤️' : '🤍'} {comment.likes.length}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
          <View style={styles.addCommentContainer}>
            <TextInput
              style={styles.commentInput}
              placeholder="Escribe un comentario..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            <Button onPress={handleAddComment}>Comentar</Button>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  container: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  category: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  author: {
    fontSize: 14,
    color: '#999',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 10,
    marginBottom: 20,
  },
  content: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
  },
  tagsContainer: {
    marginTop: 20,
  },
  tagsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  tag: {
    backgroundColor: '#eee',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 15,
    marginRight: 10,
    marginBottom: 5,
    fontSize: 14,
  },
  authorContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  followButton: {
    backgroundColor: '#2e61ff',
    paddingHorizontal: 15,
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
  commentsSection: {
    marginTop: 30,
  },
  commentsTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  commentContainer: {
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f2f2f2',
    borderRadius: 8,
  },
  commentAuthor: {
    fontWeight: 'bold',
    marginBottom: 5,
  },
  commentContent: {
    fontSize: 14,
    marginBottom: 10,
  },
  commentActions: {
    flexDirection: 'row',
  },
  likeButton: {
    fontSize: 16,
    color: '#888',
  },
  liked: {
    color: '#e0245e',
  },
  addCommentContainer: {
    marginTop: 10,
  },
  commentInput: {
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
    minHeight: 40,
    fontSize: 14,
  },
});
