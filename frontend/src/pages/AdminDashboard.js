import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminDashboard = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    adminUsers: 0,
    regularUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    totalMappings: 0,
    pendingIssues: 0,
    totalIssues: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    fetchAdminStats();
  }, [user, navigate]);

  const fetchAdminStats = async () => {
    try {
      // Use the dedicated admin dashboard stats endpoint
      const statsRes = await axiosInstance.get('/admin/dashboard/stats');
      const { stats: dashboardStats, recentUsers } = statsRes.data;

      // Get issues separately (since dashboard-stats doesn't include all issue details)
      const issuesRes = await axiosInstance.get('/issues');
      const issues = issuesRes.data;

      setStats({
        totalUsers: dashboardStats.totalUsers,
        activeUsers: dashboardStats.activeUsers,
        inactiveUsers: dashboardStats.inactiveUsers,
        adminUsers: 0, // Calculate from users if needed
        regularUsers: dashboardStats.totalUsers - 0,
        totalPatients: dashboardStats.totalPatients,
        totalDoctors: dashboardStats.totalDoctors,
        totalMappings: dashboardStats.totalMappings,
        pendingIssues: dashboardStats.pendingIssues,
        totalIssues: issues.length,
      });

      // Create recent activity log from recent users and issues
      const activities = [
        ...recentUsers.map(u => ({
          type: 'user',
          message: `New user: ${u.firstName} ${u.lastName} (${u.username})`,
          time: new Date(u.createdAt).toLocaleString(),
        })),
        ...issues.slice(0, 3).map(i => ({
          type: 'issue',
          message: `Issue: ${i.subject} (${i.status})`,
          time: new Date(i.createdAt).toLocaleString(),
        })),
      ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

      setRecentActivity(activities);
    } catch (error) {
      toast.error('Failed to fetch admin statistics');
      console.error('Error fetching admin stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const adminCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers,
      subtitle: `${stats.activeUsers} Active`,
      icon: (
        <svg className="h-8 w-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"></path>
        </svg>
      ),
      bgColor: 'bg-blue-600',
      link: '/admin',
    },
    {
      title: 'Pending Issues',
      value: stats.pendingIssues,
      subtitle: `${stats.totalIssues} Total`,
      icon: (
        <svg className="h-8 w-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
        </svg>
      ),
      bgColor: 'bg-yellow-600',
      link: '/issues',
    },
    {
      title: 'Total Patients',
      value: stats.totalPatients,
      subtitle: 'Manage Patients',
      icon: (
        <svg className="h-8 w-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
        </svg>
      ),
      bgColor: 'bg-green-600',
      link: '/patients',
    },
    {
      title: 'Total Doctors',
      value: stats.totalDoctors,
      subtitle: 'Manage Doctors',
      icon: (
        <svg className="h-8 w-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
        </svg>
      ),
      bgColor: 'bg-indigo-600',
      link: '/doctors',
    },
    {
      title: 'Total Mappings',
      value: stats.totalMappings,
      subtitle: 'View Mappings',
      icon: (
        <svg className="h-8 w-8" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
          <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
        </svg>
      ),
      bgColor: 'bg-red-600',
      link: '/mappings',
    },
  ];

  const quickActions = [
    {
      title: 'User Management',
      description: 'Create, edit, and manage all users',
      icon: '👥',
      link: '/admin',
    },
    {
      title: 'Issue Requests',
      description: 'Review and respond to user issues',
      icon: '📋',
      link: '/issues',
    },
    {
      title: 'System Settings',
      description: 'View system statistics and logs',
      icon: '⚙️',
      action: () => toast.info('System settings coming soon!'),
    },
    {
      title: 'Reports & Analytics',
      description: 'Generate system reports',
      icon: '📊',
      action: () => toast.info('Reports coming soon!'),
    },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Admin Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mt-2">
          Welcome back, {user?.firstName || 'Admin'}! You have full system access.
        </p>
      </div>

      {/* Admin Badge */}
      {user?.username === 'iamADMIN' && (
        <div className="mb-6 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg shadow-lg p-4">
          <div className="flex items-center space-x-3 text-white">
            <svg className="h-6 w-6" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"></path>
            </svg>
            <div>
              <p className="font-bold">Super Admin Access</p>
              <p className="text-sm opacity-90">You are logged in as the default administrator</p>
            </div>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {adminCards.map((card, index) => (
          <div
            key={index}
            className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-all cursor-pointer transform hover:-translate-y-1"
            onClick={() => card.link && navigate(card.link)}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {card.title}
                </p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white mt-2">
                  {card.value}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {card.subtitle}
                </p>
              </div>
              <div className={`${card.bgColor} p-3 rounded-full text-white shadow-lg`}>
                {card.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions & Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Quick Actions */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2 text-blue-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Quick Actions
          </h2>
          <div className="space-y-3">
            {quickActions.map((action, index) => (
              <div
                key={index}
                className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 cursor-pointer transition-colors"
                onClick={() => action.link ? navigate(action.link) : action.action?.()}
              >
                <div className="flex items-center space-x-3">
                  <span className="text-3xl">{action.icon}</span>
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      {action.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {action.description}
                    </p>
                  </div>
                  <svg className="h-5 w-5 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
                    <path d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4 flex items-center">
            <svg className="h-6 w-6 mr-2 text-green-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
            </svg>
            Recent Activity
          </h2>
          <div className="space-y-3">
            {recentActivity.length > 0 ? (
              recentActivity.map((activity, index) => (
                <div
                  key={index}
                  className="p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                >
                  <p className="text-sm text-gray-900 dark:text-white font-medium">
                    {activity.message}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {activity.time}
                  </p>
                </div>
              ))
            ) : (
              <p className="text-gray-500 dark:text-gray-400 text-sm">
                No recent activity
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Admin Perks Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg shadow-lg p-6 text-white">
        <h2 className="text-2xl font-bold mb-4">🎖️ Admin Perks & Privileges</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-3xl mb-2">👑</div>
            <h3 className="font-bold mb-1">Full Control</h3>
            <p className="text-sm opacity-90">Complete system access</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-3xl mb-2">🔐</div>
            <h3 className="font-bold mb-1">User Management</h3>
            <p className="text-sm opacity-90">Create & manage all users</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-3xl mb-2">📊</div>
            <h3 className="font-bold mb-1">Analytics</h3>
            <p className="text-sm opacity-90">View all system statistics</p>
          </div>
          <div className="bg-white bg-opacity-20 backdrop-blur-sm rounded-lg p-4">
            <div className="text-3xl mb-2">⚡</div>
            <h3 className="font-bold mb-1">Priority Support</h3>
            <p className="text-sm opacity-90">Manage all issues & requests</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;

