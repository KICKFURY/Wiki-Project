// app/create.tsx
import React, { useEffect, useRef, useState } from 'react';
import {
  ScrollView,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  StyleSheet,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import io from 'socket.io-client';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { Picker } from '@react-native-picker/picker';

import { Input } from '@/components/ui/input';
import InviteCollaboratorsModal from '@/components/InviteCollaboratorsModal';
import { ENDPOINTS } from '../src/constants/endpoints';
import { router, useLocalSearchParams } from 'expo-router';

export default function CreateScreen() {
  const params = useLocalSearchParams();
  const id = params.id as string | undefined;
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [category, setCategory] = useState('');
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [tags, setTags] = useState('');
  const [loading, setLoading] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [editingId, setEditingId] = useState('');
  const [categories, setCategories] = useState<any[]>([]);
  const [inviteVisible, setInviteVisible] = useState(false);
  const socketRef = useRef<any>(null);

  useEffect(() => {
    initScreen();
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [id]);

  const initScreen = async () => {
    await loadCategories();
    const userId = await AsyncStorage.getItem('userId');
    if (!userId) {
      Alert.alert('Error', 'Usuario no autenticado');
      return;
    }

    if (id) {
      setIsEdit(true);
      setEditingId(id);
      await loadRecurso(id);
      setupSocket(id, userId);
    } else {
      setIsEdit(false);
    }
  };

  const setupSocket = (resourceId: string, userId: string) => {
    const socketUrl = 'http://localhost:4000';
    socketRef.current = io(socketUrl);
    socketRef.current.currentUserId = userId;
    socketRef.current.emit('join-resource', resourceId);
    socketRef.current.on('content-updated', (data: any) => {
      if (data.userId !== socketRef.current.currentUserId) setContent(data.content);
    });
    socketRef.current.on('title-updated', (data: any) => {
      if (data.userId !== socketRef.current.currentUserId) setTitle(data.title);
    });
  };

  const loadCategories = async () => {
    try {
      const resp = await fetch((ENDPOINTS as any).CATEGORIES);
      if (resp.ok) {
        const data = await resp.json();
        setCategories(data);
      } else {
        console.log('Categorías no cargadas:', resp.status);
      }
    } catch (err) {
      console.log('Error cargando categorías', err);
    }
  };

  const loadRecurso = async (id: string) => {
    try {
      const resp = await fetch((ENDPOINTS as any).RECURSO_BY_ID(id));
      if (resp.ok) {
        const data = await resp.json();
        setTitle(data.title || '');
        setContent(data.content || '');
        setCategory(data.category?._id || '');
        setImageUri(data.image || null);
        setTags(Array.isArray(data.tags) ? data.tags.join(', ') : '');
      }
    } catch (err) {
      console.warn('Error al cargar recurso', err);
    }
  };

  const pickImage = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permiso denegado', 'Necesitamos acceso a la galería');
      return;
    }
    const res = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
      allowsEditing: true,
      aspect: [4, 3],
      base64: true,
    });
    if (!res.canceled && res.assets?.[0]?.uri) {
      setImageUri(res.assets[0].uri);
      setImageBase64(res.assets[0].base64 || null);
    }
  };

  const validate = () => {
    if (!title.trim()) return Alert.alert('Validación', 'El título es requerido');
    if (!content.trim()) return Alert.alert('Validación', 'El contenido es requerido');
    if (!category) return Alert.alert('Validación', 'Selecciona una categoría');
    return true;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) throw new Error('Usuario no autenticado');

      const body: any = {
        title,
        content,
        category,
        tags: tags ? tags.split(',').map(t => t.trim()).filter(Boolean) : [],
      };
      if (imageBase64) body.image = `data:image/jpeg;base64,${imageBase64}`;

      const url = isEdit ? (ENDPOINTS as any).RECURSO_BY_ID(editingId) : (ENDPOINTS as any).RECURSOS;
      const method = isEdit ? 'PUT' : 'POST';

      const resp = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', 'userId': userId },
        body: JSON.stringify(body),
      });

      const result = await resp.json();
      if (!resp.ok) {
        console.error('Error:', result);
        Alert.alert('Error', result.error || result.message || 'No se pudo guardar el recurso');
      } else {
        Alert.alert('Éxito', isEdit ? 'Recurso actualizado correctamente' : 'Recurso creado con éxito');
        if (!isEdit && result._id) {
          setEditingId(result._id);
        }
        router.push('/home');
      }
    } catch (err) {
      console.error('Error al crear/actualizar', err);
      Alert.alert('Error', 'Error de conexión con el servidor');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.card}>
          <View style={styles.header}>
            <MaterialIcons name={isEdit ? 'edit' : 'add-circle'} size={34} color="#4F46E5" />
            <Text style={styles.title}>{isEdit ? 'Editar Recurso' : 'Crear Nuevo Recurso'}</Text>
            <Text style={styles.subtitle}>
              {isEdit ? 'Actualiza tu recurso educativo' : 'Comparte conocimiento con la comunidad'}
            </Text>
          </View>

          <View style={{ marginTop: 12 }}>
            <Input placeholder="Título" value={title} onChangeText={setTitle} />
            <Input placeholder="Contenido" value={content} onChangeText={setContent} multiline style={{ height: 120 }} />

            {/* --- SELECT de categoría --- */}
            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Categoría</Text>
              <Picker
                selectedValue={category}
                onValueChange={(val) => setCategory(val)}
                style={styles.picker}
              >
                <Picker.Item label="Selecciona una categoría" value="" />
                {categories.map((cat: any) => (
                  <Picker.Item key={cat._id} label={cat.name} value={cat._id} />
                ))}
              </Picker>
            </View>

            <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
              <Text style={{ color: '#2563EB', fontWeight: '600' }}>
                {imageUri ? 'Cambiar imagen' : 'Seleccionar imagen'}
              </Text>
            </TouchableOpacity>
            {imageUri ? <Image source={{ uri: imageUri }} style={styles.preview} /> : null}

            <Input placeholder="etiqueta1, etiqueta2" value={tags} onChangeText={setTags} />
          </View>

          <View style={styles.actions}>
            <TouchableOpacity
              style={[styles.btnPrimary, loading && { opacity: 0.7 }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>{isEdit ? 'Actualizar' : 'Crear'}</Text>}
            </TouchableOpacity>

            <TouchableOpacity style={styles.btnOutline} onPress={() => router.push('/home')} disabled={loading}>
              <Text style={styles.btnOutlineText}>Cancelar</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.inviteRow} onPress={() => setInviteVisible(true)}>
            <MaterialIcons name="share" size={18} color="#111" />
            <Text style={styles.inviteText}>Invitar colaboradores</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <InviteCollaboratorsModal
        visible={inviteVisible}
        onClose={() => setInviteVisible(false)}
        resourceId={editingId}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 16, paddingBottom: 40 },
  card: { backgroundColor: '#fff', borderRadius: 14, padding: 16, elevation: 6, shadowColor: '#000' },
  header: { alignItems: 'center' },
  title: { fontSize: 20, fontWeight: '700', marginTop: 8, color: '#111' },
  subtitle: { color: '#666', marginTop: 4, textAlign: 'center' },
  pickerContainer: { marginVertical: 10 },
  label: { fontWeight: '600', color: '#333', marginBottom: 4 },
  picker: {
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    height: 48,
  },
  imagePicker: { marginTop: 10, paddingVertical: 10, alignItems: 'center' },
  preview: { width: '100%', height: 180, borderRadius: 10, marginTop: 8, backgroundColor: '#eee' },
  actions: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 18, gap: 8 },
  btnPrimary: { flex: 1, backgroundColor: '#4F46E5', paddingVertical: 12, borderRadius: 10, alignItems: 'center', marginRight: 8 },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  btnOutline: { flex: 1, borderColor: '#ddd', borderWidth: 1, paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  btnOutlineText: { color: '#333', fontWeight: '700' },
  inviteRow: { marginTop: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  inviteText: { fontWeight: '600', marginLeft: 8, color: '#111' },
});
