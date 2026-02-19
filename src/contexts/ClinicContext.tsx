import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Patient, Referral, ReferralStatus } from '@/types/clinic';
import { api } from '@/lib/api';

interface ClinicContextType {
  patients: Patient[];
  referrals: Referral[];
  loading: boolean;
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => Promise<void>;
  updatePatient: (id: string, data: Partial<Patient>) => Promise<void>;
  deletePatient: (id: string) => Promise<void>;
  addReferral: (referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) => Promise<void>;
  updateReferralStatus: (id: string, status: ReferralStatus) => Promise<void>;
  deleteReferral: (id: string) => Promise<void>;
  refreshAll: () => Promise<void>;
}

const ClinicContext = createContext<ClinicContextType | null>(null);

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshAll = useCallback(async () => {
    const [patientsData, referralsData] = await Promise.all([api.getPatients(), api.getReferrals()]);
    setPatients(patientsData);
    setReferrals(referralsData);
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        await refreshAll();
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [refreshAll]);

  const addPatient = useCallback(async (data: Omit<Patient, 'id' | 'createdAt'>) => {
    const created = await api.createPatient(data);
    setPatients((prev) => [...prev, created]);
  }, []);

  const updatePatient = useCallback(async (id: string, data: Partial<Patient>) => {
    const updated = await api.updatePatient(id, data);
    setPatients((prev) => prev.map((p) => (p.id === id ? updated : p)));
  }, []);

  const deletePatient = useCallback(async (id: string) => {
    await api.deletePatient(id);
    setPatients((prev) => prev.filter((p) => p.id !== id));
    setReferrals((prev) => prev.filter((r) => r.referrerId !== id));
  }, []);

  const addReferral = useCallback(async (data: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) => {
    const created = await api.createReferral(data);
    setReferrals((prev) => [...prev, created]);
  }, []);

  const updateReferralStatus = useCallback(async (id: string, status: ReferralStatus) => {
    const updated = await api.updateReferralStatus(id, status);
    setReferrals((prev) => prev.map((r) => (r.id === id ? updated : r)));
  }, []);

  const deleteReferral = useCallback(async (id: string) => {
    await api.deleteReferral(id);
    setReferrals((prev) => prev.filter((r) => r.id !== id));
  }, []);

  return (
    <ClinicContext.Provider
      value={{
        patients,
        referrals,
        loading,
        addPatient,
        updatePatient,
        deletePatient,
        addReferral,
        updateReferralStatus,
        deleteReferral,
        refreshAll,
      }}
    >
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used within ClinicProvider');
  return ctx;
};
