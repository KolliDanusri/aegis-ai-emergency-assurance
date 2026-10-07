import React, { useEffect, useState } from 'react';
import { Volume2, VolumeX, AlertTriangle, BellRing, ShieldAlert } from 'lucide-react';
import { emergencyAudio } from '../services/emergencyAudio';

export const AudioBanner: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [autoplayBlocked, setAutoplayBlocked] = useState<boolean>(false);
  const [unlocked, setUnlocked] = useState<boolean>(false);

  useEffect(() => {
    const unsub = emergencyAudio.subscribe((playing, blocked) => {
      setIsPlaying(playing);
      setAutoplayBlocked(blocked);
    });
    return () => {
      unsub();
    };
  }, []);

  const handleUnlock = async () => {
    const ok = await emergencyAudio.unlockAudio();
    if (ok) {
      setUnlocked(true);
      setAutoplayBlocked(false);
    }
  };

  const handleStopSound = () => {
    emergencyAudio.stopEmergencyAlert();
  };

  return (
    <>
      {/* Autoplay Unlock Notice (Browser Security Policy) */}
      {autoplayBlocked && !unlocked && (
        <div className="bg-amber-500 text-black px-4 py-2 text-sm font-semibold flex items-center justify-between shadow-md border-b border-amber-600">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 flex-shrink-0 animate-bounce" />
            <span>
              Browser audio is currently suspended by autoplay policy. Click to enable loud emergency sirens and audible warnings.
            </span>
          </div>
          <button
            onClick={handleUnlock}
            className="bg-black text-white hover:bg-neutral-800 px-3 py-1 rounded text-xs uppercase tracking-wider font-bold transition flex items-center gap-1.5 shadow"
          >
            <BellRing className="w-3.5 h-3.5" />
            Enable Emergency Audio
          </button>
        </div>
      )}

      {/* Active Siren Flashing HUD */}
      {isPlaying && (
        <div className="bg-red-600 text-white px-4 py-2.5 flex items-center justify-between animate-pulse border-b-2 border-red-700 shadow-xl z-50 sticky top-0">
          <div className="flex items-center gap-3">
            <div className="bg-white text-red-600 p-1.5 rounded-full animate-spin">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div>
              <p className="text-sm font-extrabold tracking-wide uppercase flex items-center gap-1.5">
                🚨 CRITICAL EMERGENCY SIREN SOUNDING — MOVE TO SAFETY
              </p>
              <p className="text-xs text-red-100 hidden sm:block">
                Web Audio dual-tone alarm pattern active (960Hz / 850Hz) + device vibration
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleStopSound}
              className="bg-white text-red-700 hover:bg-neutral-100 px-4 py-1.5 rounded font-black text-xs uppercase tracking-wider transition shadow-lg active:scale-95"
            >
              Stop Siren
            </button>
          </div>
        </div>
      )}
    </>
  );
};
