import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminMappingsManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [mappings, setMappings] = useState([]);
  const [filteredMappings, setFilteredMappings] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    fetchUsers();
    fetchAllMappings();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAllMappings = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/mappings');
      setMappings(response.data);
      setFilteredMappings(response.data);
    } catch (error) {
      console.error('Error fetching mappings:', error);
      toast.error('Failed to fetch mappings');
    } finally {
      setLoading(false);
    }
  };

  const fetchMappingsByUser = async (userId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}/mappings`);
      const user = users.find(u => u.id === parseInt(userId));
      const userMappings = response.data.map(m => ({
        ...m,
        userName: `${user.firstName} ${user.lastName}`,
        userUsername: user.username
      }));
      setMappings(userMappings);
      setFilteredMappings(userMappings);
    } catch (error) {
      console.error('Error fetching user mappings:', error);
      toast.error('Failed to fetch mappings for selected user');
    } finally {
      setLoading(false);
    }
  };

  const handleUserFilterChange = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    setSearchTerm('');
    setDateFilter('all');
    
    if (userId === 'all') {
      fetchAllMappings();
    } else {
      fetchMappingsByUser(userId);
    }
  };

  // Filter mappings based on search and date filter
  useEffect(() => {
    let filtered = [...mappings];

    // Search filter
    if (searchTerm) {
      const lowerSearch = searchTerm.toLowerCase();
      filtered = filtered.filter(mapping =>
        mapping.patient.name.toLowerCase().includes(lowerSearch) ||
        mapping.doctor.name.toLowerCase().includes(lowerSearch) ||
        (mapping.user && (`${mapping.user.firstName} ${mapping.user.lastName}`.toLowerCase().includes(lowerSearch) ||
          mapping.user.username.toLowerCase().includes(lowerSearch)))
      );
    }

    // Date filter
    if (dateFilter !== 'all') {
      const now = new Date();
      filtered = filtered.filter(mapping => {
        const createdDate = new Date(mapping.createdAt);
        const daysDiff = Math.floor((now - createdDate) / (1000 * 60 * 60 * 24));
        
        if (dateFilter === 'today') return daysDiff === 0;
        if (dateFilter === 'week') return daysDiff <= 7;
        if (dateFilter === 'month') return daysDiff <= 30;
        if (dateFilter === 'year') return daysDiff <= 365;
        return true;
      });
    }

    setFilteredMappings(filtered);
  }, [mappings, searchTerm, dateFilter]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="h-8 w-8 mr-3 text-purple-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M13 10V3L4 14h7v7l9-11h-7z"></path>
            </svg>
            Mappings Management
          </h1>
          
          {/* User Filter Dropdown */}
          <div className="flex items-center space-x-3">
            <label htmlFor="userFilter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Filter by User:
            </label>
            <select
              id="userFilter"
              value={selectedUserId}
              onChange={handleUserFilterChange}
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value="all">All Users ({users.length})</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.username}) - {u._count?.mappings || 0} mappings
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Mappings
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <input
                type="text"
                id="search"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search by patient, doctor, or creator..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Date Filter */}
          <div>
            <label htmlFor="dateFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Created
            </label>
            <select
              id="dateFilter"
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Time</option>
              <option value="today">Today</option>
              <option value="week">Last 7 days</option>
              <option value="month">Last 30 days</option>
              <option value="year">Last year</option>
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || dateFilter !== 'all') && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setDateFilter('all');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredMappings.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{mappings.length}</span> mappings
        </div>

        {/* Mappings Table */}
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredMappings.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No mappings found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || dateFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : selectedUserId === 'all'
                  ? 'No mappings have been created yet.'
                  : 'This user has not created any mappings yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Doctor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Disease
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created By
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Created At
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredMappings.map((mapping) => (
                  <tr key={mapping.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {mapping.patient?.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        Age: {mapping.patient?.age}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {mapping.doctor?.name}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {mapping.doctor?.specialty}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                        {mapping.patient?.disease}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {mapping.userName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        @{mapping.userUsername}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(mapping.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-semibold">{filteredMappings.length}</span> mapping(s)
                {selectedUserId !== 'all' && (
                  <span> for <span className="font-semibold">
                    {users.find(u => u.id === parseInt(selectedUserId))?.firstName} {users.find(u => u.id === parseInt(selectedUserId))?.lastName}
                  </span></span>
                )}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMappingsManagement;

