import { create } from 'zustand';
import dataAdapter from '~/services/dataAdapter';

interface Task {
  id: number;
  name: string;
  intervals: number;
}

interface TasksStore {
  byId: Record<number, Task>;
  addTask: (task: Task) => Promise<void>;
  editTask: (task: Task) => Promise<void>;
  deleteTask: (id: number) => Promise<void>;
  getTask: (id: number) => Task | undefined;
  getAllTasks: () => Task[];
  getCount: () => number;
  loadTasks: () => Promise<void>;
}

export const useTasksStore = create<TasksStore>((set, get) => ({
  byId: {},
  
  addTask: async (task) => {
    try {
      await dataAdapter.create('tasks', task);
      set((state) => ({
        byId: { ...state.byId, [task.id]: task },
      }));
    } catch (error) {
      console.error('Failed to add task:', error);
      throw error;
    }
  },
  
  editTask: async (task) => {
    try {
      await dataAdapter.update('tasks', task);
      set((state) => ({
        byId: {
          ...state.byId,
          [task.id]: { ...state.byId[task.id], ...task },
        },
      }));
    } catch (error) {
      console.error('Failed to edit task:', error);
      throw error;
    }
  },
  
  deleteTask: async (id) => {
    try {
      await dataAdapter.delete('tasks', id);
      set((state) => {
        const { [id]: removed, ...restById } = state.byId;
        return { byId: restById };
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
      throw error;
    }
  },
  
  getTask: (id) => get().byId[id],
  
  getAllTasks: () => Object.values(get().byId),
  
  getCount: () => Object.keys(get().byId).length,
  
  loadTasks: async () => {
    try {
      // Note: You'll need to add getAllByStore method to dataAdapter or indexedDB
      // For now, this is a placeholder
      console.log('Load tasks from database');
    } catch (error) {
      console.error('Failed to load tasks:', error);
    }
  },
}));
