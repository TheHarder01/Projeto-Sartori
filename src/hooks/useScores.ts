import { useEffect, useState } from 'react';
import { PatientScore } from '@/types/clinic';
import { api } from '@/lib/api';

export const useScores = (month?: number, year?: number): PatientScore[] => {
  const [scores, setScores] = useState<PatientScore[]>([]);

  useEffect(() => {
    let active = true;

    const load = async () => {
      try {
        if (month === undefined || year === undefined) {
          const payload = await api.getRankingAll();
          if (active) setScores(payload.data as PatientScore[]);
          return;
        }

        const payload = await api.getRankingMonthly(month, year);
        if (active) setScores(payload.data as PatientScore[]);
      } catch {
        if (active) setScores([]);
      }
    };

    load();

    return () => {
      active = false;
    };
  }, [month, year]);

  return scores;
};
