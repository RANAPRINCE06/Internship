import React, { useState } from 'react';
import { motion } from 'framer-motion';
import Header from './components/Header';
import Footer from './components/Footer';
import Translator from './components/Translator';
import TranslationHistory from './components/TranslationHistory';
import ToastNotification from './components/ToastNotification';
import useLocalStorage from './hooks/useLocalStorage';
import { isDemoMode } from './services/translationService';
import { FiTrendingUp, FiCheckCircle, FiGlobe } from 'react-icons/fi';
import ThreeDBackground from './components/ThreeDBackground';

/**
 * App Root Component (Dark Theme with Framer Motion Entrance)
 */
export default function App() {
  const [history, setHistory] = useLocalStorage('globalspeak-history', []);
  const [favorites, setFavorites] = useLocalStorage('globalspeak-favorites', ['hi', 'es', 'fr', 'ja']);
  const [recentLangs, setRecentLangs] = useLocalStorage('globalspeak-recents', ['en', 'es', 'hi']);
  
  // Analytics statistics
  const [stats, setStats] = useLocalStorage('globalspeak-stats', {
    totalTranslations: 0,
    totalWords: 0
  });

  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const handleAddHistory = (item) => {
    setHistory((prevHistory) => {
      // De-duplicate previous logs to prevent clutter
      const filtered = prevHistory.filter(
        (h) => !(h.originalText.toLowerCase() === item.originalText.toLowerCase() && 
                 h.targetLang === item.targetLang)
      );
      
      const newHistory = [
        { ...item, id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}` },
        ...filtered
      ];
      
      return newHistory.slice(0, 20); // capped at 20 logs
    });

    // Update global dashboard statistics
    const words = item.originalText.trim() ? item.originalText.trim().split(/\s+/).length : 0;
    setStats((prevStats) => ({
      totalTranslations: prevStats.totalTranslations + 1,
      totalWords: prevStats.totalWords + words
    }));
  };

  const handleDeleteHistory = (id) => {
    setHistory((prevHistory) => prevHistory.filter((item) => item.id !== id));
  };

  const handleClearAllHistory = () => {
    setHistory([]);
  };

  const handleToggleFavorite = (langCode) => {
    setFavorites((prevFavorites) => {
      if (prevFavorites.includes(langCode)) {
        showToast(`${langCode.toUpperCase()} removed from quick access.`, 'info');
        return prevFavorites.filter((c) => c !== langCode);
      } else {
        showToast(`${langCode.toUpperCase()} added to quick access.`, 'success');
        return [...prevFavorites, langCode];
      }
    });
  };

  const handleAddRecent = (langCode) => {
    if (langCode === 'auto') return;
    setRecentLangs((prevRecents) => {
      const filtered = prevRecents.filter((c) => c !== langCode);
      return [langCode, ...filtered].slice(0, 5);
    });
  };

  const handleReuse = (item) => {
    const event = new CustomEvent('reuse-translation', {
      detail: item
    });
    window.dispatchEvent(event);
    
    // Smooth scroll back to Translator workspace
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
      className="min-h-screen flex flex-col relative overflow-hidden bg-slate-950 text-slate-100 transition-colors duration-300"
    >
      
      {/* Blurred neon styling backdrops */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-sky-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/5 rounded-full blur-[120px] pointer-events-none" />

      {/* 3D Constellation Particle Background */}
      <ThreeDBackground />

      {/* Header (No theme switch panel) */}
      <Header isDemo={isDemoMode} />

      {/* Main Grid */}
      <main className="flex-grow w-full max-w-6xl mx-auto px-4 py-8 md:py-12 space-y-12 z-10">
        
        {/* Entrance Heading details */}
        <section className="space-y-4">
          <div className="text-center max-w-2xl mx-auto space-y-2 mb-8">
            <h2 className="font-display font-extrabold text-3xl md:text-4xl text-white tracking-tight m-0 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent select-none">
              Translate smarter with GlobalSpeak
            </h2>
            <p className="text-sm text-slate-400 font-medium">
              Seamlessly bridge language barriers with our premium neural text translator.
            </p>
          </div>

          <Translator
            onAddHistory={handleAddHistory}
            favorites={favorites}
            onToggleFavorite={handleToggleFavorite}
            recentLangs={recentLangs}
            onAddRecent={handleAddRecent}
            onShowToast={showToast}
          />
        </section>

        {/* Live Statistics metrics dashboard */}
        <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          
          <div className="glass-panel rounded-2xl p-4 flex items-center gap-3.5 border border-slate-800/40 bg-slate-900/10">
            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center flex-shrink-0">
              <FiCheckCircle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider select-none">Translations</div>
              <div className="text-lg font-bold text-slate-200">{stats.totalTranslations}</div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex items-center gap-3.5 border border-slate-800/40 bg-slate-900/10">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center flex-shrink-0">
              <FiTrendingUp className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider select-none">Words Parsed</div>
              <div className="text-lg font-bold text-slate-200">{stats.totalWords}</div>
            </div>
          </div>

          <div className="glass-panel rounded-2xl p-4 flex items-center gap-3.5 border border-slate-800/40 bg-slate-900/10">
            <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center flex-shrink-0">
              <FiGlobe className="w-5 h-5" />
            </div>
            <div>
              <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider select-none">Saved Favorites</div>
              <div className="text-lg font-bold text-slate-200">{favorites.length}</div>
            </div>
          </div>

        </section>

        {/* Translation History log grid */}
        <section className="pt-4">
          <TranslationHistory
            history={history}
            onReuse={handleReuse}
            onDelete={handleDeleteHistory}
            onClearAll={handleClearAllHistory}
            onShowToast={showToast}
          />
        </section>

      </main>

      {/* Footer */}
      <Footer />

      {/* Slide Toast Notifications */}
      <ToastNotification 
        toast={toast} 
        onClose={() => setToast(null)} 
      />

    </motion.div>
  );
}
