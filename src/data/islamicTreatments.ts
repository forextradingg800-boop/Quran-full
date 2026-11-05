export interface IslamicTreatment {
  id: string;
  category: 'physical' | 'spiritual';
  titleEnglish: string;
  titleUrdu: string;
  symptomsEnglish: string;
  symptomsUrdu: string;
  quranicVerse: {
    arabic: string;
    urdu: string;
    reference: string;
    surahNumber: number;
    ayahNumber: number;
  };
  propheticRemedy: {
    arabicDua?: string;
    remedyEnglish: string;
    remedyUrdu: string;
    reference: string;
  };
  methodUrdu: string;
}

export const ISLAMIC_TREATMENTS: IslamicTreatment[] = [
  {
    id: 'general-healing-fatiha',
    category: 'physical',
    titleEnglish: 'General Illness & Chronic Pain',
    titleUrdu: 'ہر بیماری اور دائمی درد کا علاج',
    symptomsEnglish: 'Body aches, chronic illness, unexplained pain, general fatigue',
    symptomsUrdu: 'جسم میں درد، پرانی بیماری، تھکاوٹ اور کمزوری',
    quranicVerse: {
      arabic: 'وَنُنَزِّلُ مِنَ الْقُرْآنِ مَا هُوَ شِفَاءٌ وَرَحْمَةٌ لِّلْمُؤْمِنِينَ',
      urdu: 'اور ہم قرآن میں ایسی چیزیں نازل کرتے ہیں جو ایمان والوں کے لیے شفا اور رحمت ہیں۔',
      reference: 'Surah Al-Isra 17:82',
      surahNumber: 17,
      ayahNumber: 82,
    },
    propheticRemedy: {
      arabicDua:
        'أَذْهِبِ الْبَاسَ رَبَّ النَّاسِ، اشْفِ وَأَنْتَ الشَّافِي، لَا شِفَاءَ إِلَّا شِفَاؤُكَ، شِفَاءً لَا يُغَادِرُ سَقَمًا',
      remedyEnglish:
        'Recite Surah Al-Fatiha (7 times) over the area of pain or over water, alongside the Prophetic Dua for healing.',
      remedyUrdu:
        'سورۃ الفاتحہ (7 مرتبہ) درد کی جگہ پر دم کریں یا پانی پر دم کر کے پئیں، اور نبی کریم ﷺ کی مسنون دعا پڑھیں۔',
      reference: 'Sahih al-Bukhari 5736, 5743',
    },
    methodUrdu:
      'درد کی جگہ پر دایاں ہاتھ رکھیں، 3 مرتبہ بسم اللہ پڑھیں، پھر 7 مرتبہ سورۃ الفاتحہ اور مندرجہ بالا دعا پڑھ کر دم کریں۔',
  },
  {
    id: 'digestive-stomach-honey',
    category: 'physical',
    titleEnglish: 'Stomach & Digestive Disorders',
    titleUrdu: 'معدہ اور ہاضمے کے امراض',
    symptomsEnglish: 'Stomach pain, indigestion, acidity, abdominal discomfort',
    symptomsUrdu: 'معدے کا درد، بدہضمی، تیزابیت اور پیٹ کی تکلیف',
    quranicVerse: {
      arabic: 'يَخْرُجُ مِن بُطُونِهَا شَرَابٌ مُّخْتَلِفٌ أَلْوَانُهُ فِيهِ شِفَاءٌ لِّلنَّاسِ',
      urdu: 'ان (شہد کی مکھیوں) کے پیٹ سے مختلف رنگوں کا مشروب نکلتا ہے جس میں لوگوں کے لیے شفا ہے۔',
      reference: 'Surah An-Nahl 16:69',
      surahNumber: 16,
      ayahNumber: 69,
    },
    propheticRemedy: {
      remedyEnglish:
        'Pure raw honey mixed with lukewarm water on an empty stomach, as prescribed by the Prophet (ﷺ).',
      remedyUrdu:
        'خالص شہد کو نیم گرم پانی میں ملا کر نہار منہ پینا، جیسا کہ نبی کریم ﷺ نے پیٹ کی تکلیف کے لیے تجویز فرمایا۔',
      reference: 'Sahih al-Bukhari 5684',
    },
    methodUrdu:
      'صبح نہار منہ ایک گلاس نیم گرم پانی میں ایک چمچ خالص شہد ملا کر سورۃ النحل کی آیت 69 پڑھ کر پئیں۔',
  },
  {
    id: 'immunity-black-seed',
    category: 'physical',
    titleEnglish: 'Weak Immunity & Systemic Ailments',
    titleUrdu: 'قوتِ مدافعت کی کمی اور عمومی امراض',
    symptomsEnglish: 'Frequent infections, low immunity, inflammation, weakness',
    symptomsUrdu: 'بار بار بیمار ہونا، کمزوری، جسمانی سوزش',
    quranicVerse: {
      arabic: 'وَإِذَا مَرِضْتُ فَهُوَ يَشْفِينِ',
      urdu: 'اور جب میں بیمار ہوتا ہوں تو وہی (اللہ) مجھے شفا دیتا ہے۔',
      reference: 'Surah Ash-Shuara 26:80',
      surahNumber: 26,
      ayahNumber: 80,
    },
    propheticRemedy: {
      remedyEnglish:
        'Black Seed (Kalonji / Nigella sativa) — "In the black seed there is healing for every disease except death."',
      remedyUrdu:
        'کلونجی (حبۃ السوداء) — نبی کریم ﷺ نے فرمایا: کلونجی میں موت کے سوا ہر بیماری کے لیے شفا ہے۔',
      reference: 'Sahih al-Bukhari 5688',
    },
    methodUrdu:
      'روزانہ صبح 7 دانے کلونجی شہد کے ساتھ یا نیم گرم پانی کے ساتھ استعمال کریں۔',
  },
  {
    id: 'fever-headache',
    category: 'physical',
    titleEnglish: 'Fever & High Temperature',
    titleUrdu: 'بخار اور جسم کی حرارت',
    symptomsEnglish: 'High fever, body heat, headache, chills',
    symptomsUrdu: 'تیز بخار، سر درد، جسم کا گرم ہونا',
    quranicVerse: {
      arabic: 'قُلْنَا يَا نَارُ كُونِي بَرْدًا وَسَلَامًا عَلَىٰ إِبْرَاهِيمَ',
      urdu: 'ہم نے فرمایا: اے آگ! تو ابراہیم پر ٹھنڈی اور سلامتی والی ہو جا۔',
      reference: 'Surah Al-Anbiya 21:69',
      surahNumber: 21,
      ayahNumber: 69,
    },
    propheticRemedy: {
      remedyEnglish:
        'Cool water compresses — "Fever is from the heat of Hell, so cool it down with water."',
      remedyUrdu:
        'ٹھنڈے پانی کی پٹیاں — نبی کریم ﷺ نے فرمایا: بخار جہنم کی بھاپ سے ہے، پس اسے پانی سے ٹھنڈا کرو۔',
      reference: 'Sahih al-Bukhari 5723',
    },
    methodUrdu:
      'مریض کی پیشانی اور ہاتھوں پاؤں پر ٹھنڈے پانی کی پٹیاں رکھیں اور سورۃ الانبیاء کی آیت 69 پڑھ کر دم کریں۔',
  },
  {
    id: 'heart-blood-pressure',
    category: 'physical',
    titleEnglish: 'Heart Health & Blood Pressure',
    titleUrdu: 'دل کے امراض اور بلڈ پریشر',
    symptomsEnglish: 'Palpitations, high blood pressure, chest tightness, stress',
    symptomsUrdu: 'دل کی دھڑکن تیز ہونا، ہائی بلڈ پریشر، سینے کی گھٹن',
    quranicVerse: {
      arabic: 'أَلَا بِذِكْرِ اللَّهِ تَطْمَئِنُّ الْقُلُوبُ',
      urdu: 'خبردار! اللہ کے ذکر ہی سے دلوں کو اطمینان نصیب ہوتا ہے۔',
      reference: 'Surah Ar-Ra’d 13:28',
      surahNumber: 13,
      ayahNumber: 28,
    },
    propheticRemedy: {
      remedyEnglish:
        'Ajwa Dates (7 dates in the morning) and Extra Virgin Olive Oil, combined with regular Dhikr.',
      remedyUrdu:
        'عجوہ کھجور (صبح 7 دانے) اور زیتون کا تیل، ساتھ ہی کثرت سے اللہ کا ذکر۔',
      reference: 'Sahih al-Bukhari 5445, Jami at-Tirmidhi 1851',
    },
    methodUrdu:
      'صبح نہار منہ 7 عجوہ کھجوریں کھائیں، کھانے میں زیتون کا تیل استعمال کریں اور سورۃ الرعد کی آیت 28 کا ورد رکھیں۔',
  },
  {
    id: 'anxiety-depression-grief',
    category: 'spiritual',
    titleEnglish: 'Anxiety, Depression & Grief',
    titleUrdu: 'پریشانی، ڈپریشن اور غم کا علاج',
    symptomsEnglish: 'Sadness, hopelessness, panic, heavy heart, emotional distress',
    symptomsUrdu: 'اداسی، مایوسی، گھبراہٹ، دل کا بوجھل ہونا',
    quranicVerse: {
      arabic: 'لَّا إِلَٰهَ إِلَّا أَنتَ سُبْحَانَكَ إِنِّي كُنتُ مِنَ الظَّالِمِينَ',
      urdu: 'تیرے سوا کوئی معبود نہیں، تو پاک ہے، بے شک میں ہی قصورواروں میں سے تھا۔',
      reference: 'Surah Al-Anbiya 21:87',
      surahNumber: 21,
      ayahNumber: 87,
    },
    propheticRemedy: {
      arabicDua:
        'اللَّهُمَّ إِنِّي أَعُوذُ بِكَ مِنَ الْهَمِّ وَالْحَزَنِ، وَالْعَجْزِ وَالْكَسَلِ',
      remedyEnglish:
        'Talbina (barley porridge with milk and honey) — "Talbina gives rest to the heart of the patient and makes it active and relieves some of his grief."',
      remedyUrdu:
        'تلبینہ (جو کا دلیہ دودھ اور شہد کے ساتھ) — نبی کریم ﷺ نے فرمایا: تلبینہ بیمار کے دل کو راحت دیتا ہے اور غم کو دور کرتا ہے۔',
      reference: 'Sahih al-Bukhari 5417, 6369',
    },
    methodUrdu:
      'آیتِ کریمہ (لَّا إِلَٰهَ إِلَّا أَنتَ...) کثرت سے پڑھیں، مسنون دعا کا اہتمام کریں اور ناشتے میں تلبینہ استعمال کریں۔',
  },
  {
    id: 'evil-eye-envy',
    category: 'spiritual',
    titleEnglish: 'Evil Eye (Nazar-e-Bad) & Envy',
    titleUrdu: 'نظرِ بد اور حسد کا علاج',
    symptomsEnglish: 'Sudden fatigue, unexplained blockages, restlessness, yawning',
    symptomsUrdu: 'اچانک سستی، کاموں میں رکاوٹ، بے چینی، بلاوجہ تھکاوٹ',
    quranicVerse: {
      arabic: 'قُلْ أَعُوذُ بِرَبِّ الْفَلَقِ ۝ مِن شَرِّ مَا خَلَقَ ۝ وَمِن شَرِّ حَاسِدٍ إِذَا حَسَدَ',
      urdu: 'کہہ دیجیے: میں صبح کے رب کی پناہ مانگتا ہوں، ہر اس چیز کے شر سے جو اس نے پیدا کی، اور حسد کرنے والے کے شر سے جب وہ حسد کرے۔',
      reference: 'Surah Al-Falaq 113:1-5',
      surahNumber: 113,
      ayahNumber: 1,
    },
    propheticRemedy: {
      arabicDua:
        'أَعُوذُ بِكَلِمَاتِ اللَّهِ التَّامَّةِ، مِنْ كُلِّ شَيْطَانٍ وَهَامَّةٍ، وَمِنْ كُلِّ عَيْنٍ لَامَّةٍ',
      remedyEnglish:
        'Recite Surah Al-Ikhlas, Surah Al-Falaq, and Surah An-Nas (3 times each morning and evening) and blow into hands to wipe over the body.',
      remedyUrdu:
        'صبح و شام تینوں قل (سورۃ الاخلاص، الفلق، الناس) 3، 3 مرتبہ پڑھ کر ہاتھوں پر دم کر کے پورے جسم پر پھیریں۔',
      reference: 'Sahih al-Bukhari 3371, 5017',
    },
    methodUrdu:
      'سورۃ الفاتحہ، آیۃ الکرسی اور تینوں قل پڑھ کر پانی پر دم کریں اور پئیں، نیز صبح و شام کی مسنون دعا پڑھیں۔',
  },
  {
    id: 'insomnia-sleep',
    category: 'spiritual',
    titleEnglish: 'Insomnia & Disturbed Sleep',
    titleUrdu: 'بے خوابی اور نیند کی کمی',
    symptomsEnglish: 'Difficulty falling asleep, nightmares, waking up anxious',
    symptomsUrdu: 'نیند نہ آنا، ڈراؤنے خواب، رات کو گھبرا کر اٹھنا',
    quranicVerse: {
      arabic: 'اللَّهُ لَا إِلَٰهَ إِلَّا هُوَ الْحَيُّ الْقَيُّومُ ۚ لَا تَأْخُذُهُ سِنَةٌ وَلَا نَوْمٌ',
      urdu: 'اللہ، جس کے سوا کوئی معبود نہیں، زندہ ہے، سب کا تھامنے والا ہے، اسے نہ اونگھ آتی ہے نہ نیند۔',
      reference: 'Surah Al-Baqarah 2:255',
      surahNumber: 2,
      ayahNumber: 255,
    },
    propheticRemedy: {
      arabicDua:
        'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
      remedyEnglish:
        'Perform Wudu before bed, sleep on the right side, and recite Ayat-ul-Kursi and the last two verses of Surah Al-Baqarah.',
      remedyUrdu:
        'سونے سے پہلے وضو کریں، دائیں کروٹ لیٹیں، آیۃ الکرسی اور سورۃ البقرہ کی آخری دو آیات پڑھیں۔',
      reference: 'Sahih al-Bukhari 2311, 5009',
    },
    methodUrdu:
      'بستر پر جانے سے پہلے باوضو ہو کر آیۃ الکرسی اور تینوں قل پڑھ کر اپنے اوپر دم کریں۔',
  },
];
