# GlobalSpeak - Premium AI Text Translator 🌐

GlobalSpeak is a production-ready, dark-theme-only AI Text Translator web application built using **React (Vite)**, **Tailwind CSS v4**, **JavaScript (ES6+)**, and the **RapidAPI Google Translate API**. It features a premium SaaS-style interface similar to DeepL, Notion AI, and Linear, enriched with smooth **Framer Motion** layout animations.

---

## 🚀 Refactored SaaS Features

### 1. Permanent Dark Theme Only
* **Deep Space Aesthetics**: Designed entirely for dark mode, using custom blurred backgrounds, slate shades, and neon accents. All light-mode variants have been removed for visual consistency.
* **Glassmorphism Panels**: Blur-filtered cards, floating buttons, and high-contrast borders optimized for developers and SaaS power users.

### 2. Resilient API Integration
* **AbortController Timeout**: Requests abort after **8 seconds** of network inactivity, preventing hangs and returning a clean "Request timed out" notification.
* **HTTP Error Mapper**: Translates code statuses (e.g. 401, 403, 429, 500) into descriptive, actionable warning screens with interactive Retry triggers.
* **Demo Mode Simulation**: Built-in translation and language detector simulation. If API credentials in your `.env` file are missing or use placeholder text, the app runs in Demo Mode seamlessly.

### 3. High-Fidelity UX Modifications
* **Auto-Resizing Textareas**: The source editor expands vertically in real-time as text is typed to prevent double scrollbars.
* **Keyboard Shortcuts**:
  * `Ctrl + Enter`: Instantly force-translates your text when manual mode is selected.
  * `Escape`: Instantly clears your input buffer, output translations, and stops any speech streams.
* **Framer Motion Transitions**:
  * Slide-in animated page entrance.
  * Elastic sprined animations for language dropdown popovers.
  * Smooth sprined exit slide and layout repositioning for deleted translation history cards.

### 4. Interactive Components
* **Text-to-Speech (TTS)**: Controls (Play, Pause, Resume, Stop) with voice profiles aligned to target languages.
* **Speech-to-Text (Voice Search)**: Hands-free dictation using microphone voice captures.
* **Analytics Board**: Real-time counter detailing total translations executed, words parsed, favorites saved, and network statuses.

---

## 🛠️ Tech Stack

* **Framework**: React.js (Vite compiler)
* **Styling**: Tailwind CSS v4
* **Animations**: Framer Motion
* **Icons**: React Icons (Feather, Heroicons)
* **Storage**: Web LocalStorage API
* **Speech Systems**: Web Speech Recognition & SpeechSynthesis API

---

## 📂 Refactored Project Structure

```bash
src/
├── components/
│   ├── Header.jsx              # App logo, badge status (Demo / API mode)
│   ├── Translator.jsx          # Dual-pane text editor, analytics tracker, and microphones
│   ├── LanguageSelector.jsx    # Popover containing region groupings, search filters, and favorite stars
│   ├── TranslationHistory.jsx  # Grid displaying previous items with layout sprines
│   ├── SpeechControls.jsx      # Voice speed controls and readout playbars
│   ├── LoadingSpinner.jsx      # Rotating progress ring with skeleton cards
│   └── Footer.jsx              # Tech stack information
│
├── services/
│   └── translationService.js   # API link with custom timeouts, error parsing, and fallback simulator
│
├── hooks/
│   ├── useTranslation.js       # Hook coordinating translation queries, errors, and debounces
│   └── useLocalStorage.js      # Synced localStorage state hook
│
├── utils/
│   ├── languages.js            # Standardized ISO country mappings grouped by region
│   └── helpers.js              # Clipboard, dates formatting, and file download utilities
│
├── App.jsx                     # Entrance wrapper containing dashboards and layouts
├── main.jsx                    # React entrypoint
└── index.css                   # Tailwind v4 directives, custom themes, and base resets
```

---

## ⚙️ Quick Start

### 1. Install Dependencies
Restore all npm packages including the new `framer-motion` library:
```bash
npm install
```

### 2. Set Up Environment Variables
Modify the `.env` file located in the root of the project:
```env
VITE_RAPIDAPI_KEY=YOUR_RAPIDAPI_KEY
VITE_RAPIDAPI_HOST=google-translate1.p.rapidapi.com
```
*(If no key is configured, the application runs automatically in simulated Demo Mode for demonstration).*

### 3. Launch Development Server
```bash
npm run dev
```

### 4. Build for Production
```bash
npm run build
```
The compiled, type-checked, and compressed static bundles will be written to the `/dist` folder.
