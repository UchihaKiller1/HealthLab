import React, { useState } from "react";
import Navbar from "./component/Navbar";

export default function AboutUs() {
  const [active, setActive] = useState(null);

  const team = [
    { name: "K L C H Weerasiri", role: "IT23245556", bio: "Epidemiologist specialising in community surveillance and data ethics." },
    { name: "R D L L Jayawardhana", role: "IT23213876", bio: "Builds resilient APIs and data pipelines for the platform." },
    { name: "R D A P Rajamuni", role: "IT23265738 ", bio: "Coordinates volunteers, outreach and partnerships." },
    { name: "M L D Perera", role: "IT23255524", bio: "Designs reproducible analysis workflows and visualisations." },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#DBE4D3] to-white text-gray-800">
      <Navbar />
      {/* HERO */}
      <header className="max-w-7xl mx-auto px-6 md:px-12 py-12 md:py-20 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        <div className="space-y-6">
          <h1 className="text-3xl md:text-4xl font-extrabold text-[#2C5835]">About HealthLab</h1>
          <p className="text-gray-700 max-w-xl">
            HealthLab is a community-powered platform that collects and shares
            public-health data to accelerate open research and informed decision making.
          </p>

          <div className="flex gap-3 mt-4">
            <a
              href="/register"
              className="inline-flex items-center gap-2 rounded-md bg-[#75A64D] text-white px-4 py-2 text-sm font-medium hover:bg-[#2C5835] focus:outline-none focus:ring-2 focus:ring-[#DBE4D3]"
            >
              Get started
            </a>
            <a href="/contact" className="inline-flex items-center gap-2 px-4 py-2 text-sm text-[#2C5835] hover:underline">
              Contact us
            </a>
          </div>
        </div>

        <div className="hidden md:block rounded-xl overflow-hidden shadow-lg">
          <div className="w-full h-64 bg-gradient-to-tr from-[#75A64D] to-[#2C5835] flex items-center justify-center text-white">
            <div className="text-center px-6">
              <div className="text-xl font-semibold">Community driven</div>
              <div className="mt-2 text-sm opacity-90">Open, secure research</div>
            </div>
          </div>
        </div>
      </header>

      {/* MISSION */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="p-6 bg-white/80 rounded-2xl border border-[#DBE4D3] shadow-sm">
            <h3 className="text-lg font-semibold text-[#2C5835]">Our mission</h3>
            <p className="mt-2 text-sm text-gray-700">At HealthLab, our mission is to bring people together 
                to share health experiences, create experiments, and learn from each other. We give everyone a 
                space to test ideas, join projects, and exchange knowledge so communities can make better decisions 
                for their well-being.</p>
          </div>

          <div className="p-6 bg-white/80 rounded-2xl border border-[#DBE4D3] shadow-sm lg:col-span-2">
            <h3 className="text-lg font-semibold text-[#2C5835]">What we do</h3>
            <ul className="mt-3 space-y-3 text-sm text-gray-700">
              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-[#75A64D] text-white inline-flex items-center justify-center font-semibold">1</span>
                <div>
                  <div className="font-medium text-[#2C5835]">Collect</div>
                  <div className="text-xs">Consented, privacy-preserving data from volunteers and partners.</div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-[#75A64D] text-white inline-flex items-center justify-center font-semibold">2</span>
                <div>
                  <div className="font-medium text-[#2C5835]">Validate</div>
                  <div className="text-xs">Rigorous automated and manual QA to ensure data quality.</div>
                </div>
              </li>

              <li className="flex items-start gap-3">
                <span className="w-8 h-8 rounded-full bg-[#75A64D] text-white inline-flex items-center justify-center font-semibold">3</span>
                <div>
                  <div className="font-medium text-[#2C5835]">Share</div>
                  <div className="text-xs">Open APIs and tools for approved researchers and projects.</div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* TEAM */}
      <section className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-semibold text-[#2C5835]">Core team</h2>
          <div className="text-sm text-gray-600 hidden sm:block">Experienced researchers and engineers</div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
          {team.map((m, i) => (
            <button
              key={`${m.name}-${i}`}
              onClick={() => setActive(i)}
              className="group p-4 bg-white rounded-2xl border border-[#DBE4D3] shadow-sm text-left hover:shadow-lg transform hover:-translate-y-1 transition duration-200 focus:outline-none"
              aria-label={`Open ${m.name} details`}
            >
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-full bg-[#DBE4D3] flex items-center justify-center text-[#2C5835] font-semibold text-sm">
                  {m.name.split(" ").map(n => n[0]).slice(0,2).join("")}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-[#2C5835]">{m.name}</div>
                  <div className="text-xs text-gray-600">{m.role}</div>
                </div>
              </div>
              <p className="mt-3 text-xs text-gray-600 line-clamp-3">{m.bio}</p>
            </button>
          ))}
        </div>

        {/* modal/detail panel */}
        {active !== null && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/40" onClick={() => setActive(null)} />
            <div className="relative bg-white rounded-xl max-w-2xl w-full p-6 border border-[#DBE4D3] shadow-xl">
              <div className="flex items-start gap-4">
                <div className="w-20 h-20 rounded-full bg-[#DBE4D3] flex items-center justify-center text-2xl text-[#2C5835] font-bold">
                  {team[active].name.split(" ").map(n => n[0]).slice(0,2).join("")}
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="text-lg font-semibold text-[#2C5835]">{team[active].name}</div>
                      <div className="text-sm text-gray-600">{team[active].role}</div>
                    </div>
                    <button onClick={() => setActive(null)} className="text-gray-500 hover:text-gray-800">✕</button>
                  </div>

                  <p className="mt-4 text-sm text-gray-700">{team[active].bio}</p>

                  <div className="mt-4 flex gap-3">
                    <a href="#" onClick={(e)=>e.preventDefault()} className="text-[#2C5835] hover:underline text-sm">View projects</a>
                    <a href="#" onClick={(e)=>e.preventDefault()} className="text-[#2C5835] hover:underline text-sm">Connect</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* FOOTER */}
      <footer className="max-w-7xl mx-auto px-6 md:px-12 py-8">
        <div className="rounded-2xl p-6 bg-white/80 border border-[#DBE4D3] shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <div className="text-lg font-semibold text-[#2C5835]">Help improve public health</div>
            <div className="text-sm text-gray-600">Join as a contributor or partner — every dataset helps.</div>
          </div>
          <div className="flex gap-3">
            <a href="/register" className="inline-flex items-center px-4 py-2 bg-[#75A64D] text-white rounded-md hover:bg-[#2C5835]">Create account</a>
            <a href="/contact" className="inline-flex items-center px-4 py-2 border border-[#DBE4D3] text-[#2C5835] rounded-md">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}
