import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import Patients from './pages/Patients';
import Doctors from './pages/Doctors';
import Mappings from './pages/Mappings';
import AdminPanel from './pages/AdminPanel';
import AdminPatientsManagement from './pages/AdminPatientsManagement';
import AdminDoctorsManagement from './pages/AdminDoctorsManagement';
import AdminMappingsManagement from './pages/AdminMappingsManagement';
import Profile from './pages/Profile';
import IssueRequests from './pages/IssueRequests';
import NotFound from './pages/NotFound';

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    const darkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(darkMode);
    if (darkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('darkMode', newMode);
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const closeSidebar = () => {
    setIsSidebarOpen(false);
  };

  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-100 dark:bg-gray-900">
          <Routes>
            {/* Public Routes */}
            <Route path="/login" element={<Login />} />

            {/* Protected Routes */}
            <Route
              path="/*"
              element={
                <ProtectedRoute>
                  <div className="flex flex-col h-screen">
                    <Navbar
                      toggleSidebar={toggleSidebar}
                      toggleTheme={toggleTheme}
                      isDarkMode={isDarkMode}
                    />
                    <div className="flex flex-1 pt-16">
                      <Sidebar isOpen={isSidebarOpen} closeSidebar={closeSidebar} />
                      <main className="flex-1 overflow-y-auto lg:ml-64">
                        <Routes>
                          <Route path="/" element={<Navigate to="/dashboard" replace />} />
                          <Route path="/dashboard" element={<Dashboard />} />
                          <Route path="/admin-dashboard" element={<AdminDashboard />} />
                          <Route path="/admin/patients" element={<AdminPatientsManagement />} />
                          <Route path="/admin/doctors" element={<AdminDoctorsManagement />} />
                          <Route path="/admin/mappings" element={<AdminMappingsManagement />} />
                          <Route path="/patients" element={<Patients />} />
                          <Route path="/doctors" element={<Doctors />} />
                          <Route path="/mappings" element={<Mappings />} />
                          <Route path="/admin" element={<AdminPanel />} />
                          <Route path="/profile" element={<Profile />} />
                          <Route path="/issues" element={<IssueRequests />} />
                          <Route path="*" element={<NotFound />} />
                        </Routes>
                      </main>
                    </div>
                  </div>
                </ProtectedRoute>
              }
            />
          </Routes>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme={isDarkMode ? 'dark' : 'light'}
          />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
