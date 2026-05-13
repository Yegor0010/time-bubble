import { create } from 'zustand';
import dataAdapter from '~/services/dataAdapter';
import { logger } from './middleware/logger';

interface Interval {
  id: number;
  isRunning: boolean;
  isOnBreak: boolean;
  durationSeconds: number;
  taskId?: number;
  userId?: number;
  startDate?: Date;
  endDate?: Date;
}

interface IntervalsStore {
  byId: Record<number, Interval>;
  isLoading: boolean;
  error: string | null;
  addInterval: (interval: Interval) => Promise<void>;
  editInterval: (interval: Interval) => Promise<void>;
  deleteInterval: (id: number) => Promise<void>;
  getInterval: (id: number) => Interval | undefined;
  getAllIntervals: () => Interval[];
  getCount: () => number;
  loadIntervals: () => Promise<void>;
}

const DATA_STORE_KEY = 'intervals';

export const useIntervalsStore = create<IntervalsStore>()(logger((set, get) => ({
  byId: {},
  isLoading: false,
  error: null,
  
  addInterval: async (interval) => {
    set({ isLoading: true, error: null });
    try {
      await dataAdapter.create(DATA_STORE_KEY, interval);
      set((state) => ({
        byId: { ...state.byId, [interval.id]: interval },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  editInterval: async (interval) => {
    set({ isLoading: true, error: null });
    try {
      await dataAdapter.update(DATA_STORE_KEY, interval);
      set((state) => ({
        byId: {
          ...state.byId,
          [interval.id]: { ...state.byId[interval.id], ...interval },
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  deleteInterval: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dataAdapter.delete(DATA_STORE_KEY, id);
      set((state) => {
        const { [id]: removed, ...restById } = state.byId;
        return { byId: restById, isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      throw error;
    }
  },
  
  getInterval: (id) => get().byId[id],
  
  getAllIntervals: () => Object.values(get().byId),
  
  getCount: () => Object.keys(get().byId).length,
  
  loadIntervals: async () => {
    set({ isLoading: true, error: null });
    try {
      const intervals = await dataAdapter.readAll<Interval>(DATA_STORE_KEY);
      const byId = intervals.reduce((acc, interval) => {
        acc[interval.id] = interval;
        return acc;
      }, {} as Record<number, Interval>);
      set({ byId, isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
    }
  },
}), 'IntervalsStore'));
