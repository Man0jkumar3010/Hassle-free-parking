CREATE TABLE "company" (
	"id" serial PRIMARY KEY NOT NULL,
	"company_name" varchar(32) NOT NULL,
	"company_code" varchar(8) NOT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "company_company_code_unique" UNIQUE("company_code")
);
--> statement-breakpoint
CREATE TABLE "genders" (
	"gender" varchar(16) PRIMARY KEY NOT NULL
);
--> statement-breakpoint
CREATE TABLE "slot" (
	"id" serial PRIMARY KEY NOT NULL,
	"slot_name" varchar(10) NOT NULL,
	"company_id" integer NOT NULL,
	"effective_from" date DEFAULT NOW(),
	"expire_at" date DEFAULT NULL,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "slot-booking" (
	"id" serial PRIMARY KEY NOT NULL,
	"user_id" integer NOT NULL,
	"slot_id" integer NOT NULL,
	"start_time" timestamp with time zone,
	"end_time" timestamp with time zone,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" serial PRIMARY KEY NOT NULL,
	"mobile_number" varchar(10) NOT NULL,
	"first_name" varchar(32) DEFAULT NULL,
	"last_name" varchar(32) DEFAULT NULL,
	"gender" varchar DEFAULT NULL,
	"company_id" integer NOT NULL,
	"otp" varchar(6),
	"otp_expire_at" timestamp with time zone,
	"is_verified" smallint DEFAULT 0,
	"created_at" timestamp with time zone,
	"updated_at" timestamp with time zone,
	"deleted_at" timestamp with time zone,
	CONSTRAINT "users_mobile_number_unique" UNIQUE("mobile_number")
);
--> statement-breakpoint
ALTER TABLE "slot" ADD CONSTRAINT "slot_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "slot-booking" ADD CONSTRAINT "slot-booking_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_gender_genders_gender_fk" FOREIGN KEY ("gender") REFERENCES "public"."genders"("gender") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_company_id_company_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."company"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "unique_gender_idx" ON "genders" USING btree (lower("gender"));