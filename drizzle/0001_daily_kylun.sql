CREATE TABLE `admin_attempts` (
	`owner_id` text PRIMARY KEY NOT NULL,
	`started_at` integer NOT NULL,
	`attempts` integer DEFAULT 0 NOT NULL
);
--> statement-breakpoint
CREATE TABLE `admin_sessions` (
	`token_hash` text PRIMARY KEY NOT NULL,
	`owner_id` text NOT NULL,
	`expires_at` integer NOT NULL
);
--> statement-breakpoint
CREATE TABLE `annual_datasets` (
	`year` integer PRIMARY KEY NOT NULL,
	`filename` text NOT NULL,
	`file_key` text NOT NULL,
	`data_json` text NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
