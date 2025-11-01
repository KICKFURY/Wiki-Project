import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import Icon from 'react-native-vector-icons/MaterialIcons';

// Import screens
import IndexScreen from './app/index';
import HomeScreen from './app/home';
import DetailScreen from './app/detail';
import CreateScreen from './app/create';
import UsersScreen from './app/users';
import NotificationsScreen from './app/notifications';
import ProfileScreen from './app/profile';

// Define types
export type RootStackParamList = {
  Auth: undefined;
  MainTab: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
  Detail: { id: string };
  Create: { id?: string };
};

export type CreateStackParamList = {
  Create: { id?: string };
};

export type UsersStackParamList = {
  Users: undefined;
};

export type NotificationsStackParamList = {
  Notifications: undefined;
};

export type ProfileStackParamList = {
  Profile: undefined;
};

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator<RootStackParamList>();
const HomeStack = createStackNavigator<HomeStackParamList>();
const CreateStack = createStackNavigator<CreateStackParamList>();
const UsersStack = createStackNavigator<UsersStackParamList>();
const NotificationsStack = createStackNavigator<NotificationsStackParamList>();
const ProfileStack = createStackNavigator<ProfileStackParamList>();

// Home Stack Navigator
function HomeStackNavigator() {
  return (
    <HomeStack.Navigator screenOptions={{ headerShown: false }}>
      <HomeStack.Screen name="Home" component={HomeScreen} />
      <HomeStack.Screen name="Detail" component={DetailScreen} />
      <HomeStack.Screen name="Create" component={CreateScreen} />
    </HomeStack.Navigator>
  );
}

// Create Stack Navigator
function CreateStackNavigator() {
  return (
    <CreateStack.Navigator screenOptions={{ headerShown: false }}>
      <CreateStack.Screen name="Create" component={CreateScreen} />
    </CreateStack.Navigator>
  );
}

// Users Stack Navigator
function UsersStackNavigator() {
  return (
    <UsersStack.Navigator screenOptions={{ headerShown: false }}>
      <UsersStack.Screen name="Users" component={UsersScreen} />
    </UsersStack.Navigator>
  );
}

// Notifications Stack Navigator
function NotificationsStackNavigator() {
  return (
    <NotificationsStack.Navigator screenOptions={{ headerShown: false }}>
      <NotificationsStack.Screen name="Notifications" component={NotificationsScreen} />
    </NotificationsStack.Navigator>
  );
}

// Profile Stack Navigator
function ProfileStackNavigator() {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Profile" component={ProfileScreen} />
    </ProfileStack.Navigator>
  );
}

// Main Tab Navigator
function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: string;

          if (route.name === 'HomeTab') {
            iconName = 'home';
          } else if (route.name === 'CreateTab') {
            iconName = 'add-box';
          } else if (route.name === 'UsersTab') {
            iconName = 'people';
          } else if (route.name === 'NotificationsTab') {
            iconName = 'notifications';
          } else if (route.name === 'ProfileTab') {
            iconName = 'person';
          } else {
            iconName = 'help';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#007bff',
        tabBarInactiveTintColor: 'gray',
        headerShown: false,
      })}
    >
      <Tab.Screen name="HomeTab" component={HomeStackNavigator} options={{ title: 'Inicio' }} />
      <Tab.Screen name="CreateTab" component={CreateStackNavigator} options={{ title: 'Crear' }} />
      <Tab.Screen name="UsersTab" component={UsersStackNavigator} options={{ title: 'Usuarios' }} />
      <Tab.Screen name="NotificationsTab" component={NotificationsStackNavigator} options={{ title: 'Notificaciones' }} />
      <Tab.Screen name="ProfileTab" component={ProfileStackNavigator} options={{ title: 'Perfil' }} />
    </Tab.Navigator>
  );
}

// Root Stack Navigator
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="Auth" component={IndexScreen} />
        <Stack.Screen name="MainTab" component={MainTabNavigator} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
