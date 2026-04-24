import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

type User = { id: string; email: string };

type AuthState = {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
};

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => set({ token, user }),
      logout: () => set({ token: null, user: null }),
    }),
    {
      name: 'ai-todo-auth',
      // Next.js prerender/SSR: avoid touching `localStorage` when `window` is undefined.
      storage: createJSONStorage(() => {
        if (typeof window !== 'undefined') return localStorage;
        // Minimal no-op storage for SSR; just keeps Zustand from crashing.
        return {
          getItem: () => null,
          setItem: () => {},
          removeItem: () => {},
        } as unknown as Storage;
      }),
    },
  ),
);
