ALTER TABLE "users" ADD COLUMN "vechile_number" varchar(32) DEFAULT NULL;--> statement-breakpoint
ALTER TABLE "users" ADD CONSTRAINT "users_vechile_number_unique" UNIQUE("vechile_number");