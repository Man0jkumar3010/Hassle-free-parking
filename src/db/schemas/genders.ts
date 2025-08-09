import { sql } from 'drizzle-orm';
import { varchar, pgTable, uniqueIndex } from 'drizzle-orm/pg-core';

export const genders = pgTable(
  'genders',
  {
    gender: varchar('gender', { length: 16 }).primaryKey(),
  },
  (table) => {
    return {
      uniqueCustomerUser: uniqueIndex('unique_gender_idx').on(
        sql`lower(${table.gender})`,
      ),
    };
  },
);
