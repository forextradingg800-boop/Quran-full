import React, { useState } from 'react';
import { BookOpen, HeartPulse, Search, Sparkles } from 'lucide-react';
import { ISLAMIC_TREATMENTS } from '../data/islamicTreatments';

interface IslamicTreatmentsViewProps {
  onOpenQuranVerse: (surahNumber: number, ayahNumber: number) => void;
}

export const IslamicTreatmentsView: React.FC<IslamicTreatmentsViewProps> = ({
  onOpenQuranVerse,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [category, setCategory] = useState<'all' | 'physical' | 'spiritual'>(
    'all'
  );

  const filtered = ISLAMIC_TREATMENTS.filter((item) => {
    const matchesCategory = category === 'all' || item.category === category;
    const q = searchQuery.trim().toLowerCase();
    const matchesQuery =
      !q ||
      item.titleEnglish.toLowerCase().includes(q) ||
      item.titleUrdu.includes(searchQuery.trim()) ||
      item.symptomsEnglish.toLowerCase().includes(q) ||
      item.symptomsUrdu.includes(searchQuery.trim()) ||
      item.propheticRemedy.remedyEnglish.toLowerCase().includes(q);
    return matchesCategory && matchesQuery;
  });

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="border-b border-stone-200 dark:border-stone-800 pb-5 space-y-2">
        <p className="text-xs uppercase tracking-widest text-[#14532D] dark:text-emerald-400 font-medium">
          Tibb-e-Nabawi &amp; Ruqyah Shariah · طبِ نبوی ﷺ اور قرآنی علاج
        </p>
        <h1 className="text-2xl sm:text-3xl font-display font-semibold text-stone-900 dark:text-stone-100">
          Islamic Treatment &amp; Spiritual Healing
        </h1>
        <p className="text-sm text-stone-600 dark:text-stone-400 leading-relaxed">
          Authentic Quranic verses, Prophetic remedies (Tibb-e-Nabawi), and
          masnoon Duas for physical, psychological, and spiritual ailments.
        </p>
      </div>

      {/* Search & Category Filter */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search disease or symptom (e.g. Fever, Anxiety, بخار, معدہ)..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-stone-800 dark:text-stone-200 placeholder:text-stone-400 focus:outline-none focus:ring-1 focus:ring-[#14532D]"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-stone-100 dark:bg-stone-900 rounded-lg border border-stone-200/80 dark:border-stone-800 shrink-0">
          <button
            onClick={() => setCategory('all')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              category === 'all'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            All ({ISLAMIC_TREATMENTS.length})
          </button>
          <button
            onClick={() => setCategory('physical')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              category === 'physical'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Physical
          </button>
          <button
            onClick={() => setCategory('spiritual')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors cursor-pointer whitespace-nowrap ${
              category === 'spiritual'
                ? 'bg-white dark:bg-stone-800 text-stone-900 dark:text-stone-100 shadow-sm'
                : 'text-stone-600 dark:text-stone-400 hover:text-stone-900'
            }`}
          >
            Spiritual &amp; Mental
          </button>
        </div>
      </div>

      {/* Treatments List */}
      {filtered.length === 0 ? (
        <div className="py-16 text-center text-sm text-stone-500 dark:text-stone-400">
          No treatments found matching &ldquo;{searchQuery}&rdquo;.
        </div>
      ) : (
        <div className="divide-y divide-stone-200 dark:divide-stone-800">
          {filtered.map((item) => (
            <article key={item.id} className="py-7 space-y-4">
              {/* Title & Category */}
              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400 mb-1">
                    {item.category === 'physical' ? (
                      <HeartPulse className="w-3.5 h-3.5 text-[#14532D] dark:text-emerald-400" />
                    ) : (
                      <Sparkles className="w-3.5 h-3.5 text-[#B45309] dark:text-amber-400" />
                    )}
                    <span className="uppercase tracking-wider">
                      {item.category === 'physical'
                        ? 'Physical Ailment'
                        : 'Spiritual & Psychological'}
                    </span>
                  </div>
                  <h2 className="text-xl font-display font-semibold text-stone-900 dark:text-stone-100">
                    {item.titleEnglish}
                  </h2>
                </div>
                <p className="font-urdu text-lg text-[#14532D] dark:text-emerald-400">
                  {item.titleUrdu}
                </p>
              </div>

              {/* Symptoms */}
              <p className="text-xs text-stone-500 dark:text-stone-400">
                <strong>Symptoms:</strong> {item.symptomsEnglish} ·{' '}
                <span className="font-urdu text-sm">{item.symptomsUrdu}</span>
              </p>

              {/* Quranic Verse */}
              <div className="p-4 rounded-xl bg-stone-100/80 dark:bg-stone-900/70 border border-stone-200/80 dark:border-stone-800 space-y-2.5">
                <p className="font-arabic text-2xl sm:text-3xl leading-[2.2] text-right text-stone-900 dark:text-stone-100">
                  {item.quranicVerse.arabic}
                </p>
                <p className="font-urdu text-base sm:text-lg text-right text-stone-700 dark:text-stone-300">
                  {item.quranicVerse.urdu}
                </p>
                <div className="pt-2 border-t border-stone-200/70 dark:border-stone-800 flex items-center justify-between text-xs">
                  <span className="text-stone-500 dark:text-stone-400 font-mono">
                    {item.quranicVerse.reference}
                  </span>
                  <button
                    onClick={() =>
                      onOpenQuranVerse(
                        item.quranicVerse.surahNumber,
                        item.quranicVerse.ayahNumber
                      )
                    }
                    className="flex items-center gap-1 font-medium text-[#14532D] dark:text-emerald-400 hover:underline cursor-pointer"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Read in Quran</span>
                  </button>
                </div>
              </div>

              {/* Prophetic Remedy & Dua */}
              <div className="space-y-2">
                {item.propheticRemedy.arabicDua && (
                  <p className="font-arabic text-xl sm:text-2xl leading-[2.1] text-right text-[#14532D] dark:text-emerald-300 bg-[#14532D]/[0.04] dark:bg-emerald-500/[0.06] p-3.5 rounded-lg">
                    {item.propheticRemedy.arabicDua}
                  </p>
                )}
                <p className="text-sm text-stone-700 dark:text-stone-300 leading-relaxed">
                  <strong>Prophetic Remedy:</strong>{' '}
                  {item.propheticRemedy.remedyEnglish}
                </p>
                <p className="font-urdu text-base text-right text-stone-700 dark:text-stone-300">
                  {item.propheticRemedy.remedyUrdu}
                </p>
                <p className="font-urdu text-base text-right text-stone-600 dark:text-stone-400">
                  <strong>طریقۂ علاج:</strong> {item.methodUrdu}
                </p>
                <p className="text-xs text-stone-400 font-mono">
                  Source: {item.propheticRemedy.reference}
                </p>
              </div>
            </article>
          ))}
        </div>
      )}

      {/* Medical Note */}
      <div className="p-4 rounded-xl bg-stone-100 dark:bg-stone-900 border border-stone-200 dark:border-stone-800 text-xs text-stone-500 dark:text-stone-400 leading-relaxed">
        Note: Quranic Ruqyah and Tibb-e-Nabawi are spiritual and prophetic
        means of healing. In accordance with the Sunnah of seeking medical
        treatment, please also consult a qualified physician for medical
        conditions.
      </div>
    </div>
  );
};
