import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const AdminPatientsManagement = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [selectedUserId, setSelectedUserId] = useState('all');
  const [patients, setPatients] = useState([]);
  const [filteredPatients, setFilteredPatients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [ageFilter, setAgeFilter] = useState('all');
  const [diseaseFilter, setDiseaseFilter] = useState('all');

  useEffect(() => {
    if (user?.role !== 'ADMIN') {
      toast.error('Access denied. Admin only.');
      navigate('/dashboard');
      return;
    }
    fetchUsers();
    fetchAllPatients();
  }, [user, navigate]);

  const fetchUsers = async () => {
    try {
      const response = await axiosInstance.get('/admin/users');
      setUsers(response.data);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchAllPatients = async () => {
    setLoading(true);
    try {
      const response = await axiosInstance.get('/admin/patients');
      setPatients(response.data);
      setFilteredPatients(response.data);
    } catch (error) {
      console.error('Error fetching patients:', error);
      toast.error('Failed to fetch patients');
    } finally {
      setLoading(false);
    }
  };

  const fetchPatientsByUser = async (userId) => {
    setLoading(true);
    try {
      const response = await axiosInstance.get(`/admin/users/${userId}/patients`);
      const user = users.find(u => u.id === parseInt(userId));
      const userPatients = response.data.map(p => ({
        ...p,
        userName: `${user.firstName} ${user.lastName}`,
        userUsername: user.username
      }));
      setPatients(userPatients);
      setFilteredPatients(userPatients);
    } catch (error) {
      console.error('Error fetching user patients:', error);
      toast.error('Failed to fetch patients for selected user');
    } finally {
      setLoading(false);
    }
  };

  // Search and filter logic
  useEffect(() => {
    let result = [...patients];

    // Search by name
    if (searchTerm) {
      result = result.filter(patient =>
        patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.disease.toLowerCase().includes(searchTerm.toLowerCase()) ||
        patient.userName?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by age range
    if (ageFilter !== 'all') {
      if (ageFilter === '0-18') {
        result = result.filter(p => p.age >= 0 && p.age <= 18);
      } else if (ageFilter === '19-40') {
        result = result.filter(p => p.age >= 19 && p.age <= 40);
      } else if (ageFilter === '41-60') {
        result = result.filter(p => p.age >= 41 && p.age <= 60);
      } else if (ageFilter === '60+') {
        result = result.filter(p => p.age > 60);
      }
    }

    // Filter by disease
    if (diseaseFilter !== 'all') {
      result = result.filter(p => p.disease === diseaseFilter);
    }

    setFilteredPatients(result);
  }, [searchTerm, ageFilter, diseaseFilter, patients]);

  // Get unique diseases for filter
  const uniqueDiseases = [...new Set(patients.map(p => p.disease))];

  const handleUserFilterChange = (e) => {
    const userId = e.target.value;
    setSelectedUserId(userId);
    setSearchTerm('');
    setAgeFilter('all');
    setDiseaseFilter('all');
    
    if (userId === 'all') {
      fetchAllPatients();
    } else {
      fetchPatientsByUser(userId);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center">
            <svg className="h-8 w-8 mr-3 text-indigo-600" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            Patients Management
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
              className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white transition-all"
            >
              <option value="all">All Users ({users.length})</option>
              {users.map(u => (
                <option key={u.id} value={u.id}>
                  {u.firstName} {u.lastName} ({u.username}) - {u._count?.patients || 0} patients
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search Bar */}
          <div className="md:col-span-2">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Search Patients
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
                placeholder="Search by name, disease, or creator..."
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Age Filter */}
          <div>
            <label htmlFor="ageFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Age Range
            </label>
            <select
              id="ageFilter"
              value={ageFilter}
              onChange={(e) => setAgeFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Ages</option>
              <option value="0-18">0-18 years</option>
              <option value="19-40">19-40 years</option>
              <option value="41-60">41-60 years</option>
              <option value="60+">60+ years</option>
            </select>
          </div>

          {/* Disease Filter */}
          <div>
            <label htmlFor="diseaseFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Disease
            </label>
            <select
              id="diseaseFilter"
              value={diseaseFilter}
              onChange={(e) => setDiseaseFilter(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:text-white"
            >
              <option value="all">All Diseases</option>
              {uniqueDiseases.map(disease => (
                <option key={disease} value={disease}>{disease}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters Button */}
        {(searchTerm || ageFilter !== 'all' || diseaseFilter !== 'all') && (
          <div className="mb-4 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm('');
                setAgeFilter('all');
                setDiseaseFilter('all');
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}

        {/* Patients Table */}
        {/* Results Count */}
        <div className="mb-4 text-sm text-gray-600 dark:text-gray-400">
          Showing <span className="font-semibold text-gray-900 dark:text-white">{filteredPatients.length}</span> of <span className="font-semibold text-gray-900 dark:text-white">{patients.length}</span> patients
        </div>

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <LoadingSpinner />
          </div>
        ) : filteredPatients.length === 0 ? (
          <div className="text-center py-12">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" viewBox="0 0 24 24" stroke="currentColor">
              <path d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"></path>
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-white">No patients found</h3>
            <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
              {searchTerm || ageFilter !== 'all' || diseaseFilter !== 'all'
                ? 'Try adjusting your filters or search terms.'
                : selectedUserId === 'all' 
                  ? 'No patients have been created yet.'
                  : 'This user has not created any patients yet.'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Patient Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                    Age
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
                {filteredPatients.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                          <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
                            {patient.name.charAt(0)}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {patient.name}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">{patient.age} years</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {patient.disease}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900 dark:text-white">
                        {patient.userName}
                      </div>
                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        @{patient.userUsername}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(patient.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-600">
              <p className="text-sm text-gray-700 dark:text-gray-300">
                Showing <span className="font-semibold">{patients.length}</span> patient(s)
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

export default AdminPatientsManagement;

