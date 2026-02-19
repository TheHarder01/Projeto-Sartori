import { Patient, Referral, ReferralStatus } from '@/types/clinic';

const API_BASE = (window as any).__SARTORI_API__ || 'http://localhost:7070';

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${url}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options,
  });

  if (!response.ok) {
    let message = `Erro ${response.status}`;
    try {
      const payload = await response.json();
      if (payload?.error) message = payload.error;
    } catch {
      // ignore parse error
    }
    throw new Error(message);
  }

  return response.json() as Promise<T>;
}

export const api = {
  health: () => req<{ ok: boolean; username: string; dataDir: string }>('/api/health'),

  getPatients: () => req<Patient[]>('/api/pacientes'),
  createPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) =>
    req<Patient>('/api/pacientes', { method: 'POST', body: JSON.stringify(patient) }),
  updatePatient: (id: string, patient: Partial<Patient>) =>
    req<Patient>(`/api/pacientes/${id}`, { method: 'PUT', body: JSON.stringify(patient) }),
  deletePatient: (id: string) => req<{ ok: boolean }>(`/api/pacientes/${id}`, { method: 'DELETE' }),

  getReferrals: () => req<Referral[]>('/api/indicacoes'),
  createReferral: (referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) =>
    req<Referral>('/api/indicacoes', { method: 'POST', body: JSON.stringify(referral) }),
  updateReferral: (id: string, referral: Partial<Referral>) =>
    req<Referral>(`/api/indicacoes/${id}`, { method: 'PUT', body: JSON.stringify(referral) }),
  updateReferralStatus: (id: string, status: ReferralStatus) =>
    req<Referral>(`/api/indicacoes/${id}`, { method: 'PUT', body: JSON.stringify({ status }) }),
  deleteReferral: (id: string) => req<{ ok: boolean }>(`/api/indicacoes/${id}`, { method: 'DELETE' }),

  getRankingMonthly: (month: number, year: number) =>
    req<{ key: string; generatedAt: string; data: any[] }>(`/api/ranking/mensal?month=${month}&year=${year}`),
  getRankingAll: () => req<{ generatedAt: string; data: any[] }>('/api/ranking/all'),
};
