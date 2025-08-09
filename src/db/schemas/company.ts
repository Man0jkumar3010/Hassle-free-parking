import {
  serial,
  varchar,
  timestamp,
  pgTable,
} from 'drizzle-orm/pg-core';

export const company = pgTable(
  'company',
  {
    id: serial('id').primaryKey(),
    companyName:  varchar('company_name', { length: 32 }).notNull(),
    companyCode: varchar('company_code', { length: 8 }).unique().notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }),
    updatedAt: timestamp('updated_at', { withTimezone: true }),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  }
);
