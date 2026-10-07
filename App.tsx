import React, { useState, useEffect } from 'react';
import { api } from './services/api';
import { emergencyAudio } from './services/emergencyAudio';
import {
  EmergencyAlert,
  Shelter,
  SafeRoute,
  EmergencyContact,
  SupportedLanguage,
  User,
} from './types';
import {
  INITIAL_CRITICAL_ALERT,
  SEED_SHELTERS,
  SEED_ROUTES,
  SEED_CONTACTS,
} from './data/seedData';
import { DemoBar } from './components/DemoBar';
import { AudioBanner } from './components/AudioBanner';
import { CitizenView } from './components/CitizenView';
import { AuthorityView } from './components/AuthorityView';
import { AboutView } from './components/AboutView';
import { EmergencySoundTester } from './components/EmergencySoundTester';
import { AuthModal } from './components/AuthModal';

export default function App() {
  const [currentExperience, setCurrentExperience] = useState<'citizen' | 'authority' | 'about'>('citizen');
  const [currentLang, setCurrentLang] = useState<SupportedLanguage>('en');
  const [currentUser, setCurrentUser] = useState<User | null>(null);

  const [alerts, setAlerts] = useState<EmergencyAlert[]>([INITIAL_CRITICAL_ALERT]);
  const [activeAlert, setActiveAlert] = useState<EmergencyAlert | null>(INITIAL_CRITICAL_ALERT);
  const [shelters, setShelters] = useState<Shelter[]>(SEED_SHELTERS);
  const [routes, setRoutes] = useState<SafeRoute[]>(SEED_ROUTES);
  const [contacts, setContacts] = useState<EmergencyContact[]>(SEED_CONTACTS);

  const [isAuthOpen, setIsAuthOpen] = useState<boolean>(false);
  const [isSoundTestOpen, setIsSoundTestOpen] = useState<boolean>(false);
  const [isOffline, setIsOffline] = useState<boolean>(false);
  const [lastSyncTime, setLastSyncTime] = useState<string>(new Date().toISOString());
  const [activeScenarioId, setActiveScenarioId] = useState<number>(1);

  // Initialize data on mount
  useEffect(() => {
    const user = api.getCurrentUser();
    if (user) {
      setCurrentUser(user);
    } else {
      // Default to citizen user
      setCurrentUser({
        id: 'usr-cit-01',
        name: 'Arjun Menon',
        email: 'citizen@example.com',
        role: 'citizen',
      });
    }

    refreshAllData();

    // Check offline status
    setIsOffline(api.getIsOffline());
    setLastSyncTime(api.getLastSyncTime());

    window.addEventListener('online', () => setIsOffline(false));
    window.addEventListener('offline', () => setIsOffline(true));
  }, []);

  const refreshAllData = async () => {
    try {
      const alertList = await api.getAlerts();
      setAlerts(alertList);
      if (alertList.length > 0) {
        setActiveAlert(alertList[0]);
      }
      const shelterList = await api.getShelters();
      setShelters(shelterList);
      const routeList = await api.getRoutes();
      setRoutes(routeList);
      const contactList = await api.getContacts();
      setContacts(contactList);
      setLastSyncTime(api.getLastSyncTime());
    } catch (err) {
      console.warn('Offline mode or failed to fetch live API:', err);
    }
  };

  const handleAcknowledge = async (alertId: string) => {
    try {
      await api.acknowledgeAlert(alertId, true);
      refreshAllData();
    } catch (e) {
      console.warn('Failed to acknowledge alert', e);
    }
  };

  // Full 20-Step Emergency Assurance Hackathon Demonstration
  const handleRunFullDemo = async () => {
    // 1. Reset state
    await api.runFullEmergencyDemo();
    await refreshAllData();

    // 2. Switch to Citizen view
    setCurrentExperience('citizen');

    // 3. Play loud emergency beep / siren cadence
    await emergencyAudio.playEmergencyAlert();

    // 4. Trigger voice synthesis after initial sirens
    setTimeout(() => {
      emergencyAudio.speakText(
        'Critical flash flood emergency warning. Mandatory evacuation. Proceed to St. Aloysius Relief Center.',
        currentLang === 'en' ? 'en-US' : currentLang
      );
    }, 2800);
  };

  // Deterministic Scenario Selector
  const handleSelectScenario = async (scenarioId: number) => {
    setActiveScenarioId(scenarioId);

    switch (scenarioId) {
      case 1: // Flood with missing shelter (Information Gap Demo)
        {
          const base = { ...INITIAL_CRITICAL_ALERT };
          base.shelterIds = [];
          base.whereToGo = 'Evacuation destination not provided by source.';
          base.completeness.score = 68;
          base.completeness.missingFields = ['whereToGo', 'shelters', 'roadConditions'];
          base.gaps = [
            {
              id: 'gap-shelter-demo',
              field: 'shelters',
              label: 'Missing Official Shelter Location',
              severity: 'critical',
              status: 'open',
              evidence: 'Source warning does not assign safe assembly point.',
              explanation: 'Citizens are advised to evacuate without an official designated destination.',
              suggestedAction: 'Query District Civil Defense for available shelters.',
            },
          ];
          setActiveAlert(base);
          setCurrentExperience('citizen');
        }
        break;

      case 2: // Conflicting evacuation deadlines
        {
          const base = { ...INITIAL_CRITICAL_ALERT };
          base.conflicts = [
            {
              id: 'conf-deadline',
              field: 'expiresAt',
              fieldLabel: 'Evacuation Deadline Discrepancy',
              sourceA: {
                sourceId: 'src-sdma',
                sourceName: 'SDMA Control Room (Tier 1)',
                tier: 1,
                value: 'Mandatory relocation by 8:00 PM',
                timestamp: new Date().toISOString(),
              },
              sourceB: {
                sourceId: 'src-redcross',
                sourceName: 'Red Cross Field Unit (Tier 3)',
                tier: 3,
                value: 'Advised relocation by 6:00 PM before dark',
                timestamp: new Date().toISOString(),
              },
              status: 'requires_verification',
              explanation:
                'Discrepancy in recommended deadline. Tier 1 government authority takes legal precedence; early movement prior to darkness (6:00 PM) strongly urged by operational teams.',
            },
          ];
          setActiveAlert(base);
          setCurrentExperience('authority');
        }
        break;

      case 3: // Stale road information
        {
          const base = { ...INITIAL_CRITICAL_ALERT };
          base.freshness = {
            lastUpdated: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
            receivedAt: new Date(Date.now() - 140 * 60 * 1000).toISOString(),
            ageMinutes: 140,
            status: 'stale',
            warningMessage:
              'Potentially outdated — road transit and water levels last updated 140 minutes ago. Verification strongly recommended before driving.',
            thresholdMinutes: 45,
          };
          setActiveAlert(base);
          setCurrentExperience('citizen');
        }
        break;

      case 4: // Cyclone warning update (Alert Change Detector)
        {
          const base = { ...INITIAL_CRITICAL_ALERT };
          base.disasterType = 'cyclone';
          base.headline = 'VERY SEVERE CYCLONIC STORM WARNING — LANDFALL WINDS 145 KM/H';
          base.version = 2;
          base.affectedArea.zones = ['Coastal Zone A', 'Port Terminal Ward', 'Zone B High Inundation'];
          setActiveAlert(base);
          setCurrentExperience('authority');
        }
        break;

      case 5: // Ground Motion signal vs official event (Strict Safety)
        {
          setCurrentExperience('authority');
        }
        break;

      case 6: // Multilingual translation
        {
          setCurrentLang('ml'); // Malayalam
          setCurrentExperience('citizen');
        }
        break;

      case 7: // Critical alert triggering loud beep
        {
          setCurrentExperience('citizen');
          await emergencyAudio.playEmergencyAlert();
        }
        break;

      case 8: // Multi-channel delivery failure
        {
          setCurrentExperience('authority');
        }
        break;

      case 9: // Offline mode
        {
          setIsOffline(true);
          setCurrentExperience('citizen');
        }
        break;

      default:
        refreshAllData();
        break;
    }
  };

  return (
    <div className="min-h-screen bg-black text-neutral-100 flex flex-col font-sans antialiased selection:bg-red-600 selection:text-white">
      {/* Audio Lifecycle & Autoplay Unlock Banner */}
      <AudioBanner />

      {/* Main Top Header & Evaluation Demo Bar */}
      <DemoBar
        currentExperience={currentExperience}
        onSelectExperience={setCurrentExperience}
        currentLang={currentLang}
        onSelectLang={setCurrentLang}
        currentUser={currentUser}
        onOpenAuth={() => setIsAuthOpen(true)}
        onOpenSoundTest={() => setIsSoundTestOpen(true)}
        onRunFullDemo={handleRunFullDemo}
        onSelectScenario={handleSelectScenario}
        activeScenarioId={activeScenarioId}
      />

      {/* Main Experience Layout Container */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 pt-6">
        {currentExperience === 'citizen' && (
          <CitizenView
            alert={activeAlert}
            shelters={shelters}
            routes={routes}
            contacts={contacts}
            currentLang={currentLang}
            isOffline={isOffline}
            lastSyncTime={lastSyncTime}
            onAcknowledge={handleAcknowledge}
            onOpenSoundTest={() => setIsSoundTestOpen(true)}
          />
        )}

        {currentExperience === 'authority' && (
          <AuthorityView
            currentUser={currentUser}
            alert={activeAlert}
            shelters={shelters}
            routes={routes}
            contacts={contacts}
            onRefreshAlerts={refreshAllData}
            onRunFullDemo={handleRunFullDemo}
          />
        )}

        {currentExperience === 'about' && <AboutView />}
      </main>

      {/* Settings: Emergency Sound & Siren Test Suite Modal */}
      <EmergencySoundTester
        isOpen={isSoundTestOpen}
        onClose={() => setIsSoundTestOpen(false)}
        preferredLanguage={currentLang}
      />

      {/* Authentication & Role Switcher Modal */}
      <AuthModal
        isOpen={isAuthOpen}
        onClose={() => setIsAuthOpen(false)}
        currentUser={currentUser}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          if (user.role === 'authority') {
            setCurrentExperience('authority');
          }
        }}
        onLogout={() => {
          api.logout();
          setCurrentUser(null);
          setCurrentExperience('citizen');
        }}
      />

      {/* Footer Disclaimer & Safety Statement */}
      <footer className="bg-neutral-950 border-t border-neutral-800/80 py-6 text-xs text-neutral-400 select-none">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-center sm:text-left">
          <div>
            <p className="font-bold text-neutral-300">
              AEGIS — AI Emergency Information & Alert Assurance System
            </p>
            <p className="text-[11px] text-neutral-400">
              "Don't just send the warning. Assure the warning." • Strict seismological consensus: earthquake prediction is physically impossible.
            </p>
          </div>
          <div className="flex items-center gap-4 text-[11px] text-neutral-400">
            <span>Deterministic Assurance Architecture</span>
            <span>•</span>
            <span>Web Audio Siren System</span>
            <span>•</span>
            <span>Offline Cache Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
