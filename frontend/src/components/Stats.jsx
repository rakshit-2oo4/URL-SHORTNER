import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';

function Stats() {
  const { code } = useParams();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get(`/stats/${code}`);
        setStats(response.data);
      } catch (error) {
        setError(error.response?.data?.error || 'Failed to fetch stats');
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [code]);

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    // You could add a toast notification here
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <Link to="/dashboard" className="text-blue-600 hover:text-blue-800">
          ← Back to Dashboard
        </Link>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold mb-6">URL Statistics</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Original URL</h3>
            <p className="text-gray-700 break-all">{stats.originalUrl}</p>
          </div>
          
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Short URL</h3>
            <div className="flex items-center space-x-2">
              <code className="bg-white px-2 py-1 rounded border flex-1">
                {`${window.location.origin}/api/${stats.shortCode}`}
              </code>
              <button
                onClick={() => copyToClipboard(`${window.location.origin}/api/${stats.shortCode}`)}
                className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 transition-colors"
              >
                Copy
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-blue-50 p-4 rounded-lg text-center">
            <div className="text-3xl font-bold text-blue-600">{stats.clicks}</div>
            <div className="text-gray-600">Total Clicks</div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg text-center">
            <div className="text-lg font-semibold text-green-600">
              {formatDate(stats.createdAt).split(',')[0]}
            </div>
            <div className="text-gray-600">Created Date</div>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg text-center">
            <div className="text-lg font-semibold text-purple-600">
              {stats.clickHistory.length > 0 
                ? formatDate(stats.clickHistory[stats.clickHistory.length - 1].timestamp).split(',')[0]
                : 'Never'
              }
            </div>
            <div className="text-gray-600">Last Click</div>
          </div>
        </div>

        {stats.clickHistory && stats.clickHistory.length > 0 && (
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="text-lg font-semibold mb-4">Click History</h3>
            <div className="max-h-64 overflow-y-auto">
              <table className="w-full text-sm">
                <thead className="bg-gray-200 sticky top-0">
                  <tr>
                    <th className="text-left p-2">Date & Time</th>
                    <th className="text-left p-2">IP Address</th>
                    <th className="text-left p-2">User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {stats.clickHistory.slice().reverse().map((click, index) => (
                    <tr key={index} className="border-b border-gray-200">
                      <td className="p-2">{formatDate(click.timestamp)}</td>
                      <td className="p-2 font-mono">{click.ip || 'N/A'}</td>
                      <td className="p-2 truncate max-w-xs" title={click.userAgent}>
                        {click.userAgent || 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {stats.clickHistory && stats.clickHistory.length === 0 && (
          <div className="bg-gray-50 p-8 rounded-lg text-center">
            <p className="text-gray-500">No clicks yet. Share your short URL to start tracking!</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default Stats;