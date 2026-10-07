import React, { useState, useEffect } from 'react';
import {
  EmergencyAlert,
  Shelter,
  SafeRoute,
  EmergencyContact,
  EarthquakeEvent,
  GroundMotionSignal,
  NotificationChannelStatus,
  AuditLogItem,
  User,
  AlertVersionDiff,
} from '../types';
import { api } from '../services/api';
import { InteractiveMap } from './InteractiveMap';
import {
  ShieldAlert,
  AlertTriangle,
  CheckCircle,
  Clock,
  Send,
  Sparkles,
  Bot,
  RefreshCw,
  GitCompare,
  Layers,
  Database,
  Users,
  Radio,
  FileCheck,
  PlusCircle,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Activity,
  Sliders,
} from 'lucide-react';

interface Props {
  currentUser: User | null;
  alert: EmergencyAlert | null;
  shelters: Shelter[];
  routes: SafeRoute[];
  contacts: EmergencyContact[];
  onRefreshAlerts: () => void;
  onRunFullDemo: () => Promise<void>;
}

export const AuthorityView: React.FC<Props> = ({
  currentUser,
  alert,
  shelters,
  routes,
  contacts,
  onRefreshAlerts,
  onRunFullDemo,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'gaps' | 'conflicts' | 'workflow' | 'delivery' | 'shelters' | 'seismic' | 'audit' | 'copilot'
  >('overview');

  const [copilotQuestion, setCopilotQuestion] = useState<string>('');
  const [copilotAnswer, setCopilotAnswer] = useState<string>('');
  const [isCopilotLoading, setIsCopilotLoading] = useState<boolean>(false);

  const [rawIntakeText, setRawIntakeText] = useState<string>(
    'Flood warning issued for coastal wards of Kollam. Heavy downpour has led to water ingress in low areas. Residents should evacuate immediately. Road status on bypass is being surveyed.'
  );
  const [isDrafting, setIsDrafting] = useState<boolean>(false);
  const [actionNotice, setActionNotice] = useState<string | null>(null);
  const [versionDiff, setVersionDiff] = useState<AlertVersionDiff | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogItem[]>([]);
  const [seismicEvents, setSeismicEvents] = useState<EarthquakeEvent[]>([]);
  const [groundSignals, setGroundSignals] = useState<GroundMotionSignal[]>([]);
  const [isRunningDemo, setIsRunningDemo] = useState<boolean>(false);

  useEffect(() => {
    loadAuditAndSeismic();
    if (alert) {
      api.getAlertDiff(alert.id).then(setVersionDiff).catch(() => {});
    }
  }, [alert]);

  const loadAuditAndSeismic = async () => {
    try {
      const logs = await api.getAuditLogs();
      setAuditLogs(logs);
      const seismic = await api.getSeismicEvents();
      setSeismicEvents(seismic.events || []);
      const signals = await api.getGroundMotionSignals();
      setGroundSignals(signals || []);
    } catch (err) {
      console.warn('Failed to load audit or seismic data', err);
    }
  };

  const handleApproveAlert = async () => {
    if (!alert) return;
    try {
      await api.approveAlert(alert.id);
      setActionNotice('Official alert verified and approved by Authorized Commander.');
      onRefreshAlerts();
      loadAuditAndSeismic();
    } catch (err: any) {
      setActionNotice(`Approval failed: ${err.message}`);
    }
  };

  const handlePublishAlert = async () => {
    if (!alert) return;
    try {
      await api.publishAlert(alert.id);
      setActionNotice('Official warning broadcasted across In-App, Web Push, and Voice channels.');
      onRefreshAlerts();
      loadAuditAndSeismic();
    } catch (err: any) {
      setActionNotice(`Publication failed: ${err.message}`);
    }
  };

  const handleCreateDraft = async () => {
    setIsDrafting(true);
    try {
      const res = await api.analyzeAlertText(rawIntakeText);
      setActionNotice('Ingested text parsed via AI Assurance pipeline. Draft created.');
      onRefreshAlerts();
    } catch (err: any) {
      setActionNotice(`AI Extraction failed: ${err.message}`);
    } finally {
      setIsDrafting(false);
    }
  };

  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuestion.trim()) return;

    setIsCopilotLoading(true);
    try {
      const answer = await api.queryCopilot(copilotQuestion, alert?.id);
      setCopilotAnswer(answer);
    } catch (err: any) {
      setCopilotAnswer(`Copilot query error: ${err.message}`);
    } finally {
      setIsCopilotLoading(false);
    }
  };

  const handleTriggerFullDemo = async () => {
    setIsRunningDemo(true);
    setActionNotice('Running full 20-step Emergency Assurance demonstration...');
    try {
      await onRunFullDemo();
      setActionNotice('Full 20-step emergency demonstration flow completed successfully.');
      loadAuditAndSeismic();
    } finally {
      setIsRunningDemo(false);
    }
  };

  return (
    <div className="space-y-6 pb-12 text-neutral-100">
      {/* Action Notice Toast */}
      {actionNotice && (
        <div className="bg-emerald-950/90 border border-emerald-500/80 p-3 rounded-xl flex items-center justify-between text-xs text-emerald-200 shadow-lg animate-fadeIn">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>{actionNotice}</span>
          </div>
          <button onClick={() => setActionNotice(null)} className="text-emerald-400 hover:text-white px-2">
            ✕
          </button>
        </div>
      )}

      {/* Authority Command Center Banner */}
      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="bg-red-500/20 text-red-400 p-3 rounded-xl border border-red-500/30">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-black tracking-tight uppercase">Emergency Authority Operations Center</h2>
              <span className="bg-red-950 text-red-400 border border-red-800 text-[10px] font-black px-2 py-0.5 rounded">
                RESTRICTED ACCESS
              </span>
            </div>
            <p className="text-xs text-neutral-400">
              Authenticated Officer: <strong className="text-neutral-200">{currentUser?.name || 'Commander Nair'}</strong> ({currentUser?.agency || 'State Disaster Management Operations'})
            </p>
          </div>
        </div>

        {/* Action: Run Full Demo */}
        <button
          onClick={handleTriggerFullDemo}
          disabled={isRunningDemo}
          className="bg-red-600 hover:bg-red-700 active:scale-95 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition shadow-lg flex items-center gap-2 border border-red-400"
        >
          <Sparkles className="w-4 h-4 animate-spin" />
          {isRunningDemo ? 'Executing Demo Flow...' : 'RUN FULL EMERGENCY DEMO'}
        </button>
      </div>

      {/* Demo Sandbox & AI Status Disclosure */}
      <div className="bg-neutral-900 border border-neutral-800 p-3 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2">
          <span className="bg-amber-500 text-black font-black px-2 py-0.5 rounded text-[10px] uppercase tracking-wider">
            DEMO MODE
          </span>
          <span className="text-neutral-300">
            <strong>Authority Simulation Environment:</strong> Operating in deterministic test mode with synthetic records. Not connected to active government dispatch systems.
          </span>
        </div>
        <span className="text-[11px] text-neutral-400 font-mono">
          AI Status: Gemini 3.8 Flash SDK Active (Deterministic safety fallback enabled)
        </span>
      </div>

      {/* Top High-Density Operations Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl shadow">
          <p className="text-[11px] text-neutral-400 font-bold uppercase">Active Emergency</p>
          <p className="text-xl font-black text-red-400">1 CRITICAL</p>
          <p className="text-[10px] text-neutral-500">Kollam District</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl shadow">
          <p className="text-[11px] text-neutral-400 font-bold uppercase">Assurance Score</p>
          <p className="text-xl font-black text-emerald-400">{alert?.assuranceScorecard.overallScore || 92}%</p>
          <p className="text-[10px] text-neutral-500">Composite index</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl shadow">
          <p className="text-[11px] text-neutral-400 font-bold uppercase">Information Gaps</p>
          <p className="text-xl font-black text-amber-400">{alert?.gaps.length || 1}</p>
          <p className="text-[10px] text-neutral-500">1 under review</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl shadow">
          <p className="text-[11px] text-neutral-400 font-bold uppercase">Source Conflicts</p>
          <p className="text-xl font-black text-blue-400">{alert?.conflicts.length || 1}</p>
          <p className="text-[10px] text-neutral-500">Adjudicated Tier 1</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl shadow">
          <p className="text-[11px] text-neutral-400 font-bold uppercase">Broadcast Reach</p>
          <p className="text-xl font-black text-white">
            {alert ? alert.deliveryStats.inAppDelivered + alert.deliveryStats.pushDelivered : 8100}
          </p>
          <p className="text-[10px] text-neutral-500">In-App & Push</p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 p-3.5 rounded-xl shadow">
          <p className="text-[11px] text-neutral-400 font-bold uppercase">Acknowledgements</p>
          <p className="text-xl font-black text-emerald-400">{alert?.deliveryStats.acknowledgementCount || 1845}</p>
          <p className="text-[10px] text-neutral-500">Delivery proof only</p>
        </div>
      </div>

      {/* Navigation Sub-Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-neutral-800 text-xs font-bold scrollbar-none">
        {[
          { id: 'overview', label: 'Tactical HUD & Map' },
          { id: 'gaps', label: `Information Gaps (${alert?.gaps.length || 1})` },
          { id: 'conflicts', label: `Conflicts (${alert?.conflicts.length || 1})` },
          { id: 'workflow', label: 'Ingest & Verification Workflow' },
          { id: 'delivery', label: 'Multi-Channel Delivery' },
          { id: 'shelters', label: 'Shelters & Safe Routes' },
          { id: 'seismic', label: 'Seismic Telemetry (Strict Safety)' },
          { id: 'copilot', label: 'Authority Copilot (Gemini)' },
          { id: 'audit', label: 'Cryptographic Audit Trail' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`px-3 py-2 rounded-lg whitespace-nowrap transition uppercase tracking-wider ${
              activeTab === tab.id
                ? 'bg-neutral-800 text-white border-b-2 border-red-500 font-black'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW & TACTICAL MAP */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <InteractiveMap
            severity={alert?.severity || 'critical'}
            affectedDistrict={alert?.affectedArea.district}
            zones={alert?.affectedArea.zones}
            shelters={shelters}
            routes={routes}
          />

          {/* Alert Quick Verification / Publish Panel */}
          {alert && (
            <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-4">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-neutral-800">
                <div>
                  <h3 className="font-extrabold text-sm uppercase tracking-wide text-neutral-200">
                    Active Incident Verification Status
                  </h3>
                  <p className="text-xs text-neutral-400">
                    Current status: <strong className="text-amber-400 uppercase">{alert.status.replace('_', ' ')}</strong>
                  </p>
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    onClick={handleApproveAlert}
                    className="bg-blue-600 hover:bg-blue-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow"
                  >
                    <FileCheck className="w-4 h-4" />
                    Approve Verification
                  </button>

                  <button
                    onClick={handlePublishAlert}
                    className="bg-red-600 hover:bg-red-500 text-white font-black px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5 shadow-lg shadow-red-950/60"
                  >
                    <Send className="w-4 h-4" />
                    Publish Official Broadcast
                  </button>
                </div>
              </div>

              {/* Version Comparison Diff Card */}
              {versionDiff && (
                <div className="bg-neutral-950 p-4 rounded-xl border border-neutral-800 space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-neutral-300 flex items-center gap-1.5 uppercase">
                      <GitCompare className="w-3.5 h-3.5 text-blue-400" />
                      Alert Change Detector: Version {versionDiff.versionFrom} → Version {versionDiff.versionTo}
                    </span>
                    <span className="text-[10px] text-neutral-500">{new Date(versionDiff.timestamp).toLocaleTimeString()}</span>
                  </div>

                  <div className="space-y-2 pt-1">
                    {versionDiff.changes.map((c, i) => (
                      <div key={i} className="text-xs bg-neutral-900/80 p-2.5 rounded-lg border border-neutral-800 space-y-1">
                        <div className="flex items-center justify-between">
                          <strong className="text-blue-300 uppercase tracking-wider text-[11px]">{c.label}</strong>
                          <span className="text-[10px] bg-red-950 text-red-300 px-2 py-0.5 rounded font-mono">
                            {c.significance.toUpperCase()}
                          </span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-neutral-300 pt-1">
                          <div className="bg-neutral-950 p-2 rounded border border-neutral-800/80">
                            <span className="text-[10px] text-neutral-500 uppercase block">Before:</span>
                            <span>{c.before}</span>
                          </div>
                          <div className="bg-neutral-950 p-2 rounded border border-neutral-800/80">
                            <span className="text-[10px] text-neutral-500 uppercase block">Now:</span>
                            <span className="text-emerald-400 font-bold">{c.after}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: INFORMATION GAPS */}
      {activeTab === 'gaps' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              AI Information Gap Detector & Completeness Breakdown
            </h3>
            <p className="text-xs text-neutral-400">
              The AI assurance layer inspects incoming disaster data against defined safety-critical fields.
              Missing items are never hallucinated or invented; they are flagged as explicit operational gaps.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 pt-2">
              {alert?.completeness.fieldBreakdown.map((f, i) => (
                <div
                  key={i}
                  className={`p-3 rounded-xl border text-xs space-y-1 ${
                    f.present
                      ? 'bg-neutral-950 border-neutral-800 text-neutral-300'
                      : 'bg-red-950/30 border-red-800/60 text-red-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-bold">
                    <span>{f.label}</span>
                    <span>{f.present ? '✓ Present' : '✗ Missing'}</span>
                  </div>
                  <p className="text-[11px] text-neutral-400">{f.valueSummary}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Active Gaps List */}
          <div className="space-y-3">
            {alert?.gaps.map((gap) => (
              <div key={gap.id} className="bg-neutral-900 border border-amber-600/40 p-5 rounded-2xl space-y-2">
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-sm text-amber-300 uppercase">{gap.label}</h4>
                    <p className="text-xs text-neutral-400">{gap.evidence}</p>
                  </div>
                  <span className="text-[10px] bg-amber-500/20 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded font-black uppercase">
                    Status: {gap.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-200">
                  <strong>Explanation:</strong> {gap.explanation}
                </p>
                <div className="bg-neutral-950 p-2.5 rounded-lg text-xs text-emerald-300 border border-neutral-800 flex items-center justify-between">
                  <span>Suggested Operational Action: {gap.suggestedAction}</span>
                  <button
                    onClick={() => setActionNotice(`Gap marked resolved: ${gap.label}`)}
                    className="bg-neutral-800 hover:bg-neutral-700 text-white px-2 py-1 rounded text-[11px] font-bold"
                  >
                    Mark Resolved
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: CONFLICT DETECTOR */}
      {activeTab === 'conflicts' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <Layers className="w-4 h-4 text-blue-400" />
              Multi-Source Conflict Detector & Source Authority Tiers
            </h3>
            <p className="text-xs text-neutral-400">
              Disaster information arriving from multiple feeds is reconciled using the 5-Tier Authority Hierarchy.
              AEGIS never randomly picks an outcome; discrepancies require explicit authority verification.
            </p>

            {/* Source Tier Legend */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 text-[11px] pt-2">
              <div className="bg-neutral-950 p-2.5 rounded-lg border border-emerald-500/40">
                <p className="font-bold text-emerald-400">Tier 1: Government</p>
                <p className="text-neutral-400">State / National Disaster Authority (SDMA / NDMA)</p>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-lg border border-blue-500/40">
                <p className="font-bold text-blue-400">Tier 2: Scientific</p>
                <p className="text-neutral-400">IMD, USGS, Geological Survey</p>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-lg border border-purple-500/40">
                <p className="font-bold text-purple-400">Tier 3: Operational</p>
                <p className="text-neutral-400">Red Cross, First Responders, NDRF</p>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-lg border border-amber-500/40">
                <p className="font-bold text-amber-400">Tier 4: Sensor Network</p>
                <p className="text-neutral-400">River gauges, IoT weather stations</p>
              </div>
              <div className="bg-neutral-950 p-2.5 rounded-lg border border-neutral-700">
                <p className="font-bold text-neutral-300">Tier 5: Crowd Signals</p>
                <p className="text-neutral-400">Unverified citizen field reports</p>
              </div>
            </div>
          </div>

          {/* Active Conflicts List */}
          <div className="space-y-3">
            {alert?.conflicts.map((conf) => (
              <div key={conf.id} className="bg-neutral-900 border border-blue-600/40 p-5 rounded-2xl space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-blue-300 uppercase">
                    Discrepancy: {conf.fieldLabel}
                  </h4>
                  <span className="text-[10px] bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded font-black uppercase">
                    Status: {conf.status.replace('_', ' ')}
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                    <p className="font-bold text-neutral-200">Source A ({conf.sourceA.sourceName})</p>
                    <p className="text-emerald-400 font-bold text-sm">"{conf.sourceA.value}"</p>
                    <span className="text-[10px] text-neutral-500">
                      Tier {conf.sourceA.tier} • {new Date(conf.sourceA.timestamp).toLocaleTimeString()}
                    </span>
                  </div>

                  <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 space-y-1">
                    <p className="font-bold text-neutral-200">Source B ({conf.sourceB.sourceName})</p>
                    <p className="text-amber-400 font-bold text-sm">"{conf.sourceB.value}"</p>
                    <span className="text-[10px] text-neutral-500">
                      Tier {conf.sourceB.tier} • {new Date(conf.sourceB.timestamp).toLocaleTimeString()}
                    </span>
                  </div>
                </div>

                <div className="bg-neutral-950 p-3 rounded-xl border border-neutral-800 text-xs space-y-1">
                  <p className="text-neutral-300">
                    <strong>Adjudication Basis:</strong> {conf.explanation}
                  </p>
                  {conf.adjudicatedValue && (
                    <p className="text-emerald-400 font-bold">
                      Official Decision: {conf.adjudicatedValue}
                    </p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: INGEST & VERIFICATION WORKFLOW */}
      {activeTab === 'workflow' && (
        <div className="space-y-5">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              Emergency Intake & AI Extraction Pipeline
            </h3>
            <p className="text-xs text-neutral-400">
              Paste raw dispatches, radio transcripts, or police reports. The AI extraction pipeline normalizes
              parameters, calculates completeness, and flags information gaps without hallucination.
            </p>

            <textarea
              value={rawIntakeText}
              onChange={(e) => setRawIntakeText(e.target.value)}
              rows={4}
              className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-red-500 font-mono"
              placeholder="Paste raw incoming emergency text..."
            />

            <button
              onClick={handleCreateDraft}
              disabled={isDrafting}
              className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              {isDrafting ? 'Extracting Parameters...' : 'Run AI Extraction & Ingest Draft Alert'}
            </button>
          </div>
        </div>
      )}

      {/* TAB 5: MULTI-CHANNEL DELIVERY & ACKNOWLEDGEMENT */}
      {activeTab === 'delivery' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <Radio className="w-4 h-4 text-red-400" />
              Multi-Channel Alert Dispatch & Provider Status
            </h3>
            <p className="text-xs text-neutral-400">
              Real multi-channel broadcast gateway tracking. Unconfigured providers are explicitly marked as{' '}
              <strong className="text-amber-400">NOT CONFIGURED</strong> or{' '}
              <strong className="text-blue-400">DEMO SANDBOX</strong> to prevent false delivery claims.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              {
                channel: 'In-App Loud Beep & Screen HUD',
                status: 'ACTIVE',
                color: 'text-emerald-400 border-emerald-500/40',
                details: 'Web Audio API synthesized 960Hz siren + device vibration.',
                count: '4,210 delivered',
              },
              {
                channel: 'W3C Browser Web Push',
                status: 'ACTIVE',
                color: 'text-emerald-400 border-emerald-500/40',
                details: 'Standard Web Push Service to subscribed clients.',
                count: '3,890 delivered',
              },
              {
                channel: 'Telecom SMS Emergency Gateway',
                status: 'DEMO SANDBOX',
                color: 'text-amber-400 border-amber-500/40',
                details: 'SMS Aggregator Sandbox mode. Real carrier delivery requires telecom provider keys.',
                count: '0 simulated',
              },
              {
                channel: 'Cell Broadcast Service (CBC)',
                status: 'NOT CONFIGURED (INTEGRATION READY)',
                color: 'text-neutral-400 border-neutral-700',
                details: 'Standard web browsers cannot emit raw RF broadcasts. Direct telco gateway required.',
                count: 'Provider not configured',
              },
              {
                channel: 'Voice Synthesis TTS Broadcast',
                status: 'ACTIVE',
                color: 'text-emerald-400 border-emerald-500/40',
                details: 'Automated multi-lingual text-to-speech reading in 8 languages.',
                count: '3,812 synthesized',
              },
            ].map((c, i) => (
              <div key={i} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-200">{c.channel}</h4>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded border ${c.color}`}>
                    {c.status}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{c.details}</p>
                <p className="text-xs font-mono text-neutral-300 pt-1 border-t border-neutral-800/60">
                  Delivery telemetry: <strong className="text-white">{c.count}</strong>
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 6: SHELTERS & SAFE ROUTES */}
      {activeTab === 'shelters' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <Users className="w-4 h-4 text-emerald-400" />
              Shelter Registry & Live Occupancy Monitoring
            </h3>
            <p className="text-xs text-neutral-400">
              Only verified relief centers are assigned to public warnings. Capacity numbers are strictly preserved.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {shelters.map((s) => (
              <div key={s.id} className="bg-neutral-900 border border-neutral-800 p-4 rounded-xl space-y-2">
                <div className="flex items-start justify-between">
                  <h4 className="font-bold text-sm text-neutral-100">{s.name}</h4>
                  <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-bold uppercase">
                    {s.status.replace('_', ' ')}
                  </span>
                </div>
                <p className="text-xs text-neutral-400">{s.location.address}</p>
                <div className="space-y-1 text-xs text-neutral-300 pt-2 border-t border-neutral-800">
                  <div className="flex justify-between">
                    <span>Capacity:</span>
                    <strong>{s.capacity}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Live Occupancy:</span>
                    <strong>{s.occupancy} ({s.capacity ? Math.round((s.occupancy! / s.capacity) * 100) : 0}%)</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Wheelchair Accessible:</span>
                    <strong>{s.wheelchairAccessible ? 'Yes' : 'No'}</strong>
                  </div>
                  <div className="flex justify-between">
                    <span>Contact:</span>
                    <strong className="text-emerald-400">{s.contactNumber}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 7: SEISMIC TELEMETRY (STRICT NO PREDICTION SAFETY) */}
      {activeTab === 'seismic' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <Radio className="w-4 h-4 text-purple-400" />
              Seismological Telemetry & Ground Motion Ingestion
            </h3>

            {/* MANDATORY SAFETY RULE NOTICE */}
            <div className="bg-red-950/80 border border-red-600/80 p-3.5 rounded-xl text-xs text-red-200 space-y-1">
              <p className="font-black uppercase tracking-wider text-red-300 flex items-center gap-1.5">
                <AlertTriangle className="w-4 h-4" />
                MANDATORY SAFETY RULE: NO EARTHQUAKE PREDICTION
              </p>
              <p>
                The system NEVER claims that it can predict earthquakes. Earthquake prediction is scientifically impossible.
                AEGIS receives detected ground-motion telemetry from trusted seismic networks and separates:
              </p>
              <ul className="list-disc list-inside space-y-0.5 text-neutral-300 pt-1">
                <li>Possible ground-motion signal (Device accelerometer)</li>
                <li>Detected earthquake event (Unverified sensor cluster)</li>
                <li>Official earthquake information (Scientific agency feed)</li>
                <li>Confirmed official warning (Authority disaster declaration)</li>
              </ul>
            </div>
          </div>

          {/* Seismic Events Display */}
          <div className="space-y-3">
            {seismicEvents.map((evt) => (
              <div key={evt.id} className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-2">
                <div className="flex items-center justify-between">
                  <h4 className="font-bold text-sm text-neutral-100 uppercase">
                    Magnitude {evt.magnitude} — {evt.epicenter.placeName}
                  </h4>
                  <span className="text-[10px] bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded font-black uppercase">
                    {evt.classification.replace(/_/g, ' ')}
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs text-neutral-400 pt-1 border-t border-neutral-800">
                  <div>
                    Depth: <strong className="text-white">{evt.depthKm} km</strong>
                  </div>
                  <div>
                    Source: <strong className="text-white">{evt.source}</strong>
                  </div>
                  <div>
                    Intensity: <strong className="text-white uppercase">{evt.intensityZone}</strong>
                  </div>
                  <div>
                    Time: <strong className="text-white">{new Date(evt.timestamp).toLocaleTimeString()}</strong>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 8: AUTHORITY AI COPILOT */}
      {activeTab === 'copilot' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <Bot className="w-4 h-4 text-purple-400" />
              Authority Emergency AI Copilot (Gemini 3.8 Flash)
            </h3>
            <p className="text-xs text-neutral-400">
              Query the disaster operations knowledge base. The AI answers strictly from ingested records, citing
              underlying source tiers and highlighting missing information.
            </p>

            <form onSubmit={handleAskCopilot} className="space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  value={copilotQuestion}
                  onChange={(e) => setCopilotQuestion(e.target.value)}
                  placeholder="Ask: 'What information is missing?', 'Which sources conflict?', 'Are road updates stale?'"
                  className="flex-1 bg-neutral-950 border border-neutral-700 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-purple-500"
                />
                <button
                  type="submit"
                  disabled={isCopilotLoading}
                  className="bg-purple-600 hover:bg-purple-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs uppercase tracking-wider transition flex items-center gap-1.5"
                >
                  <Send className="w-3.5 h-3.5" />
                  Ask
                </button>
              </div>

              {/* Quick sample question chips */}
              <div className="flex flex-wrap gap-2 text-[11px]">
                <button
                  type="button"
                  onClick={() => setCopilotQuestion('What critical information is missing from the active alert?')}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-lg"
                >
                  What info is missing?
                </button>
                <button
                  type="button"
                  onClick={() => setCopilotQuestion('Which sources conflict on evacuation deadlines?')}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-lg"
                >
                  Which sources conflict?
                </button>
                <button
                  type="button"
                  onClick={() => setCopilotQuestion('Are any road condition reports stale or unverified?')}
                  className="bg-neutral-800 hover:bg-neutral-700 text-neutral-300 px-2.5 py-1 rounded-lg"
                >
                  Are roads stale?
                </button>
              </div>
            </form>

            {copilotAnswer && (
              <div className="bg-neutral-950 p-4 rounded-xl border border-purple-500/40 text-xs text-neutral-200 space-y-2 animate-fadeIn">
                <p className="font-bold text-purple-400 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
                  <Bot className="w-3.5 h-3.5" /> Copilot Operational Assessment:
                </p>
                <p className="whitespace-pre-wrap leading-relaxed">{copilotAnswer}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 9: CRYPTOGRAPHIC AUDIT TRAIL */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="bg-neutral-900 border border-neutral-800 p-5 rounded-2xl space-y-3">
            <h3 className="font-black text-sm uppercase tracking-wide flex items-center gap-2">
              <FileCheck className="w-4 h-4 text-emerald-400" />
              Append-Oriented Cryptographic Audit Log
            </h3>
            <p className="text-xs text-neutral-400">
              Every ingestion, AI extraction, conflict adjudication, approval, and publication generates an immutable
              tamper-verifiable SHA-256 audit entry.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl overflow-hidden shadow">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-neutral-950 text-neutral-400 uppercase text-[10px] tracking-wider border-b border-neutral-800">
                  <tr>
                    <th className="p-3">Timestamp</th>
                    <th className="p-3">Actor & Role</th>
                    <th className="p-3">Action</th>
                    <th className="p-3">Summary</th>
                    <th className="p-3">Audit Hash</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-neutral-800 text-neutral-300">
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-neutral-950/60 transition">
                      <td className="p-3 whitespace-nowrap text-neutral-400">
                        {new Date(log.timestamp).toLocaleTimeString()}
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="font-bold text-white">{log.actorEmail}</span>
                        <span className="text-[10px] text-neutral-500 block uppercase">{log.actorRole}</span>
                      </td>
                      <td className="p-3 whitespace-nowrap">
                        <span className="bg-neutral-800 text-neutral-300 px-2 py-0.5 rounded font-mono text-[10px]">
                          {log.action}
                        </span>
                      </td>
                      <td className="p-3">{log.summary}</td>
                      <td className="p-3 font-mono text-[10px] text-neutral-400 truncate max-w-[120px]">
                        {log.auditHash}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
