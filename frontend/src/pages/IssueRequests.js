import React, { useState, useEffect } from 'react';
import axiosInstance from '../api/axios';
import LoadingSpinner from '../components/LoadingSpinner';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const IssueRequests = () => {
  const { user } = useAuth();
  const [issues, setIssues] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedIssue, setSelectedIssue] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');
  const [status, setStatus] = useState('');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    fetchIssues();
  }, []);

  const fetchIssues = async () => {
    try {
      const response = await axiosInstance.get('/issues');
      setIssues(response.data);
    } catch (error) {
      toast.error('Failed to fetch requests');
      console.error('Error fetching issues:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewIssue = (issue) => {
    setSelectedIssue(issue);
    setStatus(issue.status);
    setAdminNotes(issue.adminNotes || '');
    setShowModal(true);
  };

  const handleUpdateIssue = async (e) => {
    e.preventDefault();
    try {
      await axiosInstance.put(`/issues/${selectedIssue.id}`, {
        status,
        adminNotes,
      });
      toast.success('Request updated successfully');
      fetchIssues();
      setShowModal(false);
    } catch (error) {
      toast.error('Failed to update request');
    }
  };

  const handleDeleteIssue = async (id) => {
    if (window.confirm('Are you sure you want to delete this request?')) {
      try {
        await axiosInstance.delete(`/issues/${id}`);
        toast.success('Request deleted successfully');
        fetchIssues();
      } catch (error) {
        toast.error('Failed to delete request');
      }
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'resolved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isAdmin ? 'All Issue Requests' : 'My Requests'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {isAdmin
              ? 'View and manage all user requests'
              : 'View your submitted requests to admin'}
          </p>
        </div>
      </div>

      {/* Issues List */}
      <div className="grid grid-cols-1 gap-4">
        {issues.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">No requests found</p>
          </div>
        ) : (
          issues.map((issue) => (
            <div
              key={issue.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {issue.subject}
                    </h3>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                        issue.status
                      )}`}
                    >
                      {issue.status}
                    </span>
                    <span
                      className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                        issue.priority
                      )}`}
                    >
                      {issue.priority}
                    </span>
                  </div>
                  <p className="text-gray-600 dark:text-gray-400 mb-2">{issue.description}</p>
                  {isAdmin && issue.user && (
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      By: {issue.user.firstName} {issue.user.lastName} ({issue.user.username})
                    </p>
                  )}
                  {issue.adminNotes && (
                    <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900 rounded">
                      <p className="text-sm font-semibold text-blue-800 dark:text-blue-300">
                        Admin Response:
                      </p>
                      <p className="text-sm text-blue-700 dark:text-blue-200 mt-1">
                        {issue.adminNotes}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-gray-200 dark:border-gray-700">
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {new Date(issue.createdAt).toLocaleString()}
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleViewIssue(issue)}
                    className="text-blue-600 hover:text-blue-900 text-sm font-medium"
                  >
                    {isAdmin ? 'Manage' : 'View'}
                  </button>
                  <button
                    onClick={() => handleDeleteIssue(issue.id)}
                    className="text-red-600 hover:text-red-900 text-sm font-medium"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {showModal && selectedIssue && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Request Details
            </h2>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Subject
                </label>
                <p className="text-gray-900 dark:text-white font-semibold">
                  {selectedIssue.subject}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Description
                </label>
                <p className="text-gray-900 dark:text-white">{selectedIssue.description}</p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Priority
                  </label>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(
                      selectedIssue.priority
                    )}`}
                  >
                    {selectedIssue.priority}
                  </span>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Status
                  </label>
                  <span
                    className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                      selectedIssue.status
                    )}`}
                  >
                    {selectedIssue.status}
                  </span>
                </div>
              </div>

              {isAdmin && selectedIssue.user && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Submitted By
                  </label>
                  <p className="text-gray-900 dark:text-white">
                    {selectedIssue.user.firstName} {selectedIssue.user.lastName} (
                    {selectedIssue.user.email})
                  </p>
                </div>
              )}

              {isAdmin && (
                <form onSubmit={handleUpdateIssue}>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Update Status
                      </label>
                      <select
                        value={status}
                        onChange={(e) => setStatus(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                      >
                        <option value="pending">Pending</option>
                        <option value="in-progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="rejected">Rejected</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Admin Notes
                      </label>
                      <textarea
                        value={adminNotes}
                        onChange={(e) => setAdminNotes(e.target.value)}
                        rows="4"
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md dark:bg-gray-700 dark:text-white"
                        placeholder="Add notes for the user..."
                      />
                    </div>
                  </div>

                  <div className="flex justify-end space-x-3 mt-6">
                    <button
                      type="button"
                      onClick={() => setShowModal(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      className="px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                    >
                      Update Request
                    </button>
                  </div>
                </form>
              )}

              {!isAdmin && (
                <button
                  onClick={() => setShowModal(false)}
                  className="w-full mt-4 px-4 py-2 bg-primary text-white rounded-md hover:bg-blue-700"
                >
                  Close
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IssueRequests;

