import React, { useContext } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

const Navbar = () => {
  const { currentUser, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const isHomePage = location.pathname === "/";

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!currentUser) return '';
    const { firstname, lastname, username } = currentUser;
    if (firstname && lastname) return `${firstname[0]}${lastname[0]}`.toUpperCase();
    if (username) return username[0].toUpperCase();
    return 'U';
  };

  return (
    <nav
      className={`flex justify-between items-center px-8 py-4 ${
        isHomePage ? "bg-transparent shadow-none" : "bg-white shadow-md"
      }`}
    >
      {/* Logo */}
      <Link
        to="/"
        className={`text-3xl font-bold font-champ transition ${
          isHomePage ? "text-white" : "text-primary"
        }`}
      >
        HealthLab
      </Link>

      {/* Navigation Links */}
      <div className="hidden md:flex space-x-8 items-center">
        <Link
          to="/explore"
          className={`hover:text-primary transition ${
            isHomePage ? "text-black" : "text-gray-700"
          }`}
        >
          Explore
        </Link>
        <Link
          to="/community"
          className={`hover:text-primary transition ${
            isHomePage ? "text-black" : "text-gray-700"
          }`}
        >
          Community
        </Link>
        <Link
          to="/about"
          className={`hover:text-primary transition ${
            isHomePage ? "text-black" : "text-gray-700"
          }`}
        >
          About Us
        </Link>
        {currentUser && (
          <Link
            to="/my-experiments"
            className={`hover:text-primary transition ${
              isHomePage ? "text-black" : "text-gray-700"
            }`}
          >
            My Experiments
          </Link>
        )}
      </div>

      {/* Auth Buttons */}
      <div className="flex items-center space-x-4">
        {currentUser ? (
          <div className="flex items-center space-x-4">
            {currentUser.role === "admin" && (
              <Link
                to="/admin"
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition"
              >
                Admin Dashboard
              </Link>
            )}
            <Link
              to="/profile"
              className="flex items-center space-x-2"
            >
              <span className="text-black">
                {currentUser.username || "Profile"}
              </span>
              <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                {currentUser.profilePicture ? (
                  <img
                    src={currentUser.profilePicture}
                    alt="Profile"
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-gray-600 font-medium">
                    {getUserInitials()}
                  </span>
                )}
              </div>
            </Link>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        ) : (
          <>
            <Link
              to="/login"
              className={`px-4 py-2 rounded-md transition ${
                isHomePage
                  ? "text-black hover:bg-white hover:bg-opacity-20"
                  : "bg-primary text-black hover:bg-primary-dark"
              }`}
            >
              Login
            </Link>
            <Link
              to="/register"
              className="bg-white text-primary px-4 py-2 rounded-md hover:bg-gray-100 transition"
            >
              Register
            </Link>
          </>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
