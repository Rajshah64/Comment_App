# 💬 Real-Time Comment System

A production-ready, full-stack comment application featuring **real-time notifications**, **hierarchical comment structure**, and **modern web technologies**. Built with NestJS backend, Next.js frontend, and Supabase authentication.

## 🎯 Project Overview

This is a complete comment system application with two main components:

- **Backend API** (`comment-app/`) - NestJS server with real-time WebSocket support
- **Frontend App** (`comment-frontend/`) - Next.js client with modern UI

### ✨ Key Features

- 🔐 **Complete Authentication** - Supabase Auth with JWT tokens
- 💬 **Nested Comments** - Unlimited depth hierarchical comment structure
- ⚡ **Real-time Notifications** - WebSocket-powered instant notifications
- 🗑️ **Soft Delete System** - Comments can be deleted and restored
- ⏰ **Time-based Restrictions** - 15-minute window for editing/deleting
- 🛡️ **Robust Authorization** - Users can only modify their own content
- 📱 **Responsive Design** - Modern UI that works on all devices
- 🔄 **Live Updates** - Comments and notifications update in real-time

## 🛠️ Tech Stack

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
- **Forms**: React Hook Form with Zod validation
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
- **Development**: Hot reload, TypeScript compilation

## 📁 Project Architecture

```
Sanctity_Assignment/
├── comment-app/                    # 🎯 NestJS Backend API
│   ├── src/
│   │   ├── auth/                   # Authentication module
│   │   │   ├── auth.controller.ts  # Signup/login endpoints
│   │   │   ├── auth.service.ts     # Supabase integration
│   │   │   ├── supabase-auth.guard.ts # JWT validation
│   │   │   └── dto/                # Request validation
│   │   ├── comment/                # Comment CRUD operations
│   │   │   ├── comment.controller.ts # Comment endpoints
│   │   │   ├── comment.service.ts  # Business logic & nesting
│   │   │   └── dto/                # Comment validation
│   │   ├── notifications/          # 🔔 Real-time notifications
│   │   │   ├── notifications.controller.ts # Notification API
│   │   │   ├── notifications.service.ts    # Notification logic
│   │   │   ├── notifications.gateway.ts    # WebSocket gateway
│   │   │   └── dto/                        # Notification DTOs
│   │   ├── drizzle/                # 🗄️ Database layer
│   │   │   ├── schema.ts           # PostgreSQL schema
│   │   │   ├── db.ts              # Database connection
│   │   │   └── test-connection.ts  # Connection testing
│   │   ├── lib/
│   │   │   └── supabase.ts        # Supabase client
│   │   └── main.ts                # Application bootstrap
│   ├── migrations/                # Database migrations
│   ├── test/                      # E2E tests
│   ├── drizzle.config.ts         # Database configuration
│   └── package.json              # Backend dependencies
│
└── comment-frontend/              # 🎨 Next.js Frontend
    ├── src/
    │   ├── app/                   # Next.js App Router
    │   │   ├── page.tsx          # Main comment interface
    │   │   ├── login/page.tsx    # Login page
    │   │   ├── signup/page.tsx   # Registration page
    │   │   └── layout.tsx        # Root layout
    │   ├── components/           # 🧩 React components
    │   │   ├── Comment.tsx       # Individual comment display
    │   │   ├── CommentForm.tsx   # Comment creation form
    │   │   ├── CommentList.tsx   # Nested comment list
    │   │   ├── Notifications.tsx # 🔔 Real-time notifications
    │   │   ├── ProfileDropdown.tsx # User menu
    │   │   ├── UserComments.tsx  # User's comment history
    │   │   └── ui/               # Reusable UI components
    │   ├── context/              # React Context providers
    │   │   └── AuthContext.tsx   # Authentication state
    │   ├── hooks/                # Custom React hooks
    │   │   ├── useComments.ts    # Comment operations
    │   │   ├── useNotifications.ts # Notification management
    │   │   ├── useUserComments.ts  # User comment history
    │   │   └── useWebSocket.ts   # WebSocket connection
    │   └── lib/                  # Utility libraries
    │       ├── apiClient.ts      # HTTP client configuration
    │       ├── supabase.ts       # Supabase client
    │       └── utils.ts          # Utility functions
    └── package.json              # Frontend dependencies
```

## 🗄️ Database Schema

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

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ (recommended: 20+)
- **pnpm** (preferred) or npm
- **Supabase account** (free tier available)

### 1. Clone Repository

```bash
git clone <your-repository-url>
cd Sanctity_Assignment
```

### 2. Supabase Setup

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Create a new project
3. Go to **Settings** → **API** → Copy `URL` and `anon public` key
4. Go to **Settings** → **Database** → Copy connection string

### 3. Backend Setup (`comment-app/`)

```bash
cd comment-app
pnpm install

# Create environment file
cat > .env << EOF
# Supabase Configuration
SUPABASE_URL=https://your-project-id.supabase.co
SUPABASE_ANON_KEY=your-anon-public-key

# Database Configuration
DATABASE_URL=postgresql://postgres:your-password@db.your-project-id.supabase.co:5432/postgres
EOF

# Apply database schema
npx drizzle-kit push:pg

# Test database connection
npx tsx src/drizzle/test-connection.ts

# Start development server (runs on port 3600)
pnpm run start:dev
```

### 4. Frontend Setup (`comment-frontend/`)

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

### 5. Access Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3600
- **WebSocket**: ws://localhost:3600/notifications

## 🔌 API Endpoints

### Authentication

- `POST /auth/signup` - Register new user
- `POST /auth/login` - User login
- `GET /profile` - Get current user profile

### Comments (All require authentication)

- `GET /comments` - Get all comments (nested structure)
- `POST /comments` - Create new comment
- `PATCH /comments/:id` - Edit comment (author only, 15min window)
- `DELETE /comments/:id` - Soft delete comment (author only, 15min window)
- `PATCH /comments/:id/restore` - Restore deleted comment (author only, 15min window)

### Notifications (All require authentication)

- `GET /notifications` - Get user notifications
- `GET /notifications?unreadOnly=true` - Get only unread notifications
- `PATCH /notifications/:id/read` - Mark notification as read/unread

### WebSocket Events

- `newNotification` - Receive new notification
- `notificationUpdated` - Notification status changed

## 🎨 Frontend Features

### Main Interface

- **Comment Feed** - Displays all comments in hierarchical structure
- **Real-time Updates** - New comments and notifications appear instantly
- **Comment Actions** - Reply, edit, delete, restore with proper permissions
- **Responsive Design** - Works seamlessly on desktop and mobile

### Authentication Pages

- **Login/Signup** - Clean, accessible authentication forms
- **Profile Management** - User profile dropdown with logout

### Notification System

- **Bell Icon** - Shows unread notification count
- **Dropdown** - Expandable notification list
- **Mark as Read** - Individual and bulk read actions
- **Real-time** - Notifications appear instantly

## 🔒 Security Features

### Authorization Rules

- **Comment Ownership** - Users can only edit/delete their own comments
- **Time Restrictions** - 15-minute window for modifications
- **JWT Validation** - All protected routes require valid tokens
- **CORS Configuration** - Proper cross-origin resource sharing

### Input Validation

- **Backend Validation** - DTOs with class-validator
- **Frontend Validation** - React Hook Form with Zod schemas
- **SQL Injection Protection** - Drizzle ORM parameterized queries
- **XSS Prevention** - Content sanitization

## 🧪 Development Commands

### Backend (`comment-app/`)

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

### Frontend (`comment-frontend/`)

```bash
pnpm run dev                # Development server
pnpm run build              # Production build
pnpm run start              # Start production server
pnpm run lint               # Next.js linting
```

### Database Management

```bash
# Generate migration
npx drizzle-kit generate:pg

# Apply migrations
npx drizzle-kit push:pg

# Reset database
npx drizzle-kit drop

# Database studio (GUI)
npx drizzle-kit studio
```

## 🎯 Usage Guide

### 1. User Registration

1. Navigate to http://localhost:3000
2. Click "Sign Up"
3. Enter email and password (minimum 6 characters)
4. Automatic login after successful registration

### 2. Creating Comments

1. Use the comment form at the top of the page
2. Type your message and click "Post Comment"
3. Comment appears instantly in the feed

### 3. Replying to Comments

1. Click "Reply" on any comment
2. Type your response
3. Reply appears nested under the original comment
4. Original author receives real-time notification

### 4. Managing Comments

- **Edit**: Click pencil icon (15-minute window)
- **Delete**: Click trash icon (15-minute window)
- **Restore**: Click restore icon on deleted comments (15-minute window)

### 5. Notifications

- **View**: Click bell icon in header
- **Mark Read**: Click checkmark on individual notifications
- **Mark All Read**: Click "Mark all read" button

## 🔧 Configuration

### Environment Variables

#### Backend (`.env`)

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
DATABASE_URL=postgresql://postgres:password@host:5432/db
```

#### Frontend (`.env.local`)

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

### Port Configuration

- **Backend**: Port 3600 (configurable in `comment-app/src/main.ts`)
- **Frontend**: Port 3000 (configurable in package.json dev script)
- **WebSocket**: Same as backend port + `/notifications` namespace

## 🚢 Production Deployment

### Backend Deployment

1. Set production environment variables
2. Run `pnpm run build`
3. Deploy `dist/` folder to your hosting platform
4. Ensure PostgreSQL database is accessible
5. Configure CORS for your frontend domain

### Frontend Deployment

1. Set production environment variables
2. Run `pnpm run build`
3. Deploy to Vercel, Netlify, or similar platform
4. Update API endpoints to production backend URL

### Database Migration in Production

```bash
# Apply migrations to production database
DATABASE_URL=your-production-url npx drizzle-kit push:pg
```

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🐛 Troubleshooting

### Common Issues

**Database Connection Failed**

```bash
# Test connection manually
cd comment-app
npx tsx src/drizzle/test-connection.ts
```

**WebSocket Connection Issues**

- Ensure backend is running on port 3600
- Check that frontend WebSocket URL matches backend
- Verify JWT token is being sent correctly

**Supabase Authentication Errors**

- Verify environment variables are set correctly
- Check Supabase project settings
- Ensure RLS policies are configured if needed

**CORS Issues**

- Verify frontend URL is allowed in backend CORS configuration
- Check that credentials are included in requests

### Getting Help

1. Check the console logs for detailed error messages
2. Verify all environment variables are set correctly
3. Ensure both frontend and backend servers are running
4. Test API endpoints directly using curl or Postman

---

**Built with ❤️ using modern web technologies**
