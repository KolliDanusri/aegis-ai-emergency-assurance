import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  ShieldAlert,
  CheckCircle,
  AlertTriangle,
  Radio,
  FileCheck,
  Sparkles,
  Layers,
  Clock,
  Globe,
  Volume2,
  Lock,
  ExternalLink,
  Activity,
  Cpu,
} from 'lucide-react';

export const AboutView: React.FC = () => {
  const [systemHealth, setSystemHealth] = useState<Record<string, any>>({});
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    api.getSystemHealth()
      .then((data) => {
        setSystemHealth(data.components || {});
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const assurancePillars = [
    {
      title: '1. Information Gap Detector',
      desc: 'Checks 13 safety-critical disaster fields. If shelters or safe routes are missing, flags gaps immediately instead of hallucinating fake numbers.',
      icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
    },
    {
      title: '2. Multi-Source Conflict Adjudication',
      desc: 'Compares feeds with a strict 5-Tier Source Authority Hierarchy (Tier 1 Gov down to Tier 5 Crowd). Highlights conflicting evacuation deadlines.',
      icon: <Layers className="w-5 h-5 text-blue-400" />,
    },
    {
      title: '3. Real-Time Freshness & Stale Tracking',
      desc: 'Tracks telemetry age in minutes. Flags aging road conditions with "Potentially outdated — verification recommended" warnings.',
      icon: <Clock className="w-5 h-5 text-emerald-400" />,
    },
    {
      title: '4. Cryptographic Provenance & Audit',
      desc: 'Immutable append-oriented SHA-256 audit log tracking every raw ingest, AI extraction, commander approval, and public broadcast.',
      icon: <FileCheck className="w-5 h-5 text-purple-400" />,
    },
    {
      title: '5. Alert Version Change Detector',
      desc: 'Highlights exact changes between successive alerts (Before vs Now) so citizens and authorities immediately grasp perimeter changes.',
      icon: <Activity className="w-5 h-5 text-teal-400" />,
    },
    {
      title: '6. High-Urgency Audible Siren (Web Audio)',
      desc: 'Synthesizes an attention-grabbing dual-frequency (960Hz / 850Hz) repeating emergency beep cadence + synchronized screen flash.',
      icon: <Volume2 className="w-5 h-5 text-red-400" />,
    },
    {
      title: '7. Simple Language & 8 Indian Languages',
      desc: 'Translates and simplifies complex civil defense jargon into crystal-clear instructions: What Happened, What To Do, Where To Go.',
      icon: <Globe className="w-5 h-5 text-cyan-400" />,
    },
    {
      title: '8. Strict Safety: No Earthquake Prediction',
      desc: 'Distinguishes device accelerometer signals from official seismological feeds. Never claims unverified tremors are confirmed events.',
      icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
    },
    {
      title: '9. Multi-Channel Truth (No Fake Delivery)',
      desc: 'Clearly labels SMS and Cell Broadcast as DEMO SANDBOX or NOT CONFIGURED rather than faking carrier delivery.',
      icon: <Radio className="w-5 h-5 text-amber-500" />,
    },
    {
      title: '10. Delivery vs Safety Distinction',
      desc: 'Citizen alert acknowledgement is tracked as delivery proof only — explicitly disclaiming that receipt does not prove physical safety.',
      icon: <CheckCircle className="w-5 h-5 text-emerald-500" />,
    },
  ];

  return (
    <div className="space-y-8 pb-12 max-w-5xl mx-auto text-neutral-100">
      {/* Hero Header */}
      <div className="text-center space-y-4 pt-4">
        <div className="inline-flex items-center gap-2 bg-red-500/10 text-red-400 border border-red-500/30 px-3.5 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
          <ShieldAlert className="w-4 h-4" />
          AEGIS Assurance Architecture
        </div>

        <h1 className="text-3xl sm:text-5xl font-black tracking-tight uppercase leading-tight">
          "Don't just send the warning.<br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-500 via-amber-400 to-emerald-400">
            Assure the warning.
          </span>"
        </h1>

        <p className="text-sm sm:text-base text-neutral-300 max-w-2xl mx-auto leading-relaxed">
          AEGIS is not merely another disaster notification app. It is an AI-powered emergency information assurance
          layer ensuring disaster information is complete, current, consistent, trustworthy, accessible, and reaching
          the people who need it.
        </p>
      </div>

      {/* 10 Core Assurance Pillars Grid */}
      <div className="space-y-4">
        <h2 className="text-xl font-black uppercase tracking-wide border-b border-neutral-800 pb-2">
          The 10 Core Emergency Information Assurance Pillars
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {assurancePillars.map((p, i) => (
            <div key={i} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2 shadow-lg">
              <div className="flex items-center gap-3">
                <div className="bg-neutral-950 p-2.5 rounded-xl border border-neutral-800">{p.icon}</div>
                <h3 className="font-bold text-sm text-neutral-100">{p.title}</h3>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed pl-12">{p.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Real System Status & Provider Health (Truthful, No Fake Status) */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 space-y-4 shadow-xl">
        <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
          <div className="flex items-center gap-2.5">
            <Cpu className="w-5 h-5 text-blue-400" />
            <div>
              <h3 className="font-extrabold text-sm uppercase tracking-wide">Live System Integration Health Status</h3>
              <p className="text-xs text-neutral-400">Honest status disclosure — unconfigured external feeds are explicitly labeled</p>
            </div>
          </div>
          <span className="text-[10px] bg-neutral-800 text-neutral-300 px-2.5 py-1 rounded font-mono">
            {Object.keys(systemHealth).length} MONITORED SUBSYSTEMS
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          {Object.entries(systemHealth).map(([key, item]: [string, any]) => (
            <div key={key} className="bg-neutral-950 border border-neutral-800/80 p-3.5 rounded-xl space-y-1">
              <div className="flex items-center justify-between">
                <span className="font-bold text-neutral-200 capitalize">
                  {key.replace(/([A-Z])/g, ' $1')}
                </span>
                <span
                  className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                    item.status === 'operational'
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : item.status === 'degraded'
                      ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                      : 'bg-neutral-800 text-neutral-400 border border-neutral-700'
                  }`}
                >
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              <p className="text-[11px] text-neutral-400">{item.details}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Safety Compliance & Seismological Consensus Notice */}
      <div className="bg-red-950/30 border border-red-800/60 p-5 rounded-2xl space-y-2 text-xs text-neutral-300">
        <p className="font-extrabold text-red-300 uppercase tracking-wider flex items-center gap-1.5">
          <ShieldAlert className="w-4 h-4 text-red-400" />
          Strict Safety Guarantee: Seismological Consensus Compliance
        </p>
        <p className="text-neutral-300 leading-relaxed">
          AEGIS strictly enforces international scientific standards: earthquake prediction is physically impossible
          with current science. AEGIS only ingests ground motion acceleration telemetry and verified official earthquake
          information from recognized agencies (e.g., USGS, NCS), maintaining a strict distinction between possible sensor
          signals and confirmed public alerts.
        </p>
      </div>
    </div>
  );
};
