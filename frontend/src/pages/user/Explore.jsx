import React, { useEffect, useMemo, useState } from "react";
import Navbar from "./component/Navbar";

const categories = ["all","fitness","diet","sleep","mental health","other"];

export default function Explore(){
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("all");

  useEffect(() => {
    (async () => {
      try{
        const res = await fetch("http://localhost:4000/api/experiments");
        const data = await res.json();
        if(res.ok){ setItems(Array.isArray(data) ? data : []); }
      }catch(_e){ setItems([]); }
      finally{ setLoading(false); }
    })();
  }, []);

  const filtered = useMemo(() => {
    const s = (q || "").toLowerCase();
    return items.filter(x => {
      const matchCat = cat === "all" ? true : String(x.category) === cat;
      const matchQ = !s ? true : (
        String(x.title || "").toLowerCase().includes(s) ||
        String(x.description || "").toLowerCase().includes(s)
      );
      return matchCat && matchQ;
    });
  }, [items, q, cat]);

  return (
    <div>
      <Navbar />
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-4">
          <h1 className="text-2xl font-semibold text-[#2C5835]">Explore Experiments</h1>
          <div className="flex items-center gap-2 w-full md:w-auto">
            <input value={q} onChange={e=>setQ(e.target.value)} placeholder="Search experiments..." className="flex-1 md:w-80 border rounded px-3 py-2" />
            <div className="flex gap-2">
              {categories.map(c => (
                <button key={c} onClick={()=>setCat(c)} className={`px-3 py-2 rounded border ${cat===c?"bg-[#75A64D] text-white border-[#75A64D]":"bg-white text-gray-800"}`}>{c}</button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-gray-600">Loading...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {filtered.map(exp => (
              <div key={exp._id} className="w-full aspect-[16/10] bg-white rounded-3xl overflow-hidden shadow hover:shadow-lg transition">
                <div className="px-6 pb-6 pt-3 h-full flex flex-col">
                  <h3 className="w-full text-2xl font-champ font-black text-black leading-tight mb-4">{exp.title}</h3>
                  <div className="flex gap-6 items-start">
                    <div className="w-1/2">
                      <div className="w-full aspect-square overflow-hidden">
                        <img src={`http://localhost:4000${exp.imageUrl}`} alt={exp.title} className="w-full h-full object-cover" />
                      </div>
                    </div>
                    <div className="w-1/2 flex flex-col h-full">
                      <p className="text-xs font-dm-medium text-black leading-relaxed">{exp.description}</p>
                      <div className="mt-auto self-end">
                        <button className="bg-gray-200 text-black px-6 py-3 font-dm-bold rounded-none">View Details</button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
            {filtered.length === 0 && (
              <div className="text-gray-600">No experiments match your search.</div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}


