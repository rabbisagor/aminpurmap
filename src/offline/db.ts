/**
 * অফলাইন ডেটাবেস ও IndexedDB হ্যান্ডলার
 */

import { Place, SavedPlace, AppSettings } from '../types';

const DB_NAME = 'aminpur_map_db';
const DB_VERSION = 1;

interface OfflinePack {
  id: string;
  name_bn: string;
  version: string;
  downloadedAt: string;
  placesCount: number;
  roadsCount: number;
  dataSizeBytes: number;
}

export function openDatabase(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB ব্রাউজারে সমর্থিত নয়'));
      return;
    }

    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;

      if (!db.objectStoreNames.contains('offline_packs')) {
        db.createObjectStore('offline_packs', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('custom_places')) {
        db.createObjectStore('custom_places', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('saved_places')) {
        db.createObjectStore('saved_places', { keyPath: 'id' });
      }
      if (!db.objectStoreNames.contains('app_settings')) {
        db.createObjectStore('app_settings', { keyPath: 'key' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * সংরক্ষিত স্থানের তালিকা পাওয়া
 */
export async function getSavedPlaces(): Promise<SavedPlace[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('saved_places', 'readonly');
      const store = tx.objectStore('saved_places');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

/**
 * স্থান সংরক্ষণ করা (বুকমার্ক)
 */
export async function savePlaceToBookmarks(savedPlace: SavedPlace): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('saved_places', 'readwrite');
    const store = tx.objectStore('saved_places');
    const request = store.put(savedPlace);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * বুকমার্ক থেকে স্থান অপসারণ
 */
export async function removeSavedPlace(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('saved_places', 'readwrite');
    const store = tx.objectStore('saved_places');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * কাস্টম বা এডিটেড স্থান সংরক্ষণ
 */
export async function saveCustomPlace(place: Place): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('custom_places', 'readwrite');
    const store = tx.objectStore('custom_places');
    const request = store.put(place);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * সকল কাস্টম স্থান পাওয়া
 */
export async function getCustomPlaces(): Promise<Place[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('custom_places', 'readonly');
      const store = tx.objectStore('custom_places');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

/**
 * অফলাইন প্যাক সংরক্ষণ ও স্ট্যাটাস যাচাই
 */
export async function saveOfflinePack(pack: OfflinePack): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_packs', 'readwrite');
    const store = tx.objectStore('offline_packs');
    const request = store.put(pack);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

export async function getOfflinePacks(): Promise<OfflinePack[]> {
  try {
    const db = await openDatabase();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('offline_packs', 'readonly');
      const store = tx.objectStore('offline_packs');
      const request = store.getAll();
      request.onsuccess = () => resolve(request.result || []);
      request.onerror = () => reject(request.error);
    });
  } catch {
    return [];
  }
}

export async function deleteOfflinePack(id: string): Promise<void> {
  const db = await openDatabase();
  return new Promise((resolve, reject) => {
    const tx = db.transaction('offline_packs', 'readwrite');
    const store = tx.objectStore('offline_packs');
    const request = store.delete(id);
    request.onsuccess = () => resolve();
    request.onerror = () => reject(request.error);
  });
}

/**
 * ব্রাউজার স্টোরেজ হিসাব (bytes)
 */
export async function getStorageEstimate(): Promise<{ usedBytes: number; quotaBytes: number }> {
  if (typeof navigator !== 'undefined' && navigator.storage && navigator.storage.estimate) {
    try {
      const est = await navigator.storage.estimate();
      return {
        usedBytes: est.usage || 0,
        quotaBytes: est.quota || 0,
      };
    } catch {
      return { usedBytes: 0, quotaBytes: 0 };
    }
  }
  return { usedBytes: 0, quotaBytes: 0 };
}
