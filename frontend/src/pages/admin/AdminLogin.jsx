import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";

export default function AdminLogin(){
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);
        
        try {
            console.log('Attempting login with:', { usernameOrEmail });
            const res = await fetch(`${API_BASE}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usernameOrEmail, password })
            });
            
            let data;
            try {
                data = await res.json();
                console.log('Login response:', { status: res.status, data });
            } catch (jsonError) {
                console.error('Failed to parse JSON response:', jsonError);
                throw new Error('Invalid response from server');
            }
            
            if (!res.ok) {
                const errorMsg = data?.message || data?.error || `Login failed with status ${res.status}`;
                console.error('Login failed:', errorMsg);
                setError(errorMsg);
                return;
            }
            
            if (!data.user) {
                console.error('No user data in response:', data);
                setError("Invalid response from server");
                return;
            }
            
            if (data.user.role !== "admin") {
                console.log('Access denied - user is not an admin:', data.user);
                setError("Admin access required.");
                return;
            }
            
            // Store the token and update auth state
            const token = data.token || data.accessToken;
            if (!token) {
                console.error('No token in response:', data);
                setError("Authentication failed: No token received");
                return;
            }
            
            console.log('Login successful, storing token and updating auth state');
            localStorage.setItem("token", token);
            
            // Update the auth context with the user data
            login({
              ...data.user,
              isAdmin: data.user.role === 'admin' // Ensure isAdmin is set for backward compatibility
            });
            
            // Navigate to admin dashboard
            console.log('Navigating to /admin');
            navigate("/admin", { replace: true });
            
        } catch (e) {
            console.error("Login error:", e);
            setError(e.message || "An error occurred during login. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="w-full h-screen flex items-center justify-center bg-[#F5F8F2]">
            <form onSubmit={handleSubmit} className="w-full max-w-sm bg-white p-6 rounded-xl shadow">
                <h1 className="text-2xl font-bold text-[#2C5835] mb-4">Admin Login</h1>
                {error && <div className="mb-3 text-red-600 text-sm">{error}</div>}
                <label className="block text-sm text-gray-700 mb-1">Username or Email</label>
                <input
                    value={usernameOrEmail}
                    onChange={e=>setUsernameOrEmail(e.target.value)}
                    type="text"
                    className="w-full border rounded px-3 py-2 mb-3"
                    placeholder="admin@example.com"
                    required
                />
                <label className="block text-sm text-gray-700 mb-1">Password</label>
                <input
                    value={password}
                    onChange={e=>setPassword(e.target.value)}
                    type="password"
                    className="w-full border rounded px-3 py-2 mb-4"
                    placeholder="••••••••"
                    required
                />
                <button disabled={loading} type="submit" className="w-full bg-[#2C5835] text-white py-2 rounded disabled:opacity-70">
                    {loading ? "Signing in..." : "Login"}
                </button>
            </form>
        </div>
    );
}


