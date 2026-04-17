import { NextResponse } from 'next/server';
import { processFollowup } from '../../../../../lib/engine/followup';

export async function POST(request: Request, context: { params: Promise<{ id: string }> }) {
  const params = await context.params;
  const visitId = params.id;

  try {
    const body = await request.json();
    if (!body.outcome) {
      return NextResponse.json({ error: 'outcome is required' }, { status: 400 });
    }

    const visit = await processFollowup(visitId, body.outcome, body.outcome_text, body.metrics);
    
    const format = {
       ...visit,
       diagnoses: visit.diagnoses ? JSON.parse(visit.diagnoses) : [],
       prescriptions: visit.prescriptions ? JSON.parse(visit.prescriptions) : [],
       followupReport: visit.followupReport ? JSON.parse(visit.followupReport) : null
    };

    return NextResponse.json(format, { status: 200 });

  } catch (error: any) {
    if (error.message === 'visit_not_found') {
      return NextResponse.json({ error: 'Visit not found' }, { status: 404 });
    }
    if (error.message === 'visit_not_awaiting') {
      return NextResponse.json({ error: 'Visit already in terminal state' }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
