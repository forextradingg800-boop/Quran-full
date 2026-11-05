import React, { useEffect, useState } from 'react';
import { BookOpen, X, Loader2 } from 'lucide-react';
import { Ayah, TafseerData } from '../types/quran';
import { fetchAyahTafseer } from '../services/quranApi';

interface TafseerDrawerProps {
  surahNumber: number;
  surahName: string;
  ayah: Ayah | null;
  onClose: () => void;
}

export const TafseerDrawer: React.FC<TafseerDrawerProps> = ({
  surahNumber,
  surahName,
  ayah,
  onClose,
}) => {
  const [tafseer, setTafseer] = useState<TafseerData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!ayah) return;
    let cancelled = false;
    setLoading(true);
    setError(null);

    fetchAyahTafseer(surahNumber, ayah.numberInSurah)
      .then((data) => {
        if (!cancelled) {
          setTafseer(data);
          setLoading(false);
        }
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof Error
              ? err.message
              : 'Unable to load Tafseer. Please check your connection.'
          );
          setLoading(false);
        }
      });

    return () => {
      cancelled = true;
    };
  }, [surahNumber, ayah]);

  if (!ayah) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/40 backdrop-blur-[1px]">
      <div className="w-full max-w-2xl bg-[#FBF9F5] dark:bg-[#0C0F14] border-l border-stone-200 dark:border-stone-800 h-full flex flex-col shadow-2xl">
        {/* Header */}
        <div className="px-6 py-4 border-b border-stone-200 dark:border-stone-800 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <BookOpen className="w-4 h-4 text-[#14532D] dark:text-emerald-400" />
            <h2 className="text-base font-semibold text-stone-900 dark:text-stone-100">
              Tafseer · {surahName} ({surahNumber}:{ayah.numberInSurah})
            </h2>
          </div>
          <button
            onClick={onClose}
            aria-label="Close Tafseer"
            className="p-1.5 rounded-lg text-stone-500 hover:text-stone-900 dark:text-stone-400 dark:hover:text-stone-100 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-6 py-6 space-y-6">
          {/* Arabic Ayah */}
          <div className="p-5 rounded-xl bg-stone-100/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800">
            <p className="font-arabic text-2xl sm:text-3xl leading-[2.2] text-stone-900 dark:text-stone-100 text-right">
              {ayah.text}
            </p>
            <p className="font-urdu text-lg sm:text-xl text-stone-700 dark:text-stone-300 text-right mt-4 pt-4 border-t border-stone-200/70 dark:border-stone-800">
              {ayah.translation}
            </p>
          </div>

          {/* Tafseer Commentary */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs uppercase tracking-wider font-medium text-stone-500 dark:text-stone-400">
                Urdu Commentary (تفسیر)
              </span>
              {tafseer && (
                <span className="font-urdu text-sm text-[#14532D] dark:text-emerald-400">
                  {tafseer.source}
                </span>
              )}
            </div>

            {loading && (
              <div className="py-12 flex flex-col items-center justify-center text-stone-500 dark:text-stone-400 gap-2">
                <Loader2 className="w-6 h-6 animate-spin text-[#14532D] dark:text-emerald-400" />
                <span className="text-xs">Loading Tafseer...</span>
              </div>
            )}

            {error && (
              <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-sm text-amber-800 dark:text-amber-300">
                {error}
              </div>
            )}

            {!loading && !error && tafseer && (
              <div className="font-urdu text-lg sm:text-xl text-stone-800 dark:text-stone-200 text-right leading-[2.5] whitespace-pre-line">
                {tafseer.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
