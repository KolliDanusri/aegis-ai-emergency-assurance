import React, { useState } from 'react';
import { Volume2, Vibrate, Mic, ShieldAlert, X, CheckCircle, AlertCircle, Play, Sliders } from 'lucide-react';
import { emergencyAudio } from '../services/emergencyAudio';

interface Props {
  isOpen: boolean;
  onClose: () => void;
  preferredLanguage?: string;
}

export const EmergencySoundTester: React.FC<Props> = ({ isOpen, onClose, preferredLanguage = 'en' }) => {
  const [testingStatus, setTestingStatus] = useState<string | null>(null);
  const [volume, setVolume] = useState<number>(0.9);
  const [isFlashing, setIsFlashing] = useState<boolean>(false);

  if (!isOpen) return null;

  const handleTestBeep = async () => {
    setTestingStatus('Playing loud dual-tone emergency beep...');
    await emergencyAudio.testEmergencyAlert();
    setTestingStatus('Beep test completed (repeating burst with pause pattern).');
  };

  const handleTestVibration = () => {
    const supported = emergencyAudio.triggerVibration();
    if (supported) {
      setTestingStatus('Vibration cadence triggered on supported mobile hardware.');
    } else {
      setTestingStatus('Device does not support navigator.vibrate or permission is restricted by OS.');
    }
  };

  const handleTestVoice = async () => {
    setTestingStatus('Speaking emergency audio announcement...');
    await emergencyAudio.speakText(
      'Emergency alert. Flash flood warning. Move to higher ground immediately.',
      'en-US'
    );
    setTestingStatus('Voice broadcast test completed.');
  };

  const handleTestFullAlert = async () => {
    setTestingStatus('RUNNING FULL EMERGENCY ALERT SEQUENCE...');
    setIsFlashing(true);

    // 1. Play beep
    emergencyAudio.testEmergencyAlert();

    // 2. Vibrate
    emergencyAudio.triggerVibration();

    // 3. Spoken voice announcement
    setTimeout(() => {
      emergencyAudio.speakText(
        'Critical emergency alert. Evacuate to official shelter immediately.',
        'en-US'
      );
    }, 1800);

    setTimeout(() => {
      setIsFlashing(false);
      setTestingStatus('Full emergency alert sequence completed.');
    }, 4500);
  };

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setVolume(val);
    emergencyAudio.setVolume(val);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-sm">
      <div
        className={`bg-neutral-900 border-2 ${
          isFlashing ? 'border-red-500 ring-8 ring-red-500/50' : 'border-neutral-700'
        } rounded-2xl max-w-lg w-full text-white shadow-2xl overflow-hidden transition-all duration-200`}
      >
        {/* Header */}
        <div className="bg-neutral-800 px-6 py-4 flex items-center justify-between border-b border-neutral-700">
          <div className="flex items-center gap-2.5">
            <div className="bg-red-500/20 text-red-400 p-2 rounded-lg border border-red-500/30">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-black text-base tracking-wide uppercase">Emergency Alert Test Suite</h3>
              <p className="text-xs text-neutral-400">Audible Siren, Vibration, and Speech Synthesizer Verification</p>
            </div>
          </div>
          <button
            onClick={() => {
              emergencyAudio.stopEmergencyAlert();
              emergencyAudio.stopSpeaking();
              onClose();
            }}
            className="text-neutral-400 hover:text-white p-1.5 rounded-lg hover:bg-neutral-700 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          {/* Status Message */}
          {testingStatus && (
            <div className="bg-neutral-800/80 border border-neutral-700 rounded-xl p-3.5 flex items-start gap-2.5 text-xs text-neutral-200 animate-fadeIn">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
              <span>{testingStatus}</span>
            </div>
          )}

          {/* Test Buttons Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={handleTestBeep}
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-red-500 p-4 rounded-xl flex flex-col items-start gap-2 transition group text-left shadow"
            >
              <div className="bg-red-500/20 text-red-400 p-2 rounded-lg group-hover:bg-red-500 group-hover:text-white transition">
                <Volume2 className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-wide text-neutral-100">PLAY LOUD BEEP</p>
                <p className="text-xs text-neutral-400">960Hz / 850Hz dual-frequency urgent cadence</p>
              </div>
            </button>

            <button
              onClick={handleTestVibration}
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-amber-500 p-4 rounded-xl flex flex-col items-start gap-2 transition group text-left shadow"
            >
              <div className="bg-amber-500/20 text-amber-400 p-2 rounded-lg group-hover:bg-amber-500 group-hover:text-black transition">
                <Vibrate className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-wide text-neutral-100">TEST VIBRATION</p>
                <p className="text-xs text-neutral-400">Urgent tactile pulse pattern (mobile devices)</p>
              </div>
            </button>

            <button
              onClick={handleTestVoice}
              className="bg-neutral-800 hover:bg-neutral-700 border border-neutral-600 hover:border-blue-500 p-4 rounded-xl flex flex-col items-start gap-2 transition group text-left shadow"
            >
              <div className="bg-blue-500/20 text-blue-400 p-2 rounded-lg group-hover:bg-blue-500 group-hover:text-white transition">
                <Mic className="w-5 h-5" />
              </div>
              <div>
                <p className="font-bold text-sm tracking-wide text-neutral-100">TEST VOICE (TTS)</p>
                <p className="text-xs text-neutral-400">Clear spoken instructions via Speech Synthesis</p>
              </div>
            </button>

            <button
              onClick={handleTestFullAlert}
              className="bg-red-600 hover:bg-red-700 border border-red-500 p-4 rounded-xl flex flex-col items-start gap-2 transition group text-left shadow-lg text-white"
            >
              <div className="bg-white text-red-600 p-2 rounded-lg group-hover:scale-105 transition">
                <Play className="w-5 h-5" />
              </div>
              <div>
                <p className="font-black text-sm tracking-wide">TEST FULL ALERT</p>
                <p className="text-xs text-red-100">Beep + Vibration + Voice + Screen Flashing</p>
              </div>
            </button>
          </div>

          {/* Master Volume Slider */}
          <div className="bg-neutral-800/60 border border-neutral-700 rounded-xl p-4 space-y-2">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="flex items-center gap-1.5 text-neutral-300">
                <Sliders className="w-3.5 h-3.5 text-neutral-400" />
                Alert Audio Volume Preference
              </span>
              <span className="text-neutral-200">{Math.round(volume * 100)}%</span>
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={handleVolumeChange}
              className="w-full accent-red-500 cursor-pointer"
            />
            <p className="text-[11px] text-neutral-400">
              Critical warnings default to maximum volume to ensure audibility in life-threatening scenarios.
            </p>
          </div>

          {/* Technical Disclosure */}
          <div className="border-t border-neutral-800 pt-3 text-[11px] text-neutral-400 space-y-1">
            <p className="font-medium text-neutral-300">Browser Security & Hardware Limitations:</p>
            <p>
              • Web Audio sirens operate through the browser engine and cannot override OS hardware mute switches or locked screen sleep mode without native OS shell privileges.
            </p>
            <p>• Vibration requires user activation and supported mobile hardware.</p>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-neutral-800 px-6 py-3 flex justify-end border-t border-neutral-700">
          <button
            onClick={() => {
              emergencyAudio.stopEmergencyAlert();
              emergencyAudio.stopSpeaking();
              onClose();
            }}
            className="bg-neutral-700 hover:bg-neutral-600 text-white px-4 py-1.5 rounded-lg text-xs font-bold transition"
          >
            Close Test Suite
          </button>
        </div>
      </div>
    </div>
  );
};
