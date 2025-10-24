import {
  Link,
  useNavigate,
  Routes,
  Route,
  NavLink,
  Outlet,
} from "react-router-dom";
import React, { useEffect, useState } from "react";
import AllExperiments from "./AllExperiments";

export default function AdminDashboard() {
  const [pending, setPending] = useState([]);
  const [loading, setLoading] = useState(true);
  const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
  const navigate = useNavigate();

  // Get the current path to determine active tab
  const location = window.location.pathname;

  async function fetchPending() {
    try {
      const token = localStorage.getItem("token");
      console.log("Fetching pending experiments...", {
        API_BASE,
        token: token ? "exists" : "missing",
      });

      const res = await fetch(`${API_BASE}/api/experiments/pending`, {
        headers: { Authorization: token ? `Bearer ${token}` : "" },
      });

      console.log("Response status:", res.status, res.statusText);

      const data = await res.json();
      console.log("Response data:", data);

      if (res.ok) {
        console.log("Successfully fetched pending experiments:", data);
        setPending(data);
      } else if (res.status === 401 || res.status === 403) {
        console.log("Authentication error, redirecting to login");
        navigate("/admin/login");
      } else {
        console.error("API Error:", data);
        alert(
          `Error: ${
            data?.message ||
            data?.error ||
            "Failed to fetch pending experiments"
          }`
        );
      }
    } catch (e) {
      console.error("Network/Fetch error:", e);
      alert(`Network error: ${e.message}`);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchPending();
  }, []);

  async function handleAction(id, action) {
    const token = localStorage.getItem("token");
    const res = await fetch(`${API_BASE}/api/experiments/${id}/${action}`, {
      method: "PATCH",
      headers: { Authorization: token ? `Bearer ${token}` : "" },
    });
    if (res.ok) {
      setPending((prev) => prev.filter((p) => p._id !== id));
    } else {
      const data = await res.json();
      alert(data?.message || data?.error || "Action failed");
    }
  }

  // Fetch data when component mounts
  useEffect(() => {
    fetchPending();
  }, []);

  return (
    <div className="w-full h-screen flex">
      {/* Sidebar */}
      <div className="w-[350px] h-screen bg-[#00432D] flex-shrink-0">
        <div className="w-full h-[40px] text-[30px] mt-[20px] font-black flex justify-center items-center text-[#B8D700]">
          Admin Dashboard
        </div>
        <div className="mt-[50px]">
          <NavLink
            to="/admin"
            end
            className={({ isActive }) =>
              `w-full h-[40px] text-[25px] font-bold flex items-center pl-[50px] text-[#E6FED6] hover:bg-[#2C5835] py-2 ${
                isActive ? "bg-[#2C5835]" : ""
              }`
            }
          >
            Pending Approvals
          </NavLink>
          <NavLink
            to="/admin/experiments"
            className={({ isActive }) =>
              `w-full h-[40px] text-[25px] font-bold flex items-center pl-[50px] text-[#E6FED6] hover:bg-[#2C5835] py-2 ${
                isActive ? "bg-[#2C5835]" : ""
              }`
            }
          >
            All Experiments
          </NavLink>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 bg-white p-6 overflow-y-auto">
        <Routes>
          <Route
            path="/"
            element={
              <>
                <h2 className="text-2xl font-semibold text-[#2C5835] mb-4">
                  Pending Experiments
                </h2>
                {loading ? (
                  <div className="text-gray-600">Loading...</div>
                ) : (
                  <div className="space-y-4">
                    {pending.map((exp) => (
                      <div
                        key={exp._id}
                        className="p-4 border border-gray-200 rounded-lg flex items-start gap-4"
                      >
                        <img
                          src={`${API_BASE}${exp.imageUrl}`}
                          alt={exp.title}
                          className="w-32 h-20 object-cover rounded"
                          onError={(e) => {
                            e.target.src =
                              "https://via.placeholder.com/128x80?text=No+Image";
                          }}
                        />
                        <div className="flex-1">
                          <div className="text-xs text-gray-500">
                            by{" "}
                            {exp.createdBy?.username ||
                              exp.createdBy?.email ||
                              "Unknown"}
                            {exp.createdAt && (
                              <span>
                                {" "}
                                · {new Date(exp.createdAt).toLocaleString()}
                              </span>
                            )}
                          </div>
                          <h3 className="text-lg font-semibold text-[#2C5835]">
                            {exp.title}
                          </h3>
                          <p className="text-xs text-gray-600">
                            {exp.description}
                          </p>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleAction(exp._id, "approve")}
                            className="bg-[#75A64D] text-white px-3 py-2 rounded hover:bg-[#5d8a3d] transition-colors"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleAction(exp._id, "reject")}
                            className="bg-red-600 text-white px-3 py-2 rounded hover:bg-red-700 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      </div>
                    ))}
                    {pending.length === 0 && (
                      <div className="text-gray-600">
                        No pending experiments.
                      </div>
                    )}
                  </div>
                )}
              </>
            }
          />
          <Route path="experiments" element={<AllExperiments />} />
        </Routes>
      </div>
    </div>
  );
}
