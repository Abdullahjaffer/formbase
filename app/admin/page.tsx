'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface Submission {
  id: string;
  endpoint_name: string;
  data: any;
  browser_info: any;
  created_at: string;
  ip_address: string | null;
}

export default function AdminDashboard() {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [filteredSubmissions, setFilteredSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('all');
  const [endpoints, setEndpoints] = useState<string[]>([]);
  const router = useRouter();

  useEffect(() => {
    fetchSubmissions();
  }, []);

  useEffect(() => {
    // Filter submissions based on selected endpoint
    if (selectedEndpoint === 'all') {
      setFilteredSubmissions(submissions);
    } else {
      setFilteredSubmissions(submissions.filter(sub => sub.endpoint_name === selectedEndpoint));
    }
  }, [submissions, selectedEndpoint]);

  const fetchSubmissions = async () => {
    try {
      const response = await fetch('/api/admin/submissions');
      if (response.ok) {
        const data = await response.json();
        setSubmissions(data.submissions);
        // Extract unique endpoints
        const uniqueEndpoints = [...new Set(data.submissions.map((sub: Submission) => sub.endpoint_name))];
        setEndpoints(uniqueEndpoints);
      } else {
        setError('Failed to fetch submissions');
      }
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/admin/logout', { method: 'POST' });
      router.push('/admin/login');
    } catch (err) {
      router.push('/admin/login');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const formatJson = (data: any) => {
    return JSON.stringify(data, null, 2);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <button
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 rounded-md p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Filter */}
        <div className="mb-6">
          <label htmlFor="endpoint-filter" className="block text-sm font-medium text-gray-700 mb-2">
            Filter by Endpoint
          </label>
          <select
            id="endpoint-filter"
            value={selectedEndpoint}
            onChange={(e) => setSelectedEndpoint(e.target.value)}
            className="block w-full max-w-xs px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          >
            <option value="all">All Endpoints</option>
            {endpoints.map(endpoint => (
              <option key={endpoint} value={endpoint}>{endpoint}</option>
            ))}
          </select>
        </div>

        {/* Submissions List */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          <div className="px-4 py-5 sm:p-6">
            <h2 className="text-lg font-medium text-gray-900 mb-4">
              Form Submissions ({filteredSubmissions.length})
            </h2>

            {filteredSubmissions.length === 0 ? (
              <p className="text-gray-500">No submissions found.</p>
            ) : (
              <div className="space-y-6">
                {filteredSubmissions.map((submission) => (
                  <div key={submission.id} className="border border-gray-200 rounded-lg p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-sm font-medium text-gray-900">
                          Endpoint: {submission.endpoint_name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          Submitted: {formatDate(submission.created_at)}
                        </p>
                        {submission.ip_address && (
                          <p className="text-sm text-gray-500">
                            IP: {submission.ip_address}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-gray-400">ID: {submission.id}</span>
                    </div>

                    {/* Form Data */}
                    <div className="mb-4">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Form Data:</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                        {formatJson(submission.data)}
                      </pre>
                    </div>

                    {/* Browser Info */}
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Browser Info:</h4>
                      <pre className="bg-gray-50 p-3 rounded text-xs overflow-x-auto">
                        {formatJson(submission.browser_info)}
                      </pre>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
