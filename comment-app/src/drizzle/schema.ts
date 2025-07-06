import { pgTable, uuid, text, timestamp, boolean } from 'drizzle-orm/pg-core';

// COMMENTS TABLE - only table needed since we use Supabase auth
export const comments = pgTable('comments', {
  id: uuid('id').primaryKey().defaultRandom(),

  // Store Supabase user ID directly without foreign key constraint
  author_id: uuid('author_id').notNull(),

  parent_id: uuid('parent_id').references(() => comments.id, {
    onDelete: 'cascade',
  }),

  content: text('content').notNull(),

  created_at: timestamp('created_at').defaultNow().notNull(),
  updated_at: timestamp('updated_at').defaultNow().notNull(),

  deleted_at: timestamp('deleted_at'),
});

export const notifications = pgTable('notification', {
  id: uuid('id').primaryKey().defaultRandom(),
  recipient_id: uuid('recipient_id').notNull(),

  comment_id: uuid('comment_id')
    .notNull()
    .references(() => comments.id, { onDelete: 'cascade' }),

  is_read: boolean('is_read').notNull().default(false),

  created_at: timestamp('created_at').defaultNow().notNull(),
});
