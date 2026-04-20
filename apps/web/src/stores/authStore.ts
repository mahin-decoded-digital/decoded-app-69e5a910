import { create } from 'zustand';
import { User, Role } from '../types';
import { apiUrl } from '@/lib/api';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, role: Role) => Promise<void>;
  logout: () => void;
  updateProfile: (data: Partial<User>) => Promise<void>;
}

export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'admin@studioflow.com', name: 'Alice Admin', role: 'admin', joinedAt: new Date().toISOString() },
  { id: 'u2', email: 'staff@studioflow.com', name: 'Sam Staff', role: 'staff', joinedAt: new Date().toISOString() },
  { id: 'u3', email: 'instructor@studioflow.com', name: 'Ivy Instructor', role: 'instructor', joinedAt: new Date().toISOString() },
  { id: 'u4', email: 'member@studioflow.com', name: 'Mike Member', role: 'member', joinedAt: new Date().toISOString() },
  { id: 'u5', email: 'finance@studioflow.com', name: 'Fiona Finance', role: 'finance', joinedAt: new Date().toISOString() },
];

export const useAuthStore = create<AuthState>((set, get) => ({
  user: (() => {
    try {
      const stored = localStorage.getItem('studioflow-user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  })(),
  isAuthenticated: (() => {
    try {
      return !!localStorage.getItem('studioflow-user');
    } catch {
      return false;
    }
  })(),
  loading: false,

  login: async (email, role) => {
    set({ loading: true });
    try {
      const res = await fetch(apiUrl('/api/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, role })
      });
      if (!res.ok) throw new Error('Failed to login');
      const user = await res.json();
      const mappedUser = { ...user, id: user._id || user.id };
      localStorage.setItem('studioflow-user', JSON.stringify(mappedUser));
      set({ user: mappedUser, isAuthenticated: true, loading: false });
    } catch (err) {
      set({ loading: false });
      console.error(err);
    }
  },

  logout: () => {
    localStorage.removeItem('studioflow-user');
    set({ user: null, isAuthenticated: false });
  },

  updateProfile: async (data) => {
    const user = get().user;
    if (!user) return;
    try {
      const res = await fetch(apiUrl(`/api/users/${user.id}`), {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (!res.ok) throw new Error('Failed to update profile');
      const updated = await res.json();
      const mappedUser = { ...updated, id: updated._id || updated.id };
      localStorage.setItem('studioflow-user', JSON.stringify(mappedUser));
      set({ user: mappedUser });
    } catch (err) {
      console.error(err);
    }
  }
}));