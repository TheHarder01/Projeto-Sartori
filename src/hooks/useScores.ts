import { useMemo } from 'react';
import { useClinic } from '@/contexts/ClinicContext';
import { PatientScore } from '@/types/clinic';

export const useScores = (month?: number, year?: number): PatientScore[] => {
  const { patients, referrals } = useClinic();

  return useMemo(() => {
    const scoreMap = new Map<string, PatientScore>();

    patients.forEach((patient) => {
      scoreMap.set(patient.id, {
        patientId: patient.id,
        patientName: patient.name,
        totalReferrals: 0,
        attended: 0,
        converted: 0,
        points: 0,
      });
    });

    const filteredReferrals = referrals.filter((referral) => {
      if (month === undefined || year === undefined) return true;
      const date = new Date(referral.createdAt);
      return date.getMonth() === month && date.getFullYear() === year;
    });

    filteredReferrals.forEach((referral) => {
      const score = scoreMap.get(referral.referrerId);
      if (!score) return;

      score.totalReferrals += 1;

      if (referral.status === 'atendido') {
        score.attended += 1;
        score.points += 1;
      }

      if (referral.status === 'fechado') {
        score.converted += 1;
        score.points += 31;
      }
    });

    return Array.from(scoreMap.values())
      .filter((score) => score.totalReferrals > 0)
      .sort((a, b) => b.points - a.points || b.converted - a.converted || b.attended - a.attended || b.totalReferrals - a.totalReferrals || a.patientName.localeCompare(b.patientName));
  }, [patients, referrals, month, year]);
};
