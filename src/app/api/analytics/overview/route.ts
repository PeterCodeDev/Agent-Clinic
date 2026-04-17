import { NextResponse } from 'next/server';
import { db } from '../../../../lib/db';
import { patients, visits } from '../../../../lib/db/schema';
import { desc } from 'drizzle-orm';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
   const allPatients = await db.select().from(patients);
   const allVisits = await db.select().from(visits).orderBy(desc(visits.createdAt)).limit(100); 

   const activePatientsCount = allPatients.filter(p => p.status === 'active').length;
   
   let resolvedCount = 0;
   let unresolvedCount = 0;
   let openVisitsCount = 0;

   const ailmentDistribution: Record<string, number> = {};
   const severityDistribution: Record<string, number> = { "1": 0, "2": 0, "3": 0, "4": 0 };
   
   allVisits.forEach(v => {
       if (['RESOLVED'].includes(v.state)) resolvedCount++;
       if (['UNRESOLVED'].includes(v.state)) unresolvedCount++;
       if (['TRIAGE', 'DIAGNOSED', 'PRESCRIBED', 'AWAITING_FOLLOWUP'].includes(v.state)) openVisitsCount++;

       if (v.severity) severityDistribution[v.severity.toString()]++;
       
       if (v.diagnoses) {
          try {
             const diags = JSON.parse(v.diagnoses as string);
             diags.forEach((d: any) => {
                if (!ailmentDistribution[d.ailment_code]) ailmentDistribution[d.ailment_code] = 0;
                ailmentDistribution[d.ailment_code]++;
             });
          } catch(e) {}
       }
   });

   const resolutionRate = (resolvedCount + unresolvedCount) > 0 ? (resolvedCount / (resolvedCount + unresolvedCount)) : 0;

   return NextResponse.json({
       active_patients: activePatientsCount,
       open_visits: openVisitsCount,
       resolution_rate: resolutionRate,
       ailment_distribution: ailmentDistribution,
       severity_distribution: severityDistribution,
       recent_visits: allVisits.slice(0, 20)
   });
}
