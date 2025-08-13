# EduManage - School Management System

## Overview

EduManage is a comprehensive school management system built with React (frontend) and Firebase (backend). It provides role-based portals for students, teachers, administrators, parents, registrars, guidance counselors, and accounting staff. The system includes features for grades management, assignments, learning modules, meetings, chat, announcements, and an advanced enrollment workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 13, 2025 - Enhanced Guidance Office Dashboard**:
- Added comprehensive guidance office database schema with 4 new tables: guidance_behavior_records, guidance_counseling_sessions, guidance_wellness_programs, guidance_program_participants
- Created comprehensive EnhancedGuidanceDashboard with behavior incident tracking, counseling session management, wellness program coordination, and student participation tracking
- Implemented complete API routes for all guidance office features with automatic notification system
- Added real-time status tracking for behavioral incidents (Pending, Resolved, Escalated)
- Integrated confidentiality levels for counseling sessions (Internal, Share with Parent, Share with Teacher)
- Automated notification system for escalated incidents and program announcements
- Successfully deployed enhanced guidance dashboard replacing basic version

**August 13, 2025 - Enhanced Teacher & Student Dashboards**:
- Added enhanced database schema with teacher tasks, meetings, task submissions, and notifications tables
- Created comprehensive EnhancedTeacherDashboard with task management, meeting scheduling, grade tracking, and student communication
- Created comprehensive EnhancedStudentDashboard with assignment tracking, timer functionality, grade viewing, and notification system
- Implemented complete API routes for teacher and student enhanced features
- Added real-time task timer functionality for students with pause/resume capabilities
- Integrated notification system for task assignments and meeting announcements
- Successfully deployed enhanced dashboards replacing basic versions

**August 13, 2025 - Database Setup & Login Fix**:
- Fixed DATABASE_URL configuration issue by creating PostgreSQL database
- Pushed database schema to PostgreSQL using Drizzle migrations
- Created demo user accounts for all 7 roles with proper password hashing
- Verified login functionality working for all demo accounts
- Application now running successfully on port 5000

**Demo Accounts Available**:
- Admin: admin@school.edu / admin123456
- Teacher: teacher@school.edu / teacher123
- Student: student@school.edu / student123
- Parent: parent@school.edu / parent123
- Guidance: guidance@school.edu / guidance123
- Registrar: registrar@school.edu / registrar123
- Accounting: accounting@school.edu / accounting123

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
- Enhanced teacher features: teacher tasks, task submissions, teacher meetings, notifications
- Advanced task management with timer support, due dates, and submission tracking

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