import { NextResponse } from 'next/server';
import { processVisit } from '../../../lib/engine/pipeline';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    if (!body.patient_id || !body.symptom_text) {
      return NextResponse.json({ error: 'patient_id and symptom_text are required' }, { status: 400 });
    }

    const visit = await processVisit(body.patient_id, body.symptom_text, body.metadata);
    
    // Convert string JSONs back to objects for the API response
    const format = {
       ...visit,
       diagnoses: visit.diagnoses ? JSON.parse(visit.diagnoses) : [],
       prescriptions: visit.prescriptions ? JSON.parse(visit.prescriptions) : []
    };

    return NextResponse.json(format, { status: 200 });

  } catch (error: any) {
    if (error.message === 'patient_not_found') {
      return NextResponse.json({ error: 'Patient not found' }, { status: 404 });
    }
    if (error.message === 'patient_suspended') {
      return NextResponse.json({ error: 'Patient suspended' }, { status: 410 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
