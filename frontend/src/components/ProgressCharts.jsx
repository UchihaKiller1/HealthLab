import React, { useState, useEffect } from 'react';
import { Line } from 'react-chartjs-2';
import axios from 'axios';
import { 
  Chart as ChartJS, 
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const ProgressCharts = () => {
  const [chartData, setChartData] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  useEffect(() => {
    const fetchUserSubmissions = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your progress');
          setLoading(false);
          return;
        }

        const response = await axios.get(`${API_BASE}/api/experiments/user/submissions`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.data && response.data.length > 0) {
          // Process the data for the chart
          const processedData = processChartData(response.data);
          setChartData(processedData);
        } else {
          setChartData([]); // No data available
        }
      } catch (err) {
        console.error('Error fetching submissions:', err);
        setError('Failed to load progress data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserSubmissions();
  }, []);

  const processChartData = (experimentsData) => {
    return experimentsData.map(experiment => {
      // Extract all unique field names from all submissions
      const fieldNames = new Set();
      experiment.submissions.forEach(sub => {
        Object.keys(sub.values || {}).forEach(key => fieldNames.add(key));
      });

      // Create datasets for each field
      const datasets = Array.from(fieldNames).map((fieldName, idx) => {
        const data = experiment.submissions.map(sub => {
          const value = sub.values ? sub.values[fieldName] : null;
          // Convert string numbers to numbers if possible
          return isNaN(Number(value)) ? value : Number(value);
        });

        // Generate consistent colors for each field
        const hue = (idx * 137.5) % 360; // Golden angle for color distribution
        return {
          label: fieldName,
          data: data,
          borderColor: `hsl(${hue}, 70%, 50%)`,
          backgroundColor: `hsla(${hue}, 70%, 50%, 0.1)`,
          borderWidth: 2,
          tension: 0.4,
          fill: false,
        };
      });

      return {
        id: experiment.experimentId,
        title: experiment.experimentTitle,
        chartOptions: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: {
            legend: {
              position: 'top',
            },
            title: {
              display: true,
              text: experiment.experimentTitle,
              font: {
                size: 16
              }
            },
            tooltip: {
              mode: 'index',
              intersect: false,
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              grid: {
                display: true,
                color: 'rgba(0, 0, 0, 0.05)'
              }
            },
            x: {
              grid: {
                display: false
              }
            }
          }
        },
        chartData: {
          labels: experiment.submissions.map(sub => 
            new Date(sub.date).toLocaleDateString()
          ),
          datasets: datasets
        }
      };
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12 text-red-500">
        {error}
      </div>
    );
  }

  if (chartData.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500">
        No submission data available. Start participating in experiments to see your progress.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-md mb-8">
      <h2 className="text-2xl font-bold text-gray-800 mb-6">My Progress</h2>
      <div className="space-y-12">
        {chartData.map(({ id, title, chartData, chartOptions }) => (
          <div key={id} className="mb-12">
            <h3 className="text-lg font-semibold text-gray-700 mb-4">{title}</h3>
            <div className="h-80">
              <Line options={chartOptions} data={chartData} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProgressCharts;
