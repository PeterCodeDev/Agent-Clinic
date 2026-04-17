import { sqliteTable, text, integer, real, primaryKey } from 'drizzle-orm/sqlite-core';

export const patients = sqliteTable('patients', {
  patientId: text('patient_id').primaryKey(), // UUID
  agentName: text('agent_name').notNull(),
  model: text('model'),
  framework: text('framework'),
  version: text('version'),
  owner: text('owner'),
  tags: text('tags').default('[]'), // JSON array
  environment: text('environment'), // JSON object
  registeredAt: text('registered_at').notNull(), // ISO 8601
  lastVisit: text('last_visit'),
  visitCount: integer('visit_count').default(0),
  chronicConditions: text('chronic_conditions').default('[]'),
  status: text('status').default('active'), // active, discharged, suspended
});

export const visits = sqliteTable('visits', {
  visitId: text('visit_id').primaryKey(),
  patientId: text('patient_id').notNull().references(() => patients.patientId),
  state: text('state').notNull(), // TRIAGE, DIAGNOSED, PRESCRIBED, AWAITING_FOLLOWUP, RESOLVED, UNRESOLVED, EXPIRED
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
  symptomText: text('symptom_text').notNull(),
  severity: integer('severity'), // 1-4
  diagnoses: text('diagnoses'), // JSON array of Diagnosis objects
  prescriptions: text('prescriptions'), // JSON array of Prescription objects
  followupDue: text('followup_due'),
  followupReport: text('followup_report'), // JSON FollowupReport object
  recurrenceFlag: integer('recurrence_flag', { mode: 'boolean' }).default(false),
  metadata: text('metadata'), // JSON
});

export const ailments = sqliteTable('ailments', {
  ailmentCode: text('ailment_code').primaryKey(),
  ailmentName: text('ailment_name').notNull(),
  category: text('category').notNull(),
  description: text('description').notNull(),
  symptomPatterns: text('symptom_patterns').notNull(), // JSON array
  status: text('status').default('verified'), // verified, unverified, auto_detected
  severityModifier: text('severity_modifier'), // JSON
  createdAt: text('created_at').notNull(),
});

export const treatments = sqliteTable('treatments', {
  treatmentCode: text('treatment_code').primaryKey(),
  treatmentName: text('treatment_name').notNull(),
  description: text('description').notNull(),
  prescriptionTemplate: text('prescription_template').notNull(), // JSON
  createdAt: text('created_at').notNull(),
});

export const ailmentTreatments = sqliteTable('ailment_treatments', {
  ailmentCode: text('ailment_code').notNull().references(() => ailments.ailmentCode),
  treatmentCode: text('treatment_code').notNull().references(() => treatments.treatmentCode),
  seedEffectiveness: real('seed_effectiveness'),
  totalPrescribed: integer('total_prescribed').default(0),
  totalResolved: integer('total_resolved').default(0),
  totalUnresolved: integer('total_unresolved').default(0),
  totalExpired: integer('total_expired').default(0),
  effectivenessScore: real('effectiveness_score'),
  lastUpdated: text('last_updated'),
}, (table) => {
  return {
    pk: primaryKey({ columns: [table.ailmentCode, table.treatmentCode] })
  };
});
