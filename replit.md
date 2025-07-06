# THE SUPERVISOR

## Overview

THE SUPERVISOR is a hierarchical performance reporting and feedback platform designed for enterprise organizations with 10+ employees. The system enables structured feedback loops from employees to supervisors, to managers, to executives through a web-based interface with role-based access control.

## System Architecture

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **UI Library**: Shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: TanStack Query for server state, React hooks for local state
- **Routing**: Wouter for client-side routing
- **Build Tool**: Vite with custom configuration for monorepo structure

### Backend Architecture
- **Runtime**: Node.js with Express.js
- **Language**: TypeScript with ES modules
- **API Pattern**: RESTful API with role-based endpoints
- **Session Management**: Express sessions with PostgreSQL storage
- **Authentication**: Replit Auth (OIDC) with Passport.js

### Database Layer
- **Database**: PostgreSQL with Neon serverless connection
- **ORM**: Drizzle ORM with type-safe schema definitions
- **Schema Location**: Shared schema in `/shared/schema.ts`
- **Migration Strategy**: Drizzle Kit for schema migrations

## Key Components

### User Management
- **Roles**: Employee, Supervisor, Manager, Executive (hierarchical)
- **Authentication**: OIDC-based authentication via Replit Auth
- **Authorization**: Role-based access control (RBAC) with supervisor relationships
- **User Hierarchy**: Each user links to a supervisor, forming organizational tree structure

### Reporting System
- **Report Types**: Weekly, project, goal review, special reports
- **Workflow**: Submit → Review → Approve/Request Revision cycle
- **Metadata**: Priority levels, task completion tracking, performance metrics
- **Review Process**: Supervisor feedback with ratings and comments

### Dashboard & Analytics
- **Role-specific Dashboards**: Customized views based on user role
- **Performance Metrics**: Task completion rates, review statistics, team performance
- **Real-time Updates**: Live notification system with unread counts
- **Data Visualization**: Statistics cards and performance indicators

### Notification System
- **Real-time Alerts**: New reports, pending reviews, status changes
- **Persistence**: Database-stored notifications with read/unread status
- **Role-based Filtering**: Notifications relevant to user's role and responsibilities

## Data Flow

1. **Authentication Flow**: Replit OIDC → Passport middleware → Session creation → User context
2. **Report Submission**: Employee creates report → Supervisor notification → Review process → Status update
3. **Hierarchy Management**: User roles determine data access and available actions
4. **Dashboard Updates**: Real-time queries fetch role-appropriate statistics and recent activity

## External Dependencies

### Authentication
- **Replit Auth**: OIDC provider for user authentication
- **Requirements**: REPLIT_DOMAINS and SESSION_SECRET environment variables

### Database
- **Neon PostgreSQL**: Serverless PostgreSQL database
- **Connection**: Via DATABASE_URL environment variable
- **Session Storage**: PostgreSQL-backed session store

### UI Components
- **Radix UI**: Headless component primitives
- **Shadcn/ui**: Pre-built component library
- **Lucide React**: Icon library

## Deployment Strategy

### Development
- **Local Development**: Vite dev server with Express backend
- **Hot Reload**: Vite HMR for frontend, tsx for backend auto-restart
- **Environment**: NODE_ENV=development with debug logging

### Production Build
- **Frontend**: Vite builds to `dist/public`
- **Backend**: ESBuild bundles server to `dist/index.js`
- **Static Serving**: Express serves built frontend assets
- **Process**: Single Node.js process serving both API and static files

### Environment Variables
- `DATABASE_URL`: PostgreSQL connection string
- `SESSION_SECRET`: Session encryption key
- `REPLIT_DOMAINS`: Allowed domains for Replit Auth
- `ISSUER_URL`: OIDC issuer URL (defaults to Replit)

## Changelog
- July 06, 2025. Initial setup
- July 06, 2025. Added comprehensive admin dashboard system with role-based login portals:
  - Enhanced landing page with role-specific login buttons (Employee, Supervisor, Manager, Executive)
  - Created dedicated dashboards for each organizational level
  - Built user registration system with organizational hierarchy selection
  - Added admin dashboard for executives with system-wide oversight
  - Implemented role-based routing and authentication

## Recent Changes
✓ Enhanced landing page with role-based login portals
✓ Created 5 specialized dashboards (Admin, Employee, Supervisor, Manager, Executive)
✓ Built comprehensive user registration modal with multi-step workflow
✓ Added role-based routing with automatic dashboard selection
✓ Implemented hierarchical user management system

## User Preferences

Preferred communication style: Simple, everyday language.
User wants comprehensive admin system with organizational flow and role-based access.