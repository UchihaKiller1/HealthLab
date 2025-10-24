import React, { useState, useEffect } from "react";
import axios from "axios";

const StatsSection = () => {
  const [stats, setStats] = useState([
    { title: "Experiments Joined", value: 0, loading: true },
    { title: "Completed Experiments", value: 0, loading: true },
    { title: "Total Submissions", value: 0, loading: true },
    { title: "Achievements", value: "0 Badges", loading: true },
  ]);
  const [error, setError] = useState(null);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          setError('Please log in to view your stats');
          return;
        }

        const response = await axios.get(`${API_BASE}/api/experiments/user/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });

        setStats([
          { title: "Experiments Joined", value: response.data.totalJoined, loading: false },
          { title: "Completed Experiments", value: response.data.completedExperiments, loading: false },
          { title: "Total Submissions", value: response.data.totalSubmissions, loading: false },
          { title: "Achievements", value: `${response.data.achievements} Badges`, loading: false },
        ]);
      } catch (err) {
        console.error('Error fetching stats:', err);
        setError('Failed to load statistics');
        setStats(stats.map(stat => ({ ...stat, loading: false })));
      }
    };

    fetchStats();
  }, []);

  return (
    <section className="py-16 bg-[#F9FAF9] text-center">
      <h2 className="text-3xl font-bold text-[#2C5835] mb-8">Your Progress</h2>
      {error ? (
        <div className="text-red-500">{error}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto px-4">
          {stats.map((stat, i) => (
            <div
              key={i}
              className="p-6 bg-white rounded-xl shadow hover:shadow-md transition-all duration-300 transform hover:-translate-y-1"
            >
              {stat.loading ? (
                <div className="animate-pulse">
                  <div className="h-8 w-3/4 bg-gray-200 rounded mx-auto mb-2"></div>
                  <div className="h-6 w-1/2 bg-gray-200 rounded mx-auto"></div>
                </div>
              ) : (
                <>
                  <h3 className="text-2xl font-bold text-[#75A64D] mb-2">
                    {stat.value}
                  </h3>
                  <p className="text-gray-600">{stat.title}</p>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default StatsSection;
