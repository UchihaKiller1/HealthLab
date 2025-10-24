import { useState } from 'react';
import { saveAs } from 'file-saver';
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:4000';

const DownloadSummaryButton = ({ experimentId }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleDownload = async (format) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const token = localStorage.getItem('token');
      if (!token) {
        throw new Error('Authentication required. Please log in again.');
      }

      console.log(`Initiating download for experiment ${experimentId} in ${format} format`);
      
      const response = await axios({
        url: `${API_BASE}/api/experiments/${experimentId}/download-summary?format=${format}`,
        method: 'GET',
        responseType: 'blob',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        // Add timeout to prevent hanging
        timeout: 30000 // 30 seconds
      });

      console.log('Download response received:', {
        status: response.status,
        headers: response.headers,
        dataType: typeof response.data,
        dataSize: response.data?.size || 0
      });

      if (!response.data || response.data.size === 0) {
        throw new Error('Received empty response from server');
      }

      // Get content type from response or default based on format
      const contentType = response.headers['content-type'] || 
                         (format === 'csv' ? 'text/csv' : 'application/pdf');
      
      // Create a blob from the response
      const blob = new Blob([response.data], { type: contentType });
      
      // Generate a filename, try to get it from content-disposition header first
      let filename = `experiment-${experimentId}-summary.${format}`;
      const contentDisposition = response.headers['content-disposition'];
      if (contentDisposition) {
        const filenameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1];
        }
      }
      
      console.log('Initiating file download:', { filename, type: contentType, size: blob.size });
      
      // Create a temporary URL for the blob
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', filename);
      document.body.appendChild(link);
      
      // Trigger the download
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        window.URL.revokeObjectURL(url);
      }, 100);
    } catch (err) {
      console.error('Download failed:', err);
      const errorMessage = err.response?.data?.message || 
                         err.message || 
                         'Failed to download summary. Please try again.';
      setError(errorMessage);
      
      // Show error toast if available
      if (typeof window !== 'undefined' && window.toast) {
        window.toast.error(errorMessage);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mt-4">
      <div className="flex items-center space-x-2">
        <span className="text-sm font-medium text-gray-700">Download Summary:</span>
        <button
          onClick={() => handleDownload('pdf')}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Downloading...' : 'PDF'}
        </button>
        <button
          onClick={() => handleDownload('csv')}
          disabled={isLoading}
          className="px-3 py-1.5 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Downloading...' : 'CSV'}
        </button>
      </div>
      {error && (
        <p className="mt-2 text-sm text-red-600">{error}</p>
      )}
    </div>
  );
};

export default DownloadSummaryButton;
