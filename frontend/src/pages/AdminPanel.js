import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';

const AdminPanel = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentUser, setCurrentUser] = useState(null);
  const [showCredentials, setShowCredentials] = useState(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    contact: '',
    role: 'USER',
    permissions: {
      canManagePatients: true,
      canManageDoctors: true,
      canViewMappings: true,
      canCreateMappings: true,
    },
  });

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const response = await axiosInstance.get('/admin/users');
      setUsers([...response.data]);
      setRefreshKey(prev => prev + 1);
    } catch (error) {
      toast.error('Failed to fetch users');
      console.error('Error fetching users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    
    if (name.startsWith('permissions.')) {
      const permissionName = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        permissions: {
          ...prev.permissions,
          [permissionName]: checked,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value,
      }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = { ...formData };
      if (submitData.role === 'ADMIN') {
        delete submitData.permissions;
      }

      if (editMode) {
        await axiosInstance.put(`/admin/users/${currentUser.id}`, submitData);
        toast.success('User updated successfully');
        closeModal();
        await new Promise(resolve => setTimeout(resolve, 300));
        await fetchUsers();
      } else {
        const response = await axiosInstance.post('/admin/users', submitData);
        setShowCredentials(response.data.credentials);
        toast.success('User created successfully');
        await fetchUsers();
      }
    } catch (error) {
      console.error('Submit error:', error.response?.data || error);
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (user) => {
    console.log('Loading user permissions:', user.permissions);
    
    // Prisma returns permissions as an array, get the first item
    const userPermissions = Array.isArray(user.permissions) ? user.permissions[0] : user.permissions;
    
    setCurrentUser(user);
    setFormData({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      contact: user.contact || '',
      isActive: user.isActive,
      role: user.role,
      permissions: userPermissions ? {
        canManagePatients: userPermissions.canManagePatients === true,
        canManageDoctors: userPermissions.canManageDoctors === true,
        canViewMappings: userPermissions.canViewMappings === true,
        canCreateMappings: userPermissions.canCreateMappings === true,
      } : {
        canManagePatients: true,
        canManageDoctors: true,
        canViewMappings: true,
        canCreateMappings: true,
      },
    });
    setEditMode(true);
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      try {
        await axiosInstance.delete(`/admin/users/${id}`);
        toast.success('User deleted successfully');
        fetchUsers();
      } catch (error) {
        toast.error(error.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleResetPassword = async (id, firstName) => {
    if (window.confirm(`Reset password for this user? New password will be ${firstName}123`)) {
      try {
        const response = await axiosInstance.post(`/admin/users/${id}/reset-password`);
        toast.success('Password reset successfully');
        alert(`New credentials:\nUsername: ${response.data.credentials.username}\nPassword: ${response.data.credentials.password}`);
      } catch (error) {
        toast.error('Failed to reset password');
      }
    }
  };

  const toggleUserStatus = async (id, currentStatus) => {
    try {
      await axiosInstance.put(`/admin/users/${id}`, {
        isActive: !currentStatus,
      });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully`);
      fetchUsers();
    } catch (error) {
      toast.error('Failed to update user status');
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setEditMode(false);
    setCurrentUser(null);
    setShowCredentials(null);
    setFormData({
      firstName: '',
      lastName: '',
      email: '',
      contact: '',
      role: 'USER',
      permissions: {
        canManagePatients: true,
        canManageDoctors: true,
        canViewMappings: true,
        canCreateMappings: true,
      },
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <LoadingSpinner />
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Admin Panel</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Manage users and permissions</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create User
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg overflow-hidden" key={refreshKey}>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  User
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Username
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Role
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Permissions
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {users.length === 0 ? (
                <tr>
                  <td colSpan="7" className="px-6 py-4 text-center text-gray-500 dark:text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                users.map((user) => (
                  <tr key={`user-${user.id}-${refreshKey}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {user.contact || 'No contact'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.username}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {user.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          user.role === 'ADMIN'
                            ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                            : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {user.role === 'ADMIN' ? (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                          All Permissions
                        </span>
                      ) : (
                        <div className="flex flex-wrap gap-1">
                          {(() => {
                            // Prisma returns permissions as array, get first item
                            const perms = Array.isArray(user.permissions) ? user.permissions[0] : user.permissions;
                            
                            if (!perms) {
                              return (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                  No Permissions
                                </span>
                              );
                            }

                            const hasAnyPermission = perms.canManagePatients || perms.canManageDoctors || perms.canViewMappings || perms.canCreateMappings;

                            if (!hasAnyPermission) {
                              return (
                                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400">
                                  No Permissions
                                </span>
                              );
                            }

                            return (
                              <>
                                {perms.canManagePatients && (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200" title="Can Manage Patients">
                                    Patients
                                  </span>
                                )}
                                {perms.canManageDoctors && (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" title="Can Manage Doctors">
                                    Doctors
                                  </span>
                                )}
                                {perms.canViewMappings && (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" title="Can View Mappings">
                                    View Maps
                                  </span>
                                )}
                                {perms.canCreateMappings && (
                                  <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" title="Can Create Mappings">
                                    Create Maps
                                  </span>
                                )}
                              </>
                            );
                          })()}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => toggleUserStatus(user.id, user.isActive)}
                        className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full cursor-pointer ${
                          user.isActive
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {user.isActive ? 'Active' : 'Inactive'}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <button
                        onClick={() => handleEdit(user)}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleResetPassword(user.id, user.firstName)}
                        className="text-yellow-600 hover:text-yellow-900 dark:text-yellow-400 dark:hover:text-yellow-300 mr-3"
                      >
                        Reset Pwd
                      </button>
                      {user.role !== 'ADMIN' && (
                        <button
                          onClick={() => handleDelete(user.id)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                        >
                          Delete
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 my-8">
            {showCredentials ? (
              <div>
                <h2 className="text-2xl font-bold text-green-600 dark:text-green-400 mb-6">
                  User Created Successfully! ✓
                </h2>
                <div className="bg-gray-50 dark:bg-gray-700 p-6 rounded-lg mb-6">
                  <p className="text-gray-700 dark:text-gray-300 mb-4">
                    Please save these credentials and share them with the user:
                  </p>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded">
                      <span className="text-gray-600 dark:text-gray-400">Username:</span>
                      <span className="font-mono font-bold text-lg">{showCredentials.username}</span>
                    </div>
                    <div className="flex items-center justify-between bg-white dark:bg-gray-800 p-3 rounded">
                      <span className="text-gray-600 dark:text-gray-400">Password:</span>
                      <span className="font-mono font-bold text-lg text-blue-600">
                        {showCredentials.password}
                      </span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-4">
                    Note: The password is auto-generated as <strong>FirstName + 123</strong>
                  </p>
                </div>
                <button
                  onClick={closeModal}
                  className="w-full bg-primary text-white px-4 py-2 rounded-lg hover:bg-blue-700"
                >
                  Close
                </button>
              </div>
            ) : (
              <>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
                  {editMode ? 'Edit User' : 'Create New User'}
                </h2>
                <form onSubmit={handleSubmit} key={currentUser?.id || 'new'}>
                  <div className="space-y-4 max-h-96 overflow-y-auto pr-2">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          First Name *
                        </label>
                        <input
                          type="text"
                          name="firstName"
                          required
                          value={formData.firstName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Last Name *
                        </label>
                        <input
                          type="text"
                          name="lastName"
                          required
                          value={formData.lastName}
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Email *
                      </label>
                      <input
                        type="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Contact Number
                      </label>
                      <input
                        type="tel"
                        name="contact"
                        value={formData.contact}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Role Selection - Available in both create and edit modes */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        User Role *
                      </label>
                      <select
                        name="role"
                        value={formData.role || 'USER'}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      >
                        <option value="USER">Regular User</option>
                        <option value="ADMIN">Admin User</option>
                      </select>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formData.role === 'ADMIN' 
                          ? '⚠️ Admin users have full system access and can manage all resources.'
                          : 'Regular users can only manage their own patients, doctors, and mappings.'}
                      </p>
                    </div>

                    {/* Permissions Section - Only show for USER role in edit mode */}
                    {editMode && formData.role === 'USER' && (
                      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                          User Permissions
                        </label>
                        <div className="space-y-3 bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              name="permissions.canManagePatients"
                              checked={formData.permissions.canManagePatients}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded mt-1"
                            />
                            <div className="ml-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Manage Patients
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Create, view, update, and delete patient records
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              name="permissions.canManageDoctors"
                              checked={formData.permissions.canManageDoctors}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded mt-1"
                            />
                            <div className="ml-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Manage Doctors
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Create, view, update, and delete doctor records
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              name="permissions.canViewMappings"
                              checked={formData.permissions.canViewMappings}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-yellow-600 focus:ring-yellow-500 border-gray-300 rounded mt-1"
                            />
                            <div className="ml-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                View Mappings
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                View patient-doctor mapping relationships
                              </p>
                            </div>
                          </div>

                          <div className="flex items-start">
                            <input
                              type="checkbox"
                              name="permissions.canCreateMappings"
                              checked={formData.permissions.canCreateMappings}
                              onChange={handleInputChange}
                              className="h-4 w-4 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
                            />
                            <div className="ml-3">
                              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                                Create Mappings
                              </label>
                              <p className="text-xs text-gray-500 dark:text-gray-400">
                                Create, update, and delete patient-doctor mappings
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {editMode && (
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          name="isActive"
                          checked={formData.isActive}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                        />
                        <label className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                          Active Account
                        </label>
                      </div>
                    )}

                    {!editMode && (
                      <div className="bg-blue-50 dark:bg-blue-900 p-4 rounded-md">
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                          <strong>Note:</strong> Username will be auto-generated from first and last name.
                          Password will be <strong>FirstName + 123</strong>
                        </p>
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={closeModal}
                      className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                    >
                      {editMode ? 'Update User' : 'Create User'}
                    </button>
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;

