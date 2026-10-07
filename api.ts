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
import {
  INITIAL_CRITICAL_ALERT,
  SEED_SHELTERS,
  SEED_ROUTES,
  SEED_CONTACTS,
  SEED_NOTIFICATION_CHANNELS,
  SEED_EARTHQUAKE_EVENT,
  SEED_GROUND_MOTION_SIGNALS,
  SEED_AUDIT_LOGS,
} from '../data/seedData';

const CACHE_KEYS = {
  ALERTS: 'aegis_cache_alerts',
  SHELTERS: 'aegis_cache_shelters',
  ROUTES: 'aegis_cache_routes',
  CONTACTS: 'aegis_cache_contacts',
  LAST_SYNC: 'aegis_cache_last_sync',
  TOKEN: 'aegis_auth_token',
  USER: 'aegis_current_user',
};

class ApiService {
  private token: string | null = null;
  private isOffline: boolean = false;
  private lastSyncTime: string = new Date().toISOString();

  constructor() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem(CACHE_KEYS.TOKEN);
      this.isOffline = !navigator.onLine;

      window.addEventListener('online', () => {
        this.isOffline = false;
      });
      window.addEventListener('offline', () => {
        this.isOffline = true;
      });

      // Initialize offline cache if empty
      if (!localStorage.getItem(CACHE_KEYS.ALERTS)) {
        localStorage.setItem(CACHE_KEYS.ALERTS, JSON.stringify([INITIAL_CRITICAL_ALERT]));
        localStorage.setItem(CACHE_KEYS.SHELTERS, JSON.stringify(SEED_SHELTERS));
        localStorage.setItem(CACHE_KEYS.ROUTES, JSON.stringify(SEED_ROUTES));
        localStorage.setItem(CACHE_KEYS.CONTACTS, JSON.stringify(SEED_CONTACTS));
        localStorage.setItem(CACHE_KEYS.LAST_SYNC, this.lastSyncTime);
      }
    }
  }

  public setToken(token: string | null, user?: User) {
    this.token = token;
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem(CACHE_KEYS.TOKEN, token);
        if (user) localStorage.setItem(CACHE_KEYS.USER, JSON.stringify(user));
      } else {
        localStorage.removeItem(CACHE_KEYS.TOKEN);
        localStorage.removeItem(CACHE_KEYS.USER);
      }
    }
  }

  public getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const str = localStorage.getItem(CACHE_KEYS.USER);
    if (!str) return null;
    try {
      return JSON.parse(str);
    } catch {
      return null;
    }
  }

  public getIsOffline(): boolean {
    return this.isOffline;
  }

  public getLastSyncTime(): string {
    return localStorage.getItem(CACHE_KEYS.LAST_SYNC) || this.lastSyncTime;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as any),
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const res = await fetch(endpoint, {
        ...options,
        headers,
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || `Request failed with status ${res.status}`);
      }

      this.lastSyncTime = new Date().toISOString();
      if (typeof window !== 'undefined') {
        localStorage.setItem(CACHE_KEYS.LAST_SYNC, this.lastSyncTime);
      }

      return res.json();
    } catch (err) {
      console.warn(`[AEGIS Api] Request to ${endpoint} failed or offline:`, err);
      // Fallback to cache for read operations
      return this.getCachedFallback<T>(endpoint);
    }
  }

  private getCachedFallback<T>(endpoint: string): T {
    if (typeof window === 'undefined') throw new Error('Offline in SSR');

    if (endpoint.includes('/api/alerts')) {
      const cached = localStorage.getItem(CACHE_KEYS.ALERTS);
      return { alerts: cached ? JSON.parse(cached) : [INITIAL_CRITICAL_ALERT] } as T;
    }
    if (endpoint.includes('/api/shelters')) {
      const cached = localStorage.getItem(CACHE_KEYS.SHELTERS);
      return { shelters: cached ? JSON.parse(cached) : SEED_SHELTERS } as T;
    }
    if (endpoint.includes('/api/routes')) {
      const cached = localStorage.getItem(CACHE_KEYS.ROUTES);
      return { routes: cached ? JSON.parse(cached) : SEED_ROUTES } as T;
    }
    if (endpoint.includes('/api/contacts')) {
      const cached = localStorage.getItem(CACHE_KEYS.CONTACTS);
      return { contacts: cached ? JSON.parse(cached) : SEED_CONTACTS } as T;
    }

    throw new Error('Network error and no offline cache available for this action.');
  }

  // Auth
  public async login(email: string, pass: string): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    this.setToken(data.token, data.user);
    return data;
  }

  public async register(name: string, email: string, pass: string, role: string = 'citizen'): Promise<{ token: string; user: User }> {
    const data = await this.request<{ token: string; user: User }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password: pass, role }),
    });
    this.setToken(data.token, data.user);
    return data;
  }

  public logout() {
    this.setToken(null);
  }

  // Alerts
  public async getAlerts(): Promise<EmergencyAlert[]> {
    const data = await this.request<{ alerts: EmergencyAlert[] }>('/api/alerts');
    if (typeof window !== 'undefined' && data.alerts) {
      localStorage.setItem(CACHE_KEYS.ALERTS, JSON.stringify(data.alerts));
    }
    return data.alerts || [INITIAL_CRITICAL_ALERT];
  }

  public async getAlert(id: string): Promise<EmergencyAlert> {
    const data = await this.request<{ alert: EmergencyAlert }>(`/api/alerts/${id}`);
    return data.alert;
  }

  public async approveAlert(id: string): Promise<EmergencyAlert> {
    const data = await this.request<{ alert: EmergencyAlert }>(`/api/alerts/${id}/approve`, {
      method: 'POST',
    });
    return data.alert;
  }

  public async publishAlert(id: string): Promise<EmergencyAlert> {
    const data = await this.request<{ alert: EmergencyAlert }>(`/api/alerts/${id}/publish`, {
      method: 'POST',
    });
    return data.alert;
  }

  public async acknowledgeAlert(id: string, understood: boolean = true): Promise<{ success: boolean; disclaimer: string }> {
    return this.request<{ success: boolean; disclaimer: string }>(`/api/alerts/${id}/acknowledge`, {
      method: 'POST',
      body: JSON.stringify({ understood, disclaimerConfirmed: true }),
    });
  }

  public async getAlertDiff(id: string): Promise<AlertVersionDiff> {
    const data = await this.request<{ diff: AlertVersionDiff }>(`/api/alerts/${id}/diff`);
    return data.diff;
  }

  // Shelters, Routes, Contacts
  public async getShelters(): Promise<Shelter[]> {
    const data = await this.request<{ shelters: Shelter[] }>('/api/shelters');
    if (typeof window !== 'undefined' && data.shelters) {
      localStorage.setItem(CACHE_KEYS.SHELTERS, JSON.stringify(data.shelters));
    }
    return data.shelters || SEED_SHELTERS;
  }

  public async getRoutes(): Promise<SafeRoute[]> {
    const data = await this.request<{ routes: SafeRoute[] }>('/api/routes');
    if (typeof window !== 'undefined' && data.routes) {
      localStorage.setItem(CACHE_KEYS.ROUTES, JSON.stringify(data.routes));
    }
    return data.routes || SEED_ROUTES;
  }

  public async getContacts(): Promise<EmergencyContact[]> {
    const data = await this.request<{ contacts: EmergencyContact[] }>('/api/contacts');
    if (typeof window !== 'undefined' && data.contacts) {
      localStorage.setItem(CACHE_KEYS.CONTACTS, JSON.stringify(data.contacts));
    }
    return data.contacts || SEED_CONTACTS;
  }

  // Seismic
  public async getSeismicEvents(): Promise<{ events: EarthquakeEvent[]; safetyRule: string }> {
    return this.request<{ events: EarthquakeEvent[]; safetyRule: string }>('/api/seismic/event');
  }

  public async getGroundMotionSignals(): Promise<GroundMotionSignal[]> {
    const data = await this.request<{ signals: GroundMotionSignal[] }>('/api/seismic/ground-motion');
    return data.signals || SEED_GROUND_MOTION_SIGNALS;
  }

  public async sendDeviceMotionSignal(g: number, lat: number, lng: number): Promise<void> {
    await this.request('/api/seismic/signal', {
      method: 'POST',
      body: JSON.stringify({ peakAccelerationG: g, lat, lng }),
    });
  }

  // AI & Copilot
  public async analyzeAlertText(rawText: string) {
    return this.request<{ extraction: any }>('/api/ai/analyze-alert', {
      method: 'POST',
      body: JSON.stringify({ rawText }),
    });
  }

  public async queryCopilot(question: string, alertId?: string): Promise<string> {
    const data = await this.request<{ answer: string }>('/api/ai/copilot', {
      method: 'POST',
      body: JSON.stringify({ question, alertId }),
    });
    return data.answer;
  }

  // System Health & Audit
  public async getSystemHealth() {
    return this.request<{ status: string; components: Record<string, any> }>('/api/system/health');
  }

  public async getAuditLogs(): Promise<AuditLogItem[]> {
    const data = await this.request<{ logs: AuditLogItem[] }>('/api/audit/logs');
    return data.logs || SEED_AUDIT_LOGS;
  }

  // Demo Controls
  public async runFullEmergencyDemo(): Promise<{ success: boolean; alert: EmergencyAlert }> {
    return this.request<{ success: boolean; alert: EmergencyAlert }>('/api/demo/run-full-flow', {
      method: 'POST',
    });
  }

  public async resetState(): Promise<void> {
    await this.request('/api/demo/reset', { method: 'POST' });
  }
}

export const api = new ApiService();
