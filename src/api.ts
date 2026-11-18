import type {
  AppSettings,
  AppState,
  DocumentItem,
  JobApplication,
  MessageTemplate,
} from './types';

const TOKEN_KEY = 'karirtrack_session';

function getStoredToken(): string {
  return localStorage.getItem(TOKEN_KEY) || '';
}

function setStoredToken(token: string): void {
  if (token) {
    localStorage.setItem(TOKEN_KEY, token);
  } else {
    localStorage.removeItem(TOKEN_KEY);
  }
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getStoredToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`/api${path}`, {
    headers,
    ...options,
  });
  const data = await res.json();
  if (!res.ok) {
    if (res.status === 401 && !path.startsWith('/auth/')) {
      setStoredToken('');
      window.location.reload();
      throw new Error('Sesi habis, memuat ulang...');
    }
    throw new Error(data?.error || `HTTP ${res.status}`);
  }
  return data as T;
}

export interface AuthStatus {
  hasAuth: boolean;
  authenticated: boolean;
  displayName: string;
}

export interface AuthSession {
  session: { token: string; expiresAt: string };
  displayName: string;
}

export const api = {
  getAuthStatus: () => request<AuthStatus>('/auth/status'),

  setupAuth: (pin: string, displayName: string) =>
    request<AuthSession>('/auth/setup', {
      method: 'POST',
      body: JSON.stringify({ pin, displayName }),
    }),

  login: (pin: string) =>
    request<AuthSession>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ pin }),
    }),

  logout: () =>
    request<{ ok: boolean }>('/auth/logout', {
      method: 'POST',
    }),

  changePin: (currentPin: string, newPin: string) =>
    request<{ ok: boolean }>('/auth/change-pin', {
      method: 'POST',
      body: JSON.stringify({ currentPin, newPin }),
    }),

  removeAuth: () =>
    request<{ ok: boolean }>('/auth/remove', {
      method: 'POST',
    }),

  setToken: setStoredToken,
  getToken: getStoredToken,

  getState: () => request<AppState>('/state'),

  saveSettings: (partial: Partial<AppSettings>) =>
    request<{ settings: AppSettings }>('/settings', {
      method: 'PUT',
      body: JSON.stringify(partial),
    }),

  createJob: (payload: Partial<JobApplication>) =>
    request<{ job: JobApplication }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),

  updateJob: (id: string, payload: Partial<JobApplication> & { stageNote?: string }) =>
    request<{ job: JobApplication }>(`/jobs/${encodeURIComponent(id)}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),

  deleteJob: (id: string) =>
    request<{ ok: boolean }>(`/jobs/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  bulkJobs: (action: 'delete' | 'stage', ids: string[], stage?: string) =>
    request<{ jobs: JobApplication[] }>('/jobs/bulk', {
      method: 'POST',
      body: JSON.stringify({ action, ids, stage }),
    }),

  saveDocument: (doc: Partial<DocumentItem>) =>
    request<{ documents: DocumentItem[] }>(
      doc.id ? `/documents/${encodeURIComponent(doc.id)}` : '/documents',
      {
        method: doc.id ? 'PUT' : 'POST',
        body: JSON.stringify(doc),
      }
    ),

  deleteDocument: (id: string) =>
    request<{ documents: DocumentItem[] }>(`/documents/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  saveTemplate: (tpl: Partial<MessageTemplate>) =>
    request<{ templates: MessageTemplate[] }>(
      tpl.id ? `/templates/${encodeURIComponent(tpl.id)}` : '/templates',
      {
        method: tpl.id ? 'PUT' : 'POST',
        body: JSON.stringify(tpl),
      }
    ),

  deleteTemplate: (id: string) =>
    request<{ templates: MessageTemplate[] }>(`/templates/${encodeURIComponent(id)}`, {
      method: 'DELETE',
    }),

  resetAllJobs: () =>
    request<AppState>('/system/reset', {
      method: 'POST',
    }),

  loadSampleData: () =>
    request<AppState>('/system/seed', {
      method: 'POST',
    }),

  importBackup: (backup: unknown) =>
    request<AppState>('/system/import', {
      method: 'POST',
      body: JSON.stringify(backup),
    }),
};
