import React, { useState, useEffect } from 'react';
import axios from 'axios';
import UrlForm from './UrlForm';
import UrlList from './UrlList';

function Dashboard() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalUrls: 0
  });

  const fetchUrls = async (page = 1) => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/urls?page=${page}&limit=10`);
      setUrls(response.data.urls || []);
      setPagination({
        currentPage: response.data.currentPage || 1,
        totalPages: response.data.totalPages || 1,
        totalUrls: response.data.totalUrls || 0
      });
    } catch (error) {
      setError('Failed to fetch URLs');
      console.error('Error fetching URLs:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUrls();
  }, []);

  const handleUrlCreated = (newUrl) => {
    setUrls([newUrl, ...urls]);
    setPagination(prev => ({
      ...prev,
      totalUrls: prev.totalUrls + 1
    }));
  };

  const handleUrlDeleted = (shortCode) => {
    setUrls(urls.filter(url => url.shortCode !== shortCode));
    setPagination(prev => ({
      ...prev,
      totalUrls: prev.totalUrls - 1
    }));
  };

  const handlePageChange = (page) => {
    fetchUrls(page);
  };

  if (loading && urls.length === 0) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-8">URL Shortener Dashboard</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="mb-8">
        <UrlForm onUrlCreated={handleUrlCreated} />
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Your URLs</h2>
          <div className="text-sm text-gray-600">
            Total: {pagination.totalUrls} URLs
          </div>
        </div>

        <UrlList
          urls={urls}
          onUrlDeleted={handleUrlDeleted}
          loading={loading}
        />

        {pagination.totalPages > 1 && (
          <div className="mt-6 flex justify-center space-x-2">
            <button
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={pagination.currentPage === 1}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              Previous
            </button>

            {[...Array(pagination.totalPages)].map((_, index) => {
              const page = index + 1;
              return (
                <button
                  key={page}
                  onClick={() => handlePageChange(page)}
                  className={`px-3 py-1 rounded ${page === pagination.currentPage
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                    }`}
                >
                  {page}
                </button>
              );
            })}

            <button
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={pagination.currentPage === pagination.totalPages}
              className="px-3 py-1 bg-gray-200 text-gray-700 rounded disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-300"
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

export default Dashboard;
