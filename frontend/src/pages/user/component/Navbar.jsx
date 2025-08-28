import React, { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);
  const location = useLocation();
  const isHomePage = location.pathname === "/";

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);

    const handleStorage = () => setIsLoggedIn(!!localStorage.getItem("token"));
    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  useEffect(() => {
    const token = localStorage.getItem("token");
    async function fetchUser() {
      try {
        if (!token) {
          setUser(null);
          return;
        }
        const res = await fetch("http://localhost:4000/users/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data);
        }
      } catch (e) {
        setUser(null);
      }
    }
    fetchUser();
  }, [isLoggedIn]);

    return (
          <nav className={`flex justify-between items-center px-8 py-4 ${isHomePage ? 'bg-transparent shadow-none' : 'bg-white shadow-md'}`}>
      {/* Logo */}
             <Link to="/" className={`text-3xl font-bold font-champ transition ${isHomePage ? 'text-[#B8D703] hover:text-[#CFE063]' : 'text-[#2C5835] hover:text-[#75A64D]'}`}>HealthLab</Link>

      {/* Links */}
             <ul className={`hidden md:flex gap-6 font-light ${isHomePage ? 'text-white' : 'text-gray-700'}`}>

                 <li>
                       <Link to="/explore" className={isHomePage ? "hover:text-[#DBE4D3]" : "hover:text-[#75A64D]"}>
              Explore
            </Link>
          </li>
          <li>
            <Link to="/about" className={isHomePage ? "hover:text-[#DBE4D3]" : "hover:text-[#75A64D]"}>
              About us
            </Link>
          </li>
                     <li>
             <a href="#" className={`${isHomePage ? "hover:text-[#DBE4D3]" : "hover:text-[#75A64D]"} mr-[80px]`}>
               Contact us
             </a>
           </li>
      </ul>

      {/* CTA / Profile */}
             {isLoggedIn ? (
                  <Link to="/profile" aria-label="Profile" className={`p-2 rounded-full transition ${isHomePage ? 'hover:bg-white/20' : 'hover:bg-gray-100'}`}>
            {user?.profilePicture ? (
              <img 
                src={user.profilePicture.startsWith("http") ? user.profilePicture : `http://localhost:4000/${user.profilePicture.replace(/^\/+/, "")}`}
                alt="Profile" 
                className="w-10 h-10 rounded-full object-cover"
              />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className={`w-8 h-8 ${isHomePage ? 'text-white' : 'text-[#2C5835]'}`}>
               <path d="M12 12c2.761 0 5-2.686 5-6s-2.239-6-5-6-5 2.686-5 6 2.239 6 5 6zm0 2c-4.418 0-8 3.134-8 7v1h16v-1c0-3.866-3.582-7-8-7z" />
             </svg>
            )}
         </Link>
      ) : (
                 <Link to="/register" className={`px-5 py-2 rounded-lg transition ${isHomePage ? 'bg-white/20 text-white hover:bg-white/30 border border-white/30' : 'bg-[#75A64D] text-white hover:bg-[#2C5835]'}`}>
          Join Now
        </Link>
      )}
    </nav>
  );
};

export default Navbar;
