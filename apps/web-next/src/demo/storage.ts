let database: Promise<IDBDatabase> | undefined;

// Opened on first use: importing this module must not touch IndexedDB outside of the demo.
function openDatabase() {
  database ??= new Promise((resolve, reject) => {
    const request = indexedDB.open('sel-demo', 1);

    request.onupgradeneeded = () => {
      request.result.createObjectStore('state');
      request.result.createObjectStore('files', { keyPath: 'name' });
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () =>
      reject(new Error('The demo database could not be opened', { cause: request.error }));
  });

  return database;
}

type StoredFile = { name: string; blob: Blob };

export const demoStorage = {
  getState: <T>() => transaction<T | undefined>('state', 'readonly', (store) => store.get('state')),
  setState: (state: unknown) => transaction('state', 'readwrite', (store) => store.put(state, 'state')),
  getFiles: () => transaction<StoredFile[]>('files', 'readonly', (store) => store.getAll()),
  addFile: (file: StoredFile) => transaction('files', 'readwrite', (store) => store.put(file)),
  clear: async () => {
    await transaction('state', 'readwrite', (store) => store.clear());
    await transaction('files', 'readwrite', (store) => store.clear());
  },
};

async function transaction<T>(
  storeName: 'state' | 'files',
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest,
) {
  const transaction = (await openDatabase()).transaction(storeName, mode);
  const request = run(transaction.objectStore(storeName));

  return new Promise<T>((resolve, reject) => {
    transaction.oncomplete = () => resolve(request.result as T);
    transaction.onerror = () =>
      reject(new Error('The demo database could not be accessed', { cause: transaction.error }));
    transaction.onabort = transaction.onerror;
  });
}
