import {
  Ayah,
  Qari,
  SearchResult,
  SurahData,
  SurahMeta,
  TafseerData,
  UrduTranslationEdition,
} from '../types/quran';
import {
  getCachedSurah,
  getCachedTafseer,
  saveCachedSurah,
  saveCachedTafseer,
  searchCachedQuran,
} from './quranStorage';

const SURAH_LIST_STORAGE_KEY = 'alquran_surah_list_v1';

export const QARIS: Qari[] = [
  {
    id: 'ar.alafasy',
    name: 'Mishary Rashid Alafasy',
    arabicName: 'مشاري راشد العفاسي',
    style: 'Murattal',
  },
  {
    id: 'ar.abdulbasitmurattal',
    name: "Abdul Basit 'Abdus-Samad",
    arabicName: 'عبد الباسط عبد الصمد',
    style: 'Murattal',
  },
  {
    id: 'ar.husary',
    name: 'Mahmoud Khalil Al-Husary',
    arabicName: 'محمود خليل الحصري',
    style: 'Murattal',
  },
  {
    id: 'ar.minshawi',
    name: 'Muhammad Siddiq Al-Minshawi',
    arabicName: 'محمد صديق المنشاوي',
    style: 'Murattal',
  },
  {
    id: 'ar.shaatree',
    name: 'Abu Bakr al-Shatri',
    arabicName: 'أبو بكر الشاطري',
    style: 'Murattal',
  },
  {
    id: 'ur.khan',
    name: 'Shamshad Ali Khan (Urdu Translation)',
    arabicName: 'شمشاد علی خان (اردو ترجمہ)',
    style: 'Urdu Audio',
  },
];

export const URDU_TRANSLATIONS: UrduTranslationEdition[] = [
  {
    id: 'ur.jalandhry',
    name: 'Fateh Muhammad Jalandhri',
    scholar: 'مولانا فتح محمد جالندھری',
  },
  {
    id: 'ur.maududi',
    name: "Abul A'la Maududi",
    scholar: 'مولانا سید ابوالاعلیٰ مودودی',
  },
  {
    id: 'ur.junagarhi',
    name: 'Muhammad Junagarhi',
    scholar: 'مولانا محمد جوناگڑھی',
  },
  {
    id: 'ur.kanzuliman',
    name: 'Kanz-ul-Iman (Ahmad Raza)',
    scholar: 'امام احمد رضا خان بریلوی',
  },
];

export async function fetchSurahList(): Promise<SurahMeta[]> {
  try {
    const res = await fetch('https://api.alquran.cloud/v1/surah');
    if (!res.ok) throw new Error('Failed to fetch Surah list');
    const json = await res.json();
    const list: SurahMeta[] = json.data;
    try {
      localStorage.setItem(SURAH_LIST_STORAGE_KEY, JSON.stringify(list));
    } catch {
      // Ignore storage quota
    }
    return list;
  } catch (err) {
    const cached = localStorage.getItem(SURAH_LIST_STORAGE_KEY);
    if (cached) {
      return JSON.parse(cached) as SurahMeta[];
    }
    throw err;
  }
}

export async function fetchSurahWithUrdu(
  surahNumber: number,
  translationEdition: string
): Promise<SurahData> {
  const cached = await getCachedSurah(surahNumber, translationEdition);
  if (cached) {
    return cached;
  }

  const url = `https://api.alquran.cloud/v1/surah/${surahNumber}/editions/quran-uthmani,${translationEdition}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Unable to load Surah ${surahNumber}. Please check your connection.`);
  }
  const json = await res.json();
  const arabicEdition = json.data[0];
  const urduEdition = json.data[1];

  const meta: SurahMeta = {
    number: arabicEdition.number,
    name: arabicEdition.name,
    englishName: arabicEdition.englishName,
    englishNameTranslation: arabicEdition.englishNameTranslation,
    numberOfAyahs: arabicEdition.numberOfAyahs,
    revelationType: arabicEdition.revelationType,
  };

  const ayahs: Ayah[] = arabicEdition.ayahs.map(
    (a: Record<string, unknown>, idx: number) => ({
      number: a.number as number,
      numberInSurah: a.numberInSurah as number,
      text: a.text as string,
      translation: (urduEdition.ayahs[idx]?.text as string) || '',
      juz: a.juz as number,
      page: a.page as number,
      ruku: a.ruku as number,
      sajda: a.sajda as Ayah['sajda'],
    })
  );

  const surahData: SurahData = {
    meta,
    ayahs,
    translationEdition,
    cachedAt: Date.now(),
  };

  await saveCachedSurah(surahData);
  return surahData;
}

export async function fetchAyahTafseer(
  surahNumber: number,
  ayahNumber: number
): Promise<TafseerData> {
  const cached = await getCachedTafseer(surahNumber, ayahNumber);
  if (cached) {
    return cached;
  }

  try {
    const cdnUrl = `https://cdn.jsdelivr.net/gh/spa5k/tafsir_api@main/tafsir/ur-tafseer-ibn-e-kaseer/${surahNumber}/${ayahNumber}.json`;
    const res = await fetch(cdnUrl);
    if (res.ok) {
      const json = await res.json();
      if (json && json.text) {
        await saveCachedTafseer(
          surahNumber,
          ayahNumber,
          json.text,
          'تفسیر ابن کثیر (اردو)'
        );
        return {
          text: json.text,
          source: 'تفسیر ابن کثیر (اردو)',
          cachedAt: Date.now(),
        };
      }
    }
  } catch {
    // Fallback to Al-Quran Cloud Maududi commentary
  }

  const fallbackUrl = `https://api.alquran.cloud/v1/ayah/${surahNumber}:${ayahNumber}/ur.maududi`;
  const fallbackRes = await fetch(fallbackUrl);
  if (!fallbackRes.ok) {
    throw new Error('Tafseer could not be loaded offline.');
  }
  const fallbackJson = await fallbackRes.json();
  const text = fallbackJson.data?.text || 'تفسیر دستیاب نہیں ہے۔';
  await saveCachedTafseer(
    surahNumber,
    ayahNumber,
    text,
    'تفہیم القرآن — مولانا مودودی'
  );
  return {
    text,
    source: 'تفہیم القرآن — مولانا مودودی',
    cachedAt: Date.now(),
  };
}

export function getAyahAudioUrl(globalAyahNumber: number, qariId: string): string {
  const bitrate = qariId === 'ur.khan' ? '64' : '128';
  return `https://cdn.islamic.network/quran/audio/${bitrate}/${qariId}/${globalAyahNumber}.mp3`;
}

export async function searchQuran(
  query: string,
  translationEdition: string
): Promise<{ results: SearchResult[]; isOffline: boolean }> {
  const trimmed = query.trim();
  if (!trimmed) return { results: [], isOffline: false };

  try {
    const url = `https://api.alquran.cloud/v1/search/${encodeURIComponent(
      trimmed
    )}/all/${translationEdition}`;
    const res = await fetch(url);
    if (!res.ok) throw new Error('Search failed');
    const json = await res.json();
    const matches = json.data?.matches || [];
    const results: SearchResult[] = matches.slice(0, 40).map(
      (m: Record<string, unknown>) => {
        const surah = m.surah as Record<string, unknown>;
        return {
          surahNumber: surah.number as number,
          surahName: surah.name as string,
          englishName: surah.englishName as string,
          ayahNumber: m.numberInSurah as number,
          arabicText: '',
          urduText: m.text as string,
        };
      }
    );
    return { results, isOffline: false };
  } catch {
    const offlineResults = await searchCachedQuran(trimmed, translationEdition);
    return { results: offlineResults, isOffline: true };
  }
}
