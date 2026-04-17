import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { patients } from '../../../lib/db/schema';
import { v4 as uuidv4 } from 'uuid';
import { eq, and } from 'drizzle-orm';

export async function GET(request: Request) {
  const allPatients = await db.select().from(patients);
  return NextResponse.json({ patients: allPatients, total: allPatients.length });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.agent_name) {
    return NextResponse.json({ error: 'agent_name is required' }, { status: 400 });
  }

  // check existing
  if (body.owner) {
    const existing = await db.select().from(patients).where(and(
      eq(patients.agentName, body.agent_name),
      eq(patients.owner, body.owner)
    )).limit(1);
    if (existing.length > 0) {
       return NextResponse.json(existing[0], { status: 200 });
    }
  }

  const patientId = 'p_' + uuidv4().replace(/-/g, '').substring(0, 10);
  await db.insert(patients).values({
    patientId,
    agentName: body.agent_name,
    model: body.model || null,
    framework: body.framework || null,
    version: body.version || null,
    owner: body.owner || null,
    tags: body.tags ? JSON.stringify(body.tags) : '[]',
    environment: body.environment ? JSON.stringify(body.environment) : null,
    registeredAt: new Date().toISOString(),
    status: 'active'
  });

  const p = await db.select().from(patients).where(eq(patients.patientId, patientId));
  return NextResponse.json(p[0], { status: 201 });
}
