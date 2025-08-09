import {
  serial,
  timestamp,
  pgTable,
  integer,
  smallint,
} from "drizzle-orm/pg-core";
import { users } from "./users";
import { slot } from ".";

export const slotBooking = pgTable("slot-booking", {
  id: serial("id").primaryKey(),
  userId: integer("user_id")
    .references(() => users.id)
    .notNull(),
  slotId: integer("slot_id")
    .references(() => slot.id)
    .notNull(),
  startTime: timestamp("start_time", { withTimezone: true }),
  endTime: timestamp("end_time", { withTimezone: true }),
  createdAt: timestamp("created_at", { withTimezone: true }),
  updatedAt: timestamp("updated_at", { withTimezone: true }),
  deletedAt: timestamp("deleted_at", { withTimezone: true }),
  isDeleted: smallint("is_deleted").default(0),
});
