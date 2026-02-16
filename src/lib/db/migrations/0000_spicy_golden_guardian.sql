CREATE TABLE `emails` (
	`id` text PRIMARY KEY NOT NULL,
	`thread_id` text,
	`subject` text,
	`from_address` text,
	`date` text,
	`snippet` text,
	`body_text` text,
	`has_pdf` integer DEFAULT false,
	`pdf_filename` text,
	`pdf_text` text,
	`processed` integer DEFAULT false,
	`created_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `gmail_tokens` (
	`id` integer PRIMARY KEY AUTOINCREMENT NOT NULL,
	`access_token` text NOT NULL,
	`refresh_token` text NOT NULL,
	`expiry_date` integer NOT NULL,
	`email` text NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE TABLE `renewal_packs` (
	`id` text PRIMARY KEY NOT NULL,
	`renewal_id` text NOT NULL,
	`content` text NOT NULL,
	`created_at` text NOT NULL,
	FOREIGN KEY (`renewal_id`) REFERENCES `renewals`(`id`) ON UPDATE no action ON DELETE no action
);
--> statement-breakpoint
CREATE TABLE `renewals` (
	`id` text PRIMARY KEY NOT NULL,
	`email_id` text,
	`category` text,
	`provider` text,
	`policy_number` text,
	`renewal_date` text,
	`premium_annual` real,
	`premium_monthly` real,
	`currency` text DEFAULT 'GBP',
	`status` text DEFAULT 'upcoming',
	`raw_extraction` text,
	`evidence_category` text,
	`evidence_provider` text,
	`evidence_policy` text,
	`evidence_date` text,
	`evidence_premium` text,
	`created_at` text NOT NULL,
	`updated_at` text NOT NULL,
	FOREIGN KEY (`email_id`) REFERENCES `emails`(`id`) ON UPDATE no action ON DELETE no action
);
