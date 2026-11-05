import React, { useRef, useState } from 'react';
import { CheckCircle2, CloudDownload, Trash2, X } from 'lucide-react';
import { fetchSurahWithUrdu } from '../services/quranApi';
import { clearAllCachedSurahs } from '../services/quranStorage';

interface OfflineManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  cachedSurahs: number[];
  translationEdition: string;
  onRefreshCacheCount: () => Promise<void>;
}

export const OfflineManagerModal: React.FC<OfflineManagerModalProps> = ({
  isOpen,
  onClose,
  cachedSurahs,
  translationEdition,
  onRefreshCacheCount,
}) => {
  const [downloading, setDownloading] = useState(false);
  const [progress, setProgress] = useState(0);
  const cancelRef = useRef(false);

  if (!isOpen) return null;

  const handleDownloadAll = async () => {
    setDownloading(true);
    cancelRef.current = false;
    setProgress(cachedSurahs.length);

    for (let i = 1; i <= 114; i++) {
      if (cancelRef.current) break;
      if (!cachedSurahs.includes(i)) {
        try {
          await fetchSurahWithUrdu(i, translationEdition);
        } catch {
          // Continue with remaining Surahs
        }
      }
      setProgress(i);
    }

    await onRefreshCacheCount();
    setDownloading(false);
  };

  const handleCancel = () => {
    cancelRef.current = true;
    setDownloading(false);
  };

  const handleClear = async () => {
    await clearAllCachedSurahs();
    await onRefreshCacheCount();
  };

  const percentage = Math.round((cachedSurahs.length / 114) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-[1px] p-4">
      <div className="w-full max-w-md rounded-xl bg-[#FBF9F5] dark:bg-stone-900 border border-stone-200 dark:border-stone-800 p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-display font-semibold text-stone-900 dark:text-stone-100">
            Offline Quran Storage
          </h2>
          <button
            onClick={onClose}
            aria-label="Close Offline Manager"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-sm text-stone-600 dark:text-stone-300 leading-relaxed">
          Surahs you open are automatically saved for offline reading. You can
          also download all 114 Surahs with Urdu translation for uninterrupted
          offline access.
        </p>

        {/* Status Bar */}
        <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-800/70 border border-stone-200/80 dark:border-stone-700/60 space-y-2.5">
          <div className="flex items-center justify-between text-xs font-medium">
            <span className="text-stone-700 dark:text-stone-200">
              Cached Surahs
            </span>
            <span className="font-mono tabular-nums text-[#14532D] dark:text-emerald-400">
              {downloading ? `${progress} / 114` : `${cachedSurahs.length} / 114 (${percentage}%)`}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-stone-200 dark:bg-stone-700 overflow-hidden">
            <div
              className="h-full bg-[#14532D] dark:bg-emerald-500 transition-all duration-200"
              style={{
                width: `${downloading ? Math.round((progress / 114) * 100) : percentage}%`,
              }}
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3">
          {!downloading ? (
            <button
              onClick={handleDownloadAll}
              disabled={cachedSurahs.length === 114}
              className="flex-1 flex items-center justify-center gap-2 rounded-lg bg-[#14532D] dark:bg-emerald-700 px-4 py-2.5 text-sm font-medium text-white hover:bg-[#166534] dark:hover:bg-emerald-600 disabled:opacity-50 transition-colors cursor-pointer"
            >
              {cachedSurahs.length === 114 ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>All 114 Surahs Cached</span>
                </>
              ) : (
                <>
                  <CloudDownload className="w-4 h-4" />
                  <span>Download Entire Quran</span>
                </>
              )}
            </button>
          ) : (
            <button
              onClick={handleCancel}
              className="flex-1 rounded-lg bg-amber-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-amber-700 transition-colors cursor-pointer"
            >
              Cancel Download
            </button>
          )}

          {cachedSurahs.length > 0 && !downloading && (
            <button
              onClick={handleClear}
              title="Clear Offline Cache"
              className="p-2.5 rounded-lg border border-stone-200 dark:border-stone-700 text-stone-500 hover:text-red-600 dark:text-stone-400 dark:hover:text-red-400 hover:bg-stone-100 dark:hover:bg-stone-800 transition-colors cursor-pointer"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
