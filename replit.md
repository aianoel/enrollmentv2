# EduManage - School Management System

## Overview

EduManage is a comprehensive school management system built with React (frontend) and Firebase (backend). It provides role-based portals for students, teachers, administrators, parents, registrars, guidance counselors, and accounting staff. The system includes features for grades management, assignments, learning modules, meetings, chat, announcements, and an advanced enrollment workflow.

## User Preferences

Preferred communication style: Simple, everyday language.

## Recent Changes

**August 13, 2025 - Unified PostgreSQL Schema Implementation**:
- Implemented comprehensive unified PostgreSQL schema integrating all 9 user roles and real-time features
- Successfully migrated from fragmented table structure to cohesive relational database design
- Added Principal and Academic Coordinator roles with dedicated dashboards and API endpoints
- Created unified user management with proper role_id relationships and foreign key constraints
- Rebuilt storage layer and API routes to work with unified schema structure
- All authentication, data access, and role-based features working seamlessly
- Principal API endpoints (/api/principal/stats, /api/principal/financial) providing real-time school analytics
- Academic Coordinator API endpoints (/api/academic/curriculum, /api/academic/teacher-performance, /api/academic/stats) delivering comprehensive academic metrics
- Updated user creation system with proper role mapping and password hashing
- Demo accounts working: principal@school.edu / admin123456 and academic@school.edu / admin123456

**August 13, 2025 - Real-Time Chat System Implementation**:
- Added comprehensive chat database schema with 4 new tables: conversations, conversation_members, messages, user_status
- Implemented real-time WebSocket integration using Socket.IO for instant messaging and online status tracking
- Created comprehensive EnhancedChatSystem component with private/group chat support, typing indicators, and online user detection
- Added complete API routes for chat functionality including conversation management, message handling, and user status updates
- Integrated WebSocket server with automatic user room joining, message broadcasting, and connection handling
- Enhanced ChatPanel component to use new chat system with improved UI and real-time features
- Real-time features: instant message delivery, typing indicators, online status updates, conversation rooms
- Multi-user support: all roles (admin, teacher, student, parent, guidance, registrar, accounting) can participate in chats
- Successfully deployed enhanced chat system replacing basic placeholder version

**August 13, 2025 - Enhanced Accounting Dashboard**:
- Added comprehensive accounting database schema with 6 new tables: fee_structures, invoices, invoice_items, payments, scholarships, school_expenses
- Created comprehensive EnhancedAccountingDashboard with financial management, tuition billing, payment processing, scholarship management, and expense tracking
- Implemented complete API routes for all accounting features with automated billing and payment tracking
- Added fee structure management with grade-level tuition setup and school year tracking
- Integrated invoice generation with automated student notifications and payment status updates
- Payment processing with multiple payment methods (Cash, Bank Transfer, GCash, Credit Card) and receipt tracking
- Scholarship and discount management with percentage-based fee reductions
- School expense tracking with category-based organization and financial reporting
- Automated notification system for invoice generation, payment confirmations, and scholarship awards
- Successfully deployed enhanced accounting dashboard replacing basic version

**August 13, 2025 - Enhanced Registrar Dashboard**:
- Added comprehensive registrar database schema with 5 new tables: registrar_enrollment_requests, registrar_subjects, academic_records, graduation_candidates, transcript_requests
- Created comprehensive EnhancedRegistrarDashboard with enrollment management, curriculum control, academic record tracking, graduation processing, and transcript handling
- Implemented complete API routes for all registrar features with automated notification system
- Added enrollment request approval workflow with status tracking (Pending, Approved, Rejected)
- Integrated academic record management with quarter-based grading and automatic final grade calculation
- Graduation candidate management with clearance tracking and transcript generation
- Automated notification system for enrollment decisions, grade updates, and transcript status
- Successfully deployed enhanced registrar dashboard replacing basic version

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
- Principal: principal@school.edu / admin123456
- Academic Coordinator: academic@school.edu / admin123456
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