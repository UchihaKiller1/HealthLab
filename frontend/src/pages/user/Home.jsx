import React, { useEffect, useState } from "react";
import Navbar from "./component/Navbar";

export default function Home(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinedIds, setJoinedIds] = useState([]);

  useEffect(() => {
    (async () => {
      try{
        const res = await fetch("http://localhost:4000/api/experiments");
        const data = await res.json();
        if(res.ok){
          setItems(data);
        }
      }catch(e){
        // ignore
      }finally{
        setLoading(false);
      }
    })();
  }, []);

  // Load joined experiment ids for current user
  useEffect(() => {
    (async () => {
      try{
        const token = localStorage.getItem("token");
        if(!token) return;
        const res = await fetch("http://localhost:4000/api/experiments/joined", { headers: { Authorization: `Bearer ${token}` } });
        const data = await res.json();
        if(res.ok && Array.isArray(data)){
          setJoinedIds(data.map(x => x._id));
        }
      }catch(_e){ /* ignore */ }
    })();
  }, []);

  return (
    <div>
      {/* First View - Empty for background image and text */}
      <section className="h-screen relative bg-cover bg-center bg-no-repeat" style={{ backgroundImage: "url('/src/assets/home.jpg')" }}>
        <div className="absolute top-0 left-0 right-0 z-10">
          <Navbar />
        </div>
        <div className="flex items-end justify-start h-full pl-16 pb-15">
          <div className="text-left">
            <h1 className="text-6xl font-bold text-[#D9D9D9] leading-tight mb-8">
              From questions<br />
              to answers — let's<br />
              experiment<br />
              together.
            </h1>
            <button className="bg-white text-gray-800 px-6 py-3 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
              Let's Explore →
            </button>
          </div>
        </div>
      </section>
      
      {/* Second View - Approved Experiments */}
      <section className="min-h-screen bg-white">
        <div className="max-w-6xl mx-auto p-6">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-2xl font-semibold text-[#2C5835]">Approved Experiments</h1>
            <a href="/experiments/new" className="bg-[#75A64D] text-white px-4 py-2 rounded-lg hover:bg-[#2C5835]">Create Experiment</a>
          </div>
          {loading ? (
            <div className="text-gray-600">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {items.map(exp => (
                <button type="button" onClick={() => setSelected(exp)} key={exp._id} className="text-left rounded-lg overflow-hidden shadow hover:shadow-lg transition focus:outline-none">
                  <img src={exp.imageUrl} alt={exp.title} className="h-40 w-full object-cover" />
                  <div className="p-4">
                    <div className="text-xs text-gray-500 capitalize">{exp.category}</div>
                    <h3 className="text-lg font-semibold text-[#2C5835]">{exp.title}</h3>
                    <p className="text-sm text-gray-700 line-clamp-2">{exp.description}</p>
                  </div>
                </button>
              ))}
              {items.length === 0 && (
                <div className="text-gray-600">No approved experiments yet.</div>
              )}
            </div>
          )}
        </div>
      </section>
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl text-left">
            <div className="flex items-start gap-4">
              <img src={selected.imageUrl} alt={selected.title} className="w-32 h-32 object-cover rounded" />
              <div>
                <div className="text-xs text-gray-500 capitalize">{selected.category}</div>
                <h3 className="text-xl font-semibold text-[#2C5835]">{selected.title}</h3>
                <p className="text-sm text-gray-700 mt-1">{selected.description}</p>
                <div className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Duration:</span> {selected.durationDays ? `${selected.durationDays} days` : "Open-ended"}
                </div>
                <div className="text-sm text-gray-600 mt-2">
                  <span className="font-medium">Status:</span> {selected.runtimeStatus || (selected.endsAt && new Date(selected.endsAt).getTime() <= Date.now() ? "ended" : "active")}
                </div>
              </div>
            </div>
            <div className="mt-4">
              <div className="font-semibold text-[#2C5835] mb-1">Custom Fields</div>
              {selected.formSchema?.length ? (
                <ul className="list-disc pl-5 text-sm text-gray-800">
                  {selected.formSchema.map((f, i) => (
                    <li key={i}>{f.label} ({f.type}{f.options ? ": "+f.options.join(", ") : ""})</li>
                  ))}
                </ul>
              ) : (
                <div className="text-sm text-gray-600">No custom fields</div>
              )}
            </div>
            <div className="flex justify-end gap-2 mt-6">
              <button type="button" onClick={() => setSelected(null)} className="px-4 py-2 rounded bg-gray-200 text-gray-800">Close</button>
              {joinedIds.includes(selected._id) ? (
                <span className="px-4 py-2 rounded bg-green-100 text-green-700 font-medium">Joined ✓</span>
              ) : (
                <button type="button" disabled={joinBusy || (selected.runtimeStatus === "ended")} onClick={async ()=>{
                  setJoinBusy(true);
                  try{
                    const token = localStorage.getItem("token");
                    if(!token){ alert("Please login to join."); setJoinBusy(false); return; }
                    const res = await fetch(`http://localhost:4000/api/experiments/${selected._id}/join`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
                    const data = await res.json();
                    if(!res.ok){ alert(data?.message || data?.error || "Failed to join"); }
                    else {
                      if(!joinedIds.includes(selected._id)){
                        setJoinedIds(prev => [...prev, selected._id]);
                      }
                    }
                  }catch(e){ alert("Network error"); }
                  finally{ setJoinBusy(false); }
                }} className="px-4 py-2 rounded bg-[#75A64D] text-white hover:bg-[#2C5835]">{joinBusy ? "Joining..." : "Join Experiment"}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


