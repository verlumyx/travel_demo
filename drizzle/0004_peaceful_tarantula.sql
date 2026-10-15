CREATE TABLE "app_system_logs" (
	"id" uuid PRIMARY KEY NOT NULL,
	"level" varchar(20) DEFAULT 'error' NOT NULL,
	"source" varchar(100) DEFAULT 'system' NOT NULL,
	"message" text NOT NULL,
	"error_name" varchar(150),
	"stack" text,
	"path" varchar(500),
	"action" varchar(100),
	"context" jsonb,
	"ip" varchar(100),
	"user_agent" varchar(500),
	"status" varchar(50) DEFAULT 'unread' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "app_payments" ALTER COLUMN "method" SET DATA TYPE varchar(150);--> statement-breakpoint
CREATE INDEX "idx_app_system_logs_level" ON "app_system_logs" USING btree ("level");--> statement-breakpoint
CREATE INDEX "idx_app_system_logs_source" ON "app_system_logs" USING btree ("source");--> statement-breakpoint
CREATE INDEX "idx_app_system_logs_status" ON "app_system_logs" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_app_system_logs_created_at" ON "app_system_logs" USING btree ("created_at");--> statement-breakpoint
ALTER TABLE "app_categories" DROP COLUMN "image_url";