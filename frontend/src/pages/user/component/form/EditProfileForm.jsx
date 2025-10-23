import React, { useState } from "react";

const EditProfileForm = () => {
  const [formData, setFormData] = useState({
    name: "John Doe",
    email: "johndoe@example.com",
    bio: "Cloud health enthusiast.",
    password: "",
    confirmPassword: "",
    notifications: true,
  });

  const [profilePic, setProfilePic] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
  };

  const handleImageUpload = (e) => {
    setProfilePic(URL.createObjectURL(e.target.files[0]));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // ✅ validation + API call here
    console.log("Updated profile:", formData);
  };

  return (
    <section className="py-16 bg-[#F9FAF9]">
      <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-[#2C5835] mb-6 text-center">
          Edit Profile
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Picture */}
          <div className="text-center">
            <img
              src={profilePic || "https://via.placeholder.com/100"}
              alt="Profile"
              className="w-28 h-28 mx-auto rounded-full border-4 border-[#75A64D]"
            />
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="mt-4 block w-full text-sm text-gray-600 file:mr-4 file:py-2 file:px-4
                         file:rounded-lg file:border-0 file:text-sm file:font-semibold
                         file:bg-[#75A64D] file:text-white hover:file:bg-[#2C5835]"
            />
          </div>

          {/* Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#2C5835] outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#2C5835] outline-none"
            />
          </div>

          {/* Bio */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Bio
            </label>
            <textarea
              name="bio"
              value={formData.bio}
              onChange={handleChange}
              rows="3"
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#2C5835] outline-none"
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              New Password
            </label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#2C5835] outline-none"
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Confirm Password
            </label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              className="w-full mt-1 p-3 border rounded-lg focus:ring-2 focus:ring-[#2C5835] outline-none"
            />
          </div>

          {/* Notifications */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              name="notifications"
              checked={formData.notifications}
              onChange={handleChange}
              className="w-4 h-4 text-[#75A64D]"
            />
            <label className="text-sm text-gray-700">
              Enable Notifications
            </label>
          </div>

          {/* Buttons */}
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="bg-[#DBE4D3] text-[#2C5835] px-6 py-2 rounded-lg hover:bg-gray-300 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="bg-[#75A64D] text-white px-6 py-2 rounded-lg hover:bg-[#2C5835] transition"
            >
              Save Changes
            </button>
          </div>

          {/* Account Management */}
          <div className="border-t pt-6 mt-6 text-center">
            <button className="bg-red-500 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition">
              Deactivate Account
            </button>
            <button className="ml-4 bg-red-700 text-white px-6 py-2 rounded-lg hover:bg-red-900 transition">
              Delete Account
            </button>
          </div>
        </form>
      </div>
    </section>
  );
};

export default EditProfileForm;
