import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "./component/Navbar";

export default function Home(){
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [joinBusy, setJoinBusy] = useState(false);
  const [joinedIds, setJoinedIds] = useState([]);
  const [showLoginPopup, setShowLoginPopup] = useState(false);

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

  const handleStartExperiment = () => {
    const token = localStorage.getItem("token");
    if (token) {
      // User is logged in, navigate to create experiment page
      navigate("/experiments/new");
    } else {
      // User is not logged in, show popup
      setShowLoginPopup(true);
    }
  };

  const handleLoginRedirect = () => {
    setShowLoginPopup(false);
    navigate("/login");
  };

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
            <button className="bg-white text-gray-800 px-6 py-3  shadow-lg hover:shadow-xl transition-all duration-200 font-semibold">
              Let's Explore
            </button>
          </div>
        </div>
      </section>
      
      {/* Start Experiment Section */}
      <section className="min-h-screen bg-white flex items-center">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left side - Text content */}
            <div className="space-y-8">
              <h2 className="text-5xl font-bold text-gray-800 leading-tight">
                Start an Experiment Now
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed max-w-lg">
                Design a simple experiment to test your health ideas. Define your goal, track results, and share with the community to discover what really works.
              </p>
              <button 
                onClick={handleStartExperiment}
                className="bg-gray-200 text-gray-800 px-8 py-4 text-lg font-semibold shadow-lg hover:shadow-xl transition-all duration-200 hover:bg-gray-300"
              >
                Start new experiment
              </button>
            </div>
            
            {/* Right side - Lab illustration */}
            <div className="relative flex justify-center items-center">
              <div className="relative">
                {/* Grid paper background */}
                <div className="absolute -top-8 -right-8 w-64 h-80 bg-gradient-to-br from-yellow-50 to-yellow-100 border-2 border-green-200 shadow-lg transform rotate-12">
                  <div className="w-full h-full opacity-30" style={{
                    backgroundImage: `
                      linear-gradient(to right, #3B82F6 1px, transparent 1px),
                      linear-gradient(to bottom, #3B82F6 1px, transparent 1px)
                    `,
                    backgroundSize: '20px 20px'
                  }}></div>
                </div>
                
                {/* Lab image */}
                <div className="relative z-10 w-48 h-48">
                  <img 
                    src="/src/assets/lab.png" 
                    alt="Lab experiment illustration" 
                    className="w-full h-full object-contain drop-shadow-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
      
      {/* Second View - Popular Challenges */}
      <section className="min-h-screen bg-[#172117]">
        <div className="max-w-7xl mx-auto pl-5 pt-28 pr-8 pb-8">
          <div className="mb-12">
            <h1 className="text-5xl font-champ font-black text-white">Popular Challenges</h1>
          </div>
          {loading ? (
            <div className="text-gray-400">Loading...</div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {items.map(exp => (
                <button type="button" onClick={() => setSelected(exp)} key={exp._id} className="w-full aspect-[16/10] text-left bg-white rounded-4xl overflow-hidden shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none">
                  <div className="px-6 pb-6 pt-3 h-full flex flex-col">
                    <h3 className="w-full text-3xl font-champ font-black text-black leading-tight mb-4">
                      {exp.title}
                    </h3>
                    <div className="flex gap-6 items-start">
                      <div className="w-1/2">
                        <div className="w-full aspect-square overflow-hidden">
                          <img
                            src={`http://localhost:4000${exp.imageUrl}`}
                            alt={exp.title}
                            className="w-full h-full object-cover"
                          />
                        </div>
                      </div>
                      <div className="w-1/2 flex flex-col h-full">
                        <p className="text-xs font-dm-medium text-black leading-relaxed">
                          {exp.description}
                        </p>
                        <div className="mt-auto self-end">
                          <span className="inline-block bg-gray-200 text-black px-6 py-3 text-base font-dm-bold rounded-none">
                            View Details
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
              {items.length === 0 && (
                <div className="text-gray-400">No approved experiments yet.</div>
              )}
            </div>
          )}
        </div>
      </section>
      {selected && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl text-left">
            <div className="flex items-start gap-4">
              <img src={`http://localhost:4000${selected.imageUrl}`} alt={selected.title} className="w-32 h-32 object-cover rounded" />
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

      {/* Login Required Popup */}
      {showLoginPopup && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 w-full max-w-md text-center">
            <h3 className="text-xl font-semibold text-gray-800 mb-4">Login Required</h3>
            <p className="text-gray-600 mb-6">
              You need to log in to create a new experiment. Would you like to go to the login page?
            </p>
            <div className="flex justify-center gap-4">
              <button 
                onClick={() => setShowLoginPopup(false)}
                className="px-6 py-2 rounded bg-gray-200 text-gray-800 hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={handleLoginRedirect}
                className="px-6 py-2 rounded bg-[#75A64D] text-white hover:bg-[#2C5835] transition-colors"
              >
                Go to Login
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}


