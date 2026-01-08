CREATE TABLE `domain_records` (
	`id` text PRIMARY KEY NOT NULL,
	`subdomain_id` text NOT NULL,
	`created_at` integer,
	`type` text NOT NULL,
	`value` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `domain_records_id_unique` ON `domain_records` (`id`);--> statement-breakpoint
CREATE TABLE `domains` (
	`id` text PRIMARY KEY NOT NULL,
	`subdomain` text NOT NULL,
	`created_at` integer,
	`approved` integer DEFAULT false NOT NULL,
	`owner_id` text NOT NULL
);
--> statement-breakpoint
CREATE UNIQUE INDEX `domains_id_unique` ON `domains` (`id`);--> statement-breakpoint
CREATE UNIQUE INDEX `domains_subdomain_unique` ON `domains` (`subdomain`);--> statement-breakpoint
ALTER TABLE `user` ADD `is_admin` integer DEFAULT false NOT NULL;