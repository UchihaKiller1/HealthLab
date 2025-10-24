import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'react-toastify';
import DownloadSummaryButton from '../../components/DownloadSummaryButton';
import ShareButtons from '../../components/ShareButtons';

const ExperimentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [experiment, setExperiment] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isParticipant, setIsParticipant] = useState(false);
  const [submissions, setSubmissions] = useState([]);
  const [hasSubmittedToday, setHasSubmittedToday] = useState(false);
  const [formData, setFormData] = useState({});

  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  useEffect(() => {
    const fetchExperimentDetails = async () => {
      try {
        setIsLoading(true);
        const token = localStorage.getItem('token');
        
        if (!token) {
          navigate('/login');
          return;
        }
        
        // Fetch experiment details
        const expResponse = await axios.get(`${API_BASE}/api/experiments/${id}`, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        setExperiment(expResponse.data);
        
        // Get user ID from token (since /api/auth/me is not available)
        let userId = null;
        try {
          // Try to get user ID from token
          const tokenParts = token.split('.');
          if (tokenParts.length === 3) {
            const payload = JSON.parse(atob(tokenParts[1]));
            userId = payload.userId || payload.sub;
          }
        } catch (e) {
          console.warn('Could not extract user ID from token:', e);
        }
        
        // If we couldn't get user ID, assume not a participant
        if (!userId) {
          setIsParticipant(false);
          return;
        }
        
        // Check if user is a participant
        const participant = expResponse.data.participants?.includes(userId);
        setIsParticipant(!!participant);
        
        if (participant) {
          // Fetch user's submissions for this experiment
          const subsResponse = await axios.get(`${API_BASE}/api/experiments/${id}/submissions`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          setSubmissions(subsResponse.data);
          
          // Check if user has submitted today
          const statusResponse = await axios.get(`${API_BASE}/api/experiments/${id}/submission-status`, {
            headers: { 
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            }
          });
          setHasSubmittedToday(statusResponse.data.hasSubmitted);
          
          // Initialize form data with empty values
          const initialFormData = {};
          expResponse.data.formSchema.forEach(field => {
            initialFormData[field.label] = '';
          });
          setFormData(initialFormData);
        }
      } catch (error) {
        console.error('Error fetching experiment details:', error);
        toast.error('Failed to load experiment details');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchExperimentDetails();
  }, [id]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        navigate('/login');
        return;
      }
      
      await axios.post(
        `${API_BASE}/api/experiments/${id}/submit`,
        { values: formData },
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      toast.success('Data submitted successfully!');
      setHasSubmittedToday(true);
      // Refresh submissions
      const response = await axios.get(`http://localhost:4000/api/experiments/${id}/submissions`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      setSubmissions(response.data);
    } catch (error) {
      console.error('Error submitting data:', error);
      toast.error(error.response?.data?.message || 'Failed to submit data');
    }
  };

  const handleJoinExperiment = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `http://localhost:4000/api/experiments/${id}/join`,
        {},
        { 
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          } 
        }
      );
      toast.success('Successfully joined the experiment!');
      setIsParticipant(true);
    } catch (error) {
      console.error('Error joining experiment:', error);
      toast.error(error.response?.data?.message || 'Failed to join experiment');
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!experiment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-2xl font-semibold text-gray-700">Experiment not found</h2>
        <button
          onClick={() => navigate('/experiments')}
          className="mt-4 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          Back to Experiments
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      {/* Experiment Image */}
      {experiment.imageUrl && (
        <div className="mb-6 rounded-lg overflow-hidden shadow-md">
          <img
            src={experiment.imageUrl.startsWith('http') ? experiment.imageUrl : `${API_BASE}${experiment.imageUrl.startsWith('/') ? '' : '/'}${experiment.imageUrl}`}
            alt={experiment.title}
            className="w-full h-64 object-cover"
            onError={(e) => {
              e.target.onerror = null;
              e.target.src = '/placeholder-experiment.jpg';
            }}
          />
        </div>
      )}
      
      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <div className="px-4 py-5 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold text-gray-900">
                {experiment.title}
              </h3>
              <div className="flex items-center mt-2 space-x-2">
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  {experiment.category || 'General'}
                </span>
                <span className="text-sm text-gray-500">
                  {experiment.status} • {experiment.durationDays || 'N/A'} days • {experiment.participants?.length || 0} participants
                </span>
              </div>
              <div className="mt-3
              ">
                <ShareButtons 
                  title={experiment.title}
                  url={window.location.href}
                  description={experiment.description}
                />
              </div>
            </div>
            <div className="flex-shrink-0">
              {isParticipant && <DownloadSummaryButton experimentId={id} />}
            </div>
          </div>
        </div>
        
        <div className="border-t border-gray-200 px-4 py-5 sm:p-0">
          <dl className="sm:divide-y sm:divide-gray-200">
            <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
              <dt className="text-sm font-medium text-gray-500">Description</dt>
              <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                {experiment.description}
              </dd>
            </div>
            
            {isParticipant && experiment.formSchema?.length > 0 && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Daily Check-in</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  {hasSubmittedToday ? (
                    <div className="text-green-600">
                      You've already submitted your data for today. Come back tomorrow!
                    </div>
                  ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                      {experiment.formSchema.map((field, index) => (
                        <div key={index} className="mb-4">
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            {field.label}
                          </label>
                          {field.type === 'dropdown' ? (
                            <select
                              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                              value={formData[field.label] || ''}
                              onChange={(e) => handleInputChange(field.label, e.target.value)}
                              required
                            >
                              <option value="">Select an option</option>
                              {field.options.map((option, i) => (
                                <option key={i} value={option}>
                                  {option}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <input
                              type={field.type}
                              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                              value={formData[field.label] || ''}
                              onChange={(e) => handleInputChange(field.label, e.target.value)}
                              required
                            />
                          )}
                        </div>
                      ))}
                      <button
                        type="submit"
                        className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        Submit Today's Data
                      </button>
                    </form>
                  )}
                </dd>
              </div>
            )}
            
            {isParticipant && submissions.length > 0 && (
              <div className="py-4 sm:py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6">
                <dt className="text-sm font-medium text-gray-500">Your Submissions</dt>
                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                      <thead className="bg-gray-50">
                        <tr>
                          <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                            Date
                          </th>
                          {experiment.formSchema.map((field, i) => (
                            <th key={i} scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              {field.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {submissions.map((submission, i) => (
                          <tr key={i}>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {new Date(submission.date).toLocaleDateString()}
                            </td>
                            {experiment.formSchema.map((field, j) => (
                              <td key={j} className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {submission.values[field.label] || '-'}
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </dd>
              </div>
            )}
          </dl>
        </div>
        
        <div className="bg-gray-50 px-4 py-4 sm:px-6 flex justify-end">
          {!isParticipant ? (
            <button
              onClick={handleJoinExperiment}
              className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Join Experiment
            </button>
          ) : (
            <button
              onClick={() => navigate('/my-experiments')}
              className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Back to My Experiments
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ExperimentDetails;
