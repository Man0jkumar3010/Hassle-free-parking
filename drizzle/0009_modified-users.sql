ALTER TABLE "users" ADD COLUMN "otp_count" smallint DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "otp_limit_expire_time" timestamp with time zone DEFAULT NULL;