import React from "react";

const SettingsSection = () => {
  return (
    <section className="py-16 bg-white text-center">
      <h2 className="text-3xl font-bold text-[#2C5835] mb-8">Settings</h2>
      <div className="max-w-3xl mx-auto bg-[#DBE4D3] rounded-xl shadow p-6 text-left space-y-6">
        {/* Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-[#2C5835]">
            Notifications
          </h3>
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" defaultChecked className="w-4 h-4" />
            Email Notifications
          </label>
          <label className="flex items-center gap-2 mt-2">
            <input type="checkbox" className="w-4 h-4" />
            Push Notifications
          </label>
        </div>

        {/* Privacy */}
        <div>
          <h3 className="text-lg font-semibold text-[#2C5835]">Privacy</h3>
          <select className="mt-2 w-full p-2 border rounded">
            <option>Public Profile</option>
            <option>Friends Only</option>
            <option>Private</option>
          </select>
        </div>

        {/* Account Management */}
        <div>
          <h3 className="text-lg font-semibold text-[#2C5835]">Account</h3>
          <button className="bg-[#75A64D] text-white px-4 py-2 rounded-lg hover:bg-[#2C5835] transition mt-2">
            Change Password
          </button>
          <button className="ml-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition">
            Delete Account
          </button>
        </div>
      </div>
    </section>
  );
};

export default SettingsSection;
