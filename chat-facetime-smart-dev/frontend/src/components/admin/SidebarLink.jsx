import React from 'react';
import { NavLink } from 'react-router-dom';

function SidebarLink({ to, children }) {
  return (
    <NavLink
      to={to}
      end
      className={({ isActive }) =>
        `block px-3 py-2 rounded-lg transition-colors ${
          isActive
            ? 'bg-[rgba(141,83,139,0.12)] text-brand-text font-semibold border border-[rgba(141,83,139,0.25)]'
            : 'text-gray-700 hover:bg-gray-100'
        }`
      }
    >
      {children}
    </NavLink>
  );
}

export default SidebarLink;


