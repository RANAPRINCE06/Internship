export const LANGUAGES = [
  // Auto detect
  { code: 'auto', name: 'Auto Detect', nativeName: 'Auto Detect', group: 'Auto' },

  // Indian Languages
  { code: 'en', name: 'English', nativeName: 'English', group: 'Indian / Germanic' },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', group: 'Indian' },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', group: 'Indian' },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', group: 'Indian' },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', group: 'Indian' },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', group: 'Indian' },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', group: 'Indian' },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', group: 'Indian' },
  { code: 'kn', name: 'Kannada', nativeName: 'ಕನ್ನಡ', group: 'Indian' },
  { code: 'ml', name: 'Malayalam', nativeName: 'മലയാളം', group: 'Indian' },
  { code: 'or', name: 'Odia', nativeName: 'ଓଡ଼ିଆ', group: 'Indian' },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', group: 'Indian' },
  { code: 'sa', name: 'Sanskrit', nativeName: 'संस्कृतम्', group: 'Indian' },

  // European Languages
  { code: 'fr', name: 'French', nativeName: 'Français', group: 'European' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', group: 'European' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', group: 'European' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', group: 'European' },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', group: 'European' },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', group: 'European' },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', group: 'European' },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', group: 'European' },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', group: 'European' },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', group: 'European' },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', group: 'European' },
  { code: 'ro', name: 'Romanian', nativeName: 'Română', group: 'European' },
  { code: 'hu', name: 'Hungarian', nativeName: 'Magyar', group: 'European' },
  { code: 'cs', name: 'Czech', nativeName: 'Čeština', group: 'European' },
  { code: 'sk', name: 'Slovak', nativeName: 'Slovenčina', group: 'European' },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', group: 'European' },
  { code: 'no', name: 'Norwegian', nativeName: 'Norsk', group: 'European' },
  { code: 'da', name: 'Danish', nativeName: 'Dansk', group: 'European' },
  { code: 'fi', name: 'Finnish', nativeName: 'Suomi', group: 'European' },

  // East/Southeast Asian Languages
  { code: 'zh', name: 'Chinese Simplified', nativeName: '简体中文', group: 'Asian' },
  { code: 'zh-TW', name: 'Chinese Traditional', nativeName: '繁體中文', group: 'Asian' },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', group: 'Asian' },
  { code: 'ko', name: 'Korean', nativeName: '한국어', group: 'Asian' },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', group: 'Asian' },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', group: 'Asian' },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', group: 'Asian' },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', group: 'Asian' },
  { code: 'tl', name: 'Filipino', nativeName: 'Filipino', group: 'Asian' },

  // Middle Eastern Languages
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', group: 'Middle Eastern' },
  { code: 'fa', name: 'Persian', nativeName: 'فارسی', group: 'Middle Eastern' },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', group: 'Middle Eastern' },

  // African Languages
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', group: 'African' },
  { code: 'af', name: 'Afrikaans', nativeName: 'Afrikaans', group: 'African' },
  { code: 'zu', name: 'Zulu', nativeName: 'isiZulu', group: 'African' }
];

export const getLanguageName = (code) => {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang ? lang.name : code;
};

export const getLanguageNativeName = (code) => {
  const lang = LANGUAGES.find(l => l.code === code);
  return lang ? lang.nativeName : code;
};
