CREATE TABLE `ailment_treatments` (
	`ailment_code` text NOT NULL,
	`treatment_code` text NOT NULL,
	`seed_effectiveness` real,
	`total_prescribed` integer DEFAULT 0,
	`total_resolved` integer DEFAULT 0,
	`total_unresolved` integer DEFAULT 0,
	`total_expired` integer DEFAULT 0,
	`effectiveness_score` real,
	`last_updated` text,
	PRIMARY KEY(`ailment_code`, `treatment_code`),
	FOREIGN KEY (`ailment_code`) REFERENCES `ailments`(`ailment_code`) ON UPDATE no action ON DELETE no action,
	FOREIGN KEY (`treatment_code`) REFERENCES `treatments`(`treatment_code`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `ailments` (
	`ailment_code` text PRIMARY KEY NOT NULL,
	`ailment_name` text NOT NULL,
	`category` text NOT NULL,
	`description` text NOT NULL,
	`symptom_patterns` text NOT NULL,
	`status` text DEFAULT 'verified',
	`severity_modifier` text,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `patients` (
	`patient_id` text PRIMARY KEY NOT NULL,
	`agent_name` text NOT NULL,
	`model` text,
	`framework` text,
	`version` text,
	`owner` text,
	`tags` text DEFAULT '[]',
	`environment` text,
	`registered_at` text NOT NULL,
	`last_visit` text,
	`visit_count` integer DEFAULT 0,
	`chronic_conditions` text DEFAULT '[]',
	`status` text DEFAULT 'active'
);
--> statement-breakpoint
CREATE TABLE `treatments` (
	`treatment_code` text PRIMARY KEY NOT NULL,
	`treatment_name` text NOT NULL,
	`description` text NOT NULL,
	`prescription_template` text NOT NULL,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `visits` (
	`visit_id` text PRIMARY KEY NOT NULL,
	`patient_id` text NOT NULL,
	`state` text NOT NULL,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	`symptom_text` text NOT NULL,
	`severity` integer,
	`diagnoses` text,
	`prescriptions` text,
	`followup_due` text,
	`followup_report` text,
	`recurrence_flag` integer DEFAULT false,
	`metadata` text,
	FOREIGN KEY (`patient_id`) REFERENCES `patients`(`patient_id`) ON UPDATE no action ON DELETE no action
);
