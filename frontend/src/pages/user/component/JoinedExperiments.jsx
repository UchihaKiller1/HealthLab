import React, { useEffect, useState } from "react";

export default function JoinedExperiments(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [leavingId, setLeavingId] = useState(null);
  const [entryFor, setEntryFor] = useState(null); // experiment selected for daily entry
  const [entryBusy, setEntryBusy] = useState(false);
  const [entryValues, setEntryValues] = useState({});
  const [submittedToday, setSubmittedToday] = useState(false);

  async function load(){
    setLoading(true);
    try{
      const token = localStorage.getItem("token");
      if(!token){ setItems([]); setLoading(false); return; }
      const res = await fetch("http://localhost:4000/api/experiments/joined", { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if(res.ok){ setItems(Array.isArray(data) ? data : []); } else { setItems([]); }
    }catch(e){ setItems([]); }
    finally{ setLoading(false); }
  }

  useEffect(() => { load(); }, []);

  async function leave(id){
    setLeavingId(id);
    try{
      const token = localStorage.getItem("token");
      if(!token){ alert("Login required"); setLeavingId(null); return; }
      const res = await fetch(`http://localhost:4000/api/experiments/${id}/leave`, { method: "POST", headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if(!res.ok){ alert(data?.message || data?.error || "Failed to leave"); }
      else { setItems(prev => prev.filter(i => i._id !== id)); }
    }catch(e){ alert("Network error"); }
    finally{ setLeavingId(null); }
  }

  return (
    <section className="py-16 bg-white text-center">
      <h2 className="text-3xl font-bold text-[#2C5835] mb-8">Joined Experiments</h2>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600">You haven't joined any experiments yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {items.map(exp => (
            <div key={exp._id} className="p-6 bg-[#DBE4D3] rounded-2xl shadow text-left">
              <img src={exp.imageUrl} alt={exp.title} className="w-full h-40 object-cover rounded-lg" />
              <div className="mt-3 text-xs text-gray-600 capitalize">{exp.category}</div>
              <h3 className="text-xl font-bold text-[#2C5835] mt-1">{exp.title}</h3>
              <div className="mt-1 text-sm text-gray-700">{exp.durationDays ? `${exp.durationDays} days` : "Open-ended"}</div>
              <div className="mt-1 text-sm font-semibold text-gray-700">Status: {exp.runtimeStatus || (exp.endsAt && new Date(exp.endsAt).getTime() <= Date.now() ? "ended" : "active")}</div>
              <div className="mt-4 flex justify-between items-center">
                <button disabled={leavingId === exp._id} onClick={()=>leave(exp._id)} className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition">{leavingId === exp._id ? "Leaving..." : "Leave"}</button>
                <button disabled={exp.runtimeStatus === "ended"} onClick={async ()=>{ 
                  setEntryFor(exp); setEntryValues({});
                  try{
                    const token = localStorage.getItem("token");
                    if(!token) return;
                    const res = await fetch(`http://localhost:4000/api/experiments/${exp._id}/submission-status`, { headers: { Authorization: `Bearer ${token}` } });
                    const data = await res.json();
                    if(res.ok){ setSubmittedToday(!!data.submittedToday); } else { setSubmittedToday(false); }
                  }catch(_e){ setSubmittedToday(false); }
                }} className="bg-[#75A64D] text-white px-4 py-2 rounded-lg hover:bg-[#2C5835] transition disabled:opacity-60">Daily Entry</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {entryFor && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-xl text-left">
            <h3 className="text-lg font-semibold text-[#2C5835] mb-4">Daily Entry - {entryFor.title}</h3>
            {submittedToday && (
              <div className="mb-4 p-3 rounded bg-green-50 text-green-700 text-sm">You have added today's data.</div>
            )}
            <form onSubmit={async (e)=>{
              e.preventDefault();
              setEntryBusy(true);
              try{
                const token = localStorage.getItem("token");
                if(!token){ alert("Login required"); setEntryBusy(false); return; }
                const res = await fetch(`http://localhost:4000/api/experiments/${entryFor._id}/submit`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                  body: JSON.stringify({ values: entryValues })
                });
                const data = await res.json();
                if(!res.ok){ alert(data?.message || data?.error || "Failed to submit"); }
                else { alert("Submitted for today"); setSubmittedToday(true); }
              }catch(e){ alert("Network error"); }
              finally{ setEntryBusy(false); }
            }} className="space-y-3">
              {(entryFor.formSchema || []).length === 0 ? (
                <div className="text-sm text-gray-700">No fields to fill.</div>
              ) : (
                (entryFor.formSchema || []).map((f, i) => (
                  <div key={i}>
                    <label className="block text-sm text-gray-700">{f.label}</label>
                    {f.type === "text" && (
                      <input disabled={submittedToday} className="mt-1 w-full border rounded px-3 py-2" value={entryValues[f.label] || ""} onChange={e=>setEntryValues(v => ({...v, [f.label]: e.target.value}))} />
                    )}
                    {f.type === "number" && (
                      <input disabled={submittedToday} type="number" className="mt-1 w-full border rounded px-3 py-2" value={entryValues[f.label] || ""} onChange={e=>setEntryValues(v => ({...v, [f.label]: e.target.value}))} />
                    )}
                    {f.type === "checkbox" && (
                      <input disabled={submittedToday} type="checkbox" className="mt-1" checked={!!entryValues[f.label]} onChange={e=>setEntryValues(v => ({...v, [f.label]: e.target.checked}))} />
                    )}
                    {f.type === "slider" && (
                      <input disabled={submittedToday} type="range" min="0" max="100" className="mt-1 w-full" value={entryValues[f.label] ?? 50} onChange={e=>setEntryValues(v => ({...v, [f.label]: Number(e.target.value)}))} />
                    )}
                    {f.type === "dropdown" && (
                      <select disabled={submittedToday} className="mt-1 w-full border rounded px-3 py-2" value={entryValues[f.label] || ""} onChange={e=>setEntryValues(v => ({...v, [f.label]: e.target.value}))}>
                        <option value="">Select...</option>
                        {(f.options || []).map((opt, k) => (
                          <option key={k} value={opt}>{opt}</option>
                        ))}
                      </select>
                    )}
                  </div>
                ))
              )}
              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={()=> setEntryFor(null)} className="px-4 py-2 rounded bg-gray-200 text-gray-800">Cancel</button>
                <button type="submit" disabled={entryBusy || submittedToday} className="px-4 py-2 rounded bg-[#75A64D] text-white hover:bg-[#2C5835] disabled:opacity-60">{entryBusy ? "Submitting..." : submittedToday ? "Submitted" : "Submit"}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}


