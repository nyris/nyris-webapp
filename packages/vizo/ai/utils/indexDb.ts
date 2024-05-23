export function storeImage(
  base64Image: string,
  imageId: string,
): Promise<string> {
  return new Promise((resolve, reject) => {
    if (base64Image) {
      const dbPromise = window.indexedDB.open('imageDB', 2);
      dbPromise.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        const db = (event.target as IDBRequest<IDBDatabase>).result;
        if (!db.objectStoreNames.contains('images')) {
          db.createObjectStore('images', {
            keyPath: 'id',
            autoIncrement: true,
          });
        }
      };

      dbPromise.onsuccess = (event: Event) => {
        const db = (event.target as IDBRequest<IDBDatabase>).result;
        const transaction = db.transaction(['images'], 'readwrite');
        const store = transaction.objectStore('images');
        const request = store.put({
          id: imageId,
          data: base64Image,
        }); // Use put instead of add

        request.onsuccess = () => {
          resolve('Image stored successfully');
        };
        request.onerror = () => {
          reject('Error storing image');
        };
      };

      dbPromise.onerror = () => {
        reject('Error opening database');
      };
    } else {
      reject('Error reading image file');
    }
  });
}

export function getImage(imageId: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const dbPromise = window.indexedDB.open('imageDB', 2);
    dbPromise.onsuccess = (event: Event) => {
      const db = (event.target as IDBRequest<IDBDatabase>).result;
      const transaction = db.transaction(['images'], 'readonly');
      const store = transaction.objectStore('images');
      const request = store.get(imageId);

      request.onsuccess = () => {
        const imageData = request.result?.data;
        resolve(imageData);
      };
      request.onerror = () => {
        reject('Error retrieving image');
      };
    };

    dbPromise.onerror = () => {
      reject('Error opening database');
    };
  });
}
