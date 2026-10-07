import crypto from 'node:crypto';
import {
  EmergencyAlert,
  Shelter,
  SafeRoute,
  EmergencyContact,
  EarthquakeEvent,
  GroundMotionSignal,
  NotificationChannelStatus,
  SourceMetadata,
  AuditLogItem,
  User,
  InformationGap,
  InformationConflict,
} from '../src/types';
import {
  SEED_SOURCES,
  SEED_SHELTERS,
  SEED_ROUTES,
  SEED_CONTACTS,
  SEED_NOTIFICATION_CHANNELS,
  SEED_EARTHQUAKE_EVENT,
  SEED_GROUND_MOTION_SIGNALS,
  INITIAL_CRITICAL_ALERT,
  SEED_AUDIT_LOGS,
} from '../src/data/seedData';
import {
  calculateCompleteness,
  detectInformationGaps,
  evaluateFreshness,
  calculateAssuranceScore,
} from '../src/services/assuranceEngine';

export interface StoredUser extends User {
  passwordHash: string;
  salt: string;
}

function hashPassword(password: string, salt: string): string {
  return crypto.scryptSync(password, salt, 64).toString('hex');
}

class AegisDatabase {
  public users: Map<string, StoredUser> = new Map();
  public sources: Map<string, SourceMetadata> = new Map();
  public alerts: Map<string, EmergencyAlert> = new Map();
  public alertVersions: Map<string, EmergencyAlert[]> = new Map();
  public shelters: Map<string, Shelter> = new Map();
  public routes: Map<string, SafeRoute> = new Map();
  public contacts: Map<string, EmergencyContact> = new Map();
  public notificationChannels: Map<string, NotificationChannelStatus> = new Map();
  public earthquakeEvents: EarthquakeEvent[] = [];
  public groundMotionSignals: GroundMotionSignal[] = [];
  public auditLogs: AuditLogItem[] = [];
  public acknowledgements: Array<{
    alertId: string;
    userId: string;
    timestamp: string;
    understood: boolean;
  }> = [];

  constructor() {
    this.seed();
  }

  public seed() {
    this.users.clear();
    this.sources.clear();
    this.alerts.clear();
    this.alertVersions.clear();
    this.shelters.clear();
    this.routes.clear();
    this.contacts.clear();
    this.notificationChannels.clear();
    this.earthquakeEvents = [];
    this.groundMotionSignals = [];
    this.auditLogs = [];
    this.acknowledgements = [];

    // Seed default users
    const officerSalt = crypto.randomBytes(16).toString('hex');
    this.users.set('authority@aegis.gov', {
      id: 'usr-auth-01',
      name: 'Command Duty Officer K. Nair',
      email: 'authority@aegis.gov',
      role: 'authority',
      agency: 'State Disaster Management Operations Center',
      phone: '+91 471 233 1645',
      salt: officerSalt,
      passwordHash: hashPassword('OfficerSecure2026!', officerSalt),
    });

    const adminSalt = crypto.randomBytes(16).toString('hex');
    this.users.set('admin@aegis.gov', {
      id: 'usr-adm-01',
      name: 'Dr. Anita Roy',
      email: 'admin@aegis.gov',
      role: 'admin',
      agency: 'National Emergency Assurance Agency',
      salt: adminSalt,
      passwordHash: hashPassword('AdminSecure2026!', adminSalt),
    });

    const citizenSalt = crypto.randomBytes(16).toString('hex');
    this.users.set('citizen@example.com', {
      id: 'usr-cit-01',
      name: 'Arjun Menon',
      email: 'citizen@example.com',
      role: 'citizen',
      phone: '+91 94470 12345',
      preferredLanguage: 'en',
      salt: citizenSalt,
      passwordHash: hashPassword('CitizenSafe2026!', citizenSalt),
    });

    // Seed sources
    SEED_SOURCES.forEach((s) => this.sources.set(s.id, { ...s }));

    // Seed shelters
    SEED_SHELTERS.forEach((sh) => this.shelters.set(sh.id, { ...sh }));

    // Seed routes
    SEED_ROUTES.forEach((r) => this.routes.set(r.id, { ...r }));

    // Seed contacts
    SEED_CONTACTS.forEach((c) => this.contacts.set(c.id, { ...c }));

    // Seed notification channels
    SEED_NOTIFICATION_CHANNELS.forEach((ch) => this.notificationChannels.set(ch.channel, { ...ch }));

    // Seed earthquake
    this.earthquakeEvents.push({ ...SEED_EARTHQUAKE_EVENT });
    SEED_GROUND_MOTION_SIGNALS.forEach((sig) => this.groundMotionSignals.push({ ...sig }));

    // Seed audit logs
    SEED_AUDIT_LOGS.forEach((log) => this.auditLogs.push({ ...log }));

    // Seed critical alert
    const alert = { ...INITIAL_CRITICAL_ALERT };
    this.alerts.set(alert.id, alert);
    this.alertVersions.set(alert.id, [{ ...alert }]);
  }

  public authenticate(email: string, pass: string): User | null {
    const user = this.users.get(email.toLowerCase().trim());
    if (!user) return null;
    const computed = hashPassword(pass, user.salt);
    if (computed === user.passwordHash) {
      const { passwordHash, salt, ...safeUser } = user;
      return safeUser;
    }
    return null;
  }

  public register(name: string, email: string, pass: string, role: 'citizen' | 'authority' = 'citizen'): User {
    const existing = this.users.get(email.toLowerCase().trim());
    if (existing) {
      throw new Error('User with this email already exists.');
    }
    const salt = crypto.randomBytes(16).toString('hex');
    const storedUser: StoredUser = {
      id: `usr-${Date.now().toString(36)}`,
      name,
      email: email.toLowerCase().trim(),
      role,
      salt,
      passwordHash: hashPassword(pass, salt),
    };
    this.users.set(storedUser.email, storedUser);
    const { passwordHash, salt: _, ...safeUser } = storedUser;
    return safeUser;
  }

  public addAuditLog(
    actorEmail: string,
    actorRole: User['role'],
    action: AuditLogItem['action'],
    entityId: string,
    summary: string,
    details?: Record<string, any>
  ): AuditLogItem {
    const payload = `${Date.now()}-${actorEmail}-${action}-${entityId}-${summary}`;
    const auditHash = crypto.createHash('sha256').update(payload).digest('hex');

    const item: AuditLogItem = {
      id: `log-${Date.now().toString(36)}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actorEmail,
      actorRole,
      action,
      entityId,
      summary,
      details,
      auditHash,
    };
    this.auditLogs.unshift(item);
    return item;
  }
}

export const db = new AegisDatabase();
