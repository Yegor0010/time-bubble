import * as api from './api';
import { useUserStore } from '~/stores/user-store';
import dataBase from './indexedDB';

interface DataItem {
  id: number;
  [key: string]: any;
}

interface SyncQueueItem {
  id?: number;
  storeName: string;
  action: 'create' | 'update' | 'delete';
  data: DataItem;
  timestamp: number;
}

class DataAdapter {
  private db: dataBase;
  private syncQueueStore = 'syncQueue';
  private initialized = false;

  constructor() {
    this.db = new dataBase('timeBubbleDB', 1);
    this.init();
  }

  private async init(): Promise<void> {
    try {
      await this.db.open();
      this.initialized = true;
      this.setupNetworkListeners();
    } catch (error) {
      console.error('Failed to initialize database:', error);
    }
  }

  private get isOnline(): boolean {
    return useUserStore.getState().user.settings.isOnline;
  }

  setOnlineMode(isOnline: boolean): void {
    useUserStore.getState().changeSettings({ isOnline });
    if (isOnline) {
      this.syncData();
    }
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      console.log('Network connection detected. Enable online mode in settings to sync.');
    });

    window.addEventListener('offline', () => {
      console.log('Network connection lost.');
      this.setOnlineMode(false);
    });
  }

  async create<T extends DataItem>(storeName: string, data: T): Promise<T> {
    if (!this.initialized) await this.init();

    if (this.isOnline) {
      try {
        await api.create(`/${storeName}`, data);
        return await this.db.create(storeName, data) as unknown as T;
      } catch (error) {
        console.warn('Online create failed, saving to offline queue:', error);
        await this.queueForSync(storeName, 'create', data);
        return await this.db.create(storeName, data) as unknown as T;
      }
    } else {
      await this.queueForSync(storeName, 'create', data);
      return await this.db.create(storeName, data) as unknown as T;
    }
  }

  async read<T>(storeName: string, id: number): Promise<T> {
    if (!this.initialized) await this.init();
    return await this.db.read<T>(storeName, id);
  }

  async update<T extends DataItem>(storeName: string, data: T): Promise<T> {
    if (!this.initialized) await this.init();

    if (this.isOnline) {
      try {
        await api.update(`/${storeName}/${data.id}`, data);
        return await this.db.update(storeName, data) as unknown as T;
      } catch (error) {
        console.warn('Online update failed, saving to offline queue:', error);
        await this.queueForSync(storeName, 'update', data);
        return await this.db.update(storeName, data) as unknown as T;
      }
    } else {
      await this.queueForSync(storeName, 'update', data);
      return await this.db.update(storeName, data) as unknown as T;
    }
  }

  async delete(storeName: string, id: number): Promise<void> {
    if (!this.initialized) await this.init();

    if (this.isOnline) {
      try {
        await api.remove(`/${storeName}/${id}`);
        await this.db.delete(storeName, id);
      } catch (error) {
        console.warn('Online delete failed, saving to offline queue:', error);
        await this.queueForSync(storeName, 'delete', { id } as DataItem);
        await this.db.delete(storeName, id);
      }
    } else {
      await this.queueForSync(storeName, 'delete', { id } as DataItem);
      await this.db.delete(storeName, id);
    }
  }

  private async queueForSync(storeName: string, action: 'create' | 'update' | 'delete', data: DataItem): Promise<void> {
    if (!this.initialized) return;

    const queueItem: SyncQueueItem = {
      storeName,
      action,
      data,
      timestamp: Date.now(),
    };

    try {
      await this.db.create(this.syncQueueStore, queueItem);
    } catch (error) {
      console.error('Failed to queue item for sync:', error);
    }
  }

  async syncData(): Promise<void> {
    if (!this.initialized || !this.isOnline) return;

    // Note: This is a simplified version. In production, you'd need to get all items from syncQueue
    // The current database class doesn't have a getAll method, so we'll need to add it or handle differently
    console.log('Sync would happen here - needs getAll implementation in database class');
  }
}

export default new DataAdapter();
