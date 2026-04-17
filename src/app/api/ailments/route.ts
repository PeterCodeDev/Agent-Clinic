import { NextResponse } from 'next/server';
import { db } from '../../../lib/db';
import { ailments } from '../../../lib/db/schema';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const category = searchParams.get('category');
  const status = searchParams.get('status');

  let results = await db.select().from(ailments);
  if (category) results = results.filter(a => a.category === category);
  if (status) results = results.filter(a => a.status === status);

  return NextResponse.json({ ailments: results });
}

export async function POST(request: Request) {
  const body = await request.json();
  if (!body.ailment_code || !body.ailment_name || !body.category || !body.description || !body.symptom_patterns) {
    return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
  }

  try {
     await db.insert(ailments).values({
        ailmentCode: body.ailment_code,
        ailmentName: body.ailment_name,
        category: body.category,
        description: body.description,
        symptomPatterns: JSON.stringify(body.symptom_patterns),
        status: 'unverified',
        createdAt: new Date().toISOString()
     });
     return NextResponse.json({ ailment_code: body.ailment_code, status: 'unverified' }, { status: 201 });
  } catch (err: any) {
     return NextResponse.json({ error: 'Conflict - Code already exists' }, { status: 409 });
  }
}
