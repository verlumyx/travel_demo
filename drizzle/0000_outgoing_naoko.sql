CREATE TABLE "app_roles" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(100) NOT NULL,
	"description" varchar(255),
	"permission_type" varchar(50) DEFAULT 'custom' NOT NULL,
	"permissions" jsonb DEFAULT '[]'::jsonb NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_roles_name_unique" UNIQUE("name")
);
--> statement-breakpoint
CREATE TABLE "app_users" (
	"id" uuid PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"email" varchar(255) NOT NULL,
	"password" varchar(255) NOT NULL,
	"role_id" uuid NOT NULL,
	"phone" varchar(50),
	"avatar_url" varchar(500),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"last_login_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "account" (
	"id" text PRIMARY KEY NOT NULL,
	"account_id" text NOT NULL,
	"provider_id" text NOT NULL,
	"user_id" text NOT NULL,
	"access_token" text,
	"refresh_token" text,
	"id_token" text,
	"access_token_expires_at" timestamp with time zone,
	"refresh_token_expires_at" timestamp with time zone,
	"scope" text,
	"password" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "session" (
	"id" text PRIMARY KEY NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"token" text NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"ip_address" text,
	"user_agent" text,
	"user_id" text NOT NULL,
	CONSTRAINT "session_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"email_verified" boolean DEFAULT false NOT NULL,
	"image" text,
	"role" text DEFAULT 'operator' NOT NULL,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "verification" (
	"id" text PRIMARY KEY NOT NULL,
	"identifier" text NOT NULL,
	"value" text NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_categories" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(100) NOT NULL,
	"slug" varchar(100) NOT NULL,
	"description" text,
	"icon" varchar(100),
	"image_url" varchar(500),
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_categories_code_unique" UNIQUE("code"),
	CONSTRAINT "app_categories_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "app_destinations" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"category_id" uuid,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"image_url" varchar(500),
	"state" varchar(100),
	"city" varchar(100),
	"country" varchar(100) DEFAULT 'Venezuela' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_destinations_code_unique" UNIQUE("code"),
	CONSTRAINT "app_destinations_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "app_tours" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"slug" varchar(255) NOT NULL,
	"description" text,
	"short_description" varchar(500),
	"image_url" varchar(500),
	"duration_days" integer DEFAULT 1 NOT NULL,
	"base_price" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"includes_food" boolean DEFAULT false NOT NULL,
	"includes_lodging" boolean DEFAULT false NOT NULL,
	"inclusions" text,
	"exclusions" text,
	"status" varchar(50) DEFAULT 'draft' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_tours_code_unique" UNIQUE("code"),
	CONSTRAINT "app_tours_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "app_itinerary_stops" (
	"id" uuid PRIMARY KEY NOT NULL,
	"tour_id" uuid NOT NULL,
	"destination_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"sort_order" integer NOT NULL,
	"title" varchar(255) NOT NULL,
	"description" text,
	"overnight_stay" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_transport_units" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"plate_number" varchar(20),
	"capacity" integer NOT NULL,
	"driver_name" varchar(255),
	"driver_phone" varchar(50),
	"notes" text,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_transport_units_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "app_departures" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"tour_id" uuid NOT NULL,
	"departure_date" timestamp with time zone NOT NULL,
	"return_date" timestamp with time zone,
	"meeting_point" varchar(255),
	"meeting_time" varchar(10),
	"price_override" numeric(12, 2),
	"total_capacity" integer NOT NULL,
	"booked_slots" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"status" varchar(50) DEFAULT 'scheduled' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_departures_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "app_departure_units" (
	"id" uuid PRIMARY KEY NOT NULL,
	"departure_id" uuid NOT NULL,
	"transport_unit_id" uuid NOT NULL,
	"assigned_capacity" integer NOT NULL,
	"driver_name_override" varchar(255),
	"driver_phone_override" varchar(50),
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "app_customers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"supabase_user_id" varchar(255),
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"email" varchar(255),
	"phone" varchar(50),
	"document_type" varchar(20),
	"document_number" varchar(50),
	"birth_date" timestamp with time zone,
	"emergency_contact" varchar(255),
	"emergency_phone" varchar(50),
	"notes" text,
	"source" varchar(50) DEFAULT 'admin' NOT NULL,
	"status" varchar(50) DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_customers_code_unique" UNIQUE("code"),
	CONSTRAINT "app_customers_supabase_user_id_unique" UNIQUE("supabase_user_id")
);
--> statement-breakpoint
CREATE TABLE "app_bookings" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"departure_id" uuid NOT NULL,
	"customer_id" uuid NOT NULL,
	"slots_reserved" integer NOT NULL,
	"total_amount" numeric(12, 2) NOT NULL,
	"paid_amount" numeric(12, 2) DEFAULT '0' NOT NULL,
	"notes" text,
	"source" varchar(50) DEFAULT 'admin' NOT NULL,
	"created_by_id" uuid,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_bookings_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "app_passengers" (
	"id" uuid PRIMARY KEY NOT NULL,
	"booking_id" uuid NOT NULL,
	"first_name" varchar(255) NOT NULL,
	"last_name" varchar(255) NOT NULL,
	"document_type" varchar(20),
	"document_number" varchar(50),
	"phone" varchar(50),
	"is_main_contact" boolean DEFAULT false NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "app_payments" (
	"id" uuid PRIMARY KEY NOT NULL,
	"code" varchar(20) NOT NULL,
	"booking_id" uuid NOT NULL,
	"method" varchar(50) NOT NULL,
	"amount" numeric(12, 2) NOT NULL,
	"currency" varchar(10) DEFAULT 'USD' NOT NULL,
	"reference" varchar(255),
	"proof_image_url" varchar(500),
	"payment_date" timestamp with time zone NOT NULL,
	"received_by_name" varchar(255),
	"verified_by_id" uuid,
	"verified_at" timestamp with time zone,
	"notes" text,
	"status" varchar(50) DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now(),
	CONSTRAINT "app_payments_code_unique" UNIQUE("code")
);
--> statement-breakpoint
ALTER TABLE "app_users" ADD CONSTRAINT "app_users_role_id_app_roles_id_fk" FOREIGN KEY ("role_id") REFERENCES "public"."app_roles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "session" ADD CONSTRAINT "session_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_destinations" ADD CONSTRAINT "app_destinations_category_id_app_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."app_categories"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_itinerary_stops" ADD CONSTRAINT "app_itinerary_stops_tour_id_app_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."app_tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_itinerary_stops" ADD CONSTRAINT "app_itinerary_stops_destination_id_app_destinations_id_fk" FOREIGN KEY ("destination_id") REFERENCES "public"."app_destinations"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_departures" ADD CONSTRAINT "app_departures_tour_id_app_tours_id_fk" FOREIGN KEY ("tour_id") REFERENCES "public"."app_tours"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_departure_units" ADD CONSTRAINT "app_departure_units_departure_id_app_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."app_departures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_departure_units" ADD CONSTRAINT "app_departure_units_transport_unit_id_app_transport_units_id_fk" FOREIGN KEY ("transport_unit_id") REFERENCES "public"."app_transport_units"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_bookings" ADD CONSTRAINT "app_bookings_departure_id_app_departures_id_fk" FOREIGN KEY ("departure_id") REFERENCES "public"."app_departures"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_bookings" ADD CONSTRAINT "app_bookings_customer_id_app_customers_id_fk" FOREIGN KEY ("customer_id") REFERENCES "public"."app_customers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_bookings" ADD CONSTRAINT "app_bookings_created_by_id_app_users_id_fk" FOREIGN KEY ("created_by_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_passengers" ADD CONSTRAINT "app_passengers_booking_id_app_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."app_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_payments" ADD CONSTRAINT "app_payments_booking_id_app_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."app_bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "app_payments" ADD CONSTRAINT "app_payments_verified_by_id_app_users_id_fk" FOREIGN KEY ("verified_by_id") REFERENCES "public"."app_users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "idx_roles_name" ON "app_roles" USING btree ("name");--> statement-breakpoint
CREATE INDEX "idx_roles_status" ON "app_roles" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_users_email" ON "app_users" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_users_role_status" ON "app_users" USING btree ("role_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_code" ON "app_categories" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_categories_slug" ON "app_categories" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_categories_status" ON "app_categories" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_dest_code" ON "app_destinations" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_dest_slug" ON "app_destinations" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_dest_category" ON "app_destinations" USING btree ("category_id");--> statement-breakpoint
CREATE INDEX "idx_dest_status" ON "app_destinations" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tour_code" ON "app_tours" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_tour_slug" ON "app_tours" USING btree ("slug");--> statement-breakpoint
CREATE INDEX "idx_tour_status" ON "app_tours" USING btree ("status");--> statement-breakpoint
CREATE INDEX "app_itinerary_stops_tour_id_idx" ON "app_itinerary_stops" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "app_itinerary_stops_destination_id_idx" ON "app_itinerary_stops" USING btree ("destination_id");--> statement-breakpoint
CREATE UNIQUE INDEX "app_transport_units_code_idx" ON "app_transport_units" USING btree ("code");--> statement-breakpoint
CREATE INDEX "app_transport_units_status_idx" ON "app_transport_units" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "app_departures_code_idx" ON "app_departures" USING btree ("code");--> statement-breakpoint
CREATE INDEX "app_departures_tour_id_idx" ON "app_departures" USING btree ("tour_id");--> statement-breakpoint
CREATE INDEX "app_departures_status_date_idx" ON "app_departures" USING btree ("status","departure_date");--> statement-breakpoint
CREATE INDEX "app_departure_units_departure_id_idx" ON "app_departure_units" USING btree ("departure_id");--> statement-breakpoint
CREATE INDEX "app_departure_units_transport_unit_id_idx" ON "app_departure_units" USING btree ("transport_unit_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_app_customers_code" ON "app_customers" USING btree ("code");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_app_customers_supabase_user_id" ON "app_customers" USING btree ("supabase_user_id");--> statement-breakpoint
CREATE INDEX "idx_app_customers_email" ON "app_customers" USING btree ("email");--> statement-breakpoint
CREATE INDEX "idx_app_customers_status" ON "app_customers" USING btree ("status");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_app_bookings_code" ON "app_bookings" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_app_bookings_departure_id" ON "app_bookings" USING btree ("departure_id");--> statement-breakpoint
CREATE INDEX "idx_app_bookings_customer_id" ON "app_bookings" USING btree ("customer_id");--> statement-breakpoint
CREATE INDEX "idx_app_bookings_status" ON "app_bookings" USING btree ("status");--> statement-breakpoint
CREATE INDEX "idx_app_passengers_booking_id" ON "app_passengers" USING btree ("booking_id");--> statement-breakpoint
CREATE UNIQUE INDEX "idx_app_payments_code" ON "app_payments" USING btree ("code");--> statement-breakpoint
CREATE INDEX "idx_app_payments_booking_id" ON "app_payments" USING btree ("booking_id");--> statement-breakpoint
CREATE INDEX "idx_app_payments_status" ON "app_payments" USING btree ("status");