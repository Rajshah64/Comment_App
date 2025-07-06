-- Remove the foreign key constraint
ALTER TABLE "comments" DROP CONSTRAINT "comments_author_id_users_id_fk";

-- Drop the unused users table since we're using Supabase auth
DROP TABLE "users";