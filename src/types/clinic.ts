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
  'LIMPEZA / PROFILAXIA',
  'CLAREAMENTO DENTAL',
  'RESTAURAÇÃO',
  'EXTRAÇÃO',
  'CANAL',
  'IMPLANTE DENTÁRIO',
  'PRÓTESE FIXA',
  'PRÓTESE REMOVÍVEL',
  'ORTODONTIA (APARELHO)',
  'INVISALIGN',
  'FACETAS DE PORCELANA',
  'LENTES DE CONTATO DENTAL',
  'CIRURGIA ORAL',
  'PERIODONTIA',
  'ENDODONTIA',
  'HARMONIZAÇÃO OROFACIAL',
] as const;

export interface PatientScore {
  patientId: string;
  patientName: string;
  totalReferrals: number;
  attended: number;
  converted: number;
  points: number;
}
