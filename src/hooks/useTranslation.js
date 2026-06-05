import { useState, useEffect, useRef, useCallback } from 'react';
import { translateText } from '../services/translationService';

/**
 * Custom hook to manage translation state and API requests.
 * @param {object} options Options config
 * @param {Function} [options.onTranslateSuccess] Callback triggered when translation completes successfully
 * @param {Function} [options.onTranslateError] Callback triggered when translation fails
 */
export default function useTranslation({ onTranslateSuccess, onTranslateError } = {}) {
  const [sourceLang, setSourceLang] = useState('auto');
  const [targetLang, setTargetLang] = useState('es');
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [isInstant, setIsInstant] = useState(true);
  const [detectedLang, setDetectedLang] = useState('');
  const [confidence, setConfidence] = useState(null);

  const debounceTimerRef = useRef(null);

  // Core translate runner
  const translate = useCallback(
    async (textToTranslate = inputText, sLang = sourceLang, tLang = targetLang, isBackground = false) => {
      const trimmed = textToTranslate.trim();
      if (!trimmed) {
        setTranslatedText('');
        setError(null);
        setConfidence(null);
        setDetectedLang('');
        return;
      }

      setIsLoading(true);
      setError(null);

      try {
        const result = await translateText(trimmed, sLang, tLang);
        setTranslatedText(result.translatedText);
        setConfidence(result.confidence);

        const detected = sLang === 'auto' && result.detectedSourceLanguage ? result.detectedSourceLanguage : '';
        setDetectedLang(detected);

        if (onTranslateSuccess) {
          onTranslateSuccess({
            originalText: trimmed,
            translatedText: result.translatedText,
            sourceLang: sLang === 'auto' && result.detectedSourceLanguage ? `auto (${result.detectedSourceLanguage})` : sLang,
            targetLang: tLang,
            timestamp: Date.now()
          }, isBackground);
        }
      } catch (err) {
        const errMsg = err.message || "Failed to communicate with translation service.";
        setError(errMsg);
        if (onTranslateError) {
          onTranslateError(errMsg);
        }
      } finally {
        setIsLoading(false);
      }
    },
    [inputText, sourceLang, targetLang, onTranslateSuccess, onTranslateError]
  );

  // Debouncing effect for instant translation
  useEffect(() => {
    if (!isInstant) return;

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    if (inputText.trim() === '') {
      setTranslatedText('');
      setConfidence(null);
      setDetectedLang('');
      setError(null);
      return;
    }

    debounceTimerRef.current = setTimeout(() => {
      translate(inputText, sourceLang, targetLang, true);
    }, 1300); // Increased typing debounce to 1.3 seconds to respect rate limits

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [inputText, sourceLang, targetLang, isInstant, translate]);

  // Clear translation workspace
  const clear = useCallback(() => {
    setInputText('');
    setTranslatedText('');
    setConfidence(null);
    setDetectedLang('');
    setError(null);
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
  }, []);

  // Swap input/output languages and content
  const swap = useCallback((onShowToast) => {
    const activeSource = sourceLang === 'auto' && detectedLang ? detectedLang : sourceLang;
    
    if (activeSource === 'auto') {
      if (onShowToast) onShowToast("Please select a specific source language to swap.", "info");
      return;
    }

    setSourceLang(targetLang);
    setTargetLang(activeSource);

    if (translatedText) {
      const original = inputText;
      const translated = translatedText;
      setInputText(translated);
      setTranslatedText(original);
      
      // Auto trigger translation in the opposite direction
      translate(translated, targetLang, activeSource);
    }
  }, [sourceLang, targetLang, detectedLang, inputText, translatedText, translate]);

  return {
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    inputText,
    setInputText,
    translatedText,
    setTranslatedText,
    isLoading,
    setIsLoading,
    error,
    setError,
    isInstant,
    setIsInstant,
    detectedLang,
    setDetectedLang,
    confidence,
    clear,
    swap,
    translate
  };
}
