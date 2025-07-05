# Comment App (Backend)

A NestJS backend for a comment system, using Drizzle ORM for PostgreSQL migrations and queries, and Supabase for additional backend services.

---

## Project Structure

```
comment-app/
├── src/
│   ├── app.controller.ts
│   ├── app.module.ts
│   ├── app.service.ts
│   ├── auth/                # (auth logic, WIP)
│   ├── drizzle/
│   │   ├── schema.ts        # Drizzle ORM schema (users, comments)
│   │   ├── db.ts            # Drizzle DB connection
│   │   └── test-connection.ts # DB connection test script
│   ├── lib/
│   │   └── supabase.ts      # Supabase client setup
│   └── main.ts
├── migrations/              # Drizzle migration files
│   ├── 0000_keen_the_anarchist.sql
│   └── meta/_journal.json
├── drizzle.config.ts        # Drizzle Kit config
├── .env                     # Environment variables (not committed)
├── .gitignore
├── package.json
└── README.md
```

---

## Tech Stack

- **NestJS**: Node.js backend framework
- **Drizzle ORM**: TypeScript ORM for PostgreSQL
- **Supabase**: Used via `@supabase/supabase-js` for additional backend services
- **PostgreSQL**: Database

---

## Database Schema

Defined in `src/drizzle/schema.ts`:

- **users**
  - `id` (UUID, PK)
  - `email` (unique, not null)
  - `password_hash` (not null)
  - `created_at` (timestamp, not null)

- **comments**
  - `id` (UUID, PK)
  - `author_id` (FK to users, not null)
  - `parent_id` (FK to comments, nullable)
  - `content` (text, not null)
  - `created_at`, `updated_at` (timestamps, not null)
  - `deleted_at` (timestamp, nullable)

---

## Migrations

- Managed with Drizzle Kit.
- Migration files are in the `migrations/` folder.
- Configured via `drizzle.config.ts`:

  ```ts
  import { defineConfig } from 'drizzle-kit';

  export default defineConfig({
    schema: './src/drizzle/schema.ts',
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: {
      url: process.env.DATABASE_URL!,
    },
  });
  ```

---

## Supabase Integration

- Supabase client is set up in `src/lib/supabase.ts`:

  ```ts
  import { createClient } from '@supabase/supabase-js';
  import 'dotenv/config';

  export const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
  );
  ```

- Requires `SUPABASE_URL` and `SUPABASE_ANON_KEY` in your `.env`.

---

## Getting Started

1. **Install dependencies:**

   ```sh
   pnpm install
   ```

2. **Set up your `.env` file:**

   ```
   DATABASE_URL=postgresql://user:password@host:port/database
   SUPABASE_URL=https://your-project.supabase.co
   SUPABASE_ANON_KEY=your-anon-key
   ```

3. **Generate and run migrations:**

   ```sh
   pnpm dlx drizzle-kit generate
   pnpm dlx drizzle-kit migrate
   ```

4. **Start the server:**
   ```sh
   pnpm run start:dev
   ```

---

## Development Scripts

```bash
# Development mode
pnpm run start:dev

# Build for production
pnpm run build

# Run tests
pnpm run test

# Format code
pnpm run format

# Lint code
pnpm run lint
```

---

## Testing

- Test DB connection: `src/drizzle/test-connection.ts`
- Run all tests:
  ```sh
  pnpm run test
  ```

---

## Notes

- The project is a work in progress.
- Auth logic and more features are being developed.
- `.env` and other sensitive files are gitignored.

---

## Current Status

✅ **Completed Today:**

- NestJS project setup with TypeScript
- Drizzle ORM integration with PostgreSQL
- Database schema design (users, comments tables)
- Initial migration generated and configured
- Supabase client setup
- Environment variable configuration
- Project structure and basic controllers

🚧 **In Progress:**

- Authentication system
- Comment CRUD operations
- API endpoints implementation

📋 **TODO:**

- User registration/login endpoints
- Comment creation, editing, deletion
- Nested comment threading
- Input validation and error handling
- Unit and integration tests
- API documentation

---

_This README will be updated as the project evolves._
