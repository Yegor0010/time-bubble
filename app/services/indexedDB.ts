export default class dataBase {
  private dbName: string;
  private dbVersion: number;
  private db: IDBDatabase | null;

  constructor(dbName: string, dbVersion: number) {
    this.dbName = dbName;
    this.dbVersion = dbVersion;
    this.db = null;
  }

  async open() {
    return new Promise<void>((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        switch (event.oldVersion) {
          case 0:
            if (!db.objectStoreNames.contains('intervals')) {
              db.createObjectStore('intervals', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('tasks')) {
              db.createObjectStore('tasks', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('user')) {
              db.createObjectStore('user', { keyPath: 'id', autoIncrement: true });
            }
            if (!db.objectStoreNames.contains('syncQueue')) {
              db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true });
            }
            break;
          // Future migrations can be handled here with additional cases
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        resolve();
      };

      request.onerror = (event) => {
        reject((event.target as IDBOpenDBRequest).error);
      };
    });
  }

  async create<T>(storeName: string, data: T) {
    if (!this.db) throw new Error('Database not opened');
    return new Promise<IDBRequest<T>>((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.add(data);

      request.onsuccess = (event) => resolve(event.target as IDBRequest<T>);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async read<T>(storeName: string, id: number) {
    if (!this.db) throw new Error('Database not opened');
    return new Promise<T>((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.get(id);

      request.onsuccess = (event) => resolve((event.target as IDBRequest<T>).result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async update<T>(storeName: string, data: T) {
    if (!this.db) throw new Error('Database not opened');
    return new Promise<IDBRequest<T>>((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.put(data);

      request.onsuccess = (event) => resolve(event.target as IDBRequest<T>);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async delete(storeName: string, id: number) {
    if (!this.db) throw new Error('Database not opened');
    return new Promise<void>((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readwrite');
      const store = transaction.objectStore(storeName);
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }

  async getAll<T>(storeName: string) {
    if (!this.db) throw new Error('Database not opened');
    return new Promise<T[]>((resolve, reject) => {
      const transaction = this.db!.transaction(storeName, 'readonly');
      const store = transaction.objectStore(storeName);
      const request = store.getAll();

      request.onsuccess = (event) => resolve((event.target as IDBRequest<T[]>).result);
      request.onerror = (event) => reject((event.target as IDBRequest).error);
    });
  }
}