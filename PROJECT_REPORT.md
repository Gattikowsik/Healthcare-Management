# Healthcare Management System - Comprehensive Project Report

**Report Generated:** November 10, 2025  
**Project Name:** Healthcare Management System  
**Version:** 1.0.0  
**Repository:** healthcare-management (Owner: Gattikowsik)  
**Branch:** main

---

## Executive Summary

The Healthcare Management System is a full-stack web application designed to streamline healthcare operations including patient management, doctor management, patient-doctor mappings, and user administration. The system features role-based access control, granular permissions, issue tracking, and comprehensive administrative capabilities.

### Key Highlights
- **Full-Stack Architecture:** React frontend with Node.js/Express backend
- **Database:** PostgreSQL with Prisma ORM
- **Authentication:** JWT-based security
- **Deployment:** Fully containerized with Docker and Docker Compose
- **CI/CD:** Jenkins pipeline for automated deployment
- **Role-Based Access Control:** Admin and user roles with granular permissions
- **Modern UI:** React with Tailwind CSS and dark mode support

---

## 1. Project Architecture

### 1.1 Technology Stack

#### Frontend
- **Framework:** React 19.2.0
- **UI Framework:** Tailwind CSS 3.4.1
- **Routing:** React Router DOM 7.9.5
- **HTTP Client:** Axios 1.13.1
- **Notifications:** React Toastify 11.0.5
- **Testing:** React Testing Library, Jest

#### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express 4.18.2
- **ORM:** Prisma 6.15.0
- **Database:** PostgreSQL 15
- **Authentication:** JWT (jsonwebtoken 9.0.2)
- **Password Hashing:** bcryptjs 2.4.3
- **CORS:** cors 2.8.5

#### DevOps & Infrastructure
- **Containerization:** Docker, Docker Compose
- **CI/CD:** Jenkins
- **Database Tools:** Prisma Studio
- **Version Control:** Git/GitHub

### 1.2 System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Frontend Layer                        │
│  (React, Tailwind CSS, React Router, Axios)                 │
│  Port: 3000 (Dev) / 80 (Production Docker)                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ HTTP/HTTPS
┌─────────────────────────────────────────────────────────────┐
│                        Backend Layer                         │
│  (Node.js, Express, JWT Auth, Prisma ORM)                   │
│  Port: 5000                                                  │
└─────────────────────────────────────────────────────────────┘
                            ↓ SQL
┌─────────────────────────────────────────────────────────────┐
│                      Database Layer                          │
│  (PostgreSQL 15)                                             │
│  Port: 5432                                                  │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema

### 2.1 Data Models

The system uses Prisma ORM with the following core models:

#### **User Model**
- Primary authentication and authorization entity
- Fields: id, firstName, lastName, username, email, contact, password, role, isActive
- Relationships: permissions, patients, mappings, issueRequests
- Self-referential: createdBy (tracks user creator)
- Roles: "admin" or "user"

#### **Permission Model**
- Granular permission control per user
- Fields: userId, canManagePatients, canManageDoctors, canViewMappings, canCreateMappings
- One-to-one relationship with User

#### **Patient Model**
- Patient records management
- Fields: id, name, age, disease
- Relationships: createdBy (User), mappings

#### **Doctor Model**
- Doctor information and specialties
- Fields: id, name, specialty, experience, contact
- Relationships: mappings

#### **Mapping Model**
- Patient-Doctor assignments
- Fields: id, patientId, doctorId, createdBy
- Relationships: patient, doctor, user (creator)

#### **IssueRequest Model**
- Support ticket system
- Fields: id, userId, subject, description, status, priority, adminNotes
- Status: pending, in-progress, resolved, rejected
- Priority: low, medium, high

### 2.2 Database Migration History

1. **20250905171227_init:** Initial schema creation
2. **20250905201415_rename_spec_to_specialty:** Renamed doctor specialty field
3. **20251030071315_add_missing_fields:** Added missing fields to models
4. **20251030095856_add_admin_features:** Admin feature enhancements
5. **20251030100034_admin:** Additional admin capabilities

---

## 3. Backend API Architecture

### 3.1 Controllers & Routes

#### **Authentication Routes** (`/api/auth`)
- `POST /register` - User registration (disabled, returns 403)
- `POST /login` - User authentication
- `GET /profile` - Get user profile (protected)
- `PUT /profile` - Update profile (protected)
- `POST /change-password` - Change password (protected)

#### **Patient Routes** (`/api/patients`)
- `POST /` - Create patient (requires canManagePatients permission)
- `GET /` - Get all user's patients (protected)
- `GET /:id` - Get patient by ID (protected)
- `PUT /:id` - Update patient (requires canManagePatients permission)
- `DELETE /:id` - Delete patient (requires canManagePatients permission)

#### **Doctor Routes** (`/api/doctors`)
- `POST /` - Create doctor (requires canManageDoctors permission)
- `GET /` - Get all doctors (protected)
- `GET /:id` - Get doctor by ID (protected)
- `PUT /:id` - Update doctor (requires canManageDoctors permission)
- `DELETE /:id` - Delete doctor (requires canManageDoctors permission)

#### **Mapping Routes** (`/api/mappings`)
- `POST /` - Create mapping (requires canCreateMappings permission)
- `GET /` - Get all user's mappings (requires canViewMappings permission)
- `GET /:id` - Get mapping by ID (requires canViewMappings permission)
- `PUT /:id` - Update mapping (requires canCreateMappings permission)
- `DELETE /:id` - Delete mapping (requires canCreateMappings permission)

#### **Admin Routes** (`/api/admin`)
- `GET /dashboard/stats` - Get dashboard statistics (admin only)
- `GET /users` - Get all users (admin only)
- `POST /users` - Create new user (admin only)
- `GET /users/:id` - Get user details (admin only)
- `PUT /users/:id` - Update user (admin only)
- `DELETE /users/:id` - Delete user (admin only)
- `POST /users/:id/reset-password` - Reset user password (admin only)
- `GET /users/:id/patients` - Get user's patients (admin only)
- `GET /users/:id/mappings` - Get user's mappings (admin only)
- `GET /patients` - Get all patients (admin only)
- `GET /doctors` - Get all doctors (admin only)
- `GET /mappings` - Get all mappings (admin only)

#### **Issue Routes** (`/api/issues`)
- Issue request management (support tickets)

### 3.2 Middleware

#### **Authentication Middleware** (`authMiddleware.js`)
- JWT token validation
- User authentication verification
- Attaches user object to request

#### **Admin Middleware** (`adminMiddleware.js`)
- Admin role verification
- Protects admin-only routes

#### **Permission Middleware** (`permissionMiddleware.js`)
- Granular permission checks
- `canManagePatients` - Patient CRUD operations
- `canManageDoctors` - Doctor CRUD operations
- `canViewMappings` - View patient-doctor mappings
- `canCreateMappings` - Create/modify mappings

### 3.3 CORS Configuration

Multiple origin support for development and production:
- `http://localhost:3000` (Local development)
- `http://localhost` (Docker frontend)
- `http://localhost:80` (Docker frontend explicit port)
- Configurable via `FRONTEND_URL` environment variable

---

## 4. Frontend Architecture

### 4.1 Application Structure

#### **Context**
- `AuthContext.js` - Global authentication state management

#### **Components**
- `Navbar.js` - Top navigation bar with theme toggle
- `Sidebar.js` - Side navigation menu
- `ProtectedRoute.js` - Route protection wrapper
- `LoadingSpinner.js` - Loading indicator

#### **Pages**

**Public Pages:**
- `Login.js` - User authentication page

**User Pages:**
- `Dashboard.js` - User dashboard
- `Patients.js` - Patient management
- `Doctors.js` - Doctor management
- `Mappings.js` - Patient-doctor mapping management
- `Profile.js` - User profile management
- `IssueRequests.js` - Support ticket system

**Admin Pages:**
- `AdminDashboard.js` - Admin overview and statistics
- `AdminPanel.js` - User management panel
- `AdminPatientsManagement.js` - System-wide patient management
- `AdminDoctorsManagement.js` - System-wide doctor management
- `AdminMappingsManagement.js` - System-wide mapping management

**Utility Pages:**
- `NotFound.js` - 404 error page

### 4.2 Features

#### **Authentication & Authorization**
- JWT token-based authentication
- Persistent login with localStorage
- Protected routes with automatic redirection
- Role-based route access (admin vs. user)

#### **Theme Support**
- Light/Dark mode toggle
- Persisted theme preference
- Tailwind CSS dark mode classes

#### **Responsive Design**
- Mobile-first approach
- Collapsible sidebar for mobile devices
- Responsive tables and layouts
- Tailwind CSS responsive utilities

#### **User Experience**
- Toast notifications for feedback
- Loading states and spinners
- Form validation
- Error handling

---

## 5. DevOps & Deployment

### 5.1 Docker Configuration

#### **Docker Compose Services**

**postgres** (PostgreSQL Database)
- Image: `postgres:15-alpine`
- Port: 5432
- Health checks enabled
- Persistent volume: `postgres_data`

**backend** (Node.js API)
- Custom Dockerfile build
- Port: 5000
- Auto-runs database migrations on startup
- Environment-based configuration

**frontend** (React Application)
- Custom Dockerfile build
- Port: 3000 (dev) / 80 (production)
- Nginx-based production build

**prisma-studio** (Database GUI)
- Port: 5555
- Browser-based database management
- Development tool

#### **Networks**
- `healthcare-network` - Bridge network for service communication

#### **Volumes**
- `postgres_data` - Database persistence
- `prisma_studio_modules` - Node modules for Prisma Studio

### 5.2 Jenkins CI/CD Pipeline

#### **Pipeline Stages**

1. **Checkout**
   - Clone repository from GitHub
   - SCM integration

2. **Environment Check**
   - Verify Node.js installation
   - Check Docker availability
   - Validate Docker Compose

3. **Install Dependencies**
   - Backend: `npm install`
   - Frontend: `npm install`

4. **Run Tests**
   - Backend test suite
   - Frontend test suite with React Testing Library
   - Continues on missing tests

5. **Build**
   - Frontend production build
   - Docker image building

6. **Deploy**
   - Stop previous containers
   - Start new containers with `docker-compose up -d`
   - Database migration deployment

7. **Health Check**
   - 10-second warmup period
   - Container status verification

#### **Jenkins Configuration**
- **Tools Required:** NodeJS-18
- **Agent:** Any
- **Shell:** Windows Batch (bat commands)
- **Post Actions:** Workspace cleanup

#### **Jenkins Docker Setup**
- Separate Docker Compose file: `jenkins-docker-compose.yml`
- Services: jenkins (master), jenkins-agent
- Ports: 8080 (UI), 50000 (agent)
- Volumes: jenkins_home, jenkins_agent
- Docker socket mounting for Docker-in-Docker

---

## 6. Security Implementation

### 6.1 Authentication
- **JWT Tokens:** Secure token generation with configurable secret
- **Password Hashing:** bcryptjs with salt rounds
- **Token Storage:** localStorage (frontend)
- **Token Validation:** Middleware-based verification

### 6.2 Authorization
- **Role-Based Access Control (RBAC):** Admin vs. User roles
- **Permission System:** Granular permissions per user
- **Route Protection:** Backend middleware + frontend guards
- **Cascade Deletion:** User deletion removes associated data

### 6.3 Data Protection
- **SQL Injection Prevention:** Prisma ORM parameterized queries
- **CORS Policy:** Configured allowed origins
- **Environment Variables:** Sensitive data in .env files
- **Password Restrictions:** Self-registration disabled

### 6.4 User Management
- **Admin-Only Registration:** Only admins can create users
- **Password Reset:** Admin-initiated password resets
- **User Activation:** isActive flag for user management
- **Audit Trail:** createdBy tracking for accountability

---

## 7. Key Features & Functionality

### 7.1 User Management
- Admin can create, read, update, and delete users
- User profile management
- Password change functionality
- Role assignment (admin/user)
- Permission configuration per user
- User activity tracking

### 7.2 Patient Management
- CRUD operations for patient records
- Patient information: name, age, disease
- User-specific patient lists
- Admin can view all patients across system
- Permission-based access control

### 7.3 Doctor Management
- CRUD operations for doctor profiles
- Doctor details: name, specialty, experience, contact
- Specialty categorization
- System-wide doctor availability
- Permission-based modifications

### 7.4 Patient-Doctor Mapping
- Assign patients to doctors
- View patient-doctor relationships
- Update and delete mappings
- User-specific mapping views
- Admin oversight of all mappings

### 7.5 Issue Request System
- Submit support tickets/issues
- Priority levels: low, medium, high
- Status tracking: pending, in-progress, resolved, rejected
- Admin notes for issue resolution
- User issue history

### 7.6 Admin Dashboard
- System statistics overview
- User count and management
- Patient and doctor statistics
- Mapping overview
- Recent activity monitoring

### 7.7 Permission System
- `canManagePatients` - Create/edit/delete patients
- `canManageDoctors` - Create/edit/delete doctors
- `canViewMappings` - View patient-doctor mappings
- `canCreateMappings` - Create/edit/delete mappings
- Default permissions for new users

---

## 8. Development Workflow

### 8.1 Local Development

**Prerequisites:**
- Node.js 14+
- PostgreSQL 12+
- npm or yarn

**Setup Commands:**
```bash
# Install all dependencies
npm run install:all

# Run database migrations
npm run prisma:migrate

# Generate Prisma client
npm run prisma:generate

# Start development servers
npm run dev  # Runs both backend and frontend concurrently

# Or individually:
npm run dev:backend   # Backend only on port 5000
npm run dev:frontend  # Frontend only on port 3000
```

**Database Management:**
```bash
# Open Prisma Studio
npm run prisma:studio  # Opens on port 5555
```

### 8.2 Docker Development

**Quick Start:**
```bash
# Build and start all services
docker-compose up -d

# View logs
docker-compose logs -f

# Stop services
docker-compose down

# Rebuild images
docker-compose build
```

**Service Access:**
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Database: localhost:5432
- Prisma Studio: http://localhost:5555

### 8.3 Environment Configuration

**Required Environment Variables:**
```env
# Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password
POSTGRES_DB=healthcare_db
DATABASE_URL=postgresql://user:pass@host:5432/db

# Authentication
JWT_SECRET=your_jwt_secret_key_here

# Admin Credentials
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin_password

# CORS
FRONTEND_URL=http://localhost:3000

# Frontend API
REACT_APP_API_URL=http://localhost:5000/
```

---

## 9. Testing Strategy

### 9.1 Frontend Testing
- **Framework:** Jest + React Testing Library
- **Command:** `npm test`
- **Coverage:** Component rendering, user interactions, DOM testing

### 9.2 Backend Testing
- **Framework:** To be configured
- **Command:** `npm test`
- **Focus:** API endpoints, authentication, authorization, database operations

### 9.3 Integration Testing
- Docker Compose environment testing
- End-to-end user workflows
- Database migration verification

---

## 10. Project Statistics

### 10.1 Code Organization

**Backend:**
- Controllers: 6 files (admin, auth, doctor, issue, mapping, patient)
- Routes: 6 files
- Middlewares: 3 files (auth, admin, permission)
- Database Models: 6 models
- Migrations: 5 migrations

**Frontend:**
- Pages: 14 components
- Reusable Components: 4 components
- Context Providers: 1 (AuthContext)
- API Integration: Axios instance

### 10.2 Dependencies

**Backend Dependencies:** 7 core packages
- @prisma/client, bcryptjs, cors, dotenv, express, jsonwebtoken, pg

**Frontend Dependencies:** 10 core packages
- React 19, React Router, Axios, Tailwind CSS, React Toastify

**Dev Dependencies:** 5 packages
- concurrently, nodemon, autoprefixer, postcss, tailwindcss

---

## 11. Known Limitations & Future Enhancements

### 11.1 Current Limitations
- No email notification system
- Limited test coverage
- No file upload functionality for patient/doctor documents
- No appointment scheduling system
- No real-time notifications

### 11.2 Potential Enhancements

**Short-term:**
- Comprehensive test suite implementation
- Email notification integration
- Enhanced search and filtering
- Data export functionality (PDF/CSV)
- Audit log system

**Medium-term:**
- Appointment scheduling module
- Medical records management
- Prescription management
- Real-time chat/notifications (WebSocket)
- Multi-language support

**Long-term:**
- Mobile application (React Native)
- Analytics and reporting dashboard
- Integration with medical devices
- Telemedicine features
- AI-powered diagnosis assistance

---

## 12. Deployment Checklist

### 12.1 Pre-Deployment
- [ ] Set strong JWT_SECRET in production
- [ ] Configure production database credentials
- [ ] Set secure admin credentials
- [ ] Configure CORS for production domains
- [ ] Enable HTTPS/SSL certificates
- [ ] Set NODE_ENV=production
- [ ] Review and set rate limiting
- [ ] Configure logging and monitoring

### 12.2 Production Deployment
- [ ] Build and push Docker images to registry
- [ ] Deploy to cloud provider (AWS, Azure, GCP, DigitalOcean)
- [ ] Configure reverse proxy (Nginx)
- [ ] Set up database backups
- [ ] Configure monitoring (PM2, Prometheus)
- [ ] Set up error tracking (Sentry)
- [ ] Configure CDN for frontend assets
- [ ] Implement health check endpoints

### 12.3 Post-Deployment
- [ ] Verify all services are running
- [ ] Test authentication flows
- [ ] Validate admin functionalities
- [ ] Monitor logs for errors
- [ ] Performance testing
- [ ] Security audit
- [ ] User acceptance testing
- [ ] Documentation updates

---

## 13. Maintenance & Support

### 13.1 Backup Strategy
- **Database:** Automated daily PostgreSQL backups
- **Docker Volumes:** Regular volume snapshots
- **Code:** Version control with GitHub
- **Retention:** 30-day backup retention policy

### 13.2 Monitoring
- **Application Logs:** Docker logs, Winston/Morgan logger
- **Database Monitoring:** Prisma metrics, PostgreSQL logs
- **Server Monitoring:** CPU, memory, disk usage
- **Uptime Monitoring:** Health check endpoints

### 13.3 Update Procedures
- **Dependencies:** Monthly security updates
- **Database Migrations:** Prisma migrate workflow
- **Code Deployments:** Jenkins pipeline automation
- **Rollback Strategy:** Docker image versioning

---

## 14. Documentation References

### 14.1 Project Documentation
- `README.md` - Main project documentation
- `backend/README.md` - Backend-specific documentation
- `frontend/README.md` - Frontend-specific documentation
- `frontend/src/styles/README.md` - Styling guidelines

### 14.2 External Resources
- [Prisma Documentation](https://www.prisma.io/docs)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Docker Documentation](https://docs.docker.com/)
- [Jenkins Documentation](https://www.jenkins.io/doc/)

---

## 15. Contact & Contributors

### 15.1 Repository Information
- **Repository:** healthcare-management
- **Owner:** Gattikowsik
- **Branch:** main
- **License:** ISC

### 15.2 Project Directories
- **Root:** `d:\Projects\healthcare-management`
- **Backend:** `d:\Projects\healthcare-management\backend`
- **Frontend:** `d:\Projects\healthcare-management\frontend`

---

## 16. Conclusion

The Healthcare Management System is a robust, full-stack application that successfully implements core healthcare management functionalities with modern web technologies. The system demonstrates:

✅ **Scalable Architecture** - Microservices-ready with Docker containerization  
✅ **Security First** - JWT authentication, RBAC, and granular permissions  
✅ **Developer Friendly** - Clear project structure, comprehensive documentation  
✅ **Production Ready** - CI/CD pipeline, health checks, and monitoring hooks  
✅ **Extensible Design** - Modular controllers, middleware, and component structure  

The project provides a solid foundation for healthcare operations management and can be extended with additional features like appointment scheduling, telemedicine, and advanced analytics.

---

**Report End**