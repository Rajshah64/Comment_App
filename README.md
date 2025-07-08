# Real-Time Comment System

A production-ready, full-stack comment application featuring real-time notifications, hierarchical comment structure, and modern web technologies. Built with NestJS backend, Next.js frontend, and Supabase authentication.

## Project Overview

This is a complete comment system application consisting of two main components:

- **Backend API** (`comment-app/`) - NestJS server with real-time WebSocket support
- **Frontend Application** (`comment-frontend/`) - Next.js client with modern UI

### Key Features

- Complete user authentication with Supabase Auth and JWT tokens
- Nested comments with unlimited depth hierarchical structure
- Real-time notifications powered by WebSocket connections
- Soft delete system allowing comment restoration
- Time-based restrictions with 15-minute window for editing/deleting
- Robust authorization ensuring users can only modify their own content
- Responsive design that works across all devices
- Live updates for comments and notifications

## Technology Stack

### Backend (`comment-app/`)

- **Framework**: NestJS 11.x (Node.js + TypeScript)
- **Database**: PostgreSQL (via Supabase)
- **ORM**: Drizzle ORM 0.44.x with migrations
- **Authentication**: Supabase Auth (JWT-based)
- **Real-time**: Socket.IO WebSockets
- **Validation**: class-validator & class-transformer
- **Testing**: Jest with supertest
- **Code Quality**: ESLint + Prettier + TypeScript strict mode

### Frontend (`comment-frontend/`)

- **Framework**: Next.js 15.3.5 (React 19 + TypeScript)
- **Styling**: Tailwind CSS 4 with Radix UI components
- **State Management**: React Context + Custom Hooks
- **Forms**: React Hook Form 
- **HTTP Client**: Axios
- **Real-time**: Socket.IO Client
- **UI Components**: Radix UI + Lucide React icons
- **Notifications**: Sonner toast library
- **Date Handling**: date-fns

### Infrastructure & DevOps

- **Database**: PostgreSQL (Supabase managed)
- **Authentication**: Supabase Auth
- **Real-time**: Custom WebSocket server
- **Migrations**: Drizzle Kit
- **Package Manager**: pnpm

## Project Architecture

```
Sanctity_Assignment/
├── comment-app/                            # NestJS Backend API
│   ├── src/
│   │   ├── auth/                           # Authentication module
│   │   │   ├── auth.controller.ts          # Signup/login endpoints
│   │   │   ├── auth.service.ts             # Supabase integration
│   │   │   ├── supabase-auth.guard.ts      # JWT validation
│   │   │   └── dto/                        # Request validation
│   │   ├── comment/                        # Comment CRUD operations
│   │   │   ├── comment.controller.ts       # Comment endpoints
│   │   │   ├── comment.service.ts          # Business logic & nesting
│   │   │   └── dto/                        # Comment validation
│   │   ├── notifications/                  # Real-time notifications
│   │   │   ├── notifications.controller.ts # Notification API
│   │   │   ├── notifications.service.ts    # Notification logic
│   │   │   ├── notifications.gateway.ts    # WebSocket gateway
│   │   │   └── dto/                        # Notification DTOs
│   │   ├── drizzle/                        # Database layer
│   │   │   ├── schema.ts                   # PostgreSQL schema
│   │   │   ├── db.ts                       # Database connection
│   │   │   └── test-connection.ts          # Connection testing
│   │   ├── lib/
│   │   │   └── supabase.ts                 # Supabase client
│   │   └── main.ts                         # Application bootstrap
│   ├── migrations/                         # Database migrations
│   ├── test/                               # E2E tests
│   ├── drizzle.config.ts                   # Database configuration
│   └── package.json                        # Backend dependencies
│
└── comment-frontend/                       # Next.js Frontend
    ├── src/
    │   ├── app/                            # Next.js App Router
    │   │   ├── page.tsx                    # Main comment interface
    │   │   ├── login/page.tsx              # Login page
    │   │   ├── signup/page.tsx             # Registration page
    │   │   └── layout.tsx                  # Root layout
    │   ├── components/                     # React components
    │   │   ├── Comment.tsx                 # Individual comment display
    │   │   ├── CommentForm.tsx             # Comment creation form
    │   │   ├── CommentList.tsx             # Nested comment list
    │   │   ├── Notifications.tsx           # Real-time notifications
    │   │   ├── ProfileDropdown.tsx         # User menu
    │   │   ├── UserComments.tsx            # User's comment history
    │   │   └── ui/                         # Reusable UI components
    │   ├── context/                        # React Context providers
    │   │   └── AuthContext.tsx             # Authentication state
    │   ├── hooks/                          # Custom React hooks
    │   │   ├── useComments.ts              # Comment operations
    │   │   ├── useNotifications.ts         # Notification management
    │   │   ├── useUserComments.ts          # User comment history
    │   │   └── useWebSocket.ts             # WebSocket connection
    │   └── lib/                            # Utility libraries
    │       ├── apiClient.ts                # HTTP client configuration
    │       ├── supabase.ts                 # Supabase client
    │       └── utils.ts                    # Utility functions
    └── package.json                        # Frontend dependencies
```

## Database Schema

### Comments Table

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

### Notifications Table

```sql
CREATE TABLE "notification" (
  "id" UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  "recipient_id" UUID NOT NULL,                -- User who receives notification
  "comment_id" UUID NOT NULL REFERENCES comments(id) ON DELETE CASCADE,
  "is_read" BOOLEAN DEFAULT false NOT NULL,    -- Read status
  "created_at" TIMESTAMP DEFAULT now() NOT NULL
);
```

## Installation and Setup

### Prerequisites

- Node.js 18+ (recommended: 20+)
- pnpm (preferred) or npm
- Supabase account (free tier available)

### 1. Clone Repository

```bash
git clone https://github.com/Rajshah64/Comment_App.git

```

### 2. Supabase Configuration

1. Create a new project at [Supabase Dashboard](https://app.supabase.com)
2. Navigate to Settings → API and copy the URL and anon public key
3. Navigate to Settings → Database and copy the connection string

### 3. Backend Setup

```bash
cd comment-app
pnpm install

# Create environment file
cat > .env << EOF
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
EOF

# Apply database schema
npx drizzle-kit push:pg

# Test database connection
npx tsx src/drizzle/test-connection.ts

# Start development server (runs on port 3600)
pnpm run start:dev
```

### 4. Frontend Setup

```bash
cd ../comment-frontend
pnpm install

# Create environment file
cat > .env.local << EOF
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-public-key
EOF

# Start development server (runs on port 3000)
pnpm run dev
```

### 5. Application Access

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3600
- **WebSocket**: ws://localhost:3600/notifications

## API Documentation

### Authentication Endpoints

- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /profile` - Get current user profile

### Comment Endpoints (Authentication Required)

- `GET /comments` - Retrieve all comments in nested structure
- `POST /comments` - Create new comment
- `PATCH /comments/:id` - Edit comment (author only, 15-minute window)
- `DELETE /comments/:id` - Soft delete comment (author only, 15-minute window)
- `PATCH /comments/:id/restore` - Restore deleted comment (author only, 15-minute window)

### Notification Endpoints (Authentication Required)

- `GET /notifications` - Get user notifications
- `GET /notifications?unreadOnly=true` - Get only unread notifications
- `PATCH /notifications/:id/read` - Mark notification as read/unread

### WebSocket Events

- `newNotification` - Receive new notification
- `notificationUpdated` - Notification status changed

## Frontend Features

### Main Interface

- Comment feed displaying all comments in hierarchical structure
- Real-time updates for new comments and notifications
- Comment actions including reply, edit, delete, and restore with proper permissions
- Responsive design optimized for desktop and mobile devices

### Authentication

- Clean, accessible login and registration forms
- User profile management with logout functionality

### Notification System

- Bell icon indicator showing unread notification count
- Expandable notification dropdown list
- Individual and bulk mark-as-read functionality
- Real-time notification delivery

## Security Implementation

### Authorization

- Comment ownership validation ensuring users can only edit/delete their own comments
- Time-based restrictions with 15-minute window for modifications
- JWT token validation on all protected routes
- Proper CORS configuration for cross-origin resource sharing

### Input Validation

- Backend validation using DTOs with class-validator
- Frontend validation using React Hook Form with Zod schemas
- SQL injection protection through Drizzle ORM parameterized queries
- XSS prevention through content sanitization

## Development Commands

### Backend Operations

```bash
pnpm run start:dev          # Development with hot reload
pnpm run start:debug        # Debug mode
pnpm run build              # Production build
pnpm run start:prod         # Start production server

pnpm run test               # Unit tests
pnpm run test:e2e           # End-to-end tests
pnpm run test:cov           # Test coverage

pnpm run lint               # ESLint
pnpm run format             # Prettier formatting
```

### Frontend Operations

```bash
pnpm run dev                # Development server
pnpm run build              # Production build
pnpm run start              # Start production server
pnpm run lint               # Next.js linting
```

### Database Management

```bash
npx drizzle-kit generate:pg # Generate migration
npx drizzle-kit push:pg     # Apply migrations
npx drizzle-kit drop        # Reset database
npx drizzle-kit studio      # Database GUI
```

## Usage Instructions

### User Registration

1. Navigate to http://localhost:3000
2. Click "Sign Up" to create a new account
3. Enter email and password (minimum 6 characters required)
4. Automatic login occurs after successful registration

### Comment Management

1. Use the comment form at the top of the page to create new comments
2. Click "Reply" on existing comments to create nested responses
3. Edit comments using the pencil icon (15-minute window)
4. Delete comments using the trash icon (15-minute window)
5. Restore deleted comments using the restore icon (15-minute window)

### Notification Management

1. View notifications by clicking the bell icon in the header
2. Mark individual notifications as read using the checkmark
3. Mark all notifications as read using the "Mark all read" button

## Configuration

### Environment Variables

#### Backend Configuration (.env)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:password@host:5432/db
```

#### Frontend Configuration (.env.local)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Port Configuration

- Backend: Port 3600 (configurable in `comment-app/src/main.ts`)
- Frontend: Port 3000 (configurable in package.json dev script)
- WebSocket: Same as backend port with `/notifications` namespace

## Production Deployment

### Backend Deployment

1. Configure production environment variables
2. Execute `pnpm run build` to compile the application
3. Deploy the `dist/` folder to your hosting platform
4. Ensure PostgreSQL database accessibility
5. Configure CORS settings for your frontend domain

### Frontend Deployment

1. Set production environment variables
2. Execute `pnpm run build` to create production build
3. Deploy to platforms like Vercel, Netlify, or similar
4. Update API endpoints to point to production backend URL

### Database Migration

```bash
DATABASE_URL=your-production-url npx drizzle-kit push:pg
```

---

**Professional full-stack application demonstrating modern web development practices**
