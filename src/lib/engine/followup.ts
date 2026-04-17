import { db } from '../db';
import { visits, ailmentTreatments } from '../db/schema';
import { eq, and } from 'drizzle-orm';
import { eventEmitter } from '../events';

export async function processFollowup(visitId: string, outcome: string, outcomeText?: string, metrics?: any) {
  const v = await db.select().from(visits).where(eq(visits.visitId, visitId)).limit(1);
  if (v.length === 0) throw new Error('visit_not_found');
  if (v[0].state !== 'AWAITING_FOLLOWUP') throw new Error('visit_not_awaiting');

  let newState = 'UNRESOLVED';
  if (outcome === 'improved') newState = 'RESOLVED';
  if (outcome === 'unknown') newState = 'EXPIRED';

  const report = {
    submitted_at: new Date().toISOString(),
    outcome,
    outcome_text: outcomeText || null,
    metrics: metrics || null
  };

  await db.update(visits).set({
    state: newState,
    followupReport: JSON.stringify(report),
    updatedAt: new Date().toISOString()
  }).where(eq(visits.visitId, visitId));

  if (newState !== 'EXPIRED' && v[0].diagnoses && v[0].prescriptions) {
    // @ts-ignore
    const diags = JSON.parse(v[0].diagnoses);
    // @ts-ignore
    const prescs = JSON.parse(v[0].prescriptions);

    for (const d of diags) {
      const presc = prescs.find((p: any) => p.ailment_code === d.ailment_code || (!p.deferred && !p.referral)); 
      
      if (presc && !presc.deferred && !presc.referral) {
        const at = await db.select().from(ailmentTreatments)
          .where(and(
            eq(ailmentTreatments.ailmentCode, d.ailment_code),
            eq(ailmentTreatments.treatmentCode, presc.treatment_code)
          )).limit(1);

        if (at.length > 0) {
          const t = at[0];
          let res = t.totalResolved || 0;
          let unres = t.totalUnresolved || 0;

          if (newState === 'RESOLVED') res++;
          if (newState === 'UNRESOLVED') unres++;

          const n = res + unres;
          let effScore = null;
          if (n >= 5) {
            const seed = t.seedEffectiveness || 0;
            effScore = (seed * 5 + res) / (5 + n); 
          }

          await db.update(ailmentTreatments).set({
             totalResolved: res,
             totalUnresolved: unres,
             totalPrescribed: (t.totalPrescribed || 0) + 1,
             effectivenessScore: effScore,
             lastUpdated: new Date().toISOString()
          }).where(and(eq(ailmentTreatments.ailmentCode, d.ailment_code), eq(ailmentTreatments.treatmentCode, presc.treatment_code)));
        }
      }
    }
  }

  const finalV = await db.select().from(visits).where(eq(visits.visitId, visitId));
  eventEmitter.emit('visit_resolved', { visit_id: visitId, patient_id: v[0].patientId, outcome });
  return finalV[0];
}
