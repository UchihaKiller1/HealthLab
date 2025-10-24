import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./component/Navbar";
import { useNavigate } from "react-router-dom";

const categories = [
  "all",
  "fitness",
  "diet",
  "sleep",
  "mental health",
  "other",
];

export default function Explore() {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");
  const [joining, setJoining] = useState(false);
  const [joinedExperiments, setJoinedExperiments] = useState(new Set());
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleJoinExperiment = async (experimentId) => {
    if (!token) {
      navigate("/login");
      return;
    }

    try {
      setJoining(true);
      const response = await fetch(
        `http://localhost:4000/api/experiments/${experimentId}/join`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to join experiment");
      }

      // Update the UI to show the user has joined
      setJoinedExperiments((prev) => new Set([...prev, experimentId]));

      // Update the experiment in the items array to reflect the new participant count
      setItems((prevItems) =>
        prevItems.map((item) =>
          item._id === experimentId
            ? {
                ...item,
                participants: [
                  ...(item.participants || []),
                  { _id: "current-user" },
                ],
              }
            : item
        )
      );
    } catch (error) {
      console.error("Error joining experiment:", error);
      alert(error.message || "Failed to join experiment");
    } finally {
      setJoining(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        const res = await fetch("http://localhost:4000/api/experiments");
        const data = await res.json();
        if (res.ok) {
          setItems(Array.isArray(data) ? data : []);
        }
      } catch (_e) {
        setItems([]);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    return items.filter((x) => {
      const matchCat = cat === "all" ? true : String(x.category) === cat;
      const matchQ = !s
        ? true
        : String(x.title || "")
            .toLowerCase()
            .includes(s) ||
          String(x.description || "")
            .toLowerCase()
            .includes(s);
      return matchCat && matchQ;
    });
  }, [items, q, cat]);

  const isLoggedIn = localStorage.getItem("token");

  const handleCreateNew = () => {
    if (!isLoggedIn) {
      navigate("/login");
    } else {
      navigate("/experiments/new");
    }
  };

  return (
    <div>
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-[#2C5835]">
            Explore Experiments
          </h1>
          <button
            onClick={handleCreateNew}
            className="flex items-center gap-1.5 px-3 py-1.5 text-sm bg-[#75A64D] text-white rounded-md hover:bg-[#2C5835] transition-colors shadow-sm hover:shadow focus:outline-none focus:ring-1 focus:ring-[#75A64D] focus:ring-offset-1"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-11a1 1 0 10-2 0v2H7a1 1 0 100 2h2v2a1 1 0 102 0v-2h2a1 1 0 100-2h-2V7z"
                clipRule="evenodd"
              />
            </svg>
            <span className="font-medium">New Experiment</span>
          </button>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search experiments..."
              className="flex-1 md:w-80 border rounded px-3 py-2"
            />
            <div className="flex gap-2">
              {categories.map((c) => (
                <button
                  key={c}
                  onClick={() => setCat(c)}
                  className={`px-2.5 py-1 text-sm rounded border ${
                    cat === c
                      ? "bg-[#75A64D] text-white border-[#75A64D]"
                      : "bg-white text-gray-700 hover:bg-gray-50"
                  } transition-colors`}
                >
                  {c}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#75A64D]"></div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((exp) => (
              <div
                key={exp._id}
                className="group bg-white rounded-xl overflow-hidden shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 flex flex-col h-full"
              >
                {/* Image with overlay */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={`http://localhost:4000${exp.imageUrl}`}
                    alt={exp.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-4">
                    <span className="text-white text-sm font-medium bg-[#75A64D] px-3 py-1 rounded-full">
                      {exp.category || "General"}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex flex-col flex-grow">
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="text-xl font-bold text-gray-900 line-clamp-2 group-hover:text-[#2C5835] transition-colors">
                      {exp.title}
                    </h3>
                    <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                      {exp.durationDays || "N/A"} days
                    </span>
                  </div>

                  <p className="text-gray-600 text-sm mb-4 line-clamp-3 flex-grow">
                    {exp.description}
                  </p>

                  <div className="flex justify-between items-center mt-auto pt-4 border-t border-gray-100">
                    <div className="flex items-center">
                      <div className="flex -space-x-2">
                        {exp.participants?.slice(0, 3).map((p, i) => (
                          <div
                            key={i}
                            className="w-6 h-6 rounded-full bg-gray-300 border-2 border-white"
                          ></div>
                        ))}
                        {exp.participants?.length > 3 && (
                          <div className="w-6 h-6 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-gray-600">
                            +{exp.participants.length - 3}
                          </div>
                        )}
                      </div>
                      <span className="ml-2 text-xs text-gray-500">
                        {exp.participants?.length || 0} participants
                      </span>
                    </div>
                    <div className="flex gap-2">
                      {joinedExperiments.has(exp._id) ||
                      exp.participants?.some(
                        (p) => p._id === "current-user"
                      ) ? (
                        <span className="inline-flex items-center px-3 py-1.5 text-xs font-medium rounded-md bg-green-100 text-green-800">
                          <svg className="w-3.5 h-3.5 mr-1.5" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                          </svg>
                          Joined
                        </span>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinExperiment(exp._id);
                          }}
                          disabled={joining}
                          className={`inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white ${
                            joining
                              ? 'bg-gray-400 cursor-not-allowed'
                              : 'bg-[#2C5835] hover:bg-[#1e3d24] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C5835]'
                          }`}
                        >
                          {joining ? (
                            <>
                              <svg className="animate-spin -ml-1 mr-1.5 h-3 w-3 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                              </svg>
                              Joining...
                            </>
                          ) : 'Join'}
                        </button>
                      )}
                      <button
                        onClick={() => navigate(`/experiments/${exp._id}`)}
                        className="inline-flex items-center px-3 py-1.5 border border-gray-300 text-xs font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#2C5835]"
                      >
                        View Details →
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-gray-600">
                No experiments match your search.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
