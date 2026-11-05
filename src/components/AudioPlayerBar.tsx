import React, { useEffect, useRef, useState } from 'react';
import {
  Pause,
  Play,
  SkipBack,
  SkipForward,
  Volume2,
  X,
  Repeat,
} from 'lucide-react';
import { Ayah, Qari } from '../types/quran';
import { getAyahAudioUrl, QARIS } from '../services/quranApi';

interface AudioPlayerBarProps {
  surahName: string;
  surahNumber: number;
  ayah: Ayah;
  totalAyahs: number;
  selectedQari: Qari;
  onSelectQari: (qari: Qari) => void;
  onPrevAyah: () => void;
  onNextAyah: () => void;
  onClose: () => void;
}

export const AudioPlayerBar: React.FC<AudioPlayerBarProps> = ({
  surahName,
  surahNumber,
  ayah,
  totalAyahs,
  selectedQari,
  onSelectQari,
  onPrevAyah,
  onNextAyah,
  onClose,
}) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [autoAdvance, setAutoAdvance] = useState(true);
  const [playbackRate, setPlaybackRate] = useState<number>(1);
  const [progress, setProgress] = useState(0);
  const [audioError, setAudioError] = useState(false);

  const audioUrl = getAyahAudioUrl(ayah.number, selectedQari.id);

  useEffect(() => {
    setAudioError(false);
    setProgress(0);
    const audio = audioRef.current;
    if (!audio) return;

    audio.src = audioUrl;
    audio.playbackRate = playbackRate;
    audio
      .play()
      .then(() => setIsPlaying(true))
      .catch(() => setIsPlaying(false));
  }, [audioUrl]);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.playbackRate = playbackRate;
    }
  }, [playbackRate]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => setAudioError(true));
    }
  };

  const handleTimeUpdate = () => {
    const audio = audioRef.current;
    if (!audio || !audio.duration) return;
    setProgress((audio.currentTime / audio.duration) * 100);
  };

  const handleEnded = () => {
    if (autoAdvance && ayah.numberInSurah < totalAyahs) {
      onNextAyah();
    } else {
      setIsPlaying(false);
    }
  };

  const cycleSpeed = () => {
    const speeds = [0.75, 1, 1.25];
    const nextIdx = (speeds.indexOf(playbackRate) + 1) % speeds.length;
    setPlaybackRate(speeds[nextIdx]);
  };

  return (
    <div className="fixed bottom-0 inset-x-0 z-40 bg-[#FBF9F5]/95 dark:bg-stone-900/95 backdrop-blur-md border-t border-stone-200 dark:border-stone-800 shadow-lg">
      <audio
        ref={audioRef}
        onTimeUpdate={handleTimeUpdate}
        onEnded={handleEnded}
        onError={() => {
          setAudioError(true);
          setIsPlaying(false);
        }}
      />

      {/* Thin progress bar */}
      <div className="h-0.5 w-full bg-stone-200 dark:bg-stone-800">
        <div
          className="h-full bg-[#14532D] dark:bg-emerald-500 transition-all duration-150"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="max-w-6xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
        {/* Left: Surah & Ayah info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-8 h-8 rounded-lg bg-[#14532D]/10 dark:bg-emerald-500/15 text-[#14532D] dark:text-emerald-400 flex items-center justify-center shrink-0">
            <Volume2 className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-stone-900 dark:text-stone-100 truncate">
              {surahName} · Ayah {surahNumber}:{ayah.numberInSurah}
            </p>
            <p className="text-xs text-stone-500 dark:text-stone-400 truncate">
              {audioError
                ? 'Audio unavailable offline — connect to stream'
                : selectedQari.name}
            </p>
          </div>
        </div>

        {/* Center: Playback controls */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onPrevAyah}
            disabled={ayah.numberInSurah <= 1}
            aria-label="Previous Ayah"
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 disabled:opacity-35 transition-colors cursor-pointer"
          >
            <SkipBack className="w-4 h-4" />
          </button>

          <button
            onClick={togglePlay}
            aria-label={isPlaying ? 'Pause' : 'Play'}
            className="w-9 h-9 rounded-full bg-[#14532D] dark:bg-emerald-600 text-white flex items-center justify-center hover:bg-[#166534] dark:hover:bg-emerald-500 transition-colors cursor-pointer"
          >
            {isPlaying ? (
              <Pause className="w-4 h-4" />
            ) : (
              <Play className="w-4 h-4 ml-0.5" />
            )}
          </button>

          <button
            onClick={onNextAyah}
            disabled={ayah.numberInSurah >= totalAyahs}
            aria-label="Next Ayah"
            className="p-2 rounded-lg text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 disabled:opacity-35 transition-colors cursor-pointer"
          >
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Right: Qari selector, speed, auto-advance, close */}
        <div className="flex items-center gap-2 shrink-0">
          <select
            aria-label="Select Qari or Urdu Audio"
            value={selectedQari.id}
            onChange={(e) => {
              const found = QARIS.find((q) => q.id === e.target.value);
              if (found) onSelectQari(found);
            }}
            className="text-xs bg-stone-100 dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2 py-1.5 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#14532D] max-w-[130px] sm:max-w-none truncate"
          >
            {QARIS.map((q) => (
              <option key={q.id} value={q.id}>
                {q.name}
              </option>
            ))}
          </select>

          <button
            onClick={cycleSpeed}
            title="Playback Speed"
            className="px-2 py-1 rounded-md text-xs font-mono tabular-nums text-stone-600 dark:text-stone-300 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            {playbackRate}x
          </button>

          <button
            onClick={() => setAutoAdvance(!autoAdvance)}
            title={autoAdvance ? 'Auto-advance: On' : 'Auto-advance: Off'}
            className={`p-1.5 rounded-lg transition-colors cursor-pointer ${
              autoAdvance
                ? 'text-[#14532D] dark:text-emerald-400 bg-[#14532D]/10 dark:bg-emerald-500/15'
                : 'text-stone-400 hover:text-stone-600 dark:hover:text-stone-300'
            }`}
          >
            <Repeat className="w-4 h-4" />
          </button>

          <button
            onClick={onClose}
            aria-label="Close Audio Player"
            className="p-1.5 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-200/60 dark:hover:bg-stone-800 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
