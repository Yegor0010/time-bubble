import { create } from 'zustand';
import dataAdapter from '~/services/dataAdapter';
import { logger } from './middleware/logger';

interface Settings {
  focusTime: number;
  breakTime: number;
  theme: string;
  focusTone: string;
  breakTone: string;
  notifications: boolean;
  offlineMode: boolean;
}

interface User {
  id: number;
  name: string;
  email?: string;
  settings: Settings;
}

interface UserStore {
  user: User;
  isLoading: boolean;
  error: string | null;
  updateUser: (payload: Partial<User>) => Promise<void>;
  changeSettings: (payload: Partial<Settings>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
  loadUser: () => Promise<void>;
}

const defaultSettings: Settings = {
  focusTime: 25 * 60, // 25 minutes in seconds
  breakTime: 5 * 60, // 5 minutes in seconds
  theme: 'system',
  focusTone: 'default',
  breakTone: 'default',
  notifications: true,
  offlineMode: true,
};

const defaultUser: User = {
  id: 1,
  name: 'anonymous',
  settings: defaultSettings,
};

const DATA_STORE_KEY = 'user';

export const useUserStore = create<UserStore>()(logger((set, get) => ({
  user: defaultUser,
  isLoading: false,
  error: null,

  updateUser: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = { ...get().user, ...payload };
      await dataAdapter.update(DATA_STORE_KEY, updatedUser);
      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  changeSettings: async (payload) => {
    set({ isLoading: true, error: null });
    try {
      const updatedUser = {
        ...get().user,
        settings: { ...get().user.settings, ...payload },
      };
      await dataAdapter.update(DATA_STORE_KEY, updatedUser);

      if ('offlineMode' in payload) {
        dataAdapter.setOfflineMode(payload.offlineMode!);
      }

      // Save theme to localStorage for quick access on page load
      if ('theme' in payload) {
        localStorage.setItem('theme', payload.theme!);
      }

      set({ user: updatedUser, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  deleteUser: async (id: number) => {
    set({ isLoading: true, error: null });
    try {
      await dataAdapter.delete(DATA_STORE_KEY, id);
      // Recreate default user
      await dataAdapter.create(DATA_STORE_KEY, defaultUser);
      set({ user: defaultUser, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },

  loadUser: async () => {
    set({ isLoading: true, error: null });
    try {
      const user = await dataAdapter.read<User>(DATA_STORE_KEY, 1);
      if (user) {
        dataAdapter.setOfflineMode(user.settings.offlineMode);
        // Sync theme to localStorage for quick access on page load
        localStorage.setItem('theme', user.settings.theme);
        set({ user, isLoading: false });
      } else {
        await dataAdapter.create(DATA_STORE_KEY, defaultUser);
        localStorage.setItem('theme', defaultUser.settings.theme);
        set({ user: defaultUser, isLoading: false });
      }
    } catch (error) {
      try {
        await dataAdapter.create(DATA_STORE_KEY, defaultUser);
        localStorage.setItem('theme', defaultUser.settings.theme);
        set({ user: defaultUser, isLoading: false });
      } catch (createError) {
        set({ error: (createError as Error).message, isLoading: false });
      }
    }
  },
}), 'UserStore'));
