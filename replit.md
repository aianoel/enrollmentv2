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

**Firebase Services**:
- Firebase Authentication for user management with email/password
- Firebase Realtime Database for real-time data synchronization
- Firebase Storage for file uploads (documents, modules, profile pictures)

**Express Server (Development)**:
- Express.js server for development and API endpoints
- Vite integration for hot reloading and development features
- Basic storage interface with in-memory implementation for development

**Data Schema**:
- Zod schemas for type validation and data structure definition
- Role-based user types (student, teacher, admin, parent, etc.)
- Structured data models for grades, assignments, modules, meetings, announcements

### Real-time Features

**Chat System**: Real-time messaging using Firebase Realtime Database with online presence tracking and user status management.

**Live Data Updates**: Real-time synchronization of grades, assignments, announcements using Firebase's onValue listeners.

### Authentication & Authorization

**Role-Based Access Control**: Seven distinct user roles with different permissions and portal access. Authentication handled through Firebase Auth with user profiles stored in Realtime Database.

**Protected Routes**: Client-side route protection based on authentication status and user roles.

### File Management

**Firebase Storage Integration**: File upload system for learning modules, assignments, and enrollment documents with helper utilities for file validation and type checking.

### Enrollment System

**Multi-Step Workflow**: Progressive enrollment process with document upload, payment verification, and approval workflow managed through Firebase Realtime Database.

## External Dependencies

### Core Firebase Services
- **Firebase Authentication**: User authentication and session management
- **Firebase Realtime Database**: Real-time data storage and synchronization
- **Firebase Storage**: File storage and management

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