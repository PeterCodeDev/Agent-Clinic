import { db } from './db';
import { visits } from './db/schema';
import { eq, and, lt } from 'drizzle-orm';
import { eventEmitter } from './events';

export function initBackgroundJobs() {
  const intervalMins = parseInt(process.env.EXPIRE_CHECK_INTERVAL_MINUTES || '15', 10);
  
  setInterval(async () => {
    try {
      const now = new Date().toISOString();
      const expiredVisits = await db.select().from(visits)
        .where(and(
           eq(visits.state, 'AWAITING_FOLLOWUP'),
           lt(visits.followupDue, now)
        ));

      for (const v of expiredVisits) {
        await db.update(visits).set({
          state: 'EXPIRED',
          followupReport: JSON.stringify({ outcome: 'unknown', submitted_at: now }),
          updatedAt: now
        }).where(eq(visits.visitId, v.visitId));

        eventEmitter.emit('visit_resolved', { visit_id: v.visitId, outcome: 'unknown', state: 'EXPIRED' });
      }
    } catch(err) {
      console.error("Background job error: ", err);
    }
  }, intervalMins * 60 * 1000);
}
