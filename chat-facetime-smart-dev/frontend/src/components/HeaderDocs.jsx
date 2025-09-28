import React from 'react';
const HeaderDocs = () => {
  return (
    <header className="fixed top-0 left-0 right-0 bg-white shadow-md z-50 h-[104px] flex justify-between items-center px-6">
      <a href="/" className="logo">
        <img src="images/icons/logo-simplewebrtc.svg" alt="SimpleWebRTC Logo" className="h-14" />
      </a>
      <input type="checkbox" id="mobile-nav-toggle" className="hidden" />
      <label htmlFor="mobile-nav-toggle" className="md:hidden text-gray-600 cursor-pointer">
        Menu
      </label>
      <ul className="hidden md:flex space-x-6 mr-5">
        <li>
          <a href="/" className="text-primary text-lg hover:text-primaryHover">Docs</a>
        </li>
        <li>
          <a href="/consulting" className="text-primary text-lg hover:text-primaryHover">
            Consulting & Development
          </a>
        </li>
        <li>
          <a href="/pricing" className="text-primary text-lg hover:text-primaryHover">Pricing</a>
        </li>
        <li>
          <a href="/contact" className="text-primary text-lg hover:text-primaryHover">Contact</a>
        </li>
      </ul>
    </header>
  );
};

export default HeaderDocs;