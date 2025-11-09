# Healthcare Management - Backend

Backend API for the Healthcare Management System built with Node.js, Express, Prisma, and PostgreSQL.

## Project Structure

```
backend/
├── src/
│   ├── controllers/     # Request handlers
│   ├── middlewares/     # Authentication & authorization
│   ├── routes/          # API routes
│   ├── app.js          # Express app configuration
│   └── server.js       # Server entry point
├── prisma/
│   ├── schema.prisma   # Database schema
│   └── migrations/     # Database migrations
├── Dockerfile          # Docker configuration
├── .dockerignore       # Docker ignore rules
├── .env.example        # Environment variables template
├── package.json        # Dependencies and scripts
└── update-mappings.js  # Utility script for mappings
```

## Setup

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Copy `.env.example` to `.env`
   - Update the database connection string and other variables

3. **Run database migrations:**
   ```bash
   npm run migrate
   ```

4. **Generate Prisma Client:**
   ```bash
   npm run generate
   ```

5. **Start the server:**
   ```bash
   npm run dev
   ```

### Docker Setup

1. **Build Docker image:**
   ```bash
   docker build -t healthcare-backend .
   ```

2. **Run container:**
   ```bash
   docker run -p 5000:5000 --env-file .env healthcare-backend
   ```

Or use docker-compose from the root directory (see root README.md)

## Available Scripts

- `npm run dev` - Start development server with nodemon
- `npm start` - Start production server
- `npm run migrate` - Run Prisma migrations
- `npm run generate` - Generate Prisma Client
- `npm run studio` - Open Prisma Studio
- `npm run update-mappings` - Run mapping update utility

## Environment Variables

See `.env.example` for required environment variables:
- `DATABASE_URL` - PostgreSQL connection string
- `JWT_SECRET` - Secret key for JWT tokens
- `FRONTEND_URL` - Frontend URL for CORS
- `PORT` - Server port (default: 5000)

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration (disabled, admin only)

### Patients
- `GET /api/patients` - Get all patients
- `POST /api/patients` - Create new patient
- `PUT /api/patients/:id` - Update patient
- `DELETE /api/patients/:id` - Delete patient

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Create new doctor
- `PUT /api/doctors/:id` - Update doctor
- `DELETE /api/doctors/:id` - Delete doctor

### Mappings
- `GET /api/mappings` - Get all patient-doctor mappings
- `POST /api/mappings` - Create new mapping
- `DELETE /api/mappings/:id` - Delete mapping

### Admin
- `GET /api/admin/users` - Get all users (admin only)
- `POST /api/admin/users` - Create new user (admin only)
- `PUT /api/admin/users/:id` - Update user (admin only)
- `DELETE /api/admin/users/:id` - Delete user (admin only)

### Issues
- `GET /api/issues` - Get all issue requests
- `POST /api/issues` - Create new issue request
- `PUT /api/issues/:id` - Update issue status
- `DELETE /api/issues/:id` - Delete issue

## Database Schema

The application uses PostgreSQL with Prisma ORM. Main models:
- **User** - System users with roles and permissions
- **Patient** - Patient information
- **Doctor** - Doctor information
- **Mapping** - Patient-Doctor relationships
- **Permission** - User permissions
- **IssueRequest** - Support/issue tracking

## Docker Details

### Dockerfile Features
- Multi-stage build for optimized image size
- Uses Node.js 18 Alpine Linux
- Installs only production dependencies
- Generates Prisma Client at build time
- Exposes port 5000

### Building for Production
```bash
docker build -t healthcare-backend:latest .
docker push your-registry/healthcare-backend:latest
```

## Development

To run the backend in development mode:
```bash
npm run dev
```

The server will start on `http://localhost:5000` (or the PORT specified in .env)

## Troubleshooting

### Prisma Client Issues
If you encounter Prisma Client errors, regenerate it:
```bash
npm run generate
```

### Database Connection
Ensure PostgreSQL is running and DATABASE_URL in .env is correct

### Port Already in Use
Change the PORT in .env or stop the process using port 5000
