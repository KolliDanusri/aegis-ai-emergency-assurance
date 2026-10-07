export type UserRole = 'citizen' | 'authority' | 'admin';
export type { SupportedLanguage, LanguageMeta } from '../services/i18n';
export { SUPPORTED_LANGUAGES } from '../services/i18n';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  agency?: string;
  phone?: string;
  preferredLanguage?: string;
}

export type DisasterType =
  | 'flood'
  | 'cyclone'
  | 'earthquake'
  | 'wildfire'
  | 'landslide'
  | 'extreme_heat'
  | 'tsunami'
  | 'severe_storm';

export type AlertSeverity = 'advisory' | 'watch' | 'warning' | 'critical';

export type VerificationStatus =
  | 'unverified'
  | 'under_review'
  | 'verified'
  | 'official_warning'
  | 'superseded'
  | 'expired';

export type SourceAuthorityTier =
  | 1 // Official Government / National Emergency Authority
  | 2 // Verified Scientific / Meteorological Agency (e.g. IMD, USGS)
  | 3 // Verified Operational Organization (Red Cross, First Responders)
  | 4 // Automated Sensor / Device Signal (IoT, Accelerometers, River gauges)
  | 5; // Unverified Citizen / Crowd Report

export interface SourceMetadata {
  id: string;
  name: string;
  tier: SourceAuthorityTier;
  tierName: string;
  type: 'government' | 'weather' | 'seismic' | 'sensor' | 'satellite' | 'first_responder' | 'public_report';
  verified: boolean;
  endpointStatus: 'operational' | 'not_configured' | 'demo_data' | 'degraded';
  lastSuccessfulUpdate: string;
  reliabilityScore: number; // 0-100
}

export interface InformationGap {
  id: string;
  field: string;
  label: string;
  severity: 'critical' | 'warning' | 'info';
  status: 'open' | 'under_review' | 'resolved';
  evidence: string;
  explanation: string;
  suggestedAction: string;
}

export interface InformationConflict {
  id: string;
  field: string;
  fieldLabel: string;
  sourceA: {
    sourceId: string;
    sourceName: string;
    tier: SourceAuthorityTier;
    value: string;
    timestamp: string;
  };
  sourceB: {
    sourceId: string;
    sourceName: string;
    tier: SourceAuthorityTier;
    value: string;
    timestamp: string;
  };
  status: 'requires_verification' | 'authority_adjudicated' | 'superseded';
  explanation: string;
  adjudicatedValue?: string;
}

export interface FreshnessStatus {
  lastUpdated: string;
  receivedAt: string;
  expiresAt?: string;
  ageMinutes: number;
  status: 'fresh' | 'warning' | 'stale' | 'expired';
  warningMessage?: string;
  thresholdMinutes: number;
}

export interface ProvenanceRecord {
  sourceId: string;
  sourceName: string;
  sourceTier: SourceAuthorityTier;
  receivedAt: string;
  updatedAt: string;
  dataType: string;
  verifiedBy?: string;
  verifierRole?: string;
  auditId: string;
  inputRawTextPreview?: string;
  modificationHistory: Array<{
    timestamp: string;
    modifier: string;
    fieldChanged: string;
    previousValue: string;
    newValue: string;
  }>;
}

export interface CompletenessMetric {
  score: number; // 0 - 100
  presentFields: string[];
  missingFields: string[];
  fieldBreakdown: Array<{
    field: string;
    label: string;
    weight: number;
    present: boolean;
    valueSummary?: string;
  }>;
}

export interface AssuranceScorecard {
  overallScore: number; // 0 - 100
  completeness: number; // 0 - 100
  freshness: number; // 0 - 100
  sourceQuality: number; // 0 - 100
  conflictScore: number; // 0 - 100
  accessibilityScore: number; // 0 - 100
  verificationScore: number; // 0 - 100
  formulaExplanation: string;
}

export interface Shelter {
  id: string;
  name: string;
  district: string;
  location: {
    lat: number;
    lng: number;
    address: string;
    landmark?: string;
  };
  capacity: number | null; // null if unknown, never invent
  occupancy: number | null;
  status: 'open' | 'nearing_capacity' | 'full' | 'closed';
  wheelchairAccessible: boolean;
  medicalSupport: boolean;
  emergencyPower: boolean;
  contactNumber: string;
  source: string;
  lastUpdated: string;
}

export interface SafeRoute {
  id: string;
  name: string;
  fromArea: string;
  toShelterId: string;
  shelterName: string;
  status: 'open_verified' | 'caution_partial' | 'blocked_impassable';
  roadSegments: Array<{
    name: string;
    condition: 'open' | 'waterlogged' | 'landslide_debris' | 'fallen_trees' | 'unverified';
    lastUpdated: string;
    source: string;
  }>;
  distanceKm: number;
  estimatedMinutes: number;
  hazards: string[];
  lastVerified: string;
}

export interface EmergencyContact {
  id: string;
  name: string;
  phone: string;
  agency: string;
  category: 'disaster_control' | 'police' | 'fire_rescue' | 'ambulance' | 'flood_helpline';
  available24x7: boolean;
  lastVerified: string;
  source: string;
}

export interface EmergencyAlert {
  id: string;
  eventId: string;
  version: number;
  previousVersionId?: string;
  disasterType: DisasterType;
  severity: AlertSeverity;
  headline: string;
  affectedArea: {
    district: string;
    zones: string[];
    coordinates?: { lat: number; lng: number; radiusKm: number };
  };
  whatHappened: string;
  whatToDo: string;
  whereToGo: string;
  simpleLanguageSummary: {
    whatHappened: string;
    whatToDo: string;
    whereToGo: string;
    caveat: string;
  };
  destinationSummary?: string;
  shelterIds: string[];
  routeIds: string[];
  emergencyContactIds: string[];
  status: VerificationStatus;
  source: SourceMetadata;
  createdAt: string;
  updatedAt: string;
  expiresAt: string;
  completeness: CompletenessMetric;
  gaps: InformationGap[];
  conflicts: InformationConflict[];
  freshness: FreshnessStatus;
  provenance: ProvenanceRecord;
  assuranceScorecard: AssuranceScorecard;
  translations?: Record<string, {
    headline: string;
    whatHappened: string;
    whatToDo: string;
    whereToGo: string;
    isVerified: boolean;
  }>;
  deliveryStats: {
    inAppDelivered: number;
    pushDelivered: number;
    smsDelivered: number;
    cellBroadcastStatus: 'integration_ready_unconfigured' | 'simulated_test' | 'delivered';
    voiceCallsAttempted: number;
    acknowledgementCount: number;
    totalTargetPopEstimate: number;
  };
  auditTrailId: string;
}

export interface AlertVersionDiff {
  versionFrom: number;
  versionTo: number;
  timestamp: string;
  changes: Array<{
    category: 'affected_area' | 'severity' | 'deadline' | 'shelter' | 'action' | 'road_condition';
    label: string;
    before: string;
    after: string;
    significance: 'critical' | 'moderate' | 'minor';
  }>;
}

export interface GroundMotionSignal {
  id: string;
  deviceId: string;
  timestamp: string;
  peakAccelerationG: number;
  coordinates: { lat: number; lng: number };
  confidence: number;
  classification: 'possible_ground_motion_signal';
  notes: string;
}

export interface EarthquakeEvent {
  id: string;
  timestamp: string;
  source: string;
  sourceTier: SourceAuthorityTier;
  magnitude: number;
  depthKm: number;
  epicenter: { lat: number; lng: number; placeName: string };
  classification:
    | 'possible_ground_motion_signal'
    | 'detected_earthquake_event'
    | 'official_earthquake_information'
    | 'confirmed_official_warning';
  estimatedArrivalSeconds?: number;
  intensityZone: 'mild' | 'moderate' | 'strong' | 'severe';
  officialAgencyConfirmed: boolean;
  safetyRuleNotice: string; // Safety rule reminder
}

export interface NotificationChannelStatus {
  channel: 'in_app' | 'browser_push' | 'sms' | 'cell_broadcast' | 'voice_siren';
  name: string;
  status: 'active' | 'demo_sandbox' | 'not_configured' | 'unsupported_in_browser';
  providerName: string;
  details: string;
  deliveriesCount: number;
  failuresCount: number;
}

export interface AcknowledgementRecord {
  id: string;
  alertId: string;
  userId: string;
  userName?: string;
  timestamp: string;
  status: 'acknowledged';
  understood: boolean;
  disclaimerConfirmed: boolean; // Confirms acknowledgement is NOT proof of physical safety
}

export interface AuditLogItem {
  id: string;
  timestamp: string;
  actorEmail: string;
  actorRole: UserRole;
  action:
    | 'EVENT_INGESTED'
    | 'AI_EXTRACTION_COMPLETED'
    | 'GAPS_EVALUATED'
    | 'CONFLICT_DETECTED'
    | 'ALERT_DRAFTED'
    | 'ALERT_APPROVED'
    | 'ALERT_PUBLISHED'
    | 'ALERT_UPDATED'
    | 'NOTIFICATION_DISPATCHED'
    | 'ALERT_ACKNOWLEDGED'
    | 'SHELTER_UPDATED'
    | 'ROUTE_UPDATED';
  entityId: string;
  summary: string;
  details?: Record<string, any>;
  auditHash: string; // Deterministic sha256 identifier for tamper checking
}
