import React from "react";

const Footer = () => {
  return (
    <footer className="py-8 bg-[#2C5835] text-white text-center">
      <div className="flex justify-center gap-6 mb-4">
        <a href="#">Privacy Policy</a>
        <a href="#">Terms</a>
        <a href="#">Contact</a>
      </div>
      <div className="flex justify-center gap-4">
        <a href="#">🌐</a>
        <a href="#">🐦</a>
        <a href="#">📘</a>
      </div>
      <p className="mt-4 text-sm">© 2025 Health Lab. All rights reserved.</p>
    </footer>
  );
};

export default Footer;
