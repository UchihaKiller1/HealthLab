import React, { useState, useEffect } from "react";
import axios from "axios";
import { useAuth } from "@/contexts/AuthContext";

const SettingsSection = () => {
  const { currentUser, updateUser } = useAuth();
  const [emailNotifications, setEmailNotifications] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: '', type: '' });

  useEffect(() => {
    if (currentUser?.notificationPreferences) {
      setEmailNotifications(currentUser.notificationPreferences.emailNotifications || false);
    }
  }, [currentUser]);

  const handleNotificationChange = async (e) => {
    const isEnabled = e.target.checked;
    setEmailNotifications(isEnabled);
    
    try {
      setLoading(true);
      const token = localStorage.getItem('token');
      await axios.patch(
        '/api/users/me/notifications',
        { emailNotifications: isEnabled },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      
      // Update the current user in context
      updateUser({
        ...currentUser,
        notificationPreferences: {
          ...currentUser.notificationPreferences,
          emailNotifications: isEnabled
        }
      });
      
      setMessage({
        text: 'Notification preferences updated successfully!',
        type: 'success'
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      setEmailNotifications(!isEnabled); // Revert on error
      setMessage({
        text: 'Failed to update notification preferences. Please try again.',
        type: 'error'
      });
    } finally {
      setLoading(false);
      // Clear message after 3 seconds
      setTimeout(() => setMessage({ text: '', type: '' }), 3000);
    }
  };
  return (
    <section className="py-16 bg-white text-center">
      <h2 className="text-3xl font-bold text-[#2C5835] mb-8">Settings</h2>
      <div className="max-w-3xl mx-auto bg-[#DBE4D3] rounded-xl shadow p-6 text-left space-y-6">
        {/* Notifications */}
        <div>
          <h3 className="text-lg font-semibold text-[#2C5835] mb-2">
            Email Notifications
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            Receive email notifications when new experiments are added
          </p>
          <label className="flex items-center gap-2">
            <input 
              type="checkbox" 
              checked={emailNotifications}
              onChange={handleNotificationChange}
              disabled={loading}
              className="w-4 h-4 rounded border-gray-300 text-[#2C5835] focus:ring-[#2C5835]" 
            />
            <span className={loading ? 'text-gray-500' : 'text-gray-800'}>
              {emailNotifications ? 'Enabled' : 'Disabled'}
            </span>
          </label>
          {message.text && (
            <p className={`mt-2 text-sm ${message.type === 'success' ? 'text-green-600' : 'text-red-600'}`}>
              {message.text}
            </p>
          )}
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
