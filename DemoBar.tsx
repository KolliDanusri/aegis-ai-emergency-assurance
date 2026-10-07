import React from 'react';
import { SupportedLanguage, SUPPORTED_LANGUAGES, User } from '../types';
import {
  ShieldAlert,
  Volume2,
  Globe,
  Sliders,
  UserCheck,
  Sparkles,
  Layers,
  ChevronDown,
} from 'lucide-react';

interface Props {
  currentExperience: 'citizen' | 'authority' | 'about';
  onSelectExperience: (exp: 'citizen' | 'authority' | 'about') => void;
  currentLang: SupportedLanguage;
  onSelectLang: (lang: SupportedLanguage) => void;
  currentUser: User | null;
  onOpenAuth: () => void;
  onOpenSoundTest: () => void;
  onRunFullDemo: () => Promise<void>;
  onSelectScenario: (scenarioId: number) => void;
  activeScenarioId: number;
}

export const DemoBar: React.FC<Props> = ({
  currentExperience,
  onSelectExperience,
  currentLang,
  onSelectLang,
  currentUser,
  onOpenAuth,
  onOpenSoundTest,
  onRunFullDemo,
  onSelectScenario,
  activeScenarioId,
}) => {
  const scenarios = [
    { id: 1, name: 'Scenario 1: Flood Warning with Missing Shelter (Gap Detector)' },
    { id: 2, name: 'Scenario 2: Conflicting Evacuation Deadlines (Conflict Detector)' },
    { id: 3, name: 'Scenario 3: Stale Road Information (Freshness Alert)' },
    { id: 4, name: 'Scenario 4: Cyclone Warning Update (Alert Change Detector)' },
    { id: 5, name: 'Scenario 5: Ground Motion Signal vs Official Event (Safety Rule)' },
    { id: 6, name: 'Scenario 6: Multilingual Emergency Translation (8 Languages)' },
    { id: 7, name: 'Scenario 7: Critical Alert Triggering Loud Emergency Siren' },
    { id: 8, name: 'Scenario 8: Multi-Channel Delivery with Unconfigured Telco Gateway' },
    { id: 9, name: 'Scenario 9: Offline / Low Connectivity Local Cache Mode' },
  ];

  return (
    <header className="bg-neutral-950 border-b border-neutral-800 sticky top-0 z-40 shadow-xl select-none">
      {/* Top Demo Bar (Hackathon Evaluation Strip) */}
      <div className="bg-neutral-900 px-4 py-2 border-b border-neutral-800/80 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-red-600 text-white font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            DEMO SANDBOX
          </span>
          <span className="text-neutral-400 hidden sm:inline">
            Deterministic Scenarios & Assurance Verification
          </span>
        </div>

        {/* Scenario Selector & Quick Demo Run */}
        <div className="flex items-center gap-2 flex-wrap">
          <select
            value={activeScenarioId}
            onChange={(e) => onSelectScenario(Number(e.target.value))}
            className="bg-neutral-950 border border-neutral-700 text-neutral-200 text-xs rounded-lg px-2.5 py-1 focus:outline-none focus:border-red-500 max-w-[260px] sm:max-w-none truncate"
          >
            {scenarios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>

          <button
            onClick={onRunFullDemo}
            className="bg-red-600 hover:bg-red-500 text-white font-black px-3 py-1 rounded-lg text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Run Full</span> Demo
          </button>
        </div>
      </div>

      {/* Main App Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 py-3 flex flex-wrap items-center justify-between gap-4">
        {/* Brand & Tagline */}
        <div
          onClick={() => onSelectExperience('citizen')}
          className="flex items-center gap-3 cursor-pointer group"
        >
          <div className="bg-red-600 group-hover:bg-red-500 text-white p-2 rounded-xl transition shadow-lg shadow-red-950/60">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl font-black text-white tracking-tight uppercase">AEGIS</span>
              <span className="text-[10px] bg-neutral-800 text-neutral-300 font-bold px-2 py-0.5 rounded uppercase">
                EMERGENCY ASSURANCE
              </span>
            </div>
            <p className="text-[11px] text-neutral-400 hidden md:block">
              From Emergency Warning to Emergency Assurance
            </p>
          </div>
        </div>

        {/* Experience Switcher (Citizen vs Authority vs About) */}
        <nav className="flex items-center bg-neutral-900 p-1 rounded-xl border border-neutral-800 text-xs font-bold">
          <button
            onClick={() => onSelectExperience('citizen')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg transition uppercase tracking-wider ${
              currentExperience === 'citizen'
                ? 'bg-red-600 text-white shadow-md'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Citizen App
          </button>

          <button
            onClick={() => onSelectExperience('authority')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg transition uppercase tracking-wider flex items-center gap-1.5 ${
              currentExperience === 'authority'
                ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            Authority Center
            {currentUser?.role === 'authority' && (
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            )}
          </button>

          <button
            onClick={() => onSelectExperience('about')}
            className={`px-3 sm:px-4 py-1.5 rounded-lg transition uppercase tracking-wider ${
              currentExperience === 'about'
                ? 'bg-neutral-800 text-white shadow-md border border-neutral-700'
                : 'text-neutral-400 hover:text-white'
            }`}
          >
            About AEGIS
          </button>
        </nav>

        {/* Global Controls: Language, Sound Test, Profile */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="flex items-center gap-1 bg-neutral-900 border border-neutral-800 rounded-xl px-2.5 py-1.5 text-xs text-neutral-300">
            <Globe className="w-3.5 h-3.5 text-neutral-400" />
            <select
              value={currentLang}
              onChange={(e) => onSelectLang(e.target.value as SupportedLanguage)}
              aria-label="Select Language"
              className="bg-transparent text-white text-xs font-bold focus:outline-none cursor-pointer"
            >
              {SUPPORTED_LANGUAGES.map((lang) => (
                <option key={lang.code} value={lang.code} className="bg-neutral-900 text-white">
                  {lang.name} ({lang.nativeName})
                </option>
              ))}
            </select>
          </div>

          {/* TEST EMERGENCY ALERT Button */}
          <button
            onClick={onOpenSoundTest}
            className="bg-red-600/90 hover:bg-red-600 border border-red-500 text-white px-3 py-1.5 rounded-xl transition shadow-md flex items-center gap-1.5 text-xs font-black uppercase tracking-wider"
            title="Test Loud Siren, Vibration, Visual Alert & Voice"
          >
            <Volume2 className="w-4 h-4 text-white animate-pulse" />
            <span className="hidden sm:inline">TEST EMERGENCY ALERT</span>
            <span className="sm:hidden">TEST ALERT</span>
          </button>

          {/* User & Role Switcher */}
          <button
            onClick={onOpenAuth}
            className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 hover:border-neutral-600 text-neutral-200 px-3 py-1.5 rounded-xl transition flex items-center gap-2 text-xs font-bold"
          >
            <UserCheck className="w-3.5 h-3.5 text-emerald-400" />
            <span className="hidden sm:inline max-w-[100px] truncate">
              {currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}
            </span>
          </button>
        </div>
      </div>
    </header>
  );
};
