import React, { useState, useEffect, useRef } from 'react';
import { ScrollView, Alert, View, Platform, TouchableOpacity, Share, Clipboard } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { router, useLocalSearchParams } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import io from 'socket.io-client';

import { ThemedView } from '@/components/themed-view';
import { ThemedText } from '@/components/themed-text';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import InviteCollaboratorsModal from '@/components/InviteCollaboratorsModal';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { ENDPOINTS } from '../src/constants/endpoints';

function CreateScreen() {
  const params = useLocalSearchParams();
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [image, setImage] = useState('');
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showCategoryDropdown, setShowCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState<string[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(false);

  const socketRef = useRef<any>(null);
  const isWeb = Platform.OS === 'web';

  const [collaborators, setCollaborators] = useState<string[]>([]);
  const [sessionId, setSessionId] = useState<string>('');

  const [inviteModalVisible, setInviteModalVisible] = React.useState(false);

  const handleShare = async () => {
    // We will replace this function usage with modal open
    setInviteModalVisible(true);
  };

  useEffect(() => {
    const initialize = async () => {
      fetchCategories();
      if (params.id) {
        setIsEdit(true);
        setEditingId(params.id as string);
        fetchRecurso(params.id as string);
        await setupSocket(params.id as string);
      } else if (params.session) {
        // Join existing creation session
        setSessionId(params.session as string);
        await setupSocket(params.session as string);
      } else {
        // Create new session for creation
        const newSessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        setSessionId(newSessionId);
        await setupSocket(newSessionId);
      }
    };

    initialize();

    return () => {
      if (socketRef.current) {
        const roomId = params.id || params.session;
        if (roomId) {
          socketRef.current.emit('leave-resource', roomId);
        }
        socketRef.current.disconnect();
      }
    };
  }, [params.id, params.session]);

  const setupSocket = async (resourceId: string) => {
    socketRef.current = io('http://172.16.185.197:4000');
    socketRef.current.emit('join-resource', resourceId);

    // Get userId synchronously before setting up listeners
    const userId = await AsyncStorage.getItem('userId');
    if (userId) {
      socketRef.current.emit('set-user-id', userId);
      socketRef.current.currentUserId = userId;
    }

    socketRef.current.on('content-updated', (data: { content: string; userId: string }) => {
      // Update content only if the update is from another user
      if (socketRef.current && socketRef.current.currentUserId && socketRef.current.currentUserId !== data.userId) {
        setContent(data.content);
      }
    });

    socketRef.current.on('title-updated', (data: { title: string; userId: string }) => {
      // Update title only if the update is from another user
      if (socketRef.current && socketRef.current.currentUserId && socketRef.current.currentUserId !== data.userId) {
        setTitle(data.title);
      }
    });

    // Listen for collaborators update
    socketRef.current.on('collaborators-updated', (users: string[]) => {
      setCollaborators(users);
    });

    // Listen for typing indicator updates
    socketRef.current.on('user-typing', (data: { userId: string; isTyping: boolean }) => {
      if (socketRef.current && socketRef.current.currentUserId && socketRef.current.currentUserId !== data.userId) {
        setIsUserTyping(data.isTyping);
      }
    });

    // Listen for session state updates
    socketRef.current.on('session-state', (data: { collaborators: string[] }) => {
      setCollaborators(data.collaborators);
    });

    // Listen for session transfer updates
    socketRef.current.on('transfer-session', (data: { oldSessionId: string; newResourceId: string }) => {
      // Update sessionId to the new resource ID
      setSessionId(data.newResourceId);
      setIsEdit(true);
      setEditingId(data.newResourceId);
    });

    // Request current session state when joining
    socketRef.current.emit('request-session-state', { resourceId });
  };

  const [isUserTyping, setIsUserTyping] = useState(false);

  // Emit typing status to other users
  const emitTypingStatus = (isTyping: boolean) => {
    if (socketRef.current) {
      const roomId = editingId || sessionId;
      if (roomId) {
        AsyncStorage.getItem('userId').then((userId) => {
          socketRef.current.emit('user-typing', {
            resourceId: roomId,
            userId: userId || '',
            isTyping,
          });
        });
      }
    }
  };

  // Modify handleContentChange to emit typing status
  const handleContentChange = (text: string) => {
    setContent(text);
    emitTypingStatus(true);
    if (socketRef.current) {
      const roomId = editingId || sessionId;
      if (roomId) {
        AsyncStorage.getItem('userId').then((userId) => {
          socketRef.current.emit('update-content', {
            resourceId: roomId,
            content: text,
            userId: userId || '',
          });
        });
      }
    }
    // Stop typing indicator after a delay
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    typingTimeoutRef.current = setTimeout(() => {
      emitTypingStatus(false);
    }, 2000);
  };

  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchCategories = async () => {
    setCategoriesLoading(true);
    try {
      const baseURL = Platform.OS === 'web' ? 'http://localhost:4000/api' : 'http://172.16.185.197:4000/api';
      const response = await fetch(`${baseURL}/categories`, { mode: 'cors' });
      if (response.ok) {
        const data = await response.json();
        setCategories(data.map((cat: any) => cat.name));
      } else {
        setCategories(['Tecnología', 'Ciencia', 'Arte', 'Historia', 'Deportes', 'Otro']);
      }
    } catch (error) {
      setCategories(['Tecnología', 'Ciencia', 'Arte', 'Historia', 'Deportes', 'Otro']);
    } finally {
      setCategoriesLoading(false);
    }
  };

  const fetchRecurso = async (id: string) => {
    try {
      const response = await fetch(ENDPOINTS.RECURSO_BY_ID(id));
      if (response.ok) {
        const data = await response.json();
        setTitle(data.title);
        setContent(data.content);
        setCategory(data.category);
        setImage(data.image || '');
        setTags(data.tags ? data.tags.join(', ') : '');
      } else {
        Alert.alert('Error', 'No se pudo cargar el recurso');
      }
    } catch (err) {
      Alert.alert('Error', 'Error de conexión');
    }
  };

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};
    if (!title.trim()) newErrors.title = 'El título es requerido';
    if (!content.trim()) newErrors.content = 'El contenido es requerido';
    if (!category.trim()) newErrors.category = 'La categoría es requerida';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };



  // Emit title changes to other users (for creation session)
  const handleTitleChange = (text: string) => {
    setTitle(text);
    if (socketRef.current) {
      const roomId = editingId || sessionId;
      if (roomId) {
        AsyncStorage.getItem('userId').then((userId) => {
          socketRef.current.emit('update-title', {
            resourceId: roomId,
            title: text,
            userId: userId || '',
          });
        });
      }
    }
  };



  const handleSubmit = async () => {
    if (!validateForm()) return;
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        Alert.alert('Error', 'Usuario no autenticado');
        return;
      }

      const url = isEdit ? ENDPOINTS.RECURSO_BY_ID(editingId) : ENDPOINTS.RECURSOS;
      const method = isEdit ? 'PUT' : 'POST';
      const headers: any = { 'Content-Type': 'application/json' };
      if (!isEdit) {
        headers.userId = userId;
      }

      const bodyData: any = {
        title,
        content,
        category,
        image: image || undefined,
        tags: tags ? tags.split(',').map(t => t.trim()) : undefined,
      };
      if (!isEdit) {
        bodyData.author = userId;
      }

      const response = await fetch(url, {
        method,
        headers,
        body: JSON.stringify(bodyData),
        mode: 'cors',
      });
      if (response.ok) {
        const data = await response.json();
        Alert.alert('Éxito', `Recurso ${isEdit ? 'actualizado' : 'creado'} exitosamente`);

        // If creating a new resource, transfer session to real resource ID
        if (!isEdit && socketRef.current && sessionId) {
          socketRef.current.emit('transfer-session', {
            oldSessionId: sessionId,
            newResourceId: data._id,
          });
        }

        router.push('/home');
      } else {
        const error = await response.json();
        Alert.alert('Error', error.error || `Error al ${isEdit ? 'actualizar' : 'crear'} recurso`);
      }
    } catch (err) {
      Alert.alert('Error', 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ThemedView style={{ flex: 1, padding: isWeb ? 40 : 20 }}>
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            maxWidth: isWeb ? 600 : undefined,
            alignSelf: isWeb ? 'center' : undefined,
            width: isWeb ? '100%' : undefined,
          }}
        >
          <View
            style={{
              backgroundColor: 'rgba(255,255,255,0.95)',
              borderRadius: 20,
              padding: 28,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.15,
              shadowRadius: 12,
              elevation: 8,
              marginBottom: 20,
              borderWidth: 1,
              borderColor: 'rgba(46,97,255,0.1)',
            }}
          >
            <View style={{ alignItems: 'center', marginBottom: 24 }}>
              <MaterialIcons name={isEdit ? 'edit' : 'add-circle'} size={40} color="#4CAF50" />
              <ThemedText type="title" style={{ marginTop: 8, textAlign: 'center' }}>
                {isEdit ? 'Editar Recurso' : 'Crear Nuevo Recurso'}
              </ThemedText>
              <ThemedText style={{ marginTop: 4, color: '#666', textAlign: 'center' }}>
                {isEdit ? 'Actualiza la información de tu recurso' : 'Comparte conocimiento con la comunidad'}
              </ThemedText>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginTop: 8 }}>
                <TouchableOpacity
                  onPress={handleShare}
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    backgroundColor: '#E3F2FD',
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 16,
                    marginRight: 8,
                  }}
                >
                  <MaterialIcons name="share" size={14} color="#1976D2" />
                  <ThemedText style={{ marginLeft: 4, color: '#1976D2', fontSize: 12, fontWeight: '600' }}>
                    Invitar colaboradores
                  </ThemedText>
                </TouchableOpacity>
                {collaborators.length > 1 && (
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <MaterialIcons name="people" size={16} color="#4CAF50" />
                    <ThemedText style={{ marginLeft: 4, color: '#4CAF50', fontSize: 14 }}>
                      {collaborators.length} usuarios {isEdit ? 'editando' : 'colaborando'}
                    </ThemedText>
                  </View>
                )}
              </View>
            </View>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialIcons name="title" size={20} color="#666" />
                <ThemedText style={{ marginLeft: 8, fontWeight: '600' }}>Título *</ThemedText>
              </View>
              <Input
                placeholder="Ingresa el título del recurso"
                value={title}
                onChangeText={handleTitleChange}
                autoCapitalize="sentences"
                autoCorrect
              />
              {errors.title && (
                <ThemedText style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.title}</ThemedText>
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialIcons name="description" size={20} color="#666" />
                <ThemedText style={{ marginLeft: 8, fontWeight: '600' }}>Contenido *</ThemedText>
              </View>
              <Input
                placeholder="Describe el contenido del recurso"
                value={content}
                onChangeText={handleContentChange}
                multiline
                style={{ height: 120, textAlignVertical: 'top' }}
              />
              {errors.content && (
                <ThemedText style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.content}</ThemedText>
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialIcons name="category" size={20} color="#666" />
                <ThemedText style={{ marginLeft: 8, fontWeight: '600' }}>Categoría *</ThemedText>
              </View>
              <TouchableOpacity
                style={{
                  borderWidth: 1,
                  borderColor: '#ddd',
                  borderRadius: 8,
                  padding: 12,
                  backgroundColor: 'white',
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
                onPress={() => setShowCategoryDropdown(!showCategoryDropdown)}
              >
                <ThemedText style={{ color: category ? '#000' : '#999' }}>
                  {category || 'Selecciona una categoría'}
                </ThemedText>
                <MaterialIcons name={showCategoryDropdown ? 'expand-less' : 'expand-more'} size={24} color="#666" />
              </TouchableOpacity>
              {showCategoryDropdown && (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: '#ddd',
                    borderTopWidth: 0,
                    borderRadius: 8,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                    backgroundColor: 'white',
                    maxHeight: 150,
                  }}
                >
                  <ScrollView>
                    {categories.map((cat) => (
                      <TouchableOpacity
                        key={cat}
                        style={{
                          padding: 12,
                          borderBottomWidth: 1,
                          borderBottomColor: '#eee',
                        }}
                        onPress={() => {
                          setCategory(cat);
                          setShowCategoryDropdown(false);
                        }}
                      >
                        <ThemedText>{cat}</ThemedText>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
              {errors.category && (
                <ThemedText style={{ color: 'red', fontSize: 14, marginTop: 4 }}>{errors.category}</ThemedText>
              )}
            </View>

            <View style={{ marginBottom: 16 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialIcons name="image" size={20} color="#666" />
                <ThemedText style={{ marginLeft: 8, fontWeight: '600' }}>URL de imagen</ThemedText>
              </View>
              <Input
                placeholder="https://ejemplo.com/imagen.jpg"
                value={image}
                onChangeText={setImage}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={{ marginBottom: 24 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 8 }}>
                <MaterialIcons name="tag" size={20} color="#666" />
                <ThemedText style={{ marginLeft: 8, fontWeight: '600' }}>Etiquetas</ThemedText>
              </View>
              <Input
                placeholder="etiqueta1, etiqueta2, etiqueta3"
                value={tags}
                onChangeText={setTags}
                autoCapitalize="none"
                autoCorrect={false}
              />
            </View>

            <View style={{ flexDirection: isWeb ? 'row' : 'column', justifyContent: 'space-between' }}>
              <Button
                onPress={handleSubmit}
                disabled={loading}
                style={{
                  flex: isWeb ? 1 : undefined,
                  marginRight: isWeb ? 12 : 0,
                  marginBottom: isWeb ? 0 : 12,
                  borderRadius: 12,
                  paddingVertical: 14,
                  backgroundColor: '#4CAF50',
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name={loading ? 'hourglass-empty' : 'save'} size={20} color="white" />
                  <ThemedText style={{ color: 'white', marginLeft: 8, fontWeight: '600' }}>
                    {loading ? (isEdit ? 'Actualizando...' : 'Creando...') : (isEdit ? 'Actualizar' : 'Crear')}
                  </ThemedText>
                </View>
              </Button>

              <Button
                variant="outline"
                onPress={() => router.back()}
                style={{
                  flex: isWeb ? 1 : undefined,
                  borderRadius: 12,
                  paddingVertical: 14,
                }}
              >
                <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center' }}>
                  <MaterialIcons name="cancel" size={20} color="#666" />
                  <ThemedText style={{ color: '#666', marginLeft: 8, fontWeight: '600' }}>Cancelar</ThemedText>
                </View>
              </Button>
            </View>
          </View>
        </ScrollView>
      </ThemedView>
      <InviteCollaboratorsModal
        visible={inviteModalVisible}
        onClose={() => setInviteModalVisible(false)}
        resourceId={isEdit ? editingId : sessionId}
      />
    </SafeAreaView>
  );
}

export default CreateScreen;
