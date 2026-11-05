import React, { useCallback, useEffect, useState } from 'react';
import { Clock, Compass, Loader2, MapPin, RefreshCw } from 'lucide-react';

interface PrayerTimings {
  Fajr: string;
  Sunrise: string;
  Dhuhr: string;
  Asr: string;
  Maghrib: string;
  Isha: string;
}

interface PrayerData {
  timings: PrayerTimings;
  hijriDate: string;
  gregorianDate: string;
  timezone: string;
  latitude: number;
  longitude: number;
  method: number;
}

const PRAYER_CACHE_KEY = 'alquran_prayer_times_v1';

const CALCULATION_METHODS = [
  { id: 1, name: 'University of Islamic Sciences, Karachi' },
  { id: 2, name: 'Islamic Society of North America (ISNA)' },
  { id: 3, name: 'Muslim World League (MWL)' },
  { id: 4, name: 'Umm Al-Qura University, Makkah' },
];

const PRAYER_LIST: {
  key: keyof PrayerTimings;
  english: string;
  urdu: string;
}[] = [
  { key: 'Fajr', english: 'Fajr', urdu: 'فجر' },
  { key: 'Sunrise', english: 'Sunrise', urdu: 'طلوعِ آفتاب' },
  { key: 'Dhuhr', english: 'Dhuhr', urdu: 'ظہر' },
  { key: 'Asr', english: 'Asr', urdu: 'عصر' },
  { key: 'Maghrib', english: 'Maghrib', urdu: 'مغرب' },
  { key: 'Isha', english: 'Isha', urdu: 'عشاء' },
];

function formatTime12h(time24: string): string {
  const clean = time24.split(' ')[0];
  const [hStr, mStr] = clean.split(':');
  const h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10);
  if (isNaN(h) || isNaN(m)) return time24;
  const period = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${period}`;
}

function getNextPrayerKey(timings: PrayerTimings): keyof PrayerTimings {
  const now = new Date();
  const currentMinutes = now.getHours() * 60 + now.getMinutes();

  const order: (keyof PrayerTimings)[] = [
    'Fajr',
    'Dhuhr',
    'Asr',
    'Maghrib',
    'Isha',
  ];

  for (const key of order) {
    const clean = timings[key].split(' ')[0];
    const [h, m] = clean.split(':').map(Number);
    if (!isNaN(h) && !isNaN(m)) {
      const prayerMinutes = h * 60 + m;
      if (prayerMinutes > currentMinutes) {
        return key;
      }
    }
  }
  return 'Fajr';
}

export const PrayerTimesView: React.FC = () => {
  const [method, setMethod] = useState<number>(1);
  const [prayerData, setPrayerData] = useState<PrayerData | null>(() => {
    try {
      const raw = localStorage.getItem(PRAYER_CACHE_KEY);
      return raw ? (JSON.parse(raw) as PrayerData) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchByCoords = useCallback(
    async (lat: number, lng: number, calcMethod: number) => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(
          `https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=${calcMethod}`
        );
        if (!res.ok) throw new Error('Unable to fetch prayer times.');
        const json = await res.json();
        const data = json.data;
        const hijri = data.date.hijri;
        const gregorian = data.date.gregorian;

        const parsed: PrayerData = {
          timings: {
            Fajr: data.timings.Fajr,
            Sunrise: data.timings.Sunrise,
            Dhuhr: data.timings.Dhuhr,
            Asr: data.timings.Asr,
            Maghrib: data.timings.Maghrib,
            Isha: data.timings.Isha,
          },
          hijriDate: `${hijri.day} ${hijri.month.en} ${hijri.year} AH`,
          gregorianDate: `${gregorian.day} ${gregorian.month.en} ${gregorian.year}`,
          timezone: data.meta.timezone,
          latitude: lat,
          longitude: lng,
          method: calcMethod,
        };

        setPrayerData(parsed);
        localStorage.setItem(PRAYER_CACHE_KEY, JSON.stringify(parsed));
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load prayer times. Showing cached data if available.'
        );
      } finally {
        setLoading(false);
      }
    },
    []
  );

  const requestGeolocation = useCallback(
    (calcMethod: number) => {
      if (!navigator.geolocation) {
        setError('Geolocation is not supported by your browser.');
        return;
      }
      setLoading(true);
      setError(null);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          fetchByCoords(
            pos.coords.latitude,
            pos.coords.longitude,
            calcMethod
          );
        },
        (geoErr) => {
          setLoading(false);
          if (geoErr.code === geoErr.PERMISSION_DENIED) {
            setError(
              'Location permission denied. Please allow location access in your browser to view local Salah times.'
            );
          } else {
            setError(
              'Unable to determine your location. Please check your device GPS or network.'
            );
          }
        },
        { enableHighAccuracy: false, timeout: 10000 }
      );
    },
    [fetchByCoords]
  );

  useEffect(() => {
    if (!prayerData) {
      requestGeolocation(method);
    } else if (prayerData.method !== method) {
      fetchByCoords(prayerData.latitude, prayerData.longitude, method);
    }
  }, [method, prayerData, requestGeolocation, fetchByCoords]);

  const nextPrayer = prayerData ? getNextPrayerKey(prayerData.timings) : null;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-5 flex flex-wrap items-end justify-between gap-4">
        <div className="space-y-1.5">
          <p className="text-xs uppercase tracking-widest text-[#14532D] dark:text-emerald-400 font-medium">
            Daily Salah Schedule · اوقاتِ نماز
          </p>
          <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-stone-100">
            Prayer Times
          </h1>
          {prayerData && (
            <p className="text-xs text-stone-500 dark:text-stone-400">
              {prayerData.hijriDate} · {prayerData.gregorianDate}
            </p>
          )}
        </div>

        <button
          onClick={() => requestGeolocation(method)}
          disabled={loading}
          className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#14532D] dark:bg-emerald-700 text-white text-xs font-medium hover:bg-[#166534] dark:hover:bg-emerald-600 disabled:opacity-50 transition-colors cursor-pointer"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Update Location</span>
        </button>
      </div>

      {/* Location & Calculation Method Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl bg-stone-100/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800">
        <div className="flex items-center gap-2 text-xs text-stone-600 dark:text-stone-300">
          <MapPin className="w-4 h-4 text-[#14532D] dark:text-emerald-400 shrink-0" />
          {prayerData ? (
            <span>
              <strong>{prayerData.timezone}</strong> (
              {prayerData.latitude.toFixed(2)}°,{' '}
              {prayerData.longitude.toFixed(2)}°)
            </span>
          ) : (
            <span>Detecting your current location...</span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Compass className="w-3.5 h-3.5 text-stone-400 shrink-0" />
          <select
            aria-label="Calculation Method"
            value={method}
            onChange={(e) => setMethod(Number(e.target.value))}
            className="text-xs bg-white dark:bg-stone-800 border border-stone-200 dark:border-stone-700 rounded-lg px-2.5 py-1.5 text-stone-700 dark:text-stone-200 focus:outline-none focus:ring-1 focus:ring-[#14532D]"
          >
            {CALCULATION_METHODS.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Error Banner */}
      {error && (
        <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-300">
          {error}
        </div>
      )}

      {/* Loading State */}
      {loading && !prayerData && (
        <div className="py-16 flex flex-col items-center justify-center gap-3 text-stone-500">
          <Loader2 className="w-6 h-6 animate-spin text-[#14532D] dark:text-emerald-400" />
          <p className="text-xs">Fetching local Salah times...</p>
        </div>
      )}

      {/* Salah Timings Table */}
      {prayerData && (
        <div className="divide-y divide-stone-200 dark:divide-stone-800 border-t border-b border-stone-200 dark:border-stone-800">
          {PRAYER_LIST.map((p) => {
            const isNext = nextPrayer === p.key;
            return (
              <div
                key={p.key}
                className={`py-4 px-4 flex items-center justify-between transition-colors ${
                  isNext
                    ? 'bg-[#14532D]/[0.06] dark:bg-emerald-500/[0.08]'
                    : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  <Clock
                    className={`w-4 h-4 ${
                      isNext
                        ? 'text-[#14532D] dark:text-emerald-400'
                        : 'text-stone-400'
                    }`}
                  />
                  <div>
                    <p
                      className={`text-sm font-medium ${
                        isNext
                          ? 'text-[#14532D] dark:text-emerald-300 font-semibold'
                          : 'text-stone-900 dark:text-stone-100'
                      }`}
                    >
                      {p.english}
                      {isNext && (
                        <span className="ml-2 text-xs font-normal text-[#14532D] dark:text-emerald-400">
                          · Next Prayer
                        </span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-6">
                  <span className="font-urdu text-base text-stone-600 dark:text-stone-300">
                    {p.urdu}
                  </span>
                  <span
                    className={`font-mono tabular-nums text-sm w-20 text-right ${
                      isNext
                        ? 'font-semibold text-[#14532D] dark:text-emerald-300'
                        : 'text-stone-700 dark:text-stone-200'
                    }`}
                  >
                    {formatTime12h(prayerData.timings[p.key])}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
