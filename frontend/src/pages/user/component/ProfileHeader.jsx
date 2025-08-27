import React from "react";

const ProfileHeader = () => {
  return (
    <section className="bg-[#DBE4D3] py-10 text-center">
      <img
        src="https://via.placeholder.com/120"
        alt="User Avatar"
        className="w-28 h-28 rounded-full mx-auto border-4 border-[#75A64D]"
      />
      <h1 className="mt-4 text-3xl font-bold text-[#2C5835]">John Doe</h1>
      <p className="text-gray-700">johndoe@example.com</p>
      <p className="text-gray-600 mt-2 max-w-xl mx-auto">
        Enthusiast in cloud-based health experiments. Tracking sleep, fitness,
        and nutrition.
      </p>
      <a href="/edit-profile">
        <button className="mt-4 bg-[#75A64D] text-white px-6 py-2 rounded-lg hover:bg-[#2C5835] transition">
          Edit Profile
        </button>
      </a>
    </section>
  );
};

export default ProfileHeader;
