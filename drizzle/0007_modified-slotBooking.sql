ALTER TABLE "slot" ALTER COLUMN "created_at" SET DEFAULT NOW();--> statement-breakpoint
ALTER TABLE "slot-booking" ADD COLUMN "is_deleted" smallint DEFAULT 0;--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "isAdmin" smallint DEFAULT 0;