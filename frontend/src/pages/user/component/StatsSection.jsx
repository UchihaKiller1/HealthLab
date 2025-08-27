import React from "react";

const stats = [
  { title: "Experiments Joined", value: 12 },
  { title: "Completed Experiments", value: 8 },
  { title: "Achievements", value: "5 Badges" },
];

const StatsSection = () => {
  return (
    <section className="py-16 bg-[#F9FAF9] text-center">
      <h2 className="text-3xl font-bold text-[#2C5835] mb-8">Your Progress</h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {stats.map((s, i) => (
          <div
            key={i}
            className="p-6 bg-white rounded-xl shadow hover:scale-105 transition"
          >
            <h3 className="text-2xl font-bold text-[#75A64D]">{s.value}</h3>
            <p className="text-gray-600">{s.title}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default StatsSection;
