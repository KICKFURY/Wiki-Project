import React from 'react';
import { FlatList, StyleSheet } from 'react-native';
import { UserItem } from './UserItem';
import { User } from '../src/hooks/useInviteCollaborators';

interface UserListProps {
  users: User[];
  selectedUserIds: string[];
  onToggleSelect: (userId: string) => void;
}

export const UserList: React.FC<UserListProps> = ({ users, selectedUserIds, onToggleSelect }) => {
  const renderUser = ({ item }: { item: User }) => {
    const isSelected = selectedUserIds.includes(item._id);
    return (
      <UserItem
        user={item}
        isSelected={isSelected}
        onToggleSelect={onToggleSelect}
      />
    );
  };

  return (
    <FlatList
      data={users}
      keyExtractor={item => item._id}
      renderItem={renderUser}
      extraData={selectedUserIds}
      style={styles.userList}
    />
  );
};

const styles = StyleSheet.create({
  userList: {
    maxHeight: 300,
    marginBottom: 12,
  },
});
