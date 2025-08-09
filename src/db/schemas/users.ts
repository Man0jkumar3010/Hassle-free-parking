import { sql } from "drizzle-orm";
import {
  serial,
  varchar,
  timestamp,
  pgTable,
  integer,
  smallint,
} from "drizzle-orm/pg-core";
import { genders } from "./genders";
import { company } from "./company";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  mobileNumber: varchar("mobile_number", { length: 10 }).unique().notNull(),
  firstName: varchar("first_name", { length: 32 }).default(sql`NULL`),
  lastName: varchar("last_name", { length: 32 }).default(sql`NULL`),
  employeeCode: varchar("employee_code", { length: 32 }).default(sql`NULL`),
  gender: varchar("gender")
    .references(() => genders.gender)
    .default(sql`NULL`),
  companyId: integer("company_id")
    .notNull()
    .references(() => company.id),
  otp: varchar("otp", { length: 6 }),
  otpExpireAt: timestamp("otp_expire_at", { withTimezone: true }),
  isVerified: smallint("is_verified").default(0),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  isAdmin: smallint("isAdmin").default(0),
  vehicleNumber: varchar("vechile_number", { length: 32 })
    .default(sql`NULL`)
    .unique(),
  otpCount: smallint("otp_count").default(0),
  otpLimitExpireTime: timestamp("otp_limit_expire_time", {
    withTimezone: true,
  }).default(sql`NOW()`),
});
