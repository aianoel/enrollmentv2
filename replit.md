# EduManage - School Management System

## Overview

EduManage is a comprehensive school management system built with React (frontend) and Firebase (backend). It provides role-based portals for students, teachers, administrators, parents, registrars, guidance counselors, and accounting staff. The system includes features for grades management, assignments, learning modules, meetings, chat, announcements, and an advanced enrollment workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**React SPA with TypeScript**: The application uses React as the primary frontend framework with TypeScript for type safety. The client is structured as a single-page application using Wouter for client-side routing.

**Component Architecture**: 
- UI components follow the Shadcn/ui design system using Radix UI primitives
- Tailwind CSS for styling with custom design tokens
- Components are organized by feature (auth, dashboard, grades, etc.)
- Shared UI components in `components/ui/`

**State Management**:
- React Context API for authentication and chat state management
- TanStack Query for server state management and caching
- Custom hooks for Firebase realtime data (`useFirebaseAuth`, `useRealtimeData`)

**Routing & Layout**: 
- Wouter for lightweight client-side routing
- Role-based content rendering through conditional components
- MainLayout component handles sidebar navigation and chat panel

### Backend Architecture

**PostgreSQL Database**:
- PostgreSQL database with Drizzle ORM for type-safe database operations
- Role-based user management with password hashing
- Structured relational data with foreign key relationships
- Real-time data access through database queries

**Express Server**:
- Express.js server for API endpoints and business logic
- Vite integration for hot reloading and development features
- Database storage interface with PostgreSQL implementation

**Data Schema**:
- Drizzle ORM schema definitions with PostgreSQL-compatible types
- Type-safe database operations with Zod validation
- Role-based user types (student, teacher, admin, parent, guidance, registrar, accounting)
- Structured data models for grades, assignments, meetings, announcements, news, events

### Database Features

**Chat System**: Database-stored messaging with PostgreSQL for persistent chat history and user communication.

**Data Management**: CRUD operations for grades, assignments, announcements using PostgreSQL with Drizzle ORM for type safety.

### Authentication & Authorization

**Role-Based Access Control**: Seven distinct user roles with different permissions and portal access. Authentication handled through PostgreSQL with password hashing and session management.

**Protected Routes**: Client-side route protection based on authentication status and user roles stored in database.

### File Management

**Database File References**: File upload system with PostgreSQL storage of file URLs and metadata for learning modules, assignments, and enrollment documents.

### Enrollment System

**Multi-Step Workflow**: Progressive enrollment process with document upload, payment verification, and approval workflow managed through PostgreSQL database.

## External Dependencies

### Core Database Services
- **PostgreSQL**: Primary database for all data storage and management
- **Drizzle ORM**: Type-safe database operations and schema management
- **@neondatabase/serverless**: PostgreSQL connection pooling and management

### UI Framework & Styling
- **Radix UI**: Headless UI primitives for components
- **Tailwind CSS**: Utility-first CSS framework
- **Shadcn/ui**: Pre-built component library

### Development Tools
- **Vite**: Build tool and development server
- **TypeScript**: Type safety and development experience
- **TanStack Query**: Data fetching and caching
- **Wouter**: Lightweight client-side routing

### Form & Data Handling
- **React Hook Form**: Form state management and validation
- **Zod**: Schema validation and type inference
- **Date-fns**: Date manipulation utilities

### Development Environment
- **Replit**: Cloud development environment
- **ESBuild**: Fast bundling for production builds
- **PostCSS**: CSS processing and optimization