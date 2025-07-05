import { pgTable, uuid, text, timestamp } from 'drizzle-orm/pg-core';

// USERS TABLE
export const users = pgTable('users', {
  id: uuid('id').primaryKey().defaultRandom(),
  email: text('email').notNull().unique(),
  password_hash: text('password_hash').notNull(),
  created_at: timestamp('created_at').defaultNow().notNull(),
});

// COMMENTS TABLE
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),

  author_id: uuid('author_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),

  parent_id: uuid('parent_id').references(() => comments.id, {
    onDelete: 'cascade',
  }),

  content: text('content').notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),

  deleted_at: timestamp('deleted_at'),
});
