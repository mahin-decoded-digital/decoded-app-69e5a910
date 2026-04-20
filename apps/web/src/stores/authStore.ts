import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from '../types';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, role: Role) => void;
  logout: () => void;
  updateProfile: (data: Partial<User>) => void;
}

// Mock initial users for testing
export const MOCK_USERS: User[] = [
  { id: 'u1', email: 'admin@studioflow.com', name: 'Alice Admin', role: 'admin', joinedAt: new Date().toISOString() },
  { id: 'u2', email: 'staff@studioflow.com', name: 'Sam Staff', role: 'staff', joinedAt: new Date().toISOString() },
  { id: 'u3', email: 'instructor@studioflow.com', name: 'Ivy Instructor', role: 'instructor', joinedAt: new Date().toISOString() },
  { id: 'u4', email: 'member@studioflow.com', name: 'Mike Member', role: 'member', joinedAt: new Date().toISOString() },
  { id: 'u5', email: 'finance@studioflow.com', name: 'Fiona Finance', role: 'finance', joinedAt: new Date().toISOString() },
];

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      login: (email, role) => {
        const existingUser = MOCK_USERS.find(u => u.email === email && u.role === role);
        if (existingUser) {
          set({ user: existingUser, isAuthenticated: true });
        } else {
          const newUser: User = {
            id: Math.random().toString(36).substring(7),
            email,
            name: email.split('@')[0],
            role,
            joinedAt: new Date().toISOString()
          };
          set({ user: newUser, isAuthenticated: true });
        }
      },
      logout: () => set({ user: null, isAuthenticated: false }),
      updateProfile: (data) => set((state) => ({
        user: state.user ? { ...state.user, ...data } : null
      }))
    }),
    {
      name: 'studioflow-auth',
    }
  )
);
