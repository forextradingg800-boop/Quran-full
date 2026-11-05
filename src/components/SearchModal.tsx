import React, { useEffect, useState } from 'react';
import { Search, X, ArrowRight, Loader2 } from 'lucide-react';
import { SearchResult, SurahMeta } from '../types/quran';
import { searchQuran } from '../services/quranApi';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  surahList: SurahMeta[];
  translationEdition: string;
  onSelectAyah: (surahNumber: number, ayahNumber?: number) => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({
  isOpen,
  onClose,
  surahList,
  translationEdition,
  onSelectAyah,
}) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOfflineSearch, setIsOfflineSearch] = useState(false);

  // Check if query is a direct Surah:Ayah reference like "2:255"
  const refMatch = query.trim().match(/^(\d{1,3}):(\d{1,3})$/);
  const directSurah = refMatch ? parseInt(refMatch[1], 10) : null;
  const directAyah = refMatch ? parseInt(refMatch[2], 10) : null;
  const validDirectRef =
    directSurah !== null &&
    directAyah !== null &&
    directSurah >= 1 &&
    directSurah <= 114 &&
    directAyah >= 1;

  // Filter Surahs by name or number
  const matchingSurahs = query.trim()
    ? surahList
        .filter(
          (s) =>
            s.englishName.toLowerCase().includes(query.trim().toLowerCase()) ||
            s.name.includes(query.trim()) ||
            String(s.number) === query.trim()
        )
        .slice(0, 5)
    : [];

  useEffect(() => {
    if (!isOpen) return;
    const trimmed = query.trim();
    if (trimmed.length < 2 || validDirectRef) {
      setResults([]);
      return;
    }

    const timer = setTimeout(() => {
      setLoading(true);
      searchQuran(trimmed, translationEdition)
        .then(({ results: res, isOffline }) => {
          setResults(res);
          setIsOfflineSearch(isOffline);
          setLoading(false);
        })
        .catch(() => {
          setLoading(false);
        });
    }, 350);

    return () => clearTimeout(timer);
  }, [query, translationEdition, isOpen, validDirectRef]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center bg-black/50 backdrop-blur-[1px] pt-16 px-4">
      <div className="w-full max-w-2xl rounded-xl bg-[#FBF9F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 shadow-2xl overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-stone-200 dark:border-stone-800">
          <Search className="w-4 h-4 text-stone-400 shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search Urdu translation, Arabic text, Surah name, or 2:255..."
            className="w-full bg-transparent text-sm text-stone-900 dark:text-stone-100 placeholder:text-stone-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="text-xs text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 cursor-pointer"
            >
              Clear
            </button>
          )}
          <button
            onClick={onClose}
            aria-label="Close Search"
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[65vh] overflow-y-auto divide-y divide-stone-200/70 dark:divide-stone-800">
          {/* Direct Reference Jump */}
          {validDirectRef && directSurah && directAyah && (
            <button
              onClick={() => {
                onSelectAyah(directSurah, directAyah);
                onClose();
              }}
              className="w-full px-5 py-3.5 flex items-center justify-between text-left hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-colors cursor-pointer"
            >
              <div>
                <span className="text-sm font-medium text-[#14532D] dark:text-emerald-400">
                  Jump to Surah {directSurah}, Ayah {directAyah}
                </span>
                <p className="text-xs text-stone-500 dark:text-stone-400">
                  Direct verse reference
                </p>
              </div>
              <ArrowRight className="w-4 h-4 text-[#14532D] dark:text-emerald-400" />
            </button>
          )}

          {/* Matching Surahs */}
          {matchingSurahs.length > 0 && (
            <div className="py-2">
              <p className="px-5 py-1.5 text-xs uppercase tracking-wider text-stone-400 font-medium">
                Surahs
              </p>
              {matchingSurahs.map((s) => (
                <button
                  key={s.number}
                  onClick={() => {
                    onSelectAyah(s.number);
                    onClose();
                  }}
                  className="w-full px-5 py-2.5 flex items-center justify-between text-left hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-colors cursor-pointer"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono tabular-nums text-stone-400 w-6">
                      {s.number}.
                    </span>
                    <span className="text-sm font-medium text-stone-900 dark:text-stone-100">
                      {s.englishName}
                    </span>
                    <span className="text-xs text-stone-500 dark:text-stone-400">
                      ({s.englishNameTranslation})
                    </span>
                  </div>
                  <span className="font-arabic text-base text-stone-700 dark:text-stone-300">
                    {s.name}
                  </span>
                </button>
              ))}
            </div>
          )}

          {/* Loading */}
          {loading && (
            <div className="py-10 flex items-center justify-center gap-2 text-stone-500 text-sm">
              <Loader2 className="w-4 h-4 animate-spin text-[#14532D] dark:text-emerald-400" />
              <span>Searching verses...</span>
            </div>
          )}

          {/* Verse Matches */}
          {!loading && results.length > 0 && (
            <div className="py-2">
              <div className="px-5 py-1.5 flex items-center justify-between">
                <span className="text-xs uppercase tracking-wider text-stone-400 font-medium">
                  Verse Matches ({results.length})
                </span>
                {isOfflineSearch && (
                  <span className="text-xs text-amber-600 dark:text-amber-400">
                    Searched offline cache
                  </span>
                )}
              </div>
              {results.map((r, idx) => (
                <button
                  key={`${r.surahNumber}-${r.ayahNumber}-${idx}`}
                  onClick={() => {
                    onSelectAyah(r.surahNumber, r.ayahNumber);
                    onClose();
                  }}
                  className="w-full px-5 py-3.5 text-left hover:bg-stone-100 dark:hover:bg-stone-800/70 transition-colors cursor-pointer space-y-1.5"
                >
                  <div className="flex items-center justify-between text-xs text-stone-500 dark:text-stone-400">
                    <span className="font-medium text-[#14532D] dark:text-emerald-400">
                      {r.englishName} · {r.surahNumber}:{r.ayahNumber}
                    </span>
                    <span className="font-arabic text-sm">{r.surahName}</span>
                  </div>
                  <p className="font-urdu text-base text-stone-800 dark:text-stone-200 text-right leading-loose">
                    {r.urduText}
                  </p>
                </button>
              ))}
            </div>
          )}

          {!loading &&
            query.trim().length >= 2 &&
            !validDirectRef &&
            matchingSurahs.length === 0 &&
            results.length === 0 && (
              <div className="py-10 text-center text-sm text-stone-500 dark:text-stone-400">
                No matching verses found for &ldquo;{query}&rdquo;.
              </div>
            )}

          {!query.trim() && (
            <div className="px-5 py-8 text-center text-xs text-stone-500 dark:text-stone-400 space-y-1">
              <p>
                Type a Surah name (e.g. <strong>Al-Mulk</strong>), a verse
                reference (e.g. <strong>2:255</strong>), or Urdu/Arabic keywords.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
