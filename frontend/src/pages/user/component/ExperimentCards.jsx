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
              <p className="text-gray-600 mt-2">{exp.description}</p>
              <p className="mt-2 text-sm font-semibold text-gray-700">Status: {exp.status}</p>
              <div className="mt-4 flex justify-center gap-3">
                <button className="bg-[#75A64D] text-white px-4 py-2 rounded-lg hover:bg-[#2C5835] transition">
                  View Details
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
