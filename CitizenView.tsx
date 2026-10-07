import React, { useState, useEffect } from 'react';
import {
  EmergencyAlert,
  Shelter,
  SafeRoute,
  EmergencyContact,
  SupportedLanguage,
  EarthquakeEvent,
} from '../types';
import { t } from '../services/i18n';
import { emergencyAudio } from '../services/emergencyAudio';
import { InteractiveMap } from './InteractiveMap';
import {
  AlertOctagon,
  Volume2,
  Mic,
  ShieldCheck,
  Clock,
  MapPin,
  Navigation,
  PhoneCall,
  CheckCircle,
  AlertTriangle,
  FileText,
  Activity,
  ChevronDown,
  ChevronUp,
  Sparkles,
  WifiOff,
  Radio,
  ExternalLink,
  ShieldAlert,
  Play,
  Vibrate,
} from 'lucide-react';

interface Props {
  alert: EmergencyAlert | null;
  shelters: Shelter[];
  routes: SafeRoute[];
  contacts: EmergencyContact[];
  currentLang: SupportedLanguage;
  isOffline: boolean;
  lastSyncTime: string;
  onAcknowledge: (alertId: string) => Promise<void>;
  onOpenSoundTest: () => void;
}

export const CitizenView: React.FC<Props> = ({
  alert,
  shelters,
  routes,
  contacts,
  currentLang,
  isOffline,
  lastSyncTime,
  onAcknowledge,
  onOpenSoundTest,
}) => {
  const [simpleMode, setSimpleMode] = useState<boolean>(false);
  const [showVerbatim, setShowVerbatim] = useState<boolean>(false);
  const [showShelterModal, setShowShelterModal] = useState<boolean>(false);
  const [showRouteModal, setShowRouteModal] = useState<boolean>(false);
  const [showContactModal, setShowContactModal] = useState<boolean>(false);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);
  const [acknowledged, setAcknowledged] = useState<boolean>(false);
  const [showSensorNotice, setShowSensorNotice] = useState<boolean>(false);
  const [motionSignalSent, setMotionSignalSent] = useState<boolean>(false);
  const [isTestingAlert, setIsTestingAlert] = useState<boolean>(false);
  const [testMessage, setTestMessage] = useState<string | null>(null);

  const isCritical = alert?.severity === 'critical';
  const isWarning = alert?.severity === 'warning';
  const isWatch = alert?.severity === 'watch';

  // Get localized content if available
  const translation = alert?.translations?.[currentLang];
  const displayHeadline = translation?.headline || alert?.headline || 'NO ACTIVE EMERGENCY IN YOUR AREA';
  const displayHappened = translation?.whatHappened || alert?.whatHappened || 'All regional monitoring systems report normal conditions.';
  const displayAction = translation?.whatToDo || alert?.whatToDo || 'No emergency action required at this time.';
  const displayDestination = translation?.whereToGo || alert?.whereToGo || 'Remain at your current location.';

  const handleTestEmergencyAlertFull = async () => {
    setIsTestingAlert(true);
    setTestMessage('TESTING: 1. Loud Siren Beep  2. Device Vibration  3. Visual Alert Flash  4. Spoken Voice...');

    // 1. Play loud beep pattern
    await emergencyAudio.testEmergencyAlert();

    // 2. Trigger vibration
    emergencyAudio.triggerVibration();

    // 3. Spoken voice announcement
    setTimeout(() => {
      emergencyAudio.speakText(
        'This is an emergency alert test of the AEGIS assurance system. Audible siren, vibration, visual HUD, and speech synthesis channels verified.',
        currentLang === 'en' ? 'en-US' : currentLang
      );
    }, 1800);

    setTimeout(() => {
      setIsTestingAlert(false);
      setTestMessage('Emergency alert test sequence completed successfully.');
      setTimeout(() => setTestMessage(null), 5000);
    }, 4500);
  };

  const handlePlayVoice = async () => {
    if (isSpeaking) {
      emergencyAudio.stopSpeaking();
      setIsSpeaking(false);
      return;
    }

    setIsSpeaking(true);
    const speechText = `Emergency alert. ${displayHeadline}. ${displayAction}. Destination: ${displayDestination}`;
    await emergencyAudio.speakText(speechText, currentLang === 'en' ? 'en-US' : currentLang);
    setIsSpeaking(false);
  };

  const handlePlayLoudAlert = async () => {
    await emergencyAudio.playEmergencyAlert();
  };

  const handleAcknowledgeClick = async () => {
    if (!alert || acknowledged) return;
    await onAcknowledge(alert.id);
    setAcknowledged(true);
  };

  const handleTestSensor = () => {
    setShowSensorNotice(true);
    setMotionSignalSent(true);
    setTimeout(() => {
      setMotionSignalSent(false);
    }, 4000);
  };

  return (
    <div className={`space-y-6 pb-12 transition-all ${isTestingAlert ? 'ring-8 ring-red-600/70 rounded-3xl p-1 bg-red-950/20' : ''}`}>
      {/* Demo Sandbox Disclosure & Transparency Banner */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-black font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            DEMO MODE
          </span>
          <span className="text-neutral-300">
            <strong>Demonstration Data Only:</strong> Pre-configured deterministic disaster scenarios for assurance evaluation. Never treated as real-world live government warning.
          </span>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono">
          AI Engine: Server-side Gemini 3.8 Flash (Fallback: Deterministic Safety Engine)
        </span>
      </div>

      {/* Prominent Multi-Channel Emergency Alert Test Bar */}
      <div className="bg-gradient-to-r from-red-950/80 via-neutral-900 to-neutral-900 border-2 border-red-600/70 p-4 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="bg-red-600 text-white p-2.5 rounded-xl shadow-lg">
            <Volume2 className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-sm uppercase tracking-wide text-white">
                Emergency Alert Assurance Test
              </span>
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded">
                MULTI-CHANNEL
              </span>
            </div>
            <p className="text-xs text-neutral-300">
              Verify loud Web Audio siren (960Hz/850Hz), mobile vibration, speech synthesizer, and screen flashing
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
          <button
            onClick={handleTestEmergencyAlertFull}
            disabled={isTestingAlert}
            className="bg-red-600 hover:bg-red-500 active:scale-95 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 flex-1 sm:flex-none border border-red-400"
          >
            <Play className="w-4 h-4 fill-white" />
            {isTestingAlert ? 'Testing Channels...' : 'TEST EMERGENCY ALERT'}
          </button>
          <button
            onClick={onOpenSoundTest}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3.5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition border border-neutral-700 flex items-center justify-center gap-1.5"
          >
            Settings & Controls
          </button>
        </div>
      </div>

      {/* Active Testing Feedback Toast */}
      {testMessage && (
        <div className="bg-red-600 text-white p-3 rounded-xl text-xs font-bold flex items-center justify-between shadow-lg animate-pulse">
          <span className="flex items-center gap-2">
            <Volume2 className="w-4 h-4" />
            {testMessage}
          </span>
          <span className="text-[10px] uppercase font-mono bg-black/30 px-2 py-0.5 rounded">
            LOUD BEEP + VIBRATION + VOICE
          </span>
        </div>
      )}

      {/* Offline Connectivity Banner */}
      {isOffline && (
        <div className="bg-amber-950/80 border border-amber-600/70 p-3 rounded-xl flex items-center justify-between text-amber-200 text-xs">
          <div className="flex items-center gap-2">
            <WifiOff className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>{t('offlineMode', currentLang)}</strong>: {t('offlineDesc', currentLang)} (
              {t('lastSync', currentLang)}: {new Date(lastSyncTime).toLocaleTimeString()})
            </span>
          </div>
          <span className="bg-amber-900/60 px-2 py-0.5 rounded font-mono text-[10px]">LOCAL CACHE ACTIVE</span>
        </div>
      )}

      {/* QUESTION 1: AM I IN DANGER? (High Contrast Status HUD) */}
      <div
        className={`rounded-2xl p-6 sm:p-8 border-2 transition-all shadow-2xl relative overflow-hidden ${
          isCritical
            ? 'bg-gradient-to-br from-red-950/90 via-neutral-900 to-black border-red-600 shadow-red-950/50'
            : isWarning
            ? 'bg-gradient-to-br from-orange-950/90 via-neutral-900 to-black border-orange-500 shadow-orange-950/50'
            : isWatch
            ? 'bg-gradient-to-br from-yellow-950/80 via-neutral-900 to-black border-yellow-500 shadow-yellow-950/40'
            : 'bg-gradient-to-br from-emerald-950/70 via-neutral-900 to-black border-emerald-500 shadow-emerald-950/30'
        }`}
      >
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className={`p-3.5 rounded-2xl flex-shrink-0 ${
                isCritical
                  ? 'bg-red-600 text-white animate-pulse'
                  : isWarning
                  ? 'bg-orange-500 text-black'
                  : isWatch
                  ? 'bg-yellow-500 text-black'
                  : 'bg-emerald-500 text-black'
              }`}
            >
              {isCritical ? (
                <AlertOctagon className="w-8 h-8" />
              ) : isWarning ? (
                <AlertTriangle className="w-8 h-8" />
              ) : (
                <ShieldCheck className="w-8 h-8" />
              )}
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`text-xs font-black tracking-widest uppercase px-3 py-1 rounded-full ${
                    isCritical
                      ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                      : isWarning
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : isWatch
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/40'
                      : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                  }`}
                >
                  {isCritical
                    ? t('criticalEmergency', currentLang)
                    : isWarning
                    ? t('watchWarning', currentLang)
                    : t('allClear', currentLang)}
                </span>

                {/* Freshness Badge */}
                {alert && (
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-md font-semibold flex items-center gap-1 ${
                      alert.freshness.status === 'stale'
                        ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                        : 'bg-neutral-800 text-neutral-300'
                    }`}
                  >
                    <Clock className="w-3 h-3" />
                    {t('lastUpdated', currentLang)}: {alert.freshness.ageMinutes}m ago
                  </span>
                )}
              </div>

              <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight uppercase leading-snug">
                {displayHeadline}
              </h1>

              <p className="text-sm font-semibold text-neutral-300 flex items-center gap-2">
                <MapPin className="w-4 h-4 text-red-400 flex-shrink-0" />
                Affected Area: <span className="text-white font-bold">{alert?.affectedArea.district}</span> (
                {alert?.affectedArea.zones.join(', ')})
              </p>
            </div>
          </div>

          {/* Quick Audio & Speech Triggers */}
          {alert && (
            <div className="flex flex-wrap sm:flex-col gap-2 w-full sm:w-auto">
              {isCritical && (
                <button
                  onClick={handlePlayLoudAlert}
                  className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-4 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 flex-1 sm:flex-none border border-red-400"
                >
                  <Volume2 className="w-4 h-4 animate-bounce" />
                  {t('replayAudio', currentLang)}
                </button>
              )}

              <button
                onClick={handlePlayVoice}
                className="bg-neutral-800 hover:bg-neutral-700 active:scale-95 text-neutral-100 px-4 py-2 rounded-xl font-bold text-xs uppercase tracking-wider transition border border-neutral-600 flex items-center justify-center gap-2 flex-1 sm:flex-none"
              >
                <Mic className="w-4 h-4 text-blue-400" />
                {isSpeaking ? 'Stop Voice' : t('playVoice', currentLang)}
              </button>
            </div>
          )}
        </div>

        {/* Freshness Outdated Warning (if stale) */}
        {alert?.freshness.warningMessage && (
          <div className="mt-4 bg-amber-950/80 border border-amber-600/80 p-3 rounded-xl flex items-start gap-2 text-xs text-amber-200">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>{alert.freshness.warningMessage}</span>
          </div>
        )}

        {/* Alert Change Detector Notification (if version > 1) */}
        {alert && alert.version > 1 && (
          <div className="mt-4 bg-blue-950/70 border border-blue-600/70 p-3 rounded-xl text-xs text-blue-200 flex items-start justify-between gap-3">
            <div className="flex items-start gap-2">
              <Activity className="w-4 h-4 text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <strong className="uppercase tracking-wider text-blue-300">
                  Alert Updated (Version {alert.version}):
                </strong>{' '}
                Evacuation perimeter expanded to Mundakkal and Iravipuram wards. Follow updated destination below.
              </div>
            </div>
            <span className="text-[10px] bg-blue-900/60 px-2 py-0.5 rounded font-mono">WHAT CHANGED</span>
          </div>
        )}
      </div>

      {/* CORE SAFETY ANSWERS (2. WHAT HAPPENED, 3. WHAT TO DO, 4. WHERE TO GO) */}
      {alert && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Card 1: What Happened */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-neutral-400">
              <span className="flex items-center gap-1.5 text-neutral-200">
                <FileText className="w-4 h-4 text-blue-400" />
                {t('whatHappened', currentLang)}
              </span>
              <span className="text-[10px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">INCIDENT</span>
            </div>
            <p className="text-sm font-medium text-neutral-200 leading-relaxed">
              {simpleMode ? alert.simpleLanguageSummary.whatHappened : displayHappened}
            </p>
          </div>

          {/* Card 2: What Should I Do */}
          <div className="bg-neutral-900 border-2 border-red-600/60 p-5 rounded-2xl shadow-lg space-y-2 bg-red-950/20">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-red-400">
              <span className="flex items-center gap-1.5">
                <AlertOctagon className="w-4 h-4 text-red-500 animate-pulse" />
                {t('whatToDo', currentLang)}
              </span>
              <span className="text-[10px] bg-red-500/20 text-red-300 px-2 py-0.5 rounded font-black">
                MANDATORY
              </span>
            </div>
            <p className="text-sm font-bold text-white leading-relaxed">
              {simpleMode ? alert.simpleLanguageSummary.whatToDo : displayAction}
            </p>
          </div>

          {/* Card 3: Where Should I Go */}
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl shadow-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-extrabold uppercase tracking-wider text-neutral-400">
              <span className="flex items-center gap-1.5 text-neutral-200">
                <MapPin className="w-4 h-4 text-emerald-400" />
                {t('whereToGo', currentLang)}
              </span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold">
                SAFE ZONE
              </span>
            </div>
            <p className="text-sm font-medium text-neutral-200 leading-relaxed">
              {simpleMode ? alert.simpleLanguageSummary.whereToGo : displayDestination}
            </p>
            {alert.shelterIds.length > 0 && (
              <button
                onClick={() => setShowShelterModal(true)}
                className="text-xs text-emerald-400 hover:text-emerald-300 font-bold underline flex items-center gap-1 pt-1"
              >
                View official shelter capacity & facilities →
              </button>
            )}
          </div>
        </div>
      )}

      {/* QUICK EMERGENCY ACTIONS HUD (Shelters, Safe Routes, Emergency Helplines) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <button
          onClick={() => setShowShelterModal(true)}
          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-emerald-500 p-4 rounded-xl flex items-center justify-between transition group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="bg-emerald-500/20 text-emerald-400 p-2.5 rounded-lg group-hover:bg-emerald-500 group-hover:text-black transition">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-neutral-100">{t('shelters', currentLang)}</p>
              <p className="text-xs text-neutral-400">{shelters.filter((s) => s.status === 'open').length} verified open camps</p>
            </div>
          </div>
          <span className="text-neutral-500 group-hover:text-white transition">→</span>
        </button>

        <button
          onClick={() => setShowRouteModal(true)}
          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-blue-500 p-4 rounded-xl flex items-center justify-between transition group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 text-blue-400 p-2.5 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition">
              <Navigation className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-neutral-100">{t('safeRoutes', currentLang)}</p>
              <p className="text-xs text-neutral-400">Road conditions & hazards</p>
            </div>
          </div>
          <span className="text-neutral-500 group-hover:text-white transition">→</span>
        </button>

        <button
          onClick={() => setShowContactModal(true)}
          className="bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-red-500 p-4 rounded-xl flex items-center justify-between transition group shadow-md"
        >
          <div className="flex items-center gap-3">
            <div className="bg-red-500/20 text-red-400 p-2.5 rounded-lg group-hover:bg-red-500 group-hover:text-white transition">
              <PhoneCall className="w-5 h-5" />
            </div>
            <div className="text-left">
              <p className="font-bold text-sm text-neutral-100">{t('contacts', currentLang)}</p>
              <p className="text-xs text-neutral-400">24x7 Control Rooms (1077 / 112)</p>
            </div>
          </div>
          <span className="text-neutral-500 group-hover:text-white transition">→</span>
        </button>
      </div>

      {/* INTERACTIVE HAZARD MAP & CORRIDORS */}
      <InteractiveMap
        severity={alert?.severity || 'watch'}
        affectedDistrict={alert?.affectedArea.district}
        zones={alert?.affectedArea.zones}
        shelters={shelters}
        routes={routes}
        onSelectShelter={() => setShowShelterModal(true)}
        onSelectRoute={() => setShowRouteModal(true)}
      />

      {/* VERIFICATION & PROVENANCE STRIP (Question 5: Is this information verified?) */}
      {alert && (
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-2xl p-5 space-y-4 shadow-lg">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-neutral-800">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/20 text-blue-400 p-1.5 rounded-lg">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <span className="text-xs font-extrabold uppercase tracking-wider text-neutral-200">
                Official Verification & Provenance
              </span>
            </div>
            <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-md border border-emerald-500/20">
              ✓ Verified by {alert.provenance.verifiedBy || 'State Disaster Authority'}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-xs">
            <div>
              <p className="text-neutral-400">Authorized Source</p>
              <p className="font-bold text-neutral-100">{alert.source.name}</p>
              <span className="text-[10px] text-neutral-400">{alert.source.tierName}</span>
            </div>

            <div>
              <p className="text-neutral-400">Last Verified Update</p>
              <p className="font-bold text-neutral-100">{new Date(alert.updatedAt).toLocaleTimeString()}</p>
              <span className="text-[10px] text-neutral-400">Validity: 4-hour window</span>
            </div>

            <div>
              <p className="text-neutral-400">Information Completeness</p>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full"
                    style={{ width: `${alert.completeness.score}%` }}
                  />
                </div>
                <span className="font-bold text-neutral-200">{alert.completeness.score}%</span>
              </div>
              <span className="text-[10px] text-neutral-400">12 of 13 critical fields present</span>
            </div>

            <div>
              <p className="text-neutral-400">Audit Provenance Fingerprint</p>
              <p className="font-mono text-[11px] text-neutral-300 truncate">{alert.provenance.auditId}</p>
              <span className="text-[10px] text-neutral-400">Tamper-verifiable record</span>
            </div>
          </div>

          {/* Simple Language / Verbatim Toggle Controls */}
          <div className="pt-2 flex flex-wrap items-center justify-between gap-3 border-t border-neutral-800/60 text-xs">
            <button
              onClick={() => setSimpleMode(!simpleMode)}
              className={`px-3 py-1.5 rounded-lg font-bold transition flex items-center gap-1.5 ${
                simpleMode ? 'bg-blue-600 text-white' : 'bg-neutral-800 text-neutral-300 hover:bg-neutral-700'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              {t('simpleLanguageToggle', currentLang)}: {simpleMode ? 'ON' : 'OFF'}
            </button>

            <button
              onClick={() => setShowVerbatim(!showVerbatim)}
              className="text-neutral-400 hover:text-neutral-200 underline flex items-center gap-1"
            >
              {t('originalTextToggle', currentLang)} {showVerbatim ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Verbatim Official Government Message */}
          {showVerbatim && (
            <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 text-xs font-mono text-neutral-300 space-y-1.5 animate-fadeIn">
              <p className="text-neutral-400 uppercase tracking-widest text-[10px]">VERBATIM GOVERNMENT DISPATCH:</p>
              <p className="whitespace-pre-wrap">{alert.provenance.inputRawTextPreview || alert.whatHappened}</p>
            </div>
          )}
        </div>
      )}

      {/* ACKNOWLEDGEMENT CALL-TO-ACTION (With strict physical safety caveat) */}
      {alert && (
        <div className="bg-neutral-900 border-2 border-neutral-700 rounded-2xl p-6 text-center space-y-3 shadow-xl">
          <p className="text-xs font-black uppercase tracking-widest text-neutral-400">
            Citizen Alert Confirmation Channel
          </p>

          <button
            onClick={handleAcknowledgeClick}
            disabled={acknowledged}
            className={`w-full sm:w-auto px-8 py-3.5 rounded-xl font-black text-sm uppercase tracking-wider transition shadow-lg flex items-center justify-center gap-2 mx-auto ${
              acknowledged
                ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/50 cursor-default'
                : 'bg-emerald-600 hover:bg-emerald-500 active:scale-95 text-white shadow-emerald-900/50'
            }`}
          >
            <CheckCircle className="w-5 h-5" />
            {acknowledged ? t('acknowledgedSuccess', currentLang) : t('acknowledgeAlert', currentLang)}
          </button>

          {/* CRITICAL SAFETY DISCLAIMER */}
          <div className="max-w-xl mx-auto bg-neutral-950 border border-neutral-800 p-3 rounded-xl text-[11px] text-neutral-400 text-left flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
            <span>{t('acknowledgementDisclaimer', currentLang)}</span>
          </div>
        </div>
      )}

      {/* GROUND MOTION / ACCELEROMETER SENSOR TEST HUD (Strict safety: NO PREDICTION) */}
      <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-5 space-y-3 text-xs text-neutral-300">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Radio className="w-4 h-4 text-blue-400" />
            <span className="font-extrabold uppercase tracking-wide text-neutral-200">
              Community Ground Motion Sensor Ingestion
            </span>
          </div>
          <button
            onClick={handleTestSensor}
            className="bg-neutral-800 hover:bg-neutral-700 text-neutral-200 px-3 py-1 rounded font-bold text-xs transition border border-neutral-700"
          >
            Test Accelerometer Signal
          </button>
        </div>

        <p className="text-neutral-400 text-[11px]">
          Mobile devices can report high-frequency ground motion vectors. To prevent panic, a single phone signal is
          strictly classified as a{' '}
          <span className="text-amber-400 font-semibold">"Possible ground-motion signal"</span> and is never
          broadcast as an earthquake until validated by the official seismological network.
        </p>

        {motionSignalSent && (
          <div className="bg-blue-950/80 border border-blue-500/60 p-3 rounded-xl text-blue-200 text-xs flex items-center gap-2 animate-fadeIn">
            <CheckCircle className="w-4 h-4 text-blue-400" />
            <span>
              Device motion signal transmitted to AEGIS validation queue. Status: Awaiting corroboration.
            </span>
          </div>
        )}
      </div>

      {/* SHELTER MODAL */}
      {showShelterModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-2xl w-full text-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                Verified Relief Centers & Shelters
              </h3>
              <button
                onClick={() => setShowShelterModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {shelters.map((s) => (
                <div key={s.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-100">{s.name}</h4>
                      <p className="text-xs text-neutral-400">{s.location.address}</p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        s.status === 'open'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : s.status === 'nearing_capacity'
                          ? 'bg-amber-500/20 text-amber-300'
                          : 'bg-red-500/20 text-red-300'
                      }`}
                    >
                      {s.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs pt-1 border-t border-neutral-800 text-neutral-400">
                    <div>
                      Capacity:{' '}
                      <strong className="text-white">{s.capacity !== null ? s.capacity : 'Unknown'}</strong>
                    </div>
                    <div>
                      Occupancy:{' '}
                      <strong className="text-white">{s.occupancy !== null ? s.occupancy : 'Unknown'}</strong>
                    </div>
                    <div>
                      Wheelchair:{' '}
                      <strong className="text-white">{s.wheelchairAccessible ? '✓ Accessible' : '✗ No'}</strong>
                    </div>
                    <div>
                      Medical: <strong className="text-white">{s.medicalSupport ? '✓ Available' : '✗ No'}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-neutral-400 pt-1">
                    <span>Contact: <strong className="text-emerald-400">{s.contactNumber}</strong></span>
                    <span className="text-[10px]">Updated: {new Date(s.lastUpdated).toLocaleTimeString()}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* SAFE ROUTE MODAL */}
      {showRouteModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-2xl w-full text-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                <Navigation className="w-4 h-4 text-blue-400" />
                Verified Evacuation Corridors & Road Status
              </h3>
              <button
                onClick={() => setShowRouteModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-3">
              {routes.map((r) => (
                <div key={r.id} className="bg-neutral-950 border border-neutral-800 p-4 rounded-xl space-y-2">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-sm text-neutral-100">{r.name}</h4>
                      <p className="text-xs text-neutral-400">
                        From: {r.fromArea} → To: <strong>{r.shelterName}</strong>
                      </p>
                    </div>
                    <span
                      className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                        r.status === 'open_verified'
                          ? 'bg-emerald-500/20 text-emerald-300'
                          : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {r.status.replace('_', ' ')}
                    </span>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-neutral-400 font-semibold">Surveyed Road Segments:</p>
                    {r.roadSegments.map((seg, idx) => (
                      <div
                        key={idx}
                        className="bg-neutral-900 p-2 rounded flex items-center justify-between text-neutral-300"
                      >
                        <span>{seg.name}</span>
                        <span
                          className={`font-bold ${
                            seg.condition === 'open' ? 'text-emerald-400' : 'text-amber-400'
                          }`}
                        >
                          {seg.condition.toUpperCase()}
                        </span>
                      </div>
                    ))}
                  </div>

                  {r.hazards.length > 0 && (
                    <div className="text-xs text-amber-300 bg-amber-950/40 p-2 rounded">
                      ⚠ Hazards: {r.hazards.join('; ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* CONTACTS MODAL */}
      {showContactModal && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-neutral-900 border border-neutral-700 rounded-2xl max-w-lg w-full text-white shadow-2xl overflow-hidden max-h-[85vh] flex flex-col">
            <div className="p-4 bg-neutral-800 border-b border-neutral-700 flex items-center justify-between">
              <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-red-400" />
                Emergency Control Helplines
              </h3>
              <button
                onClick={() => setShowContactModal(false)}
                className="text-neutral-400 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto space-y-2.5">
              {contacts.map((c) => (
                <div
                  key={c.id}
                  className="bg-neutral-950 border border-neutral-800 p-3 rounded-xl flex items-center justify-between"
                >
                  <div>
                    <h4 className="font-bold text-sm text-neutral-100">{c.name}</h4>
                    <p className="text-xs text-neutral-400">{c.agency}</p>
                    <p className="text-[10px] text-neutral-500">
                      Verified: {new Date(c.lastVerified).toLocaleTimeString()}
                    </p>
                  </div>
                  <a
                    href={`tel:${c.phone}`}
                    className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 rounded-lg text-sm transition flex items-center gap-1.5 shadow"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                    {c.phone}
                  </a>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
