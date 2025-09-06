import React, { useEffect, useState } from "react";

const ExperimentCards = () => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const token = localStorage.getItem("token");
      if (!token) {
        setItems([]);
        setLoading(false);
        return;
      }
      try{
        const res = await fetch("http://localhost:4000/api/experiments/mine", {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if(!res.ok){
          setItems([]);
        }else{
          setItems(Array.isArray(data) ? data : []);
        }
      }catch(e){
        setItems([]);
      }finally{
        setLoading(false);
      }
    }
    load();
  }, []);

  async function handleDelete(expId){
    if(!window.confirm("Are you sure you want to delete this experiment? This cannot be undone.")) return;
    try{
      const token = localStorage.getItem("token");
      const res = await fetch(`http://localhost:4000/api/experiments/${expId}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if(!res.ok){
        alert(data?.message || "Failed to delete");
        return;
      }
      setItems(prev => prev.filter(x => x._id !== expId));
    }catch(e){
      alert("Network error");
    }
  }

  return (
    <section className="py-16 bg-white text-center">
      <h2 className="text-3xl font-bold text-[#2C5835] mb-8">Your Experiments</h2>
      {loading ? (
        <p className="text-gray-600">Loading...</p>
      ) : items.length === 0 ? (
        <p className="text-gray-600">You haven't created any experiments yet.</p>
      ) : (
        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {items.map((exp) => (
            <div
              key={exp._id}
              className="p-6 bg-[#DBE4D3] rounded-2xl shadow hover:scale-105 transition"
            >
              <img src={`http://localhost:4000${exp.imageUrl}`} alt={exp.title} className="w-full h-40 object-cover rounded-lg" />
              <h3 className="text-xl font-bold text-[#2C5835] mt-3">{exp.title}</h3>
              <p className="text-xs text-gray-600 mt-2">{exp.description}</p>
              <p className="mt-2 text-sm font-semibold text-gray-700">Status: {exp.status}</p>
              <div className="mt-4 flex justify-center gap-3">
                <button className="bg-[#75A64D] text-white px-4 py-2 rounded-lg hover:bg-[#2C5835] transition">
                  View Details
                </button>
                <button onClick={()=>handleDelete(exp._id)} className="bg-red-100 text-red-700 px-4 py-2 rounded-lg hover:bg-red-200 transition">
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};

export default ExperimentCards;
