const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const API_HOST = import.meta.env.VITE_RAPIDAPI_HOST;

// Check if we should fallback to demo simulation mode
export const isDemoMode = !API_KEY || API_KEY.trim() === "" || API_KEY.includes("YOUR_RAPIDAPI_KEY");

/**
 * Helper to execute fetch with a custom timeout
 * @param {string} url 
 * @param {object} options 
 * @param {number} timeoutMs 
 * @returns {Promise<Response>}
 */
async function fetchWithTimeout(url, options = {}, timeoutMs = 8000) {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(id);
    return response;
  } catch (error) {
    clearTimeout(id);
    if (error.name === 'AbortError') {
      throw new Error("Request timed out. The translation server took too long to respond. Please try again.");
    }
    throw error;
  }
}

// Local cache to reduce duplicate API requests and mitigate 429 rate limit issues
const translationCache = new Map();

/**
 * Fallback to Google's public translation endpoint when API keys fail/rate limit.
 * @param {string} text 
 * @param {string} sourceLang 
 * @param {string} targetLang 
 * @returns {Promise<object>}
 */
async function translatePublic(text, sourceLang, targetLang) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=${sourceLang}&tl=${targetLang}&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetchWithTimeout(url, { method: 'GET' }, 8000);
  if (!response.ok) {
    throw new Error(`Public translation API failed with status ${response.status}`);
  }
  const data = await response.json();
  const translatedText = data[0].map(x => x[0]).join('');
  const detectedSourceLanguage = data[2] || sourceLang;

  return {
    translatedText,
    detectedSourceLanguage,
    confidence: 1.0,
    isDemo: false,
    isPublicFallback: true
  };
}

/**
 * Fallback to Google's public detection endpoint.
 * @param {string} text 
 * @returns {Promise<object>}
 */
async function detectPublic(text) {
  const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=en&dt=t&q=${encodeURIComponent(text)}`;
  const response = await fetchWithTimeout(url, { method: 'GET' }, 8000);
  if (!response.ok) {
    throw new Error(`Public detection API failed with status ${response.status}`);
  }
  const data = await response.json();
  const detected = data[2];
  return {
    language: detected,
    confidence: 0.99,
    isReliable: true,
    isDemo: false,
    isPublicFallback: true
  };
}

/**
 * Translates a given text using Google Translate via RapidAPI.
 * @param {string} text The text to translate
 * @param {string} sourceLang Source language code ('auto' or ISO code)
 * @param {string} targetLang Target ISO language code (e.g. 'fr')
 * @returns {Promise<{translatedText: string, detectedSourceLanguage: string, confidence: number|null, isDemo: boolean}>}
 */
export async function translateText(text, sourceLang, targetLang) {
  if (!text || text.trim() === "") {
    return {
      translatedText: "",
      detectedSourceLanguage: sourceLang,
      confidence: null,
      isDemo: false
    };
  }

  // Lookup in-memory cache to save API usage and prevent 429 errors
  const cacheKey = `${sourceLang}-${targetLang}-${text.trim().toLowerCase()}`;
  if (translationCache.has(cacheKey)) {
    console.log(`[Cache Hit] Serving cached translation for: "${cacheKey}"`);
    return translationCache.get(cacheKey);
  }

  if (isDemoMode) {
    // Simulate network delay
    await new Promise((resolve) => setTimeout(resolve, 1200));

    let detectedSource = sourceLang;
    if (sourceLang === 'auto') {
      detectedSource = detectSimulatedLanguage(text);
    }

    const translatedText = getSimulatedTranslation(text, targetLang);
    const result = {
      translatedText,
      detectedSourceLanguage: detectedSource,
      confidence: 0.96,
      isDemo: true
    };
    
    translationCache.set(cacheKey, result);
    return result;
  }

  const isGoogleAPI = API_HOST.includes("googleapis.com") || API_KEY.startsWith("AIzaSy") || API_KEY.startsWith("AQ.");

  const url = isGoogleAPI 
    ? `https://translation.googleapis.com/language/translate/v2?key=${API_KEY}`
    : `https://${API_HOST}/language/translate/v2`;

  const options = isGoogleAPI
    ? {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          q: [text],
          target: targetLang,
          ...(sourceLang && sourceLang !== 'auto' ? { source: sourceLang } : {})
        })
      }
    : {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST,
        },
        body: new URLSearchParams({
          q: text,
          target: targetLang,
          ...(sourceLang && sourceLang !== 'auto' ? { source: sourceLang } : {})
        })
      };

  try {
    const response = await fetchWithTimeout(url, options, 8000);
    
    // Map HTTP Status Errors to User-Friendly Messages
    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = response.statusText;
      try {
        const parsed = JSON.parse(errText);
        errorMsg = parsed.error?.message || parsed.message || errorMsg;
      } catch (_) {
        errorMsg = errText || errorMsg;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(`Invalid API Credentials: ${errorMsg || "Verify your API Key."}`);
      } else if (response.status === 429) {
        throw new Error("Too many translation requests. API Rate limit exceeded. Please wait a moment and try again.");
      } else if (response.status === 404 && !isGoogleAPI) {
        throw new Error("API Route rate limit or subscription restriction encountered. Please try again in a moment or disable Instant Translation.");
      } else {
        throw new Error(`API Error (${response.status}): ${errorMsg}`);
      }
    }

    const data = await response.json();
    const translation = data?.data?.translations?.[0];

    if (!translation) {
      throw new Error("Received an unexpected data structure from the translation service.");
    }

    // Decode HTML entities returned by translation APIs (like &#39; to ')
    const parser = new DOMParser();
    const doc = parser.parseFromString(translation.translatedText, 'text/html');
    const decodedText = doc.body.textContent || translation.translatedText;

    const result = {
      translatedText: decodedText,
      detectedSourceLanguage: translation.detectedSourceLanguage || sourceLang,
      confidence: translation.confidence || null,
      isDemo: false
    };

    translationCache.set(cacheKey, result);
    return result;

  } catch (error) {
    console.warn("Primary API Key request failed. Recovering with public Google Translate engine...", error);
    try {
      const result = await translatePublic(text, sourceLang, targetLang);
      translationCache.set(cacheKey, result);
      return result;
    } catch (fallbackError) {
      console.error("Public translation fallback query failed:", fallbackError);
      throw error; // Throw the original API error if even the fallback fails
    }
  }
}

/**
 * Detects the language of a text string.
 * @param {string} text 
 * @returns {Promise<{language: string, confidence: number, isReliable: boolean, isDemo: boolean}>}
 */
export async function detectLanguage(text) {
  if (!text || text.trim() === "") {
    throw new Error("No text provided for language detection.");
  }

  if (isDemoMode) {
    await new Promise((resolve) => setTimeout(resolve, 600));
    const lang = detectSimulatedLanguage(text);
    return {
      language: lang,
      confidence: 0.95,
      isReliable: true,
      isDemo: true
    };
  }

  const isGoogleAPI = API_HOST.includes("googleapis.com") || API_KEY.startsWith("AIzaSy") || API_KEY.startsWith("AQ.");

  const url = isGoogleAPI
    ? `https://translation.googleapis.com/language/translate/v2/detect?key=${API_KEY}`
    : `https://${API_HOST}/language/translate/v2/detect`;

  const options = isGoogleAPI
    ? {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8',
        },
        body: JSON.stringify({
          q: [text]
        })
      }
    : {
        method: 'POST',
        headers: {
          'content-type': 'application/x-www-form-urlencoded',
          'X-RapidAPI-Key': API_KEY,
          'X-RapidAPI-Host': API_HOST,
        },
        body: new URLSearchParams({
          q: text
        })
      };

  try {
    const response = await fetchWithTimeout(url, options, 8000);

    if (!response.ok) {
      const errText = await response.text();
      let errorMsg = response.statusText;
      try {
        const parsed = JSON.parse(errText);
        errorMsg = parsed.error?.message || parsed.message || errorMsg;
      } catch (_) {
        errorMsg = errText || errorMsg;
      }

      if (response.status === 401 || response.status === 403) {
        throw new Error(`Invalid API Credentials for language detection: ${errorMsg}`);
      } else if (response.status === 429) {
        throw new Error("Rate limit exceeded for detection service.");
      } else {
        throw new Error(`API Error (${response.status}): ${errorMsg}`);
      }
    }

    const data = await response.json();
    const detection = data?.data?.detections?.[0]?.[0];

    if (!detection) {
      throw new Error("Could not detect language. Check API response.");
    }

    return {
      language: detection.language,
      confidence: detection.confidence,
      isReliable: detection.isReliable,
      isDemo: false
    };

  } catch (error) {
    console.warn("Primary API language detection failed. Recovering with public Google engine...", error);
    try {
      return await detectPublic(text);
    } catch (fallbackError) {
      console.error("Public detection fallback failed:", fallbackError);
      throw error;
    }
  }
}

// --- LOCAL DEMO TRANSLATION SIMULATOR ---

function detectSimulatedLanguage(text) {
  const t = text.toLowerCase().trim();
  if (t.startsWith("bonjour") || t.includes("comment allez-vous")) return "fr";
  if (t.startsWith("hola") || t.includes("gracias") || t.includes("buenos")) return "es";
  if (t.startsWith("hallo") || t.includes("danke")) return "de";
  if (t.startsWith("namaste") || /[\u0900-\u097F]/.test(text)) return "hi";
  if (t.startsWith("konnichiwa") || /[\u3040-\u30ff\u4e00-\u9faf]/.test(text)) return "ja";
  return "en";
}

function getSimulatedTranslation(text, targetLang) {
  const phrases = {
    fr: {
      "hello": "Bonjour",
      "thank you": "Merci",
      "how are you?": "Comment allez-vous?",
      "goodbye": "Au revoir",
      "welcome to globalspeak": "Bienvenue sur GlobalSpeak"
    },
    es: {
      "hello": "Hola",
      "thank you": "Gracias",
      "how are you?": "¿Cómo estás?",
      "goodbye": "Adiós",
      "welcome to globalspeak": "Bienvenido a GlobalSpeak"
    },
    de: {
      "hello": "Hallo",
      "thank you": "Danke",
      "how are you?": "Wie geht es dir?",
      "goodbye": "Auf Wiedersehen",
      "welcome to globalspeak": "Willkommen bei GlobalSpeak"
    },
    hi: {
      "hello": "नमस्ते",
      "thank you": "धन्यवाद",
      "how are you?": "आप कैसे हैं?",
      "goodbye": "अलविदा",
      "welcome to globalspeak": "ग्लोबलस्पीक में आपका स्वागत है"
    },
    ja: {
      "hello": "こんにちは",
      "thank you": "ありがとう",
      "how are you?": "お元気ですか？",
      "goodbye": "さようなら",
      "welcome to globalspeak": "グローバルスピークへようこそ"
    }
  };

  const cleanText = text.toLowerCase().trim().replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?]/g,"");
  if (phrases[targetLang] && phrases[targetLang][cleanText]) {
    return phrases[targetLang][cleanText];
  }

  // Prepend localized brackets
  const prefixes = {
    hi: "अनुवादः",
    gu: "અનુવાદઃ",
    mr: "भाषांतरः",
    pa: "ਅਨੁਵਾਦः",
    bn: "অনুবাদঃ",
    ta: "மொழிபெயர்ப்பு:",
    te: "అనువాదం:",
    kn: "ಭಾಷಾಂತರ:",
    ml: "വിവർത്തനം:",
    ur: "ترجمہ:",
    sa: "अनुवादः",
    fr: "Traduction :",
    es: "Traducción:",
    de: "Übersetzung:",
    it: "Traduzione:",
    pt: "Tradução:",
    nl: "Vertaling:",
    ru: "Перевод:",
    ja: "翻訳:",
    zh: "翻译:",
    ko: "번역:",
    ar: "ترجمة:",
    he: "תרגום:"
  };

  const prefix = prefixes[targetLang] || `Translated [${targetLang.toUpperCase()}]:`;
  return `${prefix} ${text}`;
}
