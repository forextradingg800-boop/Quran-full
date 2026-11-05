import { SearchResult, SurahData, TafseerData } from '../types/quran';

const DB_NAME = 'alquran_urdu_offline_db';
const DB_VERSION = 1;
const SURAH_STORE = 'surahs';
const TAFSEER_STORE = 'tafseer';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === 'undefined') {
      reject(new Error('IndexedDB is not supported in this browser.'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(SURAH_STORE)) {
        db.createObjectStore(SURAH_STORE);
      }
      if (!db.objectStoreNames.contains(TAFSEER_STORE)) {
        db.createObjectStore(TAFSEER_STORE);
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function getCachedSurah(
  surahNumber: number,
  translationEdition: string
): Promise<SurahData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURAH_STORE, 'readonly');
      const store = tx.objectStore(SURAH_STORE);
      const req = store.get(`${surahNumber}_${translationEdition}`);
      req.onsuccess = () => resolve((req.result as SurahData) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function saveCachedSurah(surahData: SurahData): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURAH_STORE, 'readwrite');
      const store = tx.objectStore(SURAH_STORE);
      const key = `${surahData.meta.number}_${surahData.translationEdition}`;
      const req = store.put(surahData, key);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore storage quota errors gracefully
  }
}

export async function getCachedSurahNumbers(
  translationEdition: string
): Promise<number[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURAH_STORE, 'readonly');
      const store = tx.objectStore(SURAH_STORE);
      const req = store.getAllKeys();
      req.onsuccess = () => {
        const keys = (req.result as string[]) || [];
        const suffix = `_${translationEdition}`;
        const numbers = keys
          .filter((k) => typeof k === 'string' && k.endsWith(suffix))
          .map((k) => parseInt(k.replace(suffix, ''), 10))
          .filter((n) => !isNaN(n))
          .sort((a, b) => a - b);
        resolve(numbers);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}

export async function clearAllCachedSurahs(): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction([SURAH_STORE, TAFSEER_STORE], 'readwrite');
      tx.objectStore(SURAH_STORE).clear();
      tx.objectStore(TAFSEER_STORE).clear();
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  } catch {
    // Ignore
  }
}

export async function getCachedTafseer(
  surahNumber: number,
  ayahNumber: number
): Promise<TafseerData | null> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TAFSEER_STORE, 'readonly');
      const store = tx.objectStore(TAFSEER_STORE);
      const req = store.get(`${surahNumber}_${ayahNumber}`);
      req.onsuccess = () => resolve((req.result as TafseerData) || null);
      req.onerror = () => reject(req.error);
    });
  } catch {
    return null;
  }
}

export async function saveCachedTafseer(
  surahNumber: number,
  ayahNumber: number,
  text: string,
  source: string
): Promise<void> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(TAFSEER_STORE, 'readwrite');
      const store = tx.objectStore(TAFSEER_STORE);
      const data: TafseerData = { text, source, cachedAt: Date.now() };
      const req = store.put(data, `${surahNumber}_${ayahNumber}`);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  } catch {
    // Ignore
  }
}

export async function searchCachedQuran(
  query: string,
  translationEdition: string
): Promise<SearchResult[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(SURAH_STORE, 'readonly');
      const store = tx.objectStore(SURAH_STORE);
      const req = store.getAll();
      req.onsuccess = () => {
        const allSurahs = (req.result as SurahData[]) || [];
        const filtered = allSurahs.filter(
          (s) => s.translationEdition === translationEdition
        );
        const results: SearchResult[] = [];
        const q = query.trim().toLowerCase();

        for (const surah of filtered) {
          for (const ayah of surah.ayahs) {
            if (
              ayah.translation.toLowerCase().includes(q) ||
              ayah.text.includes(query.trim())
            ) {
              results.push({
                surahNumber: surah.meta.number,
                surahName: surah.meta.name,
                englishName: surah.meta.englishName,
                ayahNumber: ayah.numberInSurah,
                arabicText: ayah.text,
                urduText: ayah.translation,
              });
              if (results.length >= 40) {
                resolve(results);
                return;
              }
            }
          }
        }
        resolve(results);
      };
      req.onerror = () => reject(req.error);
    });
  } catch {
    return [];
  }
}
