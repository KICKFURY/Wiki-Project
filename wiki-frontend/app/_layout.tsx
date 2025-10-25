import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { router, usePathname } from 'expo-router';

export default function RootLayout() {
  const pathname = usePathname();
  const showBottomBar = pathname !== '/';

  return (
    <>
      <StatusBar style="auto" />
      <View style={{ flex: 1 }}>
        <Stack />
        {showBottomBar && (
          <View style={styles.bottomBar}>
            <TouchableOpacity onPress={() => router.push('/home')}>
              <Icon name="home" size={28} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/create')}>
              <Icon name="add-box" size={28} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/users')}>
              <Icon name="people" size={28} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/notifications')}>
              <Icon name="notifications" size={28} color="#000" />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.push('/profile')}>
              <Icon name="person" size={28} color="#000" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </>
  );
}

const styles = StyleSheet.create({
  bottomBar: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    backgroundColor: '#fff',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e9ecef',
    paddingBottom: 20,
  },
});
