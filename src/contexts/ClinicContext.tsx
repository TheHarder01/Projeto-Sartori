import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Patient, Referral, ReferralStatus } from '@/types/clinic';

interface ClinicContextType {
  patients: Patient[];
  referrals: Referral[];
  addPatient: (patient: Omit<Patient, 'id' | 'createdAt'>) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  addReferral: (referral: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) => void;
  updateReferralStatus: (id: string, status: ReferralStatus) => void;
  deleteReferral: (id: string) => void;
}

const ClinicContext = createContext<ClinicContextType | null>(null);

const loadFromStorage = <T,>(key: string, fallback: T): T => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
};

export const ClinicProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [patients, setPatients] = useState<Patient[]>(() => loadFromStorage('clinic_patients', []));
  const [referrals, setReferrals] = useState<Referral[]>(() => loadFromStorage('clinic_referrals', []));

  useEffect(() => { localStorage.setItem('clinic_patients', JSON.stringify(patients)); }, [patients]);
  useEffect(() => { localStorage.setItem('clinic_referrals', JSON.stringify(referrals)); }, [referrals]);

  const addPatient = useCallback((data: Omit<Patient, 'id' | 'createdAt'>) => {
    const patient: Patient = { ...data, id: crypto.randomUUID(), createdAt: new Date().toISOString() };
    setPatients(prev => [...prev, patient]);
  }, []);

  const updatePatient = useCallback((id: string, data: Partial<Patient>) => {
    setPatients(prev => prev.map(p => p.id === id ? { ...p, ...data } : p));
  }, []);

  const deletePatient = useCallback((id: string) => {
    setPatients(prev => prev.filter(p => p.id !== id));
    setReferrals(prev => prev.filter(r => r.referrerId !== id));
  }, []);

  const addReferral = useCallback((data: Omit<Referral, 'id' | 'createdAt' | 'updatedAt'>) => {
    const now = new Date().toISOString();
    const referral: Referral = { ...data, id: crypto.randomUUID(), createdAt: now, updatedAt: now };
    setReferrals(prev => [...prev, referral]);
  }, []);

  const updateReferralStatus = useCallback((id: string, status: ReferralStatus) => {
    setReferrals(prev => prev.map(r => r.id === id ? { ...r, status, updatedAt: new Date().toISOString() } : r));
  }, []);

  const deleteReferral = useCallback((id: string) => {
    setReferrals(prev => prev.filter(r => r.id !== id));
  }, []);

  return (
    <ClinicContext.Provider value={{ patients, referrals, addPatient, updatePatient, deletePatient, addReferral, updateReferralStatus, deleteReferral }}>
      {children}
    </ClinicContext.Provider>
  );
};

export const useClinic = () => {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used within ClinicProvider');
  return ctx;
};
