import React, { useEffect } from 'react';
import { Modal, View, Text, ActivityIndicator, StyleSheet, TouchableOpacity } from 'react-native';
import { ThemedText } from './themed-text';
import { useInviteCollaborators } from '../src/hooks/useInviteCollaborators';
import { UserList } from './UserList';

interface InviteCollaboratorsModalProps {
  visible: boolean;
  onClose: () => void;
  resourceId: string;
}

const InviteCollaboratorsModal: React.FC<InviteCollaboratorsModalProps> = ({ visible, onClose, resourceId }) => {
  const {
    followedUsers,
    selectedUserIds,
    loading,
    loadCurrentUser,
    toggleSelectUser,
    sendInvitations,
  } = useInviteCollaborators();

  useEffect(() => {
    if (visible) {
      loadCurrentUser();
    }
  }, [visible]);

  const handleSendInvitations = async () => {
    await sendInvitations(resourceId);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Invitar Colaboradores</Text>
          {loading ? (
            <ActivityIndicator size="large" />
          ) : followedUsers.length === 0 ? (
            <View style={styles.noUsersContainer}>
              <Text style={styles.noUsersText}>No sigues a ningún usuario</Text>
              <Text style={styles.hintText}>
                Para invitar colaboradores, primero debes seguir a otros usuarios desde la pantalla de perfil.
              </Text>
            </View>
          ) : (
            <UserList
              users={followedUsers}
              selectedUserIds={selectedUserIds}
              onToggleSelect={toggleSelectUser}
            />
          )}
          <View style={styles.buttonsContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose} disabled={loading}>
              <Text style={styles.cancelButtonText}>Cancelar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.inviteButton} onPress={handleSendInvitations} disabled={loading}>
              <Text style={styles.inviteButtonText}>Invitar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContainer: {
    width: '85%',
    maxHeight: '80%',
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  noUsersContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  noUsersText: {
    textAlign: 'center',
    marginBottom: 10,
    color: '#666',
  },
  hintText: {
    textAlign: 'center',
    color: '#999',
    fontSize: 14,
  },
  buttonsContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  cancelButton: {
    marginRight: 12,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#ccc',
  },
  cancelButtonText: {
    color: '#333',
    fontWeight: 'bold',
  },
  inviteButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    backgroundColor: '#287bff',
  },
  inviteButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
});

export default InviteCollaboratorsModal;
