// Core entity types
export interface User {
  _id: string;
  dni: string;
  username: string;
  email: string;
  role: string;
  followers?: string[];
  following?: string[];
}

export interface Recurso {
  _id: string;
  title: string;
  content: string;
  category: string;
  author: User;
  image?: string;
  tags?: string[];
  createdAt?: string;
  updatedAt?: string;
}

// API Response types
export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
}

// Form types
export interface LoginForm {
  email: string;
  password: string;
}

export interface RegisterForm {
  dni: string;
  username: string;
  email: string;
  password: string;
  role?: string;
}

export interface RecursoForm {
  title: string;
  content: string;
  category: string;
  image?: string;
  tags?: string;
}

export interface UserProfileForm {
  dni: string;
  username: string;
  email: string;
  role: string;
}

// UI State types
export interface LoadingState {
  isLoading: boolean;
  error: string | null;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// Filter and search types
export interface RecursoFilters {
  category?: string;
  searchQuery?: string;
  author?: string;
}

export type CategoryType = 'Popular' | 'Tecnologia' | 'Educacion' | 'Ciencia' | 'Arte' | 'Historia' | 'Deportes' | 'Otro';

export interface FollowState {
  isFollowing: boolean;
  isLoading: boolean;
}
