import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin(){
    const [usernameOrEmail, setUsernameOrEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";

    async function handleSubmit(e){
        e.preventDefault();
        setError("");
        setLoading(true);
        try{
            const res = await fetch(`${API_BASE}/users/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ usernameOrEmail, password })
            });
            const data = await res.json();
            if(!res.ok){
                setError(data?.message || data?.error || "Login failed");
                return;
            }
            if(data?.user?.role !== "admin"){
                setError("Admin access required.");
                return;
            }
            localStorage.setItem("token", data.token);
            navigate("/admin");
        }catch(e){
            setError("Network error");
        }finally{
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


