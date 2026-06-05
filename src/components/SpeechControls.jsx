import React, { useState, useEffect, useRef } from 'react';
import { FiPlay, FiPause, FiSquare, FiChevronDown } from 'react-icons/fi';

/**
 * SpeechControls Component (Dark Theme Only)
 * @param {object} props
 * @param {string} props.text The text to read aloud
 * @param {string} props.langCode The target language code
 */
export default function SpeechControls({ text, langCode }) {
  const [voices, setVoices] = useState([]);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  
  const synthRef = useRef(typeof window !== 'undefined' ? window.speechSynthesis : null);

  useEffect(() => {
    if (!synthRef.current) return;

    const updateVoices = () => {
      const allVoices = synthRef.current.getVoices();
      setVoices(allVoices);

      // Match selected voice with target language script
      const targetLangLower = langCode?.toLowerCase();
      const match = allVoices.find(
        (v) => v.lang.toLowerCase().startsWith(targetLangLower) || 
               v.lang.toLowerCase().includes(targetLangLower.replace('-', '_'))
      );
      
      if (match) {
        setSelectedVoice(match);
      } else {
        const defaultVoice = allVoices.find((v) => v.default) || allVoices[0] || null;
        setSelectedVoice(defaultVoice);
      }
    };

    updateVoices();

    if (synthRef.current.onvoiceschanged !== undefined) {
      synthRef.current.onvoiceschanged = updateVoices;
    }

    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, [langCode]);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!synthRef.current) return;
      setIsPlaying(synthRef.current.speaking);
      setIsPaused(synthRef.current.paused);
    }, 200);

    return () => clearInterval(interval);
  }, []);

  const handleSpeak = () => {
    if (!synthRef.current || !text || text.trim() === '') return;

    synthRef.current.cancel();

    const utterance = new SpeechSynthesisUtterance(text);
    if (selectedVoice) {
      utterance.voice = selectedVoice;
    }
    
    utterance.lang = selectedVoice?.lang || langCode;

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
    };

    utterance.onerror = (e) => {
      console.warn("Speech API error:", e);
      setIsPlaying(false);
      setIsPaused(false);
    };

    synthRef.current.speak(utterance);
    setIsPlaying(true);
    setIsPaused(false);
  };

  const handlePause = () => {
    if (synthRef.current && synthRef.current.speaking && !synthRef.current.paused) {
      synthRef.current.pause();
      setIsPaused(true);
    }
  };

  const handleResume = () => {
    if (synthRef.current && synthRef.current.paused) {
      synthRef.current.resume();
      setIsPaused(false);
    }
  };

  const handleStop = () => {
    if (synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
      setIsPaused(false);
    }
  };

  if (!synthRef.current) {
    return (
      <div className="text-[11px] text-slate-500 italic px-2">
        Text-to-Speech unsupported by this browser.
      </div>
    );
  }

  return (
    <div className="flex flex-wrap items-center gap-3 p-2 rounded-xl border border-slate-800 bg-slate-900/40 w-full md:w-auto">
      <div className="flex items-center gap-1.5">
        <span className="text-[10px] uppercase font-bold text-slate-500 px-1 select-none">
          TTS
        </span>
        
        {!isPlaying ? (
          <button
            onClick={handleSpeak}
            disabled={!text || text.trim() === ''}
            className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 disabled:opacity-30 disabled:cursor-not-allowed text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-sky-500"
            title="Read translated text aloud"
          >
            <FiPlay className="w-3.5 h-3.5 fill-white text-white" />
          </button>
        ) : (
          <div className="flex items-center gap-1.5">
            {isPaused ? (
              <button
                onClick={handleResume}
                className="p-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-sky-500"
                title="Resume playing"
              >
                <FiPlay className="w-3.5 h-3.5 fill-white text-white" />
              </button>
            ) : (
              <button
                onClick={handlePause}
                className="p-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-amber-500"
                title="Pause playing"
              >
                <FiPause className="w-3.5 h-3.5 fill-white text-white" />
              </button>
            )}
            <button
              onClick={handleStop}
              className="p-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white shadow-sm hover:shadow transition-all duration-200 cursor-pointer flex items-center justify-center focus:outline-none focus:ring-1 focus:ring-rose-500"
              title="Stop playing"
            >
              <FiSquare className="w-3.5 h-3.5 fill-white" />
            </button>
          </div>
        )}
      </div>

      {voices.length > 0 && (
        <div className="relative flex-grow md:flex-grow-0 min-w-[140px] md:w-[180px]">
          <select
            value={selectedVoice?.name || ''}
            onChange={(e) => {
              const voice = voices.find(v => v.name === e.target.value);
              setSelectedVoice(voice);
              if (isPlaying) handleStop();
            }}
            className="w-full pl-2.5 pr-8 py-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-350 text-[11px] font-medium focus:ring-1 focus:ring-sky-500 focus:outline-none transition-all cursor-pointer appearance-none truncate"
          >
            {voices.map((v) => (
              <option key={v.name} value={v.name} className="bg-slate-950 text-slate-300">
                {v.name} ({v.lang})
              </option>
            ))}
          </select>
          <div className="absolute right-2 top-1/2 -translate-y-1/2 pointer-events-none text-slate-500">
            <FiChevronDown className="w-3.5 h-3.5" />
          </div>
        </div>
      )}
    </div>
  );
}
