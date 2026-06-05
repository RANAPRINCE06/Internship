import React, { useEffect, useRef, useState } from 'react';
import { 
  FiTrash2, FiCopy, FiDownload, FiShare2, FiRepeat, 
  FiMic, FiMicOff, FiAlertCircle, FiCheck, FiSliders, FiHelpCircle
} from 'react-icons/fi';
import { HiSparkles } from 'react-icons/hi';
import LanguageSelector from './LanguageSelector';
import SpeechControls from './SpeechControls';
import LoadingSpinner from './LoadingSpinner';
import useTranslation from '../hooks/useTranslation';
import { copyToClipboard, downloadAsTxt } from '../utils/helpers';
import { getLanguageName } from '../utils/languages';

const SpeechRecognition = typeof window !== 'undefined' ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;

/**
 * Translator Workspace Component (Dark SaaS design only)
 */
export default function Translator({
  onAddHistory,
  favorites,
  onToggleFavorite,
  recentLangs,
  onAddRecent,
  onShowToast
}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef(null);
  const textareaRef = useRef(null);

  const charLimit = 5000;

  // Integrate the useTranslation custom hook
  const {
    sourceLang,
    setSourceLang,
    targetLang,
    setTargetLang,
    inputText,
    setInputText,
    translatedText,
    setTranslatedText,
    isLoading,
    error,
    isInstant,
    setIsInstant,
    detectedLang,
    confidence,
    clear,
    swap,
    translate
  } = useTranslation({
    onTranslateSuccess: (logItem, isBackground) => {
      if (!isBackground) {
        onAddHistory(logItem);
      }
      // Add languages to recents list
      onAddRecent(sourceLang);
      onAddRecent(targetLang);
    },
    onTranslateError: (err) => {
      onShowToast(err, "error");
    }
  });

  // Auto-resize the input textarea as text length expands
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.max(180, textareaRef.current.scrollHeight)}px`;
    }
  }, [inputText]);

  // Handle Speech Recognition microphone capturing
  useEffect(() => {
    if (!SpeechRecognition) return;

    const rec = new SpeechRecognition();
    rec.continuous = true;
    rec.interimResults = false;
    rec.lang = sourceLang === 'auto' ? 'en-US' : sourceLang;

    rec.onresult = (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript;
      setInputText((prev) => {
        const space = prev.length > 0 && !prev.endsWith(' ') ? ' ' : '';
        const newText = prev + space + transcript;
        return newText.slice(0, charLimit);
      });
      onShowToast("Speech captured.", "success");
    };

    rec.onerror = (e) => {
      console.warn("Speech recognition error:", e.error);
      if (e.error !== 'no-speech') {
        onShowToast(`Speech recognition issue: ${e.error}`, "error");
        setIsListening(false);
      }
    };

    rec.onend = () => {
      setIsListening(false);
    };

    recognitionRef.current = rec;

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.abort();
      }
    };
  }, [sourceLang, setInputText, onShowToast]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      onShowToast("Voice recognition is not supported in this browser.", "error");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current.start();
        setIsListening(true);
        onShowToast("Microphone active. Speak now.", "info");
      } catch (err) {
        console.error("Speech trigger failed:", err);
        onShowToast("Could not activate microphone.", "error");
      }
    }
  };

  // Keyboard shortcuts event handler
  const handleKeyDown = (e) => {
    // Ctrl + Enter translates manually
    if (e.ctrlKey && e.key === 'Enter') {
      e.preventDefault();
      translate();
      onShowToast("Translation forced.", "success");
    }
    // Escape clears workspace
    if (e.key === 'Escape') {
      e.preventDefault();
      handleClear();
      onShowToast("Workspace cleared.", "info");
    }
  };

  const handleClear = () => {
    clear();
    if (isListening && recognitionRef.current) {
      recognitionRef.current.stop();
    }
  };

  const handleBlur = () => {
    if (inputText.trim() && translatedText) {
      onAddHistory({
        originalText: inputText.trim(),
        translatedText,
        sourceLang: sourceLang === 'auto' && detectedLang ? `auto (${detectedLang})` : sourceLang,
        targetLang,
        timestamp: Date.now()
      });
    }
  };

  const handleCopy = async () => {
    if (!translatedText) return;
    const success = await copyToClipboard(translatedText);
    if (success) {
      onShowToast("Copied to clipboard!", "success");
      onAddHistory({
        originalText: inputText.trim(),
        translatedText,
        sourceLang: sourceLang === 'auto' && detectedLang ? `auto (${detectedLang})` : sourceLang,
        targetLang,
        timestamp: Date.now()
      });
    } else {
      onShowToast("Failed to copy.", "error");
    }
  };

  const handleDownload = () => {
    if (!translatedText) return;
    downloadAsTxt(translatedText, `translation_${targetLang}.txt`);
    onShowToast("Downloaded as TXT file.", "success");
    onAddHistory({
      originalText: inputText.trim(),
      translatedText,
      sourceLang: sourceLang === 'auto' && detectedLang ? `auto (${detectedLang})` : sourceLang,
      targetLang,
      timestamp: Date.now()
    });
  };

  const handleShare = async () => {
    if (!translatedText) return;
    
    const shareData = {
      title: 'GlobalSpeak Translation',
      text: `Original: ${inputText}\nTranslated (${targetLang}): ${translatedText}`,
      url: window.location.href
    };

    try {
      if (navigator.share && navigator.canShare && navigator.canShare(shareData)) {
        await navigator.share(shareData);
        onShowToast("Shared successfully!", "success");
      } else {
        await copyToClipboard(`${shareData.text}\nShared via GlobalSpeak`);
        onShowToast("Template copied to clipboard for sharing!", "info");
      }
      onAddHistory({
        originalText: inputText.trim(),
        translatedText,
        sourceLang: sourceLang === 'auto' && detectedLang ? `auto (${detectedLang})` : sourceLang,
        targetLang,
        timestamp: Date.now()
      });
    } catch (err) {
      if (err.name !== 'AbortError') {
        onShowToast("Unable to trigger system sharing.", "error");
      }
    }
  };

  const handleSwap = () => {
    swap(onShowToast);
  };

  // Listen for reuse events emitted from history clicks
  useEffect(() => {
    const handleReuse = (e) => {
      const { originalText, sourceLang: s, targetLang: t } = e.detail;
      const cleanSourceCode = s.startsWith('auto') ? 'auto' : s;
      setSourceLang(cleanSourceCode);
      setTargetLang(t);
      setInputText(originalText);
    };

    window.addEventListener('reuse-translation', handleReuse);
    return () => window.removeEventListener('reuse-translation', handleReuse);
  }, [setSourceLang, setTargetLang, setInputText]);

  // Calculations
  const wordCount = inputText.trim() ? inputText.trim().split(/\s+/).length : 0;
  const charPercent = (inputText.length / charLimit) * 100;

  return (
    <div className="space-y-6">
      
      {/* Workspace Configuration Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 px-1">
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <HiSparkles className="w-3.5 h-3.5 text-sky-400 animate-pulse" />
          <span>Interactive Translation Workbench</span>
        </div>
        
        {/* Actions (Instant Toggle & Shortcut hints) */}
        <div className="flex items-center gap-4">
          {/* Keyboard Shortcut Icon with tooltip */}
          <div 
            className="flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-455 transition-colors cursor-help select-none"
            title="Shortcuts:\n- Ctrl+Enter: Force translate\n- Esc: Clear workspace"
          >
            <FiHelpCircle className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Shortcuts</span>
          </div>

          <span className="text-slate-800">|</span>

          {/* Instant translation switcher */}
          <label className="relative inline-flex items-center cursor-pointer select-none">
            <input 
              type="checkbox" 
              checked={isInstant} 
              onChange={(e) => setIsInstant(e.target.checked)}
              className="sr-only peer" 
              aria-label="Toggle instant translation"
            />
            <div className="w-9 h-5 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-900 after:border-slate-700 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-sky-500"></div>
            <span className="ml-2 text-xs font-semibold text-slate-400">
              Instant
            </span>
          </label>
        </div>
      </div>

      {/* Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-stretch relative">
        
        {/* Source Box */}
        <div className="glass-panel rounded-3xl flex flex-col p-5 md:p-6 transition-all duration-300 relative border border-slate-800/40">
          
          <div className="mb-4">
            <LanguageSelector
              selectedLang={sourceLang}
              onChange={setSourceLang}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              recentLangs={recentLangs}
            />
          </div>

          {/* Textarea container */}
          <div className="relative flex-grow min-h-[180px] flex flex-col">
            <textarea
              ref={textareaRef}
              value={inputText}
              onChange={(e) => setInputText(e.target.value.slice(0, charLimit))}
              onKeyDown={handleKeyDown}
              onBlur={handleBlur}
              placeholder="Enter text to translate... (Press Esc to clear, Ctrl+Enter to translate)"
              className="w-full flex-grow bg-transparent text-slate-100 placeholder-slate-500 text-sm md:text-base border-none outline-none resize-none focus:ring-0 font-sans leading-relaxed min-h-[180px] p-0"
              maxLength={charLimit}
              aria-label="Source Text Input"
              id="source-textarea"
            />

            {isListening && (
              <div className="absolute inset-0 bg-sky-500/5 rounded-2xl flex items-center justify-center border border-dashed border-sky-500/30 animate-pulse pointer-events-none">
                <div className="flex items-center gap-2 px-3.5 py-2 rounded-full bg-sky-500/10 text-sky-400 text-xs font-semibold">
                  <span className="w-2 h-2 rounded-full bg-sky-455 animate-ping"></span>
                  Mic Active... Speak Now
                </div>
              </div>
            )}
          </div>

          {/* Source Box Footer Toolbar */}
          <div className="flex items-center justify-between border-t border-slate-800/30 pt-4 mt-4 text-slate-400">
            
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={toggleListening}
                className={`p-2.5 rounded-xl transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500/20 ${
                  isListening
                    ? 'bg-rose-600 text-white shadow-md shadow-rose-600/20 hover:bg-rose-500'
                    : 'bg-slate-800 hover:bg-slate-750 text-slate-350'
                }`}
                title={isListening ? "Deactivate voice search" : "Speak to translate"}
                id="mic-btn"
                aria-label={isListening ? "Stop listening" : "Start voice input"}
              >
                {isListening ? <FiMicOff className="w-4 h-4" /> : <FiMic className="w-4 h-4" />}
              </button>

              <button
                type="button"
                onClick={handleClear}
                disabled={!inputText}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:cursor-not-allowed text-slate-350 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                title="Clear input"
                id="clear-btn"
                aria-label="Clear source text input"
              >
                <FiTrash2 className="w-4 h-4" />
              </button>
            </div>

            {/* Counters */}
            <div className="flex items-center gap-4 text-xs font-semibold text-slate-500">
              <span>{wordCount} words</span>
              <div className="flex items-center gap-1.5">
                <span className={inputText.length >= charLimit - 100 ? 'text-amber-500 font-bold animate-pulse' : ''}>
                  {inputText.length}
                </span>
                <span>/</span>
                <span>{charLimit}</span>
                {/* Radial visual indicator */}
                <div className="w-4 h-4 rounded-full border border-slate-800 relative overflow-hidden flex items-center justify-center">
                  <div 
                    className="absolute inset-0 bg-sky-500/20 transition-all duration-300"
                    style={{ height: `${charPercent}%` }}
                  />
                </div>
              </div>
            </div>

          </div>

        </div>

        {/* Floating Switch Button in between */}
        <div className="flex items-center justify-center py-2 lg:py-0 lg:absolute lg:left-1/2 lg:top-1/2 lg:-translate-x-1/2 lg:-translate-y-1/2 lg:z-10">
          <button
            type="button"
            onClick={handleSwap}
            className="p-3.5 rounded-full border border-slate-800 bg-slate-900 text-slate-300 shadow-lg hover:shadow-sky-500/5 hover:bg-slate-800 hover:scale-110 active:scale-95 transition-all duration-300 hover:rotate-185 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500"
            title="Swap translation directions"
            aria-label="Swap source and target languages"
          >
            <FiRepeat className="w-4 h-4 text-sky-400" />
          </button>
        </div>

        {/* Target Box */}
        <div className="glass-panel rounded-3xl flex flex-col p-5 md:p-6 transition-all duration-300 border border-slate-800/40 relative">
          
          <div className="mb-4">
            <LanguageSelector
              selectedLang={targetLang}
              onChange={setTargetLang}
              excludeAuto={true}
              favorites={favorites}
              onToggleFavorite={onToggleFavorite}
              recentLangs={recentLangs}
            />
          </div>

          {/* Result view */}
          <div className="flex-grow min-h-[180px] flex flex-col">
            {isLoading ? (
              <LoadingSpinner />
            ) : error ? (
              <div className="flex flex-col items-center justify-center p-6 space-y-3 h-full min-h-[180px] text-center">
                <FiAlertCircle className="w-10 h-10 text-rose-500/80" />
                <p className="text-xs md:text-sm font-semibold text-rose-400 break-words max-w-sm">
                  {error}
                </p>
                <button
                  onClick={() => translate()}
                  className="px-4 py-2 rounded-xl bg-rose-500/10 text-rose-455 border border-rose-500/15 hover:bg-rose-500/20 transition-all text-xs font-semibold cursor-pointer focus:outline-none"
                  aria-label="Retry translation"
                >
                  Retry Translation
                </button>
              </div>
            ) : (
              <div className="relative flex-grow flex flex-col justify-between">
                <div 
                  className={`w-full flex-grow text-slate-100 text-sm md:text-base whitespace-pre-wrap leading-relaxed break-words font-sans min-h-[180px] select-text pb-6 ${
                    !translatedText ? 'text-slate-600 italic select-none' : ''
                  }`}
                  aria-label="Translated Text Output"
                  id="translated-view"
                >
                  {translatedText || "Translation output will appear here..."}
                </div>

                {/* Auto detected lang tag metadata */}
                {detectedLang && (
                  <div className="absolute bottom-2 left-0 flex items-center gap-1 text-[11px] text-slate-500 font-medium select-none">
                    <HiSparkles className="w-3.5 h-3.5 text-sky-400" />
                    <span>Auto-detected:</span>
                    <span className="font-semibold text-slate-400">
                      {getLanguageName(detectedLang)}
                    </span>
                    {confidence && (
                      <span className="opacity-75">
                        ({Math.round(confidence * 100)}% accuracy)
                      </span>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Toolbar */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between border-t border-slate-800/30 pt-4 mt-4 gap-4">
            
            <SpeechControls 
              text={translatedText} 
              langCode={targetLang} 
            />

            <div className="flex items-center gap-2 justify-end">
              <button
                type="button"
                onClick={handleCopy}
                disabled={!translatedText}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:cursor-not-allowed text-slate-350 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                title="Copy to clipboard"
                aria-label="Copy translation output to clipboard"
              >
                <FiCopy className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleDownload}
                disabled={!translatedText}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:cursor-not-allowed text-slate-350 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                title="Download text file (.txt)"
                aria-label="Download translation output as text file"
              >
                <FiDownload className="w-4 h-4" />
              </button>

              <button
                type="button"
                onClick={handleShare}
                disabled={!translatedText}
                className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-750 disabled:opacity-30 disabled:cursor-not-allowed text-slate-350 transition-all cursor-pointer flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-sky-500/20"
                title="Share translation"
                aria-label="Open system sharing options"
              >
                <FiShare2 className="w-4 h-4" />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* Manual Action Button (when Instant translation is off) */}
      {!isInstant && inputText.trim() !== '' && (
        <div className="flex justify-center pt-2">
          <button
            type="button"
            onClick={() => translate()}
            disabled={isLoading}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-650 hover:from-sky-600 hover:to-indigo-700 text-white font-semibold text-sm shadow-md hover:shadow-lg transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer flex items-center gap-2 focus:outline-none focus:ring-2 focus:ring-sky-500"
            aria-label="Force text translation"
          >
            {isLoading ? "Translating..." : "Translate Now"}
            <HiSparkles className="w-4 h-4 animate-pulse" />
          </button>
        </div>
      )}

    </div>
  );
}
