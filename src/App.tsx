import React, { useCallback, useEffect, useState } from 'react';
import {
  Bookmark as BookmarkIcon,
  BookOpen,
  CloudDownload,
  Loader2,
  Menu,
  Moon,
  Play,
  Search,
  Sun,
  X,
} from 'lucide-react';
import {
  Ayah,
  Bookmark,
  Qari,
  SurahData,
  SurahMeta,
} from './types/quran';
import {
  fetchSurahList,
  fetchSurahWithUrdu,
  QARIS,
  URDU_TRANSLATIONS,
} from './services/quranApi';
import { getCachedSurahNumbers } from './services/quranStorage';
import { PWAInstallButton } from './components/PWAInstallButton';
import { OfflineIndicator } from './components/OfflineIndicator';
import { AudioPlayerBar } from './components/AudioPlayerBar';
import { TafseerDrawer } from './components/TafseerDrawer';
import { SearchModal } from './components/SearchModal';
import { OfflineManagerModal } from './components/OfflineManagerModal';
import { IslamicTreatmentsView } from './components/IslamicTreatmentsView';
import { PrayerTimesView } from './components/PrayerTimesView';

const BOOKMARKS_KEY = 'alquran_bookmarks_v1';
const LAST_READ_KEY = 'alquran_last_read_v1';
const THEME_KEY = 'alquran_theme_v1';

export default function App() {
  const [darkMode, setDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem(THEME_KEY);
    return saved === 'dark';
  });

  const [surahList, setSurahList] = useState<SurahMeta[]>([]);
  const [surahFilter, setSurahFilter] = useState('');
  const [activeSurahNumber, setActiveSurahNumber] = useState<number>(() => {
    const saved = localStorage.getItem(LAST_READ_KEY);
    return saved ? parseInt(saved, 10) || 1 : 1;
  });

  const [translationEdition, setTranslationEdition] =
    useState<string>('ur.jalandhry');
  const [selectedQari, setSelectedQari] = useState<Qari>(QARIS[0]);

  const [surahData, setSurahData] = useState<SurahData | null>(null);
  const [loadingSurah, setLoadingSurah] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const [playingAyah, setPlayingAyah] = useState<Ayah | null>(null);
  const [tafseerAyah, setTafseerAyah] = useState<Ayah | null>(null);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [offlineModalOpen, setOfflineModalOpen] = useState<boolean>(false);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState<boolean>(false);
  const [activeView, setActiveView] = useState<
    'read' | 'bookmarks' | 'treatments' | 'prayer'
  >('read');

  const [arabicScale, setArabicScale] = useState<number>(1);
  const [cachedSurahs, setCachedSurahs] = useState<number[]>([]);
  const [bookmarks, setBookmarks] = useState<Bookmark[]>(() => {
    try {
      const raw = localStorage.getItem(BOOKMARKS_KEY);
      return raw ? (JSON.parse(raw) as Bookmark[]) : [];
    } catch {
      return [];
    }
  });

  // Sync dark mode class on <html>
  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
      localStorage.setItem(THEME_KEY, 'dark');
    } else {
      root.classList.remove('dark');
      localStorage.setItem(THEME_KEY, 'light');
    }
  }, [darkMode]);

  // Keyboard shortcut Cmd/Ctrl + K for Search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load 114 Surahs list
  useEffect(() => {
    fetchSurahList()
      .then(setSurahList)
      .catch(() => {
        // Handled gracefully if offline without prior cache
      });
  }, []);

  const refreshCacheCount = useCallback(async () => {
    const nums = await getCachedSurahNumbers(translationEdition);
    setCachedSurahs(nums);
  }, [translationEdition]);

  // Load active Surah
  useEffect(() => {
    let cancelled = false;
    setLoadingSurah(true);
    setError(null);
    localStorage.setItem(LAST_READ_KEY, String(activeSurahNumber));

    fetchSurahWithUrdu(activeSurahNumber, translationEdition)
      .then((data) => {
        if (!cancelled) {
          setSurahData(data);
          setLoadingSurah(false);
          refreshCacheCount();
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load Surah. Please check your internet connection.'
          );
          setLoadingSurah(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [activeSurahNumber, translationEdition, refreshCacheCount]);

  const handleSelectSurah = (surahNumber: number, ayahNumber?: number) => {
    setActiveView('read');
    setActiveSurahNumber(surahNumber);
    setMobileSidebarOpen(false);
    if (ayahNumber) {
      setTimeout(() => {
        const el = document.getElementById(`ayah-${surahNumber}-${ayahNumber}`);
        if (el) {
          el.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 350);
    } else {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const toggleBookmark = (ayah: Ayah) => {
    if (!surahData) return;
    const exists = bookmarks.some(
      (b) =>
        b.surahNumber === surahData.meta.number &&
        b.ayahNumber === ayah.numberInSurah
    );
    let updated: Bookmark[];
    if (exists) {
      updated = bookmarks.filter(
        (b) =>
          !(
            b.surahNumber === surahData.meta.number &&
            b.ayahNumber === ayah.numberInSurah
          )
      );
    } else {
      updated = [
        {
          surahNumber: surahData.meta.number,
          ayahNumber: ayah.numberInSurah,
          surahName: surahData.meta.name,
          englishName: surahData.meta.englishName,
          arabicText: ayah.text,
          urduText: ayah.translation,
          createdAt: Date.now(),
        },
        ...bookmarks,
      ];
    }
    setBookmarks(updated);
    localStorage.setItem(BOOKMARKS_KEY, JSON.stringify(updated));
  };

  const isBookmarked = (surahNum: number, ayahNum: number) =>
    bookmarks.some(
      (b) => b.surahNumber === surahNum && b.ayahNumber === ayahNum
    );

  const filteredSurahs = surahList.filter(
    (s) =>
      s.englishName.toLowerCase().includes(surahFilter.toLowerCase()) ||
      s.name.includes(surahFilter) ||
      String(s.number).includes(surahFilter)
  );

  return (
    <div className="min-h-screen flex flex-col bg-[#FBF9F5] dark:bg-[#0C0F14] text-[#1C1917] dark:text-[#F5F5F4]">
      {/* Top Navigation Bar (3-Zone Contract) */}
      <header className="sticky top-0 z-30 bg-[#FBF9F5]/95 dark:bg-[#0C0F14]/95 backdrop-blur-md border-b border-stone-200 dark:border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Wordmark */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              onClick={() => setMobileSidebarOpen(true)}
              aria-label="Open Surah Index"
              className="lg:hidden p-1.5 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer"
            >
              <Menu className="w-5 h-5" />
            </button>
            <a
              href="#top"
              onClick={(e) => {
                e.preventDefault();
                setActiveView('read');
              }}
              className="text-lg font-display font-bold tracking-tight text-stone-900 dark:text-stone-100 whitespace-nowrap shrink-0"
            >
              Al-Quran Al-Kareem
            </a>
          </div>

          {/* Zone 2: Concise Single-Line Nav Links */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-stone-600 dark:text-stone-300">
            <button
              onClick={() => setActiveView('read')}
              className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'read'
                  ? 'text-[#14532D] dark:text-emerald-400 font-semibold'
                  : ''
              }`}
            >
              Read Quran
            </button>
            <button
              onClick={() => setActiveView('bookmarks')}
              className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'bookmarks'
                  ? 'text-[#14532D] dark:text-emerald-400 font-semibold'
                  : ''
              }`}
            >
              Bookmarks ({bookmarks.length})
            </button>
            <button
              onClick={() => setActiveView('treatments')}
              className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'treatments'
                  ? 'text-[#14532D] dark:text-emerald-400 font-semibold'
                  : ''
              }`}
            >
              Treatments
            </button>
            <button
              onClick={() => setActiveView('prayer')}
              className={`hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                activeView === 'prayer'
                  ? 'text-[#14532D] dark:text-emerald-400 font-semibold'
                  : ''
              }`}
            >
              Prayer Times
            </button>
            <button
              onClick={() => setOfflineModalOpen(true)}
              className="hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Offline ({cachedSurahs.length}/114)
            </button>
            <button
              onClick={() => setSearchOpen(true)}
              className="hover:text-stone-900 dark:hover:text-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Search
            </button>
          </nav>

          {/* Zone 3: Primary Action & Theme Toggle */}
          <div className="flex items-center gap-2.5 shrink-0">
            <button
              onClick={() => setSearchOpen(true)}
              aria-label="Search Verses"
              className="md:hidden p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 cursor-pointer"
            >
              <Search className="w-4 h-4" />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              aria-label="Toggle Dark Mode"
              className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              {darkMode ? (
                <Sun className="w-4 h-4" />
              ) : (
                <Moon className="w-4 h-4" />
              )}
            </button>
            <PWAInstallButton />
          </div>
        </div>
      </header>

      {/* Main Layout: Sidebar + Reading Canvas */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex">
        {/* Desktop Surah Sidebar */}
        <aside className="hidden lg:flex flex-col w-72 shrink-0 border-r border-stone-200 dark:border-stone-800 h-[calc(100vh-3.5rem)] sticky top-14">
          <div className="p-3 border-b border-stone-200 dark:border-stone-800">
            <input
              type="text"
              value={surahFilter}
              onChange={(e) => setSurahFilter(e.target.value)}
              placeholder="Filter 114 Surahs..."
              className="w-full px-3 py-1.5 text-xs rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#14532D]"
            />
          </div>
          <div className="flex-1 overflow-y-auto divide-y divide-stone-200/50 dark:divide-stone-800/50">
            {filteredSurahs.map((s) => {
              const isActive =
                activeView === 'read' && s.number === activeSurahNumber;
              const isCached = cachedSurahs.includes(s.number);
              return (
                <button
                  key={s.number}
                  onClick={() => handleSelectSurah(s.number)}
                  className={`w-full px-4 py-3 flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isActive
                      ? 'bg-[#14532D]/10 dark:bg-emerald-500/15 text-[#14532D] dark:text-emerald-300'
                      : 'hover:bg-stone-100/80 dark:hover:bg-stone-900/60'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="text-xs font-mono tabular-nums text-stone-400 w-6 shrink-0">
                      {s.number}.
                    </span>
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">
                        {s.englishName}
                      </p>
                      <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
                        {s.numberOfAyahs} Ayahs
                        {isCached ? ' · Offline' : ''}
                      </p>
                    </div>
                  </div>
                  <span className="font-arabic text-base text-stone-700 dark:text-stone-300 shrink-0 ml-2">
                    {s.name}
                  </span>
                </button>
              );
            })}
          </div>
        </aside>

        {/* Mobile Surah Drawer */}
        {mobileSidebarOpen && (
          <div className="fixed inset-0 z-50 lg:hidden flex bg-black/50">
            <div className="w-80 max-w-[85vw] bg-[#FBF9F5] dark:bg-[#0C0F14] h-full flex flex-col border-r border-stone-200 dark:border-stone-800">
              <div className="p-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between">
                <span className="font-display font-semibold text-base">
                  Surah Index (114)
                </span>
                <button
                  onClick={() => setMobileSidebarOpen(false)}
                  className="p-1 rounded-lg text-stone-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-3 border-b border-stone-200 dark:border-stone-800">
                <input
                  type="text"
                  value={surahFilter}
                  onChange={(e) => setSurahFilter(e.target.value)}
                  placeholder="Filter Surahs..."
                  className="w-full px-3 py-1.5 text-xs rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800"
                />
              </div>
              <div className="flex-1 overflow-y-auto divide-y divide-stone-200/50 dark:divide-stone-800/50">
                {filteredSurahs.map((s) => (
                  <button
                    key={s.number}
                    onClick={() => handleSelectSurah(s.number)}
                    className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-stone-100 dark:hover:bg-stone-900"
                  >
                    <div className="flex items-center gap-3">
                      <span className="text-xs font-mono tabular-nums text-stone-400 w-6">
                        {s.number}.
                      </span>
                      <div>
                        <p className="text-sm font-medium">{s.englishName}</p>
                        <p className="text-xs text-stone-500">
                          {s.numberOfAyahs} Ayahs
                        </p>
                      </div>
                    </div>
                    <span className="font-arabic text-base">{s.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <main className="flex-1 min-w-0 px-4 sm:px-8 py-6 pb-28">
          {activeView === 'prayer' ? (
            <PrayerTimesView />
          ) : activeView === 'treatments' ? (
            <IslamicTreatmentsView onOpenQuranVerse={handleSelectSurah} />
          ) : activeView === 'bookmarks' ? (
            <div className="max-w-3xl mx-auto space-y-6">
              <div className="flex items-center justify-between border-b border-stone-200 dark:border-stone-800 pb-4">
                <div>
                  <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-stone-100">
                    Saved Bookmarks
                  </h1>
                  <p className="text-sm text-stone-500 dark:text-stone-400 mt-1">
                    Your bookmarked verses for quick reflection and study
                  </p>
                </div>
                <button
                  onClick={() => setActiveView('read')}
                  className="text-xs font-medium text-[#14532D] dark:text-emerald-400 hover:underline cursor-pointer"
                >
                  Back to Reading
                </button>
              </div>

              {bookmarks.length === 0 ? (
                <div className="py-16 text-center text-stone-500 dark:text-stone-400 text-sm">
                  No bookmarks saved yet. Click the bookmark icon on any Ayah
                  while reading.
                </div>
              ) : (
                <div className="divide-y divide-stone-200 dark:divide-stone-800">
                  {bookmarks.map((b) => (
                    <div
                      key={`${b.surahNumber}-${b.ayahNumber}`}
                      className="py-6 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() =>
                            handleSelectSurah(b.surahNumber, b.ayahNumber)
                          }
                          className="text-xs font-medium text-[#14532D] dark:text-emerald-400 hover:underline cursor-pointer"
                        >
                          {b.englishName} · {b.surahNumber}:{b.ayahNumber}
                        </button>
                        <button
                          onClick={() =>
                            toggleBookmark({
                              number: 0,
                              numberInSurah: b.ayahNumber,
                              text: b.arabicText,
                              translation: b.urduText,
                              juz: 1,
                              page: 1,
                              ruku: 1,
                              sajda: false,
                            })
                          }
                          className="text-xs text-stone-400 hover:text-red-600 cursor-pointer"
                        >
                          Remove
                        </button>
                      </div>
                      <p className="font-arabic text-2xl sm:text-3xl leading-[2.2] text-right text-stone-900 dark:text-stone-100">
                        {b.arabicText}
                      </p>
                      <p className="font-urdu text-lg sm:text-xl text-right text-stone-700 dark:text-stone-300">
                        {b.urduText}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto">
              {/* Workspace Controls Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pb-5 mb-6 border-b border-stone-200 dark:border-stone-800">
                <div className="flex items-center gap-2">
                  <select
                    aria-label="Urdu Translation"
                    value={translationEdition}
                    onChange={(e) => setTranslationEdition(e.target.value)}
                    className="text-xs bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-3 py-1.5 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#14532D]"
                  >
                    {URDU_TRANSLATIONS.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.name}
                      </option>
                    ))}
                  </select>

                  <select
                    aria-label="Select Qari or Urdu Audio"
                    value={selectedQari.id}
                    onChange={(e) => {
                      const found = QARIS.find((q) => q.id === e.target.value);
                      if (found) setSelectedQari(found);
                    }}
                    className="text-xs bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 rounded-lg px-2.5 py-1.5 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#14532D] max-w-[170px] sm:max-w-none truncate"
                  >
                    {QARIS.map((q) => (
                      <option key={q.id} value={q.id}>
                        {q.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() =>
                      setArabicScale((s) => Math.max(0.8, +(s - 0.1).toFixed(1)))
                    }
                    className="px-2 py-1 text-xs rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 cursor-pointer"
                    title="Decrease Font Size"
                  >
                    A-
                  </button>
                  <button
                    onClick={() =>
                      setArabicScale((s) => Math.min(1.4, +(s + 0.1).toFixed(1)))
                    }
                    className="px-2 py-1 text-xs rounded-md border border-stone-200 dark:border-stone-800 hover:bg-stone-100 dark:hover:bg-stone-900 cursor-pointer"
                    title="Increase Font Size"
                  >
                    A+
                  </button>
                  <button
                    onClick={() => setOfflineModalOpen(true)}
                    className="lg:hidden flex items-center gap-1 px-2.5 py-1 text-xs rounded-md border border-stone-200 dark:border-stone-800 text-stone-600 dark:text-stone-300 cursor-pointer"
                  >
                    <CloudDownload className="w-3.5 h-3.5" />
                    <span>Offline</span>
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {loadingSurah && (
                <div className="py-24 flex flex-col items-center justify-center gap-3 text-stone-500">
                  <Loader2 className="w-7 h-7 animate-spin text-[#14532D] dark:text-emerald-400" />
                  <p className="text-sm">Loading Surah {activeSurahNumber}...</p>
                </div>
              )}

              {/* Error State */}
              {!loadingSurah && error && (
                <div className="p-6 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-center space-y-3">
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    {error}
                  </p>
                  <button
                    onClick={() => setActiveSurahNumber((n) => n)}
                    className="px-4 py-2 text-xs font-medium rounded-lg bg-[#14532D] text-white cursor-pointer"
                  >
                    Retry
                  </button>
                </div>
              )}

              {/* Surah Content */}
              {!loadingSurah && !error && surahData && (
                <div>
                  {/* Surah Header */}
                  <div className="text-center py-6 mb-6 border-b border-stone-200 dark:border-stone-800 space-y-2">
                    <p className="font-arabic text-3xl sm:text-4xl text-[#14532D] dark:text-emerald-400">
                      {surahData.meta.name}
                    </p>
                    <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-stone-100">
                      {surahData.meta.number}. {surahData.meta.englishName}
                    </h1>
                    <p className="text-xs uppercase tracking-widest text-stone-500 dark:text-stone-400">
                      {surahData.meta.englishNameTranslation} ·{' '}
                      {surahData.meta.revelationType} ·{' '}
                      {surahData.meta.numberOfAyahs} Ayahs
                    </p>

                    {surahData.meta.number !== 9 &&
                      surahData.meta.number !== 1 && (
                        <p className="font-arabic text-2xl sm:text-3xl text-stone-800 dark:text-stone-200 pt-4">
                          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
                        </p>
                      )}
                  </div>

                  {/* Ayahs List */}
                  <div className="divide-y divide-stone-200/80 dark:divide-stone-800/80">
                    {surahData.ayahs.map((ayah) => {
                      const isPlayingThis =
                        playingAyah?.number === ayah.number;
                      const bookmarked = isBookmarked(
                        surahData.meta.number,
                        ayah.numberInSurah
                      );

                      return (
                        <article
                          key={ayah.number}
                          id={`ayah-${surahData.meta.number}-${ayah.numberInSurah}`}
                          className={`py-7 transition-colors ${
                            isPlayingThis
                              ? 'bg-[#14532D]/[0.04] dark:bg-emerald-500/[0.06] -mx-4 px-4 rounded-xl'
                              : ''
                          }`}
                        >
                          {/* Ayah Metadata & Actions Row */}
                          <div className="flex items-center justify-between gap-4 mb-4">
                            <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 font-mono tabular-nums">
                              <span className="font-semibold text-[#14532D] dark:text-emerald-400">
                                {surahData.meta.number}:{ayah.numberInSurah}
                              </span>
                              <span aria-hidden="true">·</span>
                              <span>Juz {ayah.juz}</span>
                              <span aria-hidden="true">·</span>
                              <span>Page {ayah.page}</span>
                            </div>

                            <div className="flex items-center gap-1.5">
                              <button
                                onClick={() => setPlayingAyah(ayah)}
                                title="Play Recitation"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                              >
                                <Play className="w-3.5 h-3.5" />
                                <span className="hidden sm:inline">Listen</span>
                              </button>

                              <button
                                onClick={() => setTafseerAyah(ayah)}
                                title="Read Urdu Tafseer"
                                className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
                              >
                                <BookOpen className="w-3.5 h-3.5" />
                                <span>Tafseer</span>
                              </button>

                              <button
                                onClick={() => toggleBookmark(ayah)}
                                title={
                                  bookmarked ? 'Remove Bookmark' : 'Bookmark'
                                }
                                className={`p-1.5 rounded-md transition-colors cursor-pointer ${
                                  bookmarked
                                    ? 'text-[#B45309] dark:text-amber-400 bg-amber-500/10'
                                    : 'text-stone-400 hover:text-stone-700 dark:hover:text-stone-200'
                                }`}
                              >
                                <BookmarkIcon className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>

                          {/* Arabic Text */}
                          <p
                            className="font-arabic text-right text-stone-900 dark:text-stone-100 leading-[2.35]"
                            style={{
                              fontSize: `${1.85 * arabicScale}rem`,
                            }}
                          >
                            {ayah.text}
                          </p>

                          {/* Urdu Translation */}
                          <p
                            className="font-urdu text-right text-stone-700 dark:text-stone-300 mt-4"
                            style={{
                              fontSize: `${1.25 * arabicScale}rem`,
                            }}
                          >
                            {ayah.translation}
                          </p>
                        </article>
                      );
                    })}
                  </div>

                  {/* Next / Previous Surah Navigation */}
                  <div className="pt-8 mt-4 border-t border-stone-200 dark:border-stone-800 flex items-center justify-between">
                    <button
                      onClick={() =>
                        handleSelectSurah(Math.max(1, activeSurahNumber - 1))
                      }
                      disabled={activeSurahNumber <= 1}
                      className="px-4 py-2 text-xs font-medium rounded-lg border border-stone-200 dark:border-stone-800 text-stone-700 dark:text-stone-300 hover:bg-stone-100 dark:hover:bg-stone-900 disabled:opacity-40 cursor-pointer"
                    >
                      Previous Surah
                    </button>
                    <button
                      onClick={() =>
                        handleSelectSurah(Math.min(114, activeSurahNumber + 1))
                      }
                      disabled={activeSurahNumber >= 114}
                      className="px-4 py-2 text-xs font-medium rounded-lg bg-[#14532D] dark:bg-emerald-700 text-white hover:bg-[#166534] disabled:opacity-40 cursor-pointer"
                    >
                      Next Surah
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>
      </div>

      {/* Persistent Audio Player */}
      {playingAyah && surahData && (
        <AudioPlayerBar
          surahName={surahData.meta.englishName}
          surahNumber={surahData.meta.number}
          ayah={playingAyah}
          totalAyahs={surahData.meta.numberOfAyahs}
          selectedQari={selectedQari}
          onSelectQari={setSelectedQari}
          onPrevAyah={() => {
            const prev = surahData.ayahs.find(
              (a) => a.numberInSurah === playingAyah.numberInSurah - 1
            );
            if (prev) setPlayingAyah(prev);
          }}
          onNextAyah={() => {
            const next = surahData.ayahs.find(
              (a) => a.numberInSurah === playingAyah.numberInSurah + 1
            );
            if (next) setPlayingAyah(next);
          }}
          onClose={() => setPlayingAyah(null)}
        />
      )}

      {/* Tafseer Drawer */}
      {surahData && (
        <TafseerDrawer
          surahNumber={surahData.meta.number}
          surahName={surahData.meta.englishName}
          ayah={tafseerAyah}
          onClose={() => setTafseerAyah(null)}
        />
      )}

      {/* Search Modal */}
      <SearchModal
        isOpen={searchOpen}
        onClose={() => setSearchOpen(false)}
        surahList={surahList}
        translationEdition={translationEdition}
        onSelectAyah={handleSelectSurah}
      />

      {/* Offline Manager Modal */}
      <OfflineManagerModal
        isOpen={offlineModalOpen}
        onClose={() => setOfflineModalOpen(false)}
        cachedSurahs={cachedSurahs}
        translationEdition={translationEdition}
        onRefreshCacheCount={refreshCacheCount}
      />

      {/* Offline Connectivity Indicator */}
      <OfflineIndicator />
    </div>
  );
}
