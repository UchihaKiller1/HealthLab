import { useState } from "react";

export default function ChangePasswordForm() {
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  const [error, setError] = useState("");
  const [strength, setStrength] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });

    // Password strength check
    if (name === "newPassword") {
      if (value.length < 6) setStrength("Weak");
      else if (value.length < 10) setStrength("Medium");
      else setStrength("Strong");
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (formData.newPassword !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    alert("Password updated successfully!");
  };

  return (
    <div className="max-w-md mx-auto bg-white p-8 rounded-2xl shadow-md mt-10">
      <h2 className="font-champBlack text-2xl text-[#2C5835] mb-6 text-center">
        Change Password
      </h2>

      <form className="space-y-4 font-dmSans" onSubmit={handleSubmit}>
        {/* Current Password */}
        <div>
          <label className="block text-[#2C5835] mb-1">Current Password</label>
          <input
            type="password"
            name="currentPassword"
            value={formData.currentPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5835]"
          />
        </div>

        {/* New Password */}
        <div>
          <label className="block text-[#2C5835] mb-1">New Password</label>
          <input
            type="password"
            name="newPassword"
            value={formData.newPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5835]"
          />
          {strength && (
            <p
              className={`text-sm mt-1 ${
                strength === "Weak"
                  ? "text-red-500"
                  : strength === "Medium"
                  ? "text-yellow-600"
                  : "text-green-600"
              }`}
            >
              Strength: {strength}
            </p>
          )}
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block text-[#2C5835] mb-1">
            Confirm New Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-[#2C5835]"
          />
        </div>

        {error && <p className="text-red-500 text-sm">{error}</p>}

        {/* Buttons */}
        <div className="flex items-center justify-between mt-6">
          <button
            type="submit"
            className="bg-[#75A64D] text-white px-5 py-2 rounded-lg hover:bg-[#2C5835] transition"
          >
            Save Password
          </button>
          <button
            type="button"
            className="bg-[#DBE4D3] text-[#2C5835] px-5 py-2 rounded-lg hover:bg-[#c5d3bb] transition"
          >
            Cancel
          </button>
        </div>

        {/* Forgot Password */}
        <div className="text-right mt-4">
          <a
            href="/forgot-password"
            className="text-sm text-[#2C5835] hover:underline"
          >
            Forgot Password?
          </a>
        </div>
      </form>
    </div>
  );
}
