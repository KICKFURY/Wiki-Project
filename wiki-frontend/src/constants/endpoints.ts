import { Platform } from 'react-native';

const API_BASE_URL =
    Platform.OS === 'web'
        ? 'http://localhost:4000/api'
        : 'http://localhost:4000/api';

// const API_BASE_URL =
//     Platform.OS === 'web'
//         ? 'http://localhost:4000/api'
//         : 'http://localhost:4000/api';

export const ENDPOINTS = {
    // Auth endpoints
    LOGIN: `${API_BASE_URL}/auth/login`,
    REGISTER: `${API_BASE_URL}/auth/register`,
    LOGOUT: `${API_BASE_URL}/usuarios/logout`,

    // User endpoints
    USERS: `${API_BASE_URL}/usuarios`,
    USER_BY_ID: (id: string) => `${API_BASE_URL}/usuarios/${id}`,
    USER_FOLLOW: (targetId: string) => `${API_BASE_URL}/usuarios/${targetId}/follow`,
    USER_UNFOLLOW: (targetId: string) => `${API_BASE_URL}/usuarios/${targetId}/unfollow`,
    USER_FOLLOWING: (id: string) => `${API_BASE_URL}/usuarios/following/${id}`,
    USER_INVITE: `${API_BASE_URL}/usuarios/invite`,

    // Recurso endpoints
    RECURSOS: `${API_BASE_URL}/recursos`,
    RECURSO_BY_ID: (id: string) => `${API_BASE_URL}/recursos/${id}`,

    // Category endpoints
    CATEGORIES: `${API_BASE_URL}/categories`,
} as const;

export default ENDPOINTS;
