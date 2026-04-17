import { db } from '../db';
import { ailmentTreatments, treatments, visits } from '../db/schema';
import { eq, desc } from 'drizzle-orm';

export async function prepareTreatmentCandidates(diagnoses: any[], patientId: string) {
  const latestVisits = await db.select().from(visits)
    .where(eq(visits.patientId, patientId))
    .orderBy(desc(visits.createdAt))
    .limit(20);

  const candidates = [];

  for (const d of diagnoses) {
    const ats = await db.select({
      treatmentCode: ailmentTreatments.treatmentCode,
      effectivenessScore: ailmentTreatments.effectivenessScore,
      seedEffectiveness: ailmentTreatments.seedEffectiveness,
      treatmentName: treatments.treatmentName
    }).from(ailmentTreatments)
      .innerJoin(treatments, eq(treatments.treatmentCode, ailmentTreatments.treatmentCode))
      .where(eq(ailmentTreatments.ailmentCode, d.ailment_code));

    const ranked = ats.map(at => {
      let score = at.effectivenessScore;
      if (score === null || score === undefined) {
        score = at.seedEffectiveness || 0; 
      }
      return { ...at, score };
    }).sort((a, b) => b.score - a.score);

    const annotatedTreatments = ranked.map(at => {
      let recentlyFailed = false;
      let exhausted = false;
      let prescribes = 0;
      let resolves = 0;

      for (const v of latestVisits) {
        if (!v.diagnoses || !v.prescriptions) continue;
        // @ts-ignore
        const vDiags = JSON.parse(v.diagnoses as string);
        // @ts-ignore
        const vPrescs = JSON.parse(v.prescriptions as string);
        
        const matchingDiag = vDiags.find((xd: any) => xd.ailment_code === d.ailment_code);
        const matchingPresc = vPrescs.find((xp: any) => xp.treatment_code === at.treatmentCode && xp.ailment_code === d.ailment_code);
        
        if (matchingDiag && matchingPresc) {
          prescribes++;
          if (v.state === 'RESOLVED') resolves++;
          if (v.state === 'UNRESOLVED') {
            const timeDiff = Date.now() - new Date(v.createdAt).getTime();
            if (timeDiff < 7 * 24 * 60 * 60 * 1000) recentlyFailed = true;
          }
        }
      }

      if (prescribes >= 3 && (resolves / prescribes) < 0.3) {
        exhausted = true;
      }

      return {
        treatment_code: at.treatmentCode,
        treatment_name: at.treatmentName,
        effectiveness_score: at.score,
        recently_failed: recentlyFailed,
        exhausted: exhausted
      };
    });

    candidates.push({
      ailment_code: d.ailment_code,
      ranked_treatments: annotatedTreatments
    });
  }

  return candidates;
}
