export interface Patient {
  id: string;
  name: string;
  phone: string;
  email: string;
  cpf: string;
  birthDate: string;
  address: string;
  notes: string;
  createdAt: string;
}

export type ReferralStatus = 'indicado' | 'atendido' | 'fechado';

export interface Referral {
  id: string;
  referrerId: string; // patient who made the referral
  referredName: string;
  referredPhone: string;
  referredEmail: string;
  treatmentInterest: string;
  status: ReferralStatus;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export const TREATMENTS = [
  'Limpeza',
  'Clareamento',
  'Restauração',
  'Extração',
  'Canal',
  'Implante',
  'Prótese Fixa',
  'Prótese Removível',
  'Ortodontia',
  'Invisalign',
  'Facetas',
  'Lentes de Contato Dental',
  'Cirurgia Oral',
  'Periodontia',
  'Endodontia',
  'Harmonização Orofacial',
] as const;

export interface PatientScore {
  patientId: string;
  patientName: string;
  totalReferrals: number;
  attended: number;
  converted: number;
  points: number;
}
