CREATE TABLE "app_payment_methods" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(150) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"instructions" text NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_payment_methods_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE UNIQUE INDEX "idx_payment_methods_code" ON "app_payment_methods" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_status" ON "app_payment_methods" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_payment_methods_currency" ON "app_payment_methods" USING btree ("currency");