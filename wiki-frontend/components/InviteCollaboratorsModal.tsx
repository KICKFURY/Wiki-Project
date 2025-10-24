import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  FlatList,
  Image,
  StyleSheet,
  Platform,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { ENDPOINTS } from '../src/constants/endpoints';

interface Props {
  visible: boolean;
  onClose: () => void;
  resourceId: string;
  // optionally receive a callback after invitations sent
  onInvited?: (invitedIds: string[]) => void;
}

export default function InviteCollaboratorsModal({ visible, onClose, resourceId, onInvited }: Props) {
  const [loading, setLoading] = useState<boolean>(true);
  const [following, setFollowing] = useState<any[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [sending, setSending] = useState<boolean>(false);
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (visible) {
      fetchFollowing();
      setMessage(null);
      setSelectedIds([]);
    }
  }, [visible]);

  const fetchFollowing = async () => {
    setLoading(true);
    try {
      const userId = await AsyncStorage.getItem('userId');
      if (!userId) {
        setFollowing([]);
        setLoading(false);
        return;
      }

      // ENDPOINTS.USER_FOLLOWING should be a function or base string; adapt if needed
      // We'll use ENDPOINTS.USER_FOLLOWING(userId) if it's a function; otherwise fallback.
      const url = typeof (ENDPOINTS as any).USER_FOLLOWING === 'function'
        ? (ENDPOINTS as any).USER_FOLLOWING(userId)
        : `${(ENDPOINTS as any).USER_FOLLOWING}/${userId}`;

      const resp = await fetch(url);
      if (!resp.ok) {
        console.warn('InviteModal: fetchFollowing resp not ok', resp.status);
        setFollowing([]);
      } else {
        const data = await resp.json();
        setFollowing(Array.isArray(data) ? data : []);
      }
    } catch (err) {
      console.error('InviteModal: error fetchFollowing', err);
      setFollowing([]);
    } finally {
      setLoading(false);
    }
  };

  const toggleSelect = (id: string) => {
    setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  };

  const handleInvite = async () => {
    if (!selectedIds.length) {
      setMessage('Selecciona al menos una persona para invitar.');
      return;
    }
    setSending(true);
    setMessage(null);
    try {
      const fromUserId = await AsyncStorage.getItem('userId');
      if (!fromUserId) throw new Error('Usuario no autenticado');

      const url = (ENDPOINTS as any).USER_INVITE ?? `${(ENDPOINTS as any).USERS}/invite`;

      const resp = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'userId': fromUserId },
        body: JSON.stringify({
          fromUserId,
          toUserIds: selectedIds,
          resourceId,
        }),
      });

      if (!resp.ok) {
        const text = await resp.text();
        console.error('InviteModal: invite failed', resp.status, text);
        setMessage('Error al enviar invitaciones.');
      } else {
        const data = await resp.json().catch(() => ({}));
        setMessage(data.message || 'Invitaciones enviadas correctamente.');
        onInvited?.(selectedIds);
        // optionally keep modal open; here we clear selection
        setSelectedIds([]);
      }
    } catch (err) {
      console.error('InviteModal: exception', err);
      setMessage('Error de conexión al enviar invitaciones.');
    } finally {
      setSending(false);
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const checked = selectedIds.includes(item._id);
    return (
      <TouchableOpacity style={styles.row} onPress={() => toggleSelect(item._id)}>
        <View style={styles.left}>
          <Image
            source={{ uri: item.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(item.username)}&background=random` }}
            style={styles.avatar}
          />
          <View style={{ flex: 1 }}>
            <Text style={styles.username}>{item.username}</Text>
            <Text style={styles.email}>{item.email}</Text>
          </View>
        </View>
        <View style={styles.right}>
          <TouchableOpacity
            onPress={() => toggleSelect(item._id)}
            style={[styles.checkbox, checked && styles.checkboxChecked]}
            activeOpacity={0.8}
          >
            {checked && <Text style={styles.checkboxLabel}>✓</Text>}
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <View style={styles.backdrop}>
        <View style={styles.modal}>
          <Text style={styles.title}>Invitar colaboradores</Text>
          <Text style={styles.subtitle}>Elige entre las personas que sigues para colaborar</Text>

          {loading ? (
            <View style={{ padding: 24, alignItems: 'center' }}>
              <ActivityIndicator size="large" />
            </View>
          ) : following.length === 0 ? (
            <View style={{ padding: 20, alignItems: 'center' }}>
              <Text style={styles.emptyTitle}>No sigues a nadie</Text>
              <Text style={styles.emptySubtitle}>Sigue a otros usuarios para poder invitarlos aquí.</Text>
            </View>
          ) : (
            <FlatList
              data={following}
              keyExtractor={(i) => i._id}
              renderItem={renderItem}
              contentContainerStyle={{ paddingVertical: 8 }}
              style={{ maxHeight: 320 }}
            />
          )}

          {message ? <Text style={styles.message}>{message}</Text> : null}

          <View style={styles.actions}>
            <TouchableOpacity style={styles.btnOutline} onPress={onClose} disabled={sending}>
              <Text style={styles.btnOutlineText}>Cerrar</Text>
            </TouchableOpacity>

            <TouchableOpacity style={[styles.btnPrimary, sending && { opacity: 0.6 }]} onPress={handleInvite} disabled={sending}>
              {sending ? <ActivityIndicator color="#fff" /> : <Text style={styles.btnPrimaryText}>Invitar ({selectedIds.length})</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(10,10,10,0.45)',
    justifyContent: 'center',
    padding: 20,
  },
  modal: {
    borderRadius: 16,
    backgroundColor: Platform.OS === 'ios' ? '#fff' : '#fff',
    padding: 18,
    elevation: 10,
    shadowColor: '#000',
  },
  title: { fontSize: 18, fontWeight: '700', color: '#111', textAlign: 'center' },
  subtitle: { fontSize: 13, color: '#666', textAlign: 'center', marginTop: 6, marginBottom: 12 },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, paddingHorizontal: 6 },
  left: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  avatar: { width: 44, height: 44, borderRadius: 22, marginRight: 12, backgroundColor: '#eee' },
  username: { fontSize: 15, fontWeight: '600', color: '#111' },
  email: { fontSize: 12, color: '#777', marginTop: 2 },
  right: { width: 56, alignItems: 'flex-end' },
  checkbox: { width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' },
  checkboxChecked: { backgroundColor: '#4F46E5', borderColor: '#4F46E5' },
  checkboxLabel: { color: '#fff', fontWeight: '700' },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: '#333' },
  emptySubtitle: { fontSize: 13, color: '#666', marginTop: 6, textAlign: 'center' },
  actions: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 12, gap: 8 },
  btnOutline: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, borderWidth: 1, borderColor: '#ddd', marginRight: 8 },
  btnOutlineText: { color: '#444', fontWeight: '600' },
  btnPrimary: { paddingVertical: 10, paddingHorizontal: 14, borderRadius: 10, backgroundColor: '#4F46E5' },
  btnPrimaryText: { color: '#fff', fontWeight: '700' },
  message: { textAlign: 'center', color: '#333', marginTop: 8 },
});
