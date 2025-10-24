import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { formatDistanceToNow } from 'date-fns';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';

const CommunityFeed = () => {
  const [posts, setPosts] = useState([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const limit = 10; // Show 10 posts per page

  // Mock data for development
  const getMockPosts = (count = 5) => {
    const symptomsList = [
      ['fever', 'headache'],
      ['cough', 'sore throat', 'fatigue'],
      ['nausea', 'dizziness'],
      ['muscle pain', 'joint pain'],
      ['shortness of breath', 'chest pain'],
      ['loss of smell', 'loss of taste'],
      ['runny nose', 'sneezing']
    ];

    const locations = [
      'Colombo, Sri Lanka',
      'Kandy, Sri Lanka',
      'Galle, Sri Lanka',
      'Jaffna, Sri Lanka',
      'Anuradhapura, Sri Lanka'
    ];

    return Array.from({ length: count }, (_, i) => ({
      _id: `mock-${Date.now()}-${i}`,
      symptoms: symptomsList[i % symptomsList.length],
      severity: ['low', 'medium', 'high', 'severe'][Math.floor(Math.random() * 4)],
      description: [
        'Experiencing these symptoms for the past few days.',
        'Mild symptoms but persistent. Taking rest and medication.',
        'Severe symptoms, already consulted a doctor.',
        'Symptoms are getting better with home remedies.',
        'Looking for advice on managing these symptoms.'
      ][i % 5],
      location: locations[Math.floor(Math.random() * locations.length)],
      date: new Date(Date.now() - Math.floor(Math.random() * 7) * 24 * 60 * 60 * 1000).toISOString(),
      isMock: true
    }));
  };

  const fetchPosts = useCallback(
    async (pageNum) => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        // Try to fetch from API first
        try {
          const response = await axios.get(
            `/api/community/feed?page=${pageNum}&limit=${limit}`,
            token ? {
              headers: {
                'Authorization': `Bearer ${token}`
              }
            } : {}
          );

          const postsData = response.data?.posts || [];
          const totalCount = response.data?.total || postsData.length;
          
          // Calculate total pages
          const calculatedTotalPages = Math.ceil(totalCount / limit);
          setTotalPages(calculatedTotalPages);
          
          // If no posts from API but it's the first page, use mock data
          if (postsData.length === 0 && pageNum === 1) {
            throw new Error('No posts available');
          }
          
          setPosts(postsData);
          return;
        } catch (apiError) {
          console.warn('Using mock data due to API error:', apiError);
          // Only use mock data for the first page to simulate pagination
          if (pageNum === 1) {
            const mockPosts = getMockPosts(limit);
            setPosts(mockPosts);
            setTotalPages(1); // Only one page for mock data
            return;
          }
          throw apiError; // Re-throw to be caught by the outer catch
        }
      } catch (err) {
        console.error("Error fetching community posts:", err);
        toast.error("Failed to load community posts");
      } finally {
        setIsLoading(false);
      }
    },
    [limit]
  );

  useEffect(() => {
    fetchPosts(1);
  }, [fetchPosts]);

  const loadMore = () => {
    if (!isLoading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPosts(nextPage);
    }
  };

  // Handle page change
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages && newPage !== page) {
      setPage(newPage);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pages = [];
    const maxVisiblePages = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisiblePages / 2));
    let endPage = startPage + maxVisiblePages - 1;

    if (endPage > totalPages) {
      endPage = totalPages;
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }

    return pages;
  };

  const getSeverityColor = (severity) => {
    if (!severity) return 'bg-gray-100 text-gray-800';
    
    switch (severity.toLowerCase()) {
      case 'low':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'high':
        return 'bg-orange-100 text-orange-800';
      case 'severe':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatSymptoms = (symptoms) => {
    if (!symptoms || symptoms.length === 0) return 'No symptoms reported';
    if (Array.isArray(symptoms)) {
      return symptoms.join(', ');
    }
    return symptoms; // In case symptoms is already a string
  };

  // Show loading state only for initial load
  if (isLoading && posts.length === 0 && !posts.some(p => p.isMock)) {
    return (
      <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">
            Community Health Feed
          </h1>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="bg-white shadow overflow-hidden rounded-lg p-6 animate-pulse"
              >
                <div className="h-4 bg-gray-200 rounded w-1/4 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Community Health Feed
          </h1>
          <p className="mt-2 text-sm text-gray-600">
            Anonymous health experiences shared by our community
          </p>
        </div>

        {posts.length === 0 ? (
          <div className="bg-white shadow overflow-hidden rounded-lg p-6 text-center">
            <p className="text-gray-500">
              No posts to show. Be the first to share your experience!
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {posts.map((post) => (
              <div
                key={post._id}
                className="bg-white shadow overflow-hidden rounded-lg"
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <span
                        className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${getSeverityColor(
                          post.severity
                        )}`}
                      >
                        {post.severity.charAt(0).toUpperCase() +
                          post.severity.slice(1)}
                      </span>
                      {post.location && (
                        <div className="flex items-center text-sm text-gray-500">
                          <svg
                            className="h-4 w-4 mr-1 flex-shrink-0"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                            />
                          </svg>
                          <span className="truncate max-w-[150px]" title={post.location}>
                            {post.location}
                          </span>
                        </div>
                      )}
                    </div>
                    <span className="text-sm text-gray-500">
                      {formatDistanceToNow(new Date(post.date), {
                        addSuffix: true,
                      })}
                    </span>
                  </div>

                  <div className="mb-3">
                    <h3 className="text-lg font-medium text-gray-900">
                      {formatSymptoms(post.symptoms)}
                    </h3>
                    {post.severity && (
                      <span className={`text-xs px-2 py-0.5 rounded-full ${getSeverityColor(post.severity)}`}>
                        {post.severity.charAt(0).toUpperCase() + post.severity.slice(1)}
                      </span>
                    )}
                  </div>

                  {post.description && (
                    <div className="bg-gray-50 p-3 rounded-md mb-3">
                      <p className="text-gray-700 whitespace-pre-line">
                        {post.description}
                      </p>
                    </div>
                  )}

                  {post.tags && post.tags.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {post.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {isLoading && posts.length > 0 && (
              <div className="flex justify-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-indigo-500"></div>
              </div>
            )}

            {/* Pagination Controls - Bottom */}
            <div className="mt-6 flex items-center justify-center space-x-2">
              <button
                onClick={() => handlePageChange(page - 1)}
                disabled={page === 1}
                className={`px-3 py-1 rounded-md ${page === 1 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-indigo-600 hover:bg-indigo-50'}`}
              >
                Previous
              </button>
              
              <div className="flex space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                  <button
                    key={pageNum}
                    onClick={() => handlePageChange(pageNum)}
                    className={`w-8 h-8 flex items-center justify-center rounded-md text-sm font-medium ${
                      pageNum === page
                        ? 'bg-indigo-600 text-white'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    {pageNum}
                  </button>
                ))}
              </div>
              
              <button
                onClick={() => handlePageChange(page + 1)}
                disabled={page === totalPages}
                className={`px-3 py-1 rounded-md ${page === totalPages 
                  ? 'text-gray-400 cursor-not-allowed' 
                  : 'text-indigo-600 hover:bg-indigo-50'}`}
              >
                Next
              </button>
            </div>
            
            {/* Page Info */}
            <div className="mt-2 text-center text-sm text-gray-500">
              Page {page} of {totalPages} • Showing {Math.min(limit, posts.length)} of {totalPages * limit} posts
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CommunityFeed;
