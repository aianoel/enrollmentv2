# EduManage - School Management System

## Overview

EduManage is a comprehensive school management system designed to streamline educational administration and enhance communication. It provides role-based portals for students, teachers, administrators, parents, registrars, guidance counselors, and accounting staff. Key capabilities include grades management, assignments, learning modules, meeting scheduling, chat, announcements, and an advanced enrollment workflow. The project features a modern Tabler-inspired dashboard design with professional stat cards, interactive charts, and activity feeds. The project aims to offer a robust, secure, and user-friendly platform for efficient school operations, with a vision for broad adoption in educational institutions.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

The frontend is a React Single Page Application (SPA) built with TypeScript. It leverages Shadcn/ui, Radix UI primitives, and Tailwind CSS for a modern, consistent UI. The design follows a Tabler-inspired dashboard layout with professional stat cards featuring trend indicators, interactive donut charts, progress cards, and activity feeds. Role-specific color themes (admin: purple, student: blue, teacher: green) provide visual differentiation. 

**Mobile Responsiveness**: Comprehensive mobile-first responsive design implemented across all components using Tailwind CSS breakpoints (sm:, md:, lg:, xl:). Features include:
- Mobile-optimized Header with hamburger menu navigation
- Responsive Sidebar with adaptive sizing and spacing
- Mobile-responsive Admin Dashboard with horizontal scroll tabs and adaptive grids
- Cross-device optimization for all stat cards, content areas, and navigation elements
- Mobile-friendly forms, tables, and interactive components

State management utilizes React Context API for global states like authentication and chat, while TanStack Query handles server state and caching. Wouter provides lightweight client-side routing, enabling role-based content rendering.

### Backend Architecture

The backend is powered by an Express.js server interacting with a PostgreSQL database via Drizzle ORM for type-safe operations. It implements a robust Role-Based Access Control (RBAC) system with secure password hashing and session management. The server provides API endpoints for all system functionalities, including comprehensive data models for grades, assignments, meetings, announcements, and an advanced enrollment system. File management stores file URLs and metadata in the database. A real-time chat system is integrated using WebSockets.

### Database Features

PostgreSQL serves as the primary database, ensuring data integrity with strong foreign key relationships and optimized for performance. It stores all relational data, including user profiles, academic records, financial transactions, and real-time chat messages.

### Authentication & Authorization

The system employs a role-based access control (RBAC) model with seven distinct user roles, each having specific permissions and portal access. Authentication is handled via PostgreSQL, utilizing secure password hashing and session management for protected routes.

## External Dependencies

### Core Database Services
- **PostgreSQL**: Main relational database.
- **Drizzle ORM**: TypeScript ORM for database interactions.
- **@neondatabase/serverless**: PostgreSQL connection pooling.

### UI Framework & Styling
- **Radix UI**: Headless UI components.
- **Tailwind CSS**: Utility-first CSS framework.
- **Shadcn/ui**: Component library built on Radix UI and Tailwind CSS.

### Development Tools
- **Vite**: Frontend build tool and development server.
- **TypeScript**: Programming language for type safety.
- **TanStack Query**: Data fetching, caching, and synchronization.
- **Wouter**: Lightweight client-side router.

### Form & Data Handling
- **React Hook Form**: Form management and validation.
- **Zod**: Schema validation and type inference.
- **Date-fns**: Date manipulation utility.

### Development Environment
- **Replit**: Cloud development platform.
- **ESBuild**: Fast JavaScript bundler.
- **PostCSS**: CSS preprocessor.
- **Socket.IO**: Real-time bidirectional event-based communication.