import React from "react";

const Navbar = () => {
  return (
    <nav className="flex justify-between items-center px-8 py-4 bg-white shadow-md">
      {/* Logo */}
      <div className="text-2xl font-bold text-[#2C5835]">Health Lab</div>

      {/* Links */}
      <ul className="hidden md:flex gap-6 text-gray-700">
        <li>
          <a href="#" className="hover:text-[#75A64D]">
            Home
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-[#75A64D]">
            Experiments
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-[#75A64D]">
            About
          </a>
        </li>
        <li>
          <a href="#" className="hover:text-[#75A64D]">
            Contact
          </a>
        </li>
      </ul>

      {/* CTA Button */}
      <button className="bg-[#75A64D] text-white px-5 py-2 rounded-lg hover:bg-[#2C5835] transition">
        Join Now
      </button>
    </nav>
  );
};

export default Navbar;
