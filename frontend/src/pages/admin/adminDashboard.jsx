import { Link, useNavigate } from "react-router-dom";
import React, { useEffect, useState } from "react";

export default function AdminDashboard(){
    const [pending, setPending] = useState([]);
    const [loading, setLoading] = useState(true);
    const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:4000";
    const navigate = useNavigate();

    async function fetchPending(){
        try{
            const token = localStorage.getItem("token");
            const res = await fetch(`${API_BASE}/api/experiments/pending`, {
                headers: { Authorization: token ? `Bearer ${token}` : "" }
            });
            const data = await res.json();
            if(res.ok){ setPending(data); }
            else if(res.status === 401 || res.status === 403){
                navigate("/admin/login");
            }
        }catch(e){
            // ignore
        }finally{
            setLoading(false);
        }
    }

    useEffect(()=>{ fetchPending(); }, []);

    async function handleAction(id, action){
        const token = localStorage.getItem("token");
        const res = await fetch(`${API_BASE}/api/experiments/${id}/${action}`, {
            method: "PATCH",
            headers: { Authorization: token ? `Bearer ${token}` : "" }
        });
        if(res.ok){
            setPending(prev => prev.filter(p => p._id !== id));
        }else{
            const data = await res.json();
            alert(data?.message || data?.error || "Action failed");
        }
    }

    return(
        <div className= "w-full h-screen flex " >
            <div className="w-[350px] h-screen bg-[#00432D]">
                <button className="w-full h-[40px] text-[30px] mt-[20px] font-black flex justify-center items-center text-[#B8D700]" >Admin Dashboard</button>
                <div className='mt-[50px] items-left '>
                    <Link  className="w-full h-[40px] text-[25px] font-bold flex justify-start ml-[50px] items-center text-[#E6FED6]">Experiments</Link>
                <Link  className="w-full h-[40px] text-[25px] font-bold flex justify-start ml-[50px] mt-[0px] items-center text-[#E6FED6]">Users</Link>
                </div></div>
            <div className=" w-[calc(100vw-350px)] h-screen bg-white p-6 overflow-y-auto">
                <h2 className="text-2xl font-semibold text-[#2C5835] mb-4">Pending Experiments</h2>
                {loading ? (
                    <div className="text-gray-600">Loading...</div>
                ) : (
                    <div className="space-y-4">
                        {pending.map(exp => (
                            <div key={exp._id} className="p-4 border border-gray-200 rounded-lg flex items-start gap-4">
                                <img src={`${API_BASE}${exp.imageUrl}`} alt={exp.title} className="w-32 h-20 object-cover rounded" />
                                <div className="flex-1">
                                    <div className="text-xs text-gray-500">
                                        by {exp.createdBy?.username || exp.createdBy?.email}
                                        {exp.createdAt && (
                                            <span> · {new Date(exp.createdAt).toLocaleString()}</span>
                                        )}
                                    </div>
                                    <h3 className="text-lg font-semibold text-[#2C5835]">{exp.title}</h3>
                                    <p className="text-sm text-gray-700">{exp.description}</p>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={()=>handleAction(exp._id, 'approve')} className="bg-[#75A64D] text-white px-3 py-2 rounded">Approve</button>
                                    <button onClick={()=>handleAction(exp._id, 'reject')} className="bg-red-600 text-white px-3 py-2 rounded">Reject</button>
                                </div>
                            </div>
                        ))}
                        {pending.length === 0 && (
                            <div className="text-gray-600">No pending experiments.</div>
                        )}
                    </div>
                )}
            </div>
        </div>
    )

}