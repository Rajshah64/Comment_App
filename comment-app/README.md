# Comment System API

A production-ready NestJS backend for a hierarchical comment system with user authentication, featuring complete CRUD operations, nested comments, soft delete capabilities, robust authorization, and **real-time notifications**.

## Features

- ✅ **Complete User Authentication** - Supabase Auth integration with JWT tokens
- ✅ **Nested Comments** - Unlimited depth hierarchical comment structure
- ✅ **Full CRUD Operations** - Create, read, update, delete comments with proper validation
- ✅ **Soft Delete System** - Comments are soft-deleted with restore functionality
- ✅ **Time-based Restrictions** - 15-minute window for editing/deleting/restoring comments
- ✅ **Robust Authorization** - Users can only modify their own comments
- ✅ **Input Validation** - Comprehensive validation with DTOs and class-validator
- ✅ **Database Migrations** - Version-controlled schema changes with Drizzle
- ✅ **CORS Support** - Cross-origin resource sharing enabled
- ✅ **Global Validation** - Automatic request validation and sanitization
- ✅ **Notification System** - Automatic notifications when users reply to comments
- ✅ **Notification Management** - Mark notifications as read/unread, filter by status

## 🛠 Tech Stack

- **Framework**: NestJS 11.x (Node.js with TypeScript)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM 0.44.x with TypeScript
- **Authentication**: Supabase Auth (JWT-based)
- **Validation**: class-validator & class-transformer
- **Migration**: Drizzle Kit 0.31.x
- **Testing**: Jest with supertest
- **Code Quality**: ESLint + Prettier + TypeScript strict mode
- **Notifications**: Custom notification system with database persistence

## 📁 Project Architecture

```
comment-app/
├── src/
│   ├── auth/                         # Authentication Module
│   │   ├── auth.controller.ts        # Auth endpoints (signup, login)
│   │   ├── auth.service.ts           # Supabase auth integration
│   │   ├── auth.module.ts            # Auth module configuration
│   │   ├── supabase-auth.guard.ts    # JWT token validation guard
│   │   ├── dto/                      # Authentication DTOs
│   │   │   ├── sign-up.dto.ts        # Signup request validation
│   │   │   └── sign-in.dto.ts        # Login request validation
│   │   ├── auth.controller.spec.ts   # Auth controller tests
│   │   └── auth.service.spec.ts      # Auth service tests
│   ├── comment/                      # Comment Module
│   │   ├── comment.controller.ts     # Comment CRUD endpoints
│   │   ├── comment.service.ts        # Comment business logic & nesting
│   │   ├── comment.module.ts         # Comment module configuration
│   │   ├── dto/                      # Comment DTOs
│   │   │   ├── create-comment.dto.ts # Create comment validation
│   │   │   └── edit-comment.dto.ts   # Edit comment validation
│   │   ├── comment.controller.spec.ts # Comment controller tests
│   │   └── comment.service.spec.ts   # Comment service tests
│   ├── notifications/                # Notification Module (NEW)
│   │   ├── notifications.controller.ts # Notification endpoints
│   │   ├── notifications.service.ts    # Notification business logic
│   │   ├── notifications.module.ts     # Notification module config
│   │   ├── dto/                         # Notification DTOs
│   │   │   ├── list-notifications.dto.ts   # List filter validation
│   │   │   └── toggle-notifications.dto.ts # Read/unread toggle
│   │   ├── notifications.controller.spec.ts # Notification tests
│   │   └── notifications.service.spec.ts   # Notification service tests
│   ├── drizzle/                      # Database Layer
│   │   ├── schema.ts                 # Database schema (comments + notifications)
│   │   ├── db.ts                     # Database connection setup
│   │   └── test-connection.ts        # Database connectivity test
│   ├── lib/
│   │   └── supabase.ts               # Supabase client configuration
│   ├── app.controller.ts             # Root controller (health check, profile)
│   ├── app.service.ts                # Root service
│   ├── app.module.ts                 # Main application module
│   └── main.ts                       # Application bootstrap & configuration
├── test/
│   ├── app.e2e-spec.ts               # End-to-end tests
│   └── jest-e2e.json                 # E2E test configuration
├── migrations/                       # Database Migrations
│   ├── 0000_keen_the_anarchist.sql   # Initial schema
│   ├── 0001_wise_fat_cobra.sql       # Email field update
│   ├── 0002_eager_talisman.sql       # Users table removal
│   ├── 0003_clear_archangel.sql      # Notifications table (NEW)
│   └── meta/                         # Migration metadata
├── dist/                             # Compiled JavaScript output
├── node_modules/                     # Dependencies
├── drizzle.config.ts                 # Drizzle ORM configuration
├── tsconfig.json                     # TypeScript configuration
├── nest-cli.json                     # NestJS CLI configuration
├── eslint.config.mjs                 # ESLint configuration
├── .prettierrc                       # Prettier configuration
├── package.json                      # Dependencies & scripts
└── README.md                         # This file
```

## 🗄 Database Schema

### Comments Table (PostgreSQL)

```sql
CREATE TABLE "comments" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "author_id" UUID NOT NULL,                    -- References auth.users.id
  "parent_id" UUID REFERENCES comments(id) ON DELETE CASCADE,
  "content" TEXT NOT NULL,
  "created_at" TIMESTAMP DEFAULT now() NOT NULL,
  "updated_at" TIMESTAMP DEFAULT now() NOT NULL,
  "deleted_at" TIMESTAMP                        -- Soft delete timestamp
);
```

### Notifications Table (NEW)

```sql
CREATE TABLE "notification" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "recipient_id" UUID NOT NULL,                -- User who receives notification
  "comment_id" UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  "is_read" BOOLEAN DEFAULT false NOT NULL,    -- Read status
  "created_at" TIMESTAMP DEFAULT now() NOT NULL
);
```

### User Management

- Users are stored in **Supabase's built-in `auth.users` table**
- No local users table - authentication fully handled by Supabase
- `comments.author_id` references `auth.users.id` (no FK constraint for flexibility)

### Migration History

1. **0000_keen_the_anarchist** - Initial schema with users and comments tables
2. **0001_wise_fat_cobra** - Updated email field to varchar(255)
3. **0002_eager_talisman** - Removed users table, simplified to Supabase auth only
4. **0003_clear_archangel** - Added notifications table with foreign key constraints (NEW)

## 🔧 Installation & Setup

### Prerequisites

- Node.js 18+
- pnpm (recommended) or npm
- PostgreSQL database (Supabase account)

### 1. Clone & Install

```bash
git clone <repository-url>
cd comment-app
pnpm install
```

### 2. Environment Configuration

Create `.env` file in project root:

```env
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key

# Database Configuration (Use Supabase PostgreSQL)
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
```

**Getting Supabase Credentials:**

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. **Settings** → **API** → Copy `URL` and `anon public` key
3. **Settings** → **Database** → Copy connection string

### 3. Database Setup

```bash
# Apply schema to database
npx drizzle-kit push:pg

# Test database connection
npx tsx src/drizzle/test-connection.ts
```

### 4. Start Development Server

```bash
pnpm run start:dev
```

Server will start on `http://localhost:3000`

## 📡 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication Endpoints

#### POST /auth/signup

Register a new user

```bash
curl -X POST http://localhost:3000/auth/signup \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

**Response:**

```json
{
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "created_at": "2024-01-01T00:00:00.000Z"
  },
  "session": {
    "access_token": "jwt-token",
    "refresh_token": "refresh-token"
  }
}
```

#### POST /auth/login

Authenticate existing user

```bash
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "password123"
  }'
```

#### GET /profile

Get current user profile (requires authentication)

```bash
curl -X GET http://localhost:3000/profile \
  -H "Authorization: Bearer <jwt-token>"
```

### Comment Endpoints (All require authentication)

#### GET /comments

Retrieve all comments in nested structure

```bash
curl -X GET http://localhost:3000/comments \
  -H "Authorization: Bearer <jwt-token>"
```

**Response:**

```json
[
  {
    "id": "uuid",
    "author_id": "uuid",
    "parent_id": null,
    "content": "Top-level comment",
    "created_at": "2024-01-01T00:00:00.000Z",
    "updated_at": "2024-01-01T00:00:00.000Z",
    "deleted_at": null,
    "replies": [
      {
        "id": "uuid",
        "author_id": "uuid",
        "parent_id": "parent-uuid",
        "content": "Nested reply",
        "created_at": "2024-01-01T00:01:00.000Z",
        "updated_at": "2024-01-01T00:01:00.000Z",
        "deleted_at": null,
        "replies": []
      }
    ]
  }
]
```

#### POST /comments

Create a new comment ( **Auto-generates notifications for parent comment authors**)

```bash
curl -X POST http://localhost:3000/comments \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "This is a new comment",
    "parent_id": "uuid-optional"
  }'
```

#### PATCH /comments/:id

Edit existing comment (author only, within 15 minutes)

```bash
curl -X PATCH http://localhost:3000/comments/comment-uuid \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "content": "Updated comment content"
  }'
```

#### DELETE /comments/:id

Soft delete comment (author only, within 15 minutes)

```bash
curl -X DELETE http://localhost:3000/comments/comment-uuid \
  -H "Authorization: Bearer <jwt-token>"
```

#### PATCH /comments/:id/restore

Restore soft-deleted comment (author only, within 15 minutes of deletion)

```bash
curl -X PATCH http://localhost:3000/comments/comment-uuid/restore \
  -H "Authorization: Bearer <jwt-token>"
```

### 🔔 Notification Endpoints (NEW - All require authentication)

#### GET /notifications

List all notifications for the authenticated user

```bash
curl -X GET http://localhost:3000/notifications \
  -H "Authorization: Bearer <jwt-token>"
```

**Optional Query Parameters:**

- `unreadOnly=true` - Filter to show only unread notifications

**Examples:**

```bash
# Get all notifications
curl -X GET http://localhost:3000/notifications \
  -H "Authorization: Bearer <jwt-token>"

# Get only unread notifications
curl -X GET "http://localhost:3000/notifications?unreadOnly=true" \
  -H "Authorization: Bearer <jwt-token>"
```

**Response:**

```json
[
  {
    "id": "notification-uuid",
    "recipient_id": "user-uuid",
    "comment_id": "comment-uuid",
    "is_read": false,
    "created_at": "2024-01-01T00:05:00.000Z"
  }
]
```

#### PATCH /notifications/:id/read

Mark notification as read or unread

```bash
curl -X PATCH http://localhost:3000/notifications/notification-uuid/read \
  -H "Authorization: Bearer <jwt-token>" \
  -H "Content-Type: application/json" \
  -d '{
    "is_read": true
  }'
```

**Response:**

```json
{
  "message": "Updated"
}
```

### Health Check

#### GET /

Basic health check endpoint

```bash
curl -X GET http://localhost:3000/
```

**Response:** `"Hello World!"`

## 🔒 Security & Authorization

### Authentication Flow

1. User registers/logs in via Supabase Auth
2. JWT token returned containing user information
3. `SupabaseAuthGuard` validates tokens on protected routes
4. User information attached to request object as `req['user']`

### Authorization Rules

- **Comment Creation**: Any authenticated user
- **Comment Editing**: Comment author only, within 15 minutes
- **Comment Deletion**: Comment author only, within 15 minutes
- **Comment Restoration**: Comment author only, within 15 minutes of deletion
- **Comment Viewing**: All authenticated users (soft-deleted comments excluded)
- **🔔 Notification Viewing**: User can only see their own notifications
- **🔔 Notification Management**: User can only mark their own notifications as read/unread

### Data Validation

- **Email**: Valid email format required
- **Password**: Minimum 6 characters
- **Comment Content**: Non-empty string
- **Parent ID**: Valid UUID (optional)
- **🔔 Notification Status**: Boolean value for is_read
- **Request Sanitization**: Automatic whitelist filtering

## 🏗 Architecture Features

### Comment Nesting Algorithm

- Comments stored flat in database with `parent_id` references
- `nestComments()` method recursively builds hierarchical structure
- Supports unlimited nesting depth
- Maintains chronological order within each level
- Efficient single-query retrieval with in-memory nesting

### Soft Delete Implementation

- Comments marked as deleted with `deleted_at` timestamp
- Soft-deleted comments excluded from queries
- Restoration possible within 15-minute window
- Maintains referential integrity for nested structures
- Cascade behavior preserved for parent-child relationships

### 🔔 Notification System (NEW)

- **Automatic Notifications**: When a user replies to a comment, the parent comment author receives a notification
- **Efficient Queries**: Notifications can be filtered by read status for better UX
- **Data Integrity**: Foreign key constraints ensure notifications are cleaned up when comments are deleted
- **User Privacy**: Users only see their own notifications
- **Real-time Ready**: Database design supports future real-time notification features

### Time-based Restrictions

- 15-minute window for editing after creation
- 15-minute window for deletion after creation
- 15-minute window for restoration after deletion
- Enforced at service level with millisecond precision
- Prevents unauthorized modifications of older content

### Module Integration

- **Notifications Service** is imported into Comment Module
- **Dependency Injection** ensures clean separation of concerns
- **Service Communication** via method calls, not HTTP requests
- **Transaction Safety** ensures notifications are created atomically with comments

## 🧪 Development Scripts

```bash
# Development
pnpm run start:dev          # Start with hot reload & file watching
pnpm run start:debug        # Start with debugging enabled
pnpm run start:prod         # Start production build

# Building
pnpm run build              # Compile TypeScript to JavaScript
pnpm run start              # Start compiled application

# Code Quality
pnpm run lint               # Run ESLint with auto-fix
pnpm run format             # Format code with Prettier

# Testing
pnpm run test               # Run unit tests
pnpm run test:watch         # Run tests in watch mode
pnpm run test:cov           # Run tests with coverage report
pnpm run test:debug         # Run tests with debugging
pnpm run test:e2e           # Run end-to-end tests

# Database
npx drizzle-kit generate:pg # Generate new migration
npx drizzle-kit push:pg     # Push schema changes to database
npx drizzle-kit migrate:pg  # Run pending migrations
npx tsx src/drizzle/test-connection.ts # Test database connection
```

## 🧪 Testing

### Test Structure

- **Unit Tests**: Basic controller and service tests with dependency injection
- **Integration Tests**: E2E tests for complete request-response cycles
- **Database Tests**: Connection and query testing utilities

### Running Tests

```bash
# Run all unit tests
pnpm run test

# Run with coverage
pnpm run test:cov

# Run specific test file
pnpm run test auth.controller.spec.ts

# Run e2e tests
pnpm run test:e2e
```

### Test Files

- `src/**/*.spec.ts` - Unit tests for controllers and services
- `test/app.e2e-spec.ts` - End-to-end application tests
- `src/drizzle/test-connection.ts` - Database connectivity testing

## 📊 Current Implementation Status

### ✅ Fully Implemented & Working

- [x] **Complete Authentication System** - Supabase integration with JWT
- [x] **Full Comment CRUD** - Create, read, update, delete operations
- [x] **Nested Comment Structure** - Unlimited depth hierarchical comments
- [x] **Soft Delete System** - Mark as deleted with restore capability
- [x] **Authorization System** - User-specific comment permissions
- [x] **Time-based Restrictions** - 15-minute edit/delete/restore windows
- [x] **Input Validation** - DTOs with comprehensive validation rules
- [x] **Database Schema** - Optimized multi-table design with migrations
- [x] **API Documentation** - Complete endpoint documentation
- [x] **CORS Support** - Cross-origin request handling
- [x] **Global Validation** - Automatic request validation pipeline
- [x] **Error Handling** - Proper HTTP status codes and error responses
- [x] **Environment Configuration** - Production-ready configuration management
- [x] **🔔 Notification System** - Automatic notifications for comment replies (NEW)
- [x] **🔔 Notification Management** - Read/unread status tracking (NEW)
- [x] **🔔 Notification API** - Complete CRUD endpoints for notifications (NEW)
- [x] **🔔 Service Integration** - Auto-notification on comment creation (NEW)

### 🔧 Infrastructure & DevOps

- [x] **TypeScript Configuration** - Strict typing and modern ES2023 target
- [x] **Code Quality Tools** - ESLint + Prettier with custom rules
- [x] **Build System** - NestJS CLI with optimized production builds
- [x] **Testing Framework** - Jest with supertest integration
- [x] **Database Migrations** - Version-controlled schema evolution (4 migrations)
- [x] **Development Tools** - Hot reload, debugging, and testing utilities
- [x] **Module Architecture** - Clean separation with dependency injection

### 📋 Future Enhancements

- [ ] **Advanced Testing** - Comprehensive unit and integration test coverage
- [ ] **🔔 Real-time Notifications** - WebSocket integration for live notifications
- [ ] **🔔 Email Notifications** - Send email alerts for new notifications
- [ ] **🔔 Notification Preferences** - User settings for notification types
- [ ] **Comment Reactions** - Like/dislike functionality
- [ ] **Comment Moderation** - Admin controls and content filtering
- [ ] **Advanced Search** - Full-text search and filtering capabilities
- [ ] **User Profiles** - Extended user information and preferences
- [ ] **Comment Analytics** - Usage metrics and reporting
- [ ] **Rate Limiting** - API throttling and spam prevention
- [ ] **Comment Threading** - Enhanced reply visualization
- [ ] **Rich Text Support** - Markdown or HTML content formatting
- [ ] **File Attachments** - Image and document uploads
- [ ] **Comment History** - Edit history and version tracking

## 🎯 Day 3 Achievements

### 🔔 Complete Notification System

- **Auto-Notification**: Users automatically receive notifications when someone replies to their comments
- **Notification Management**: Users can view all notifications and mark them as read/unread
- **Database Integration**: New notifications table with proper foreign key relationships
- **API Endpoints**: Complete REST API for notification operations
- **Service Integration**: Seamless integration between comment and notification services
- **Data Validation**: Comprehensive DTOs for all notification operations

### 🏗 Architecture Improvements

- **Module Structure**: Clean separation of notification concerns
- **Dependency Injection**: Proper service communication between modules
- **Database Design**: Normalized schema with appropriate constraints
- **Migration Management**: Version-controlled database evolution

### 📊 Development Quality

- **Code Organization**: Well-structured modules following NestJS best practices
- **Type Safety**: Full TypeScript coverage for all new features
- **Error Handling**: Proper exception handling and HTTP status codes
- **Validation**: Input validation for all new endpoints

## 🤝 Contributing

### Development Workflow

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Install dependencies (`pnpm install`)
4. Set up environment variables (`.env`)
5. Run database migrations (`npx drizzle-kit push:pg`)
6. Start development server (`pnpm run start:dev`)
7. Make changes with tests
8. Run linting (`pnpm run lint`)
9. Run tests (`pnpm run test`)
10. Commit changes (`git commit -m 'Add amazing feature'`)
11. Push to branch (`git push origin feature/amazing-feature`)
12. Create Pull Request

### Code Standards

- Follow TypeScript strict mode
- Use ESLint + Prettier for formatting
- Write tests for new features
- Update documentation for API changes
- Follow NestJS best practices and conventions

## 📝 License

This project is licensed under the UNLICENSED License.

---

**🚀 Production-Ready Comment System with Notifications built with NestJS, Supabase, and TypeScript**

_Last Updated: January 2024 - Day 3 Complete_
