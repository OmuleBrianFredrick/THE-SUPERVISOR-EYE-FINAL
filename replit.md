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
- **Custom Auth**: Email + password authentication, fully independent of Replit accounts
- **Password Security**: bcryptjs hashing with 12 salt rounds
- **Sessions**: Express sessions backed by PostgreSQL (connect-pg-simple)
- **Registration**: 2-step form — personal details + organization role/department/supervisor
- **Login/Register pages**: `/login` and `/register` — accessible without a Replit account

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
- `GOOGLE_CLIENT_ID`: Google OAuth client ID
- `GOOGLE_CLIENT_SECRET`: Google OAuth client secret
- `SMTP_HOST`: (Optional) SMTP server for email notifications
- `SMTP_PORT`: (Optional) SMTP port, defaults to 587
- `SMTP_USER`: (Optional) SMTP username/email
- `SMTP_PASS`: (Optional) SMTP password
- `SMTP_FROM`: (Optional) From address for outgoing emails

## Changelog
- July 06, 2025. Initial setup
- July 06, 2025. Added comprehensive admin dashboard system with role-based login portals:
  - Enhanced landing page with role-specific login buttons (Employee, Supervisor, Manager, Executive)
  - Created dedicated dashboards for each organizational level
  - Built user registration system with organizational hierarchy selection
  - Added admin dashboard for executives with system-wide oversight
  - Implemented role-based routing and authentication

## Recent Changes (Phase 1: Foundation & Admin)
✓ Enhanced landing page with role-based login portals and animated UI elements
✓ Created 5 specialized dashboards (Admin, Employee, Supervisor, Manager, Executive)
✓ Built comprehensive user registration modal with multi-step workflow
✓ Added role-based routing with automatic dashboard selection
✓ Implemented hierarchical user management system
✓ Added goals table to database with full CRUD (create, advance status, delete)
✓ Added goals API routes (GET/POST/PATCH/DELETE /api/goals) with ownership checks
✓ Replaced static Performance Goals card on employee dashboard with fully live goals management
✓ Added comprehensive theme system with 5 theme variants (Corporate, Modern, Nature, Sunset, Ocean)
✓ Created advanced notification center with categorization and quick actions
✓ Built quick actions panel with role-specific functionality
✓ Enhanced navigation bar with theme selector, notifications, and search
✓ Updated sidebar with role-based navigation and user profile integration
✓ Added comprehensive pop-up modals for themes, notifications, and quick actions
✓ Implemented comprehensive linkages between all system components
✓ Added glass card effects, animations, and modern UI enhancements

## March 09, 2026 - Phase 2: Core Features Implementation

### ✓ T001-T002: Complete Backend Foundation
- Added storage methods: `getAllUsers()`, `getUsersByRole()`, `getSupervisorsForRole()`, `getSystemStats()`
- Wired admin API endpoints to real database queries
- All admin routes pull real data: `/api/admin/users`, `/api/admin/stats`, `/api/users/supervisors/:role`

### ✓ T003: Admin User Management UI
- Created `/admin-users` page with full user management interface
- Search, filter users by name/email/role/department
- Edit user roles in real-time with modal dialog
- Assign/change supervisors with role-based hierarchy validation
- Executive-only access control
- Integrated into sidebar navigation

### ✓ T004: Complete Reports System
- Report submission form with validation (type, title, tasks, challenges, goals)
- Report review interface with supervisor feedback & 1-5 rating system
- Approve or request revision workflow
- Real-time notifications on report actions
- Full database integration with status tracking

### ✓ T005-T007: Dashboards & Team Management (Partially Complete)
- **Employee Dashboard**: Shows personal reports, average rating, supervisor info (queries real data)
- **Supervisor Dashboard**: Shows pending reviews, team members, team performance (queries real data)
- **Manager Dashboard**: Shows completed reports and team metrics (queries real data)
- **Executive Dashboard**: Now queries real admin stats (Total Users, Active Reports, Pending Reviews)
- **Team Management Page**: Enhanced with real statistics (Team Members, Pending Reviews, Avg Rating)

## Implementation Status

### ✅ Fully Functional & Production Ready
- Landing page with hero, highlights, news, role-based login
- User authentication and authorization (Replit Auth + Passport)
- Role-based access control (RBAC) with 4-level hierarchy
- Database schema with relationships and constraints
- Report submission and supervisor review workflow
- Admin user management system
- Notification system (database-backed)
- Real data flowing through dashboards and admin interfaces

### 🚀 Still Available for Enhancement
- T006: Analytics pages (could add charts and historical trends)
- T008: Admin database/settings pages (could add system configuration UI)
- Advanced team hierarchy visualization
- Historical analytics and reporting trends
- Export/import functionality

## March 12, 2026 - Phase 3: Analytics, Org Chart & Enhanced Settings

### ✓ Analytics Page (`/analytics`)
- Live bar chart: Reports submitted by type (weekly/project/goal_review/special)
- Live pie chart: Report status distribution (pending/approved/needs_revision/rejected)
- Live bar chart: Workforce distribution by role
- Summary cards: Total reports, approved count, approval rate, average rating
- Accessible to supervisors, managers, and executives

### ✓ Organization Chart Page (`/org-chart`)
- Full hierarchical view: Executive → Manager → Supervisor → Employee
- Visual user cards with avatars, names, emails, departments
- Role count summary (how many at each level)
- Arrow connectors showing hierarchy flow
- Accessible to supervisors, managers, and executives

### ✓ Functional Settings Page (`/settings`)
- Real user data pulled from authentication
- Editable first name, last name, and department via API call
- Department selector with 10 preset departments
- Role info display (read-only)
- Authentication status badge
- Working sign out button
- Notification preferences display

### ✓ New Backend APIs
- `GET /api/analytics` - aggregate report and user stats (supervisor+ access)
- `GET /api/users/all` - all organization users (supervisor+ access)
- `PATCH /api/users/profile` - update own profile (all users)

### ✓ Navigation & Routing Updates
- Sidebar now links to Analytics, Org Chart for supervisor/manager/executive
- App.tsx registered `/analytics` and `/org-chart` routes
- Removed broken stub nav items (Calendar, Messages badges)

## Current Feature Map

| Feature | Status | Location |
|---------|--------|----------|
| User Authentication | ✅ Complete | Replit Auth + Passport |
| Role-Based Access | ✅ Complete | RBAC middleware + page checks |
| Report Submission | ✅ Complete | `/reports` page + modal |
| Report Review | ✅ Complete | Report detail view |
| Admin User Management | ✅ Complete | `/admin-users` |
| Admin Dashboard | ✅ Complete | `/admin-dashboard` |
| Employee Dashboard | ✅ Real Data | `/employee-dashboard` |
| Supervisor Dashboard | ✅ Real Data | `/supervisor-dashboard` |
| Manager Dashboard | ✅ Real Data | `/manager-dashboard` |
| Executive Dashboard | ✅ Real Data | `/executive-dashboard` |
| Team Management | ✅ Real Data | `/team` |
| Analytics Charts | ✅ Complete | `/analytics` |
| Organization Chart | ✅ Complete | `/org-chart` |
| Notifications | ✅ Complete | Navbar + database backed |
| Theme System | ✅ Complete | 5 themes available |
| Settings Page | ✅ Functional | `/settings` (editable profile) |

## User Preferences

Preferred communication style: Simple, everyday language.
User wants comprehensive admin system with organizational flow and role-based access.