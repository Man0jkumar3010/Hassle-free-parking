import { sql } from 'drizzle-orm';
import {
  serial,
  varchar,
  timestamp,
  pgTable,
  date,
  integer,
} from 'drizzle-orm/pg-core';
import { company } from './company';

export const slot = pgTable(
  'slot',
  {
    id: serial('id').primaryKey(),
    slotName:  varchar('slot_name', { length: 10 }).notNull(),
    companyId: integer('company_id')
      .references(() => company.id)
      .notNull(),
    effectiveFrom: date('effective_from').default(sql`NOW()`),
    expireAt: date('expire_at').default(sql`NULL`),
    createdAt: timestamp('created_at', { withTimezone: true }).default(sql`NOW()`),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  }
);
