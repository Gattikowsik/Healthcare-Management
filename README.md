# Healthcare Management System

A full-stack healthcare management application with Docker support, built with React, Node.js, Express, Prisma, and PostgreSQL.

## Project Structure

```
healthcare-management/
├── backend/              # Backend API (Node.js + Express + Prisma)
│   ├── src/             # Source code
│   ├── prisma/          # Database schema and migrations
│   ├── Dockerfile       # Backend Docker configuration
│   └── package.json     # Backend dependencies
├── frontend/            # Frontend application (React)
│   ├── src/            # React components and pages
│   ├── Dockerfile      # Frontend Docker configuration
│   └── package.json    # Frontend dependencies
├── docker-compose.yml  # Docker Compose configuration
├── .dockerignore       # Docker ignore rules
├── package.json        # Root package.json with scripts
└── README.md          # This file
```

## Features

- **User Management**: Admin panel for managing users with role-based access control
- **Patient Management**: Create, read, update, and delete patient records
- **Doctor Management**: Manage doctor information and specialties
- **Patient-Doctor Mapping**: Link patients with their assigned doctors
- **Issue Tracking**: Submit and manage support requests
- **Authentication**: JWT-based authentication with protected routes
- **Permissions**: Granular permission system for different user roles
- **Docker Support**: Full containerization with Docker and Docker Compose

## Prerequisites

### For Local Development
- Node.js (v14 or higher)
- PostgreSQL (v12 or higher)
- npm or yarn

### For Docker Deployment
- Docker
- Docker Compose

## Quick Start

### Option 1: Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd healthcare-management
   ```

2. **Create environment file:**
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` with your configuration:
   ```env
   # PostgreSQL
   POSTGRES_USER=postgres
   POSTGRES_PASSWORD=your_password
   POSTGRES_DB=healthcare_db
   
   # Backend
   DATABASE_URL=postgresql://postgres:your_password@postgres:5432/healthcare_db
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:3000
   
   # Frontend (if needed)
   REACT_APP_API_URL=http://localhost:5000/api
   ```

3. **Start all services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   docker-compose exec backend npx prisma migrate deploy
   ```

5. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000
   - PostgreSQL: localhost:5432

6. **Stop all services:**
   ```bash
   docker-compose down
   ```

### Option 2: Local Development

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd healthcare-management
   ```

2. **Install dependencies:**
   ```bash
   npm run install:all
   ```

3. **Setup Backend:**
   ```bash
   cd backend
   cp .env.example .env
   # Edit .env with your database credentials
   npm run migrate
   npm run generate
   cd ..
   ```

4. **Setup Frontend:**
   ```bash
   cd frontend
   # Create .env if needed
   echo "REACT_APP_API_URL=http://localhost:5000/api" > .env
   cd ..
   ```

5. **Start development servers:**
   ```bash
   npm run dev
   ```

## Available Scripts

### Root Level Scripts

- `npm run dev` - Run both frontend and backend in development mode
- `npm run dev:backend` - Run backend only
- `npm run dev:frontend` - Run frontend only
- `npm run start:backend` - Run backend in production mode
- `npm run start:frontend` - Run frontend in production mode
- `npm run install:all` - Install dependencies for both frontend and backend
- `npm run install:backend` - Install backend dependencies
- `npm run install:frontend` - Install frontend dependencies
- `npm run prisma:migrate` - Run Prisma database migrations
- `npm run prisma:generate` - Generate Prisma Client
- `npm run prisma:studio` - Open Prisma Studio

### Docker Commands

- `docker-compose up` - Start all services
- `docker-compose up -d` - Start all services in detached mode
- `docker-compose down` - Stop all services
- `docker-compose logs` - View logs from all services
- `docker-compose logs -f backend` - Follow backend logs
- `docker-compose exec backend sh` - Access backend container shell
- `docker-compose exec postgres psql -U postgres -d healthcare_db` - Access database

## Technology Stack

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web framework
- **Prisma** - ORM for database access
- **PostgreSQL** - Database
- **JWT** - Authentication
- **bcryptjs** - Password hashing

### Frontend
- **React** - UI library
- **React Router** - Routing
- **Axios** - HTTP client
- **Tailwind CSS** - Styling
- **Context API** - State management

### DevOps
- **Docker** - Containerization
- **Docker Compose** - Multi-container orchestration
- **Nginx** - Frontend web server (in production)

## Environment Variables

### Required Environment Variables

Create a `.env` file in the root directory:

```env
# PostgreSQL Database
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_secure_password
POSTGRES_DB=healthcare_db

# Backend
DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/healthcare_db
JWT_SECRET=your_jwt_secret_key_here_use_strong_random_string
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Backend-Specific (.env in backend/)
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/healthcare_db
JWT_SECRET=your_jwt_secret_key
FRONTEND_URL=http://localhost:3000
PORT=5000
```

### Frontend-Specific (.env in frontend/)
```env
REACT_APP_API_URL=http://localhost:5000/api
```

## Docker Architecture

### Services

1. **postgres** - PostgreSQL database
   - Port: 5432
   - Volume: postgres_data (persistent storage)

2. **backend** - Node.js API server
   - Port: 5000
   - Depends on: postgres
   - Auto-generates Prisma Client on build

3. **frontend** - React application (served by Nginx)
   - Port: 3000 (mapped to container port 80)
   - Depends on: backend
   - Multi-stage build for optimization

### Volumes

- `postgres_data` - Persists database data across container restarts

### Networks

- `healthcare-network` - Bridge network connecting all services

## Production Deployment

### Docker Production Build

1. **Build images:**
   ```bash
   docker-compose build
   ```

2. **Push to registry:**
   ```bash
   docker tag healthcare-backend your-registry/healthcare-backend:latest
   docker tag healthcare-frontend your-registry/healthcare-frontend:latest
   docker push your-registry/healthcare-backend:latest
   docker push your-registry/healthcare-frontend:latest
   ```

3. **Deploy:**
   - Update docker-compose.yml to use registry images
   - Set production environment variables
   - Run migrations
   - Start services

### Environment-Specific Configuration

For production, update:
- Use strong, unique JWT_SECRET
- Use secure database password
- Update FRONTEND_URL to production domain
- Configure CORS settings
- Set up SSL/TLS certificates
- Use production database URL

## Database Management

### Migrations

```bash
# Create new migration
docker-compose exec backend npx prisma migrate dev --name migration_name

# Apply migrations (production)
docker-compose exec backend npx prisma migrate deploy

# Reset database (caution!)
docker-compose exec backend npx prisma migrate reset
```

### Prisma Studio

```bash
# Open Prisma Studio
npm run prisma:studio
# or with Docker
docker-compose exec backend npx prisma studio
```

## Troubleshooting

### Database Connection Issues
- Ensure PostgreSQL is running
- Check DATABASE_URL is correct
- Verify network connectivity in Docker

### Port Conflicts
- Change ports in docker-compose.yml if defaults are in use
- Update .env files accordingly

### Container Issues
```bash
# View logs
docker-compose logs backend
docker-compose logs frontend

# Restart services
docker-compose restart backend

# Rebuild containers
docker-compose up --build
```

### Prisma Client Issues
```bash
# Regenerate Prisma Client
docker-compose exec backend npx prisma generate
```

## Development Workflow

1. Make changes to frontend or backend code
2. Changes auto-reload in development mode
3. Test locally with Docker Compose
4. Commit and push to repository
5. Build and deploy to production

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the ISC License.

## Support

For issues and questions:
- Use the issue tracking system within the application
- Create a GitHub issue
- Check the documentation in backend/README.md and frontend/README.md
