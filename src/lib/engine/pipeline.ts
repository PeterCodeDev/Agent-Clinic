import { v4 as uuidv4 } from 'uuid';
import { db } from '../db';
import { patients, visits } from '../db/schema';
import { eq } from 'drizzle-orm';
import { runTriageAndDiagnosis } from './triage';
import { prepareTreatmentCandidates } from './treatment-selection';
import { runPrescription } from './prescription';
import { eventEmitter } from '../events';

export async function processVisit(patientId: string, symptomText: string, metadata?: any) {
  const patientRec = await db.select().from(patients).where(eq(patients.patientId, patientId)).limit(1);
  if (patientRec.length === 0) throw new Error('patient_not_found');
  if (patientRec[0].status !== 'active') throw new Error('patient_suspended');

  const visitId = 'v_' + uuidv4().replace(/-/g, '').substring(0, 10);
  const now = new Date().toISOString();

  await db.insert(visits).values({
    visitId,
    patientId,
    state: 'TRIAGE',
    createdAt: now,
    updatedAt: now,
    symptomText,
    metadata: metadata ? JSON.stringify(metadata) : null,
  });

  const patientContext = {
    agentName: patientRec[0].agentName,
    model: patientRec[0].model,
    framework: patientRec[0].framework,
    environment: patientRec[0].environment ? JSON.parse(patientRec[0].environment) : {}
  };

  try {
    const triageResult = await runTriageAndDiagnosis(symptomText, patientId);
    
    await db.update(visits).set({
      state: 'DIAGNOSED',
      severity: triageResult.severity,
      diagnoses: JSON.stringify(triageResult.candidates || []),
      updatedAt: new Date().toISOString()
    }).where(eq(visits.visitId, visitId));

    if (!triageResult.candidates || triageResult.candidates.length === 0) {
      return await finalizeVisit(visitId, triageResult.severity, [], []);
    }

    const confCandidates = triageResult.candidates.filter((c: any) => c.confidence >= 0.4);
    if (confCandidates.length === 0) {
        return await finalizeVisit(visitId, triageResult.severity, triageResult.candidates, []);
    }

    const treatmentCandidatesList = await prepareTreatmentCandidates(confCandidates, patientId);
    const prescResult = await runPrescription(confCandidates, treatmentCandidatesList, patientContext);

    return await finalizeVisit(visitId, triageResult.severity, confCandidates, prescResult.prescriptions || []);

  } catch (error) {
     console.error("Pipeline failure: ", error);
     throw error;
  }
}

async function finalizeVisit(visitId: string, severity: number, diagnoses: any[], prescriptions: any[]) {
    const followupDue = new Date(Date.now() + 72 * 60 * 60 * 1000).toISOString();
    
    await db.update(visits).set({
        state: 'AWAITING_FOLLOWUP',
        severity,
        diagnoses: JSON.stringify(diagnoses),
        prescriptions: JSON.stringify(prescriptions),
        followupDue,
        updatedAt: new Date().toISOString()
    }).where(eq(visits.visitId, visitId));

    const v = await db.select().from(visits).where(eq(visits.visitId, visitId));
    eventEmitter.emit('visit_created', { visit_id: visitId, patient_id: v[0].patientId, severity });
    return v[0];
}
