import { create } from 'zustand';
import dataAdapter from '~/services/dataAdapter';

interface Task {
  id: number;
  name: string;
  intervals: number;
}

interface TasksStore {
  byId: Record<number, Task>;
  isLoading: boolean;
  error: string | null;
  addTask: (task: Task) => Promise<void>;
  editTask: (task: Task) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  getTask: (id: number) => Task | undefined;
  getAllTasks: () => Task[];
  getCount: () => number;
  loadTasks: () => Promise<void>;
}

const DATA_STORE_KEY = 'tasks';

export const useTasksStore = create<TasksStore>((set, get) => ({
  byId: {},
  isLoading: false,
  error: null,

  addTask: async (task) => {
    set({ isLoading: true, error: null });
    try {
      await dataAdapter.create(DATA_STORE_KEY, task);
      set((state) => ({
        byId: { ...state.byId, [task.id]: task },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Failed to add task:', error);
      throw error;
    }
  },

  editTask: async (task) => {
    set({ isLoading: true, error: null });
    try {
      await dataAdapter.update(DATA_STORE_KEY, task);
      set((state) => ({
        byId: {
          ...state.byId,
          [task.id]: { ...state.byId[task.id], ...task },
        },
        isLoading: false,
      }));
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Failed to edit task:', error);
      throw error;
    }
  },

  deleteTask: async (id) => {
    set({ isLoading: true, error: null });
    try {
      await dataAdapter.delete(DATA_STORE_KEY, id);
      set((state) => {
        const { [id]: removed, ...restById } = state.byId;
        return { byId: restById, isLoading: false };
      });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Failed to delete task:', error);
      throw error;
    }
  },

  getTask: (id) => get().byId[id],

  getAllTasks: () => Object.values(get().byId),

  getCount: () => Object.keys(get().byId).length,

  loadTasks: async () => {
    set({ isLoading: true, error: null });
    try {
      // TODO: Implement loading all tasks from dataAdapter
      set({ isLoading: false });
    } catch (error) {
      set({ error: (error as Error).message, isLoading: false });
      console.error('Failed to load tasks:', error);
    }
  },
}));
