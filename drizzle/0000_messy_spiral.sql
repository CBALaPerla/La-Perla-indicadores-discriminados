CREATE TABLE `weekly_records` (
	`id` text PRIMARY KEY NOT NULL,
	`year` integer NOT NULL,
	`month` integer NOT NULL,
	`week` integer NOT NULL,
	`week_label` text NOT NULL,
	`values_json` text NOT NULL,
	`month_closed` integer DEFAULT false NOT NULL,
	`revision` integer DEFAULT 1 NOT NULL,
	`updated_at` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `weekly_records_period` ON `weekly_records` (`year`,`month`,`week`);