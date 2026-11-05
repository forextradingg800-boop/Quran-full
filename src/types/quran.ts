export interface SurahMeta {
  number: number;
  name: string;
  englishName: string;
  englishNameTranslation: string;
  numberOfAyahs: number;
  revelationType: 'Meccan' | 'Medinan' | string;
}

export interface Ayah {
  number: number; // Global ayah number (1 - 6236)
  numberInSurah: number;
  text: string; // Arabic Uthmani
  translation: string; // Urdu translation
  juz: number;
  page: number;
  ruku: number;
  sajda: boolean | { id: number; recommended: boolean; obligatory: boolean };
}

export interface SurahData {
  meta: SurahMeta;
  ayahs: Ayah[];
  translationEdition: string;
  cachedAt: number;
}

export interface Qari {
  id: string;
  name: string;
  arabicName: string;
  style: string;
}

export interface UrduTranslationEdition {
  id: string;
  name: string;
  scholar: string;
}

export interface Bookmark {
  surahNumber: number;
  ayahNumber: number;
  surahName: string;
  englishName: string;
  arabicText: string;
  urduText: string;
  createdAt: number;
}

export interface SearchResult {
  surahNumber: number;
  surahName: string;
  englishName: string;
  ayahNumber: number;
  arabicText: string;
  urduText: string;
}

export interface TafseerData {
  text: string;
  source: string;
  cachedAt: number;
}
