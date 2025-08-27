import React from "react";

const experiments = [
  {
    name: "Sleep Tracking",
    desc: "Monitor sleep quality and patterns.",
    status: "Ongoing",
  },
  {
    name: "Diet Monitoring",
    desc: "Track your daily meals and nutrition.",
    status: "Completed",
  },
  {
    name: "Fitness Challenge",
    desc: "Weekly workout competition.",
    status: "Ongoing",
  },
];

const ExperimentCards = () => {
  return (
    <section className="py-16 bg-white text-center">
      <h2 className="text-3xl font-bold text-[#2C5835] mb-8">
        Your Experiments
      </h2>
      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {experiments.map((exp, i) => (
          <div
            key={i}
            className="p-6 bg-[#DBE4D3] rounded-2xl shadow hover:scale-105 transition"
          >
            <h3 className="text-xl font-bold text-[#2C5835]">{exp.name}</h3>
            <p className="text-gray-600 mt-2">{exp.desc}</p>
            <p className="mt-2 text-sm font-semibold text-gray-700">
              Status: {exp.status}
            </p>
            <div className="mt-4 flex justify-center gap-3">
              <button className="bg-[#75A64D] text-white px-4 py-2 rounded-lg hover:bg-[#2C5835] transition">
                View Details
              </button>
              <button className="bg-white border border-[#75A64D] text-[#2C5835] px-4 py-2 rounded-lg hover:bg-[#DBE4D3] transition">
                Continue
              </button>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ExperimentCards;
