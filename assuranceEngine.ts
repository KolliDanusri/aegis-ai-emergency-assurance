import {
  DisasterType,
  CompletenessMetric,
  InformationGap,
  InformationConflict,
  FreshnessStatus,
  ProvenanceRecord,
  AssuranceScorecard,
  AlertVersionDiff,
  SourceAuthorityTier,
  SourceMetadata,
} from '../types';

interface RequiredFieldSpec {
  field: string;
  label: string;
  weight: number;
  critical: boolean;
  applicableDisasters?: DisasterType[];
}

export const REQUIRED_FIELDS_SPEC: RequiredFieldSpec[] = [
  { field: 'disasterType', label: 'Disaster Type', weight: 12, critical: true },
  { field: 'severity', label: 'Alert Severity Level', weight: 10, critical: true },
  { field: 'affectedArea', label: 'Affected Geographic Zone', weight: 14, critical: true },
  { field: 'whatHappened', label: 'Incident Description (What happened)', weight: 12, critical: true },
  { field: 'whatToDo', label: 'Prescribed Protective Action (What to do)', weight: 14, critical: true },
  { field: 'whereToGo', label: 'Evacuation Destination / Safe Zone', weight: 10, critical: false },
  { field: 'shelters', label: 'Verified Shelter Facility', weight: 8, critical: false },
  { field: 'safeRoutes', label: 'Safe Evacuation Route & Status', weight: 6, critical: false },
  { field: 'roadConditions', label: 'Road Transit Conditions', weight: 4, critical: false },
  { field: 'emergencyContacts', label: 'Direct Helpline / Emergency Contact', weight: 6, critical: false },
  { field: 'source', label: 'Authorized Source & Provenance', weight: 8, critical: true },
  { field: 'expiresAt', label: 'Warning Expiration / Validity Window', weight: 4, critical: false },
  { field: 'accessibilityLanguage', label: 'Multilingual / Simple Language Ready', weight: 2, critical: false },
];

/**
 * Calculates deterministic and explainable completeness for an emergency alert
 */
export function calculateCompleteness(
  data: Record<string, any>,
  disasterType: DisasterType = 'flood'
): CompletenessMetric {
  const relevantSpecs = REQUIRED_FIELDS_SPEC.filter(
    (spec) => !spec.applicableDisasters || spec.applicableDisasters.includes(disasterType)
  );

  const totalWeight = relevantSpecs.reduce((sum, s) => sum + s.weight, 0);
  let earnedWeight = 0;
  const presentFields: string[] = [];
  const missingFields: string[] = [];

  const fieldBreakdown = relevantSpecs.map((spec) => {
    const val = data[spec.field];
    let isPresent = false;
    let valueSummary = 'Not provided by source';

    if (val !== undefined && val !== null) {
      if (Array.isArray(val)) {
        isPresent = val.length > 0;
        if (isPresent) valueSummary = `${val.length} item(s) provided`;
      } else if (typeof val === 'string') {
        isPresent = val.trim().length > 0 && !val.toLowerCase().includes('unknown');
        if (isPresent) valueSummary = val.length > 40 ? `${val.slice(0, 40)}...` : val;
      } else if (typeof val === 'object') {
        isPresent = Object.keys(val).length > 0;
        if (isPresent) valueSummary = 'Metadata present';
      } else {
        isPresent = true;
        valueSummary = String(val);
      }
    }

    if (isPresent) {
      earnedWeight += spec.weight;
      presentFields.push(spec.field);
    } else {
      missingFields.push(spec.field);
    }

    return {
      field: spec.field,
      label: spec.label,
      weight: spec.weight,
      present: isPresent,
      valueSummary,
    };
  });

  const score = Math.round((earnedWeight / totalWeight) * 100);

  return {
    score,
    presentFields,
    missingFields,
    fieldBreakdown,
  };
}

/**
 * Identifies explicit information gaps based on missing critical fields
 */
export function detectInformationGaps(completeness: CompletenessMetric): InformationGap[] {
  const gaps: InformationGap[] = [];

  const gapDescriptions: Record<string, { label: string; explanation: string; action: string; severity: 'critical' | 'warning' | 'info' }> = {
    whereToGo: {
      label: 'Missing Evacuation Destination',
      explanation: 'Alert instructs citizens to take action but provides no specified safe zone or higher-ground destination.',
      action: 'Request disaster management authority designate nearest safe assembly point.',
      severity: 'critical',
    },
    shelters: {
      label: 'Missing Official Shelter Location',
      explanation: 'No operational shelter facility or shelter coordinates attached to this warning.',
      action: 'Query civil defense shelter registry for active facilities in the affected district.',
      severity: 'critical',
    },
    safeRoutes: {
      label: 'Missing Evacuation Route Guidance',
      explanation: 'Citizens are advised to relocate without guidance on which roads remain open or elevated.',
      action: 'Coordinate with traffic police / highway patrol to verify open corridors.',
      severity: 'warning',
    },
    roadConditions: {
      label: 'Missing Road Status & Hazard Updates',
      explanation: 'No status provided regarding waterlogging, tree falls, or bridge closures along egress corridors.',
      action: 'Ingest local road transport authority or sensor signals.',
      severity: 'warning',
    },
    emergencyContacts: {
      label: 'Missing Emergency Helpline Numbers',
      explanation: 'Alert lacks verified phone numbers for emergency control room or rescue units.',
      action: 'Attach 24x7 district disaster control room helpline (1077/112).',
      severity: 'warning',
    },
    expiresAt: {
      label: 'Missing Alert Expiration Time',
      explanation: 'No time boundary given for when this warning will be superseded or reviewed.',
      action: 'Specify standard 4-hour review window or official meteorological validity time.',
      severity: 'info',
    },
    accessibilityLanguage: {
      label: 'Language Availability Gap',
      explanation: 'Only single-language broadcast available; regional translations not yet validated.',
      action: 'Generate and verify local language translations immediately.',
      severity: 'info',
    },
  };

  completeness.missingFields.forEach((field) => {
    const desc = gapDescriptions[field];
    if (desc) {
      gaps.push({
        id: `gap-${field}-${Date.now().toString(36)}`,
        field,
        label: desc.label,
        severity: desc.severity,
        status: 'open',
        evidence: `Field "${field}" is empty or not provided in the ingested source payload.`,
        explanation: desc.explanation,
        suggestedAction: desc.action,
      });
    }
  });

  return gaps;
}

/**
 * Evaluates information freshness based on age in minutes
 */
export function evaluateFreshness(lastUpdatedIso: string, thresholdMinutes: number = 45): FreshnessStatus {
  const lastUpdated = new Date(lastUpdatedIso).getTime();
  const now = Date.now();
  const ageMinutes = Math.max(0, Math.floor((now - lastUpdated) / (1000 * 60)));

  let status: 'fresh' | 'warning' | 'stale' | 'expired' = 'fresh';
  let warningMessage: string | undefined;

  if (ageMinutes > thresholdMinutes * 2) {
    status = 'stale';
    warningMessage = `Potentially outdated — last updated ${ageMinutes} minutes ago. Verification recommended before taking route actions.`;
  } else if (ageMinutes > thresholdMinutes) {
    status = 'warning';
    warningMessage = `Information aging — last updated ${ageMinutes} minutes ago. Update may be pending from authority.`;
  }

  return {
    lastUpdated: lastUpdatedIso,
    receivedAt: lastUpdatedIso,
    ageMinutes,
    status,
    warningMessage,
    thresholdMinutes,
  };
}

/**
 * Calculates overall explainable Alert Assurance Score
 */
export function calculateAssuranceScore(params: {
  completenessScore: number;
  freshnessStatus: FreshnessStatus;
  sourceTier: SourceAuthorityTier;
  conflictsCount: number;
  hasTranslations: boolean;
  isVerifiedByAuthority: boolean;
}): AssuranceScorecard {
  const {
    completenessScore,
    freshnessStatus,
    sourceTier,
    conflictsCount,
    hasTranslations,
    isVerifiedByAuthority,
  } = params;

  // Freshness score
  let freshnessScore = 100;
  if (freshnessStatus.status === 'warning') freshnessScore = 70;
  if (freshnessStatus.status === 'stale') freshnessScore = 40;
  if (freshnessStatus.status === 'expired') freshnessScore = 10;

  // Source Quality score based on authority tier
  let sourceQuality = 40;
  if (sourceTier === 1) sourceQuality = 100; // Gov / NDMA
  else if (sourceTier === 2) sourceQuality = 90; // IMD / USGS
  else if (sourceTier === 3) sourceQuality = 80; // Red Cross
  else if (sourceTier === 4) sourceQuality = 65; // Sensor

  // Conflict score
  let conflictScore = 100;
  if (conflictsCount === 1) conflictScore = 65;
  else if (conflictsCount > 1) conflictScore = 40;

  // Accessibility & language
  const accessibilityScore = hasTranslations ? 90 : 65;

  // Verification score
  const verificationScore = isVerifiedByAuthority ? 100 : 45;

  // Deterministic formula
  // Completeness: 30%, Source Quality: 20%, Freshness: 15%, Conflicts: 15%, Verification: 15%, Accessibility: 5%
  const overallScore = Math.round(
    completenessScore * 0.3 +
    sourceQuality * 0.2 +
    freshnessScore * 0.15 +
    conflictScore * 0.15 +
    verificationScore * 0.15 +
    accessibilityScore * 0.05
  );

  return {
    overallScore: Math.min(100, Math.max(0, overallScore)),
    completeness: completenessScore,
    freshness: freshnessScore,
    sourceQuality,
    conflictScore,
    accessibilityScore,
    verificationScore,
    formulaExplanation:
      'Deterministic calculation: Completeness (30%) + Source Tier (20%) + Freshness (15%) + Conflict Absence (15%) + Official Verification (15%) + Accessibility (5%).',
  };
}

/**
 * Computes transparent diff between previous alert version and current alert version
 */
export function computeAlertVersionDiff(
  prev: Record<string, any>,
  curr: Record<string, any>
): AlertVersionDiff {
  const changes: AlertVersionDiff['changes'] = [];

  // 1. Severity change
  if (prev.severity !== curr.severity) {
    changes.push({
      category: 'severity',
      label: 'Severity Level Escalation/Adjustment',
      before: prev.severity ? String(prev.severity).toUpperCase() : 'UNKNOWN',
      after: curr.severity ? String(curr.severity).toUpperCase() : 'UNKNOWN',
      significance: 'critical',
    });
  }

  // 2. Affected area
  const prevZones = Array.isArray(prev.affectedArea?.zones) ? prev.affectedArea.zones.join(', ') : '';
  const currZones = Array.isArray(curr.affectedArea?.zones) ? curr.affectedArea.zones.join(', ') : '';
  if (prevZones !== currZones || prev.affectedArea?.district !== curr.affectedArea?.district) {
    changes.push({
      category: 'affected_area',
      label: 'Affected Zones & District Boundary',
      before: `${prev.affectedArea?.district || ''} [${prevZones}]`,
      after: `${curr.affectedArea?.district || ''} [${currZones}]`,
      significance: 'critical',
    });
  }

  // 3. Expiration / Evacuation Deadline
  if (prev.expiresAt !== curr.expiresAt) {
    changes.push({
      category: 'deadline',
      label: 'Warning Validity / Evacuation Deadline',
      before: prev.expiresAt ? new Date(prev.expiresAt).toLocaleTimeString() : 'Not specified',
      after: curr.expiresAt ? new Date(curr.expiresAt).toLocaleTimeString() : 'Not specified',
      significance: 'critical',
    });
  }

  // 4. Shelter guidance
  const prevShelters = Array.isArray(prev.shelterIds) ? prev.shelterIds.length : 0;
  const currShelters = Array.isArray(curr.shelterIds) ? curr.shelterIds.length : 0;
  if (prevShelters !== currShelters) {
    changes.push({
      category: 'shelter',
      label: 'Assigned Emergency Shelters',
      before: `${prevShelters} shelter(s) assigned`,
      after: `${currShelters} shelter(s) assigned`,
      significance: 'moderate',
    });
  }

  // 5. Recommended action
  if (prev.whatToDo !== curr.whatToDo) {
    changes.push({
      category: 'action',
      label: 'Recommended Public Safety Instructions',
      before: prev.whatToDo || 'None provided',
      after: curr.whatToDo || 'None provided',
      significance: 'critical',
    });
  }

  return {
    versionFrom: prev.version || 1,
    versionTo: curr.version || 2,
    timestamp: new Date().toISOString(),
    changes,
  };
}
