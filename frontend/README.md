# Healthcare Management - Frontend

React-based frontend for the Healthcare Management System with Tailwind CSS.

## Project Structure

```
frontend/
├── public/
│   ├── index.html
│   ├── manifest.json
│   └── robots.txt
├── src/
│   ├── api/
│   │   └── axios.js         # Axios configuration
│   ├── components/
│   │   ├── LoadingSpinner.js
│   │   ├── Navbar.js
│   │   ├── ProtectedRoute.js
│   │   └── Sidebar.js
│   ├── context/
│   │   └── AuthContext.js   # Authentication context
│   ├── pages/
│   │   ├── AdminDashboard.js
│   │   ├── AdminDoctorsManagement.js
│   │   ├── AdminMappingsManagement.js
│   │   ├── AdminPanel.js
│   │   ├── AdminPatientsManagement.js
│   │   ├── Dashboard.js
│   │   ├── Doctors.js
│   │   ├── IssueRequests.js
│   │   ├── Login.js
│   │   ├── Mappings.js
│   │   ├── NotFound.js
│   │   ├── Patients.js
│   │   ├── Profile.js
│   │   └── Register.js
│   ├── styles/           # CSS files
│   ├── App.js           # Main app component
│   ├── index.js         # Entry point
│   └── index.css        # Global styles
├── Dockerfile           # Docker configuration
├── .dockerignore        # Docker ignore rules
├── package.json         # Dependencies and scripts
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Setup

### Local Development

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure environment variables:**
   - Create a `.env` file in the frontend directory
   - Add: `REACT_APP_API_URL=http://localhost:5000/api`

3. **Start the development server:**
   ```bash
   npm start
   ```

The app will open at `http://localhost:3000`

### Docker Setup

1. **Build Docker image:**
   ```bash
   docker build -t healthcare-frontend .
   ```

2. **Run container:**
   ```bash
   docker run -p 3000:80 healthcare-frontend
   ```

Or use docker-compose from the root directory (see root README.md)

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run tests
- `npm run eject` - Eject from Create React App (irreversible)

## Environment Variables

- `REACT_APP_API_URL` - Backend API URL (default: http://localhost:5000/api)

## Features

### User Features
- **Authentication** - Login with JWT tokens
- **Dashboard** - Overview of system statistics
- **Patient Management** - View and manage patient records
- **Doctor Management** - View and manage doctor information
- **Mapping Management** - Assign patients to doctors
- **Issue Tracking** - Submit and track support requests
- **Profile** - View and edit user profile

### Admin Features
- **User Management** - Create, update, and delete users
- **Permission Control** - Assign granular permissions to users
- **Admin Dashboard** - Comprehensive system overview
- **Full CRUD Operations** - Manage all entities

## Technologies

- **React** - UI library
- **React Router** - Client-side routing
- **Axios** - HTTP client
- **Tailwind CSS** - Utility-first CSS framework
- **Context API** - State management
- **JWT** - Authentication tokens

## Docker Details

### Multi-Stage Build
The Dockerfile uses a multi-stage build process:
1. **Build Stage** - Compiles React app
2. **Production Stage** - Serves static files with Nginx

### Nginx Configuration
The app is served on port 80 inside the container and can be mapped to any host port.

### Building for Production
```bash
docker build -t healthcare-frontend:latest .
docker push your-registry/healthcare-frontend:latest
```

## Development Guidelines

### Component Structure
- Keep components small and focused
- Use functional components with hooks
- Extract reusable logic into custom hooks

### Styling
- Use Tailwind CSS utility classes
- Keep custom CSS in the styles folder
- Follow consistent spacing and naming

### API Calls
- Use the configured axios instance from `src/api/axios.js`
- Handle errors appropriately
- Show loading states during requests

## Troubleshooting

### API Connection Issues
Check that REACT_APP_API_URL in .env points to the correct backend URL

### Build Errors
Clear node_modules and reinstall:
```bash
rm -rf node_modules
npm install
```

### Port Already in Use
Change the port or stop the process using port 3000
