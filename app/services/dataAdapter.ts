import * as api from './api';
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
  private _offlineMode = true;
  private _networkAvailable = navigator.onLine;

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

  get shouldUseOnline(): boolean {
    return !this._offlineMode && this._networkAvailable;
  }

  get networkAvailable(): boolean {
    return this._networkAvailable;
  }

  get offlineMode(): boolean {
    return this._offlineMode;
  }

  setOfflineMode(offlineMode: boolean): void {
    this._offlineMode = offlineMode;

    if (!offlineMode && this._networkAvailable) {
      this.syncData();
    }
  }

  private setupNetworkListeners(): void {
    window.addEventListener('online', () => {
      this._networkAvailable = true;
      console.log('Network connection detected.');

      if (!this._offlineMode) {
        console.log('Syncing data...');
        this.syncData();
      }
    });

    window.addEventListener('offline', () => {
      this._networkAvailable = false;
      console.log('Network connection lost.');
    });
  }

  async create<T extends DataItem>(storeName: string, data: T): Promise<T> {
    if (!this.initialized) await this.init();

    if (this.shouldUseOnline) {
      try {
        await api.create(`/${storeName}`, data);
        return await this.db.create(storeName, data) as unknown as T;
      } catch (error) {
        console.warn('Online create failed, saving to offline queue:', error);
        await this.queueForSync(storeName, 'create', data);
        return await this.db.create(storeName, data) as unknown as T;
      }
    } else {
      return await this.db.create(storeName, data) as unknown as T;
    }
  }

  async read<T>(storeName: string, id: number): Promise<T> {
    if (!this.initialized) await this.init();
    return await this.db.read<T>(storeName, id);
  }

  async readAll<T>(storeName: string): Promise<T[]> {
    if (!this.initialized) await this.init();
    return await this.db.getAll<T>(storeName);
  }

  async update<T extends DataItem>(storeName: string, data: T): Promise<T> {
    if (!this.initialized) await this.init();

    if (this.shouldUseOnline) {
      try {
        await api.update(`/${storeName}/${data.id}`, data);
        return await this.db.update(storeName, data) as unknown as T;
      } catch (error) {
        console.warn('Online update failed, saving to offline queue:', error);
        await this.queueForSync(storeName, 'update', data);
        return await this.db.update(storeName, data) as unknown as T;
      }
    } else {
      return await this.db.update(storeName, data) as unknown as T;
    }
  }

  async delete(storeName: string, id: number): Promise<void> {
    if (!this.initialized) await this.init();

    if (this.shouldUseOnline) {
      try {
        await api.remove(`/${storeName}/${id}`);
        await this.db.delete(storeName, id);
      } catch (error) {
        console.warn('Online delete failed, saving to offline queue:', error);
        await this.queueForSync(storeName, 'delete', { id } as DataItem);
        await this.db.delete(storeName, id);
      }
    } else {
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
    if (!this.initialized || !this.shouldUseOnline) return;

    // TODO: Implement: 
    // - logic to read all items from syncQueueStore
    // - attempt to sync with server
    // - clear queue on success
    console.log('Sync triggered');
  }
}

export default new DataAdapter();
