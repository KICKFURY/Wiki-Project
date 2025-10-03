import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { ThemedText } from './themed-text';
import { IconSymbol } from './ui/icon-symbol';
import { User } from '../src/hooks/useInviteCollaborators';

interface UserItemProps {
  user: User;
  isSelected: boolean;
  onToggleSelect: (userId: string) => void;
}

export const UserItem: React.FC<UserItemProps> = ({ user, isSelected, onToggleSelect }) => {
  return (
    <TouchableOpacity
      style={[styles.userItem, isSelected && styles.userItemSelected]}
      onPress={() => onToggleSelect(user._id)}
    >
      <IconSymbol name="person.fill" size={24} color={isSelected ? '#fff' : '#666'} />
      <ThemedText style={[styles.username, isSelected && styles.usernameSelected]}>
        {user.username}
      </ThemedText>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  userItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 8,
    marginBottom: 6,
    backgroundColor: '#f0f0f0',
  },
  userItemSelected: {
    backgroundColor: '#287bff',
  },
  username: {
    marginLeft: 12,
    fontSize: 16,
    color: '#333',
  },
  usernameSelected: {
    color: '#fff',
  },
});
