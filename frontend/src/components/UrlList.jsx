import React from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

function UrlList({ urls, onUrlDeleted, loading }) {
  const handleDelete = async (shortCode) => {
    if (window.confirm('Are you sure you want to delete this URL?')) {
      try {
        await axios.delete(`/urls/${shortCode}`);
        onUrlDeleted(shortCode);
      } catch (error) {
        console.error('Error deleting URL:', error);
        alert('Failed to delete URL');
      }
    }
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (urls.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        <p>No URLs found. Create your first short URL above!</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {urls.map((url) => (
        <div key={url._id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between">
            <div className="flex-1 min-w-0">
              <div className="mb-2">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {url.originalUrl}
                </p>
              </div>
              
              <div className="flex items-center space-x-2 mb-2">
                <span className="text-sm text-gray-500">Short URL:</span>
                <code className="bg-gray-100 px-2 py-1 rounded text-sm">
                  {`${window.location.origin}/api/${url.shortCode}`}
                </code>
                <button
                  onClick={() => copyToClipboard(`${window.location.origin}/api/${url.shortCode}`)}
                  className="text-blue-600 hover:text-blue-800 text-sm"
                >
                  Copy
                </button>
              </div>
              
              <div className="flex items-center space-x-4 text-sm text-gray-500">
                <span>Clicks: {url.clicks}</span>
                <span>Created: {formatDate(url.createdAt)}</span>
              </div>
            </div>
            
            <div className="flex items-center space-x-2 mt-3 md:mt-0">
              <Link
                to={`/stats/${url.shortCode}`}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                View Stats
              </Link>
              <button
                onClick={() => handleDelete(url.shortCode)}
                className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default UrlList;