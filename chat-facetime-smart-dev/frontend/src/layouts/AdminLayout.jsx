import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import SidebarLink from '../components/admin/SidebarLink';
import AdminHeader from '../components/admin/AdminHeader';

function AdminLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  return (
    <div className="min-h-screen flex bg-gray-50">
      <aside className="w-64 bg-white border-r border-gray-200 fixed inset-y-0">
        <div className="h-16 flex items-center px-4 border-b">
          <span className="text-xl font-bold" style={{color:'#472A46'}}>Admin</span>
        </div>
        <nav className="p-4 space-y-1">
          <SidebarLink to="/admin">Tổng quan</SidebarLink>
          <SidebarLink to="/admin/users">Người dùng</SidebarLink>
          <SidebarLink to="/admin/chat">Chat</SidebarLink>
          <SidebarLink to="/admin/video">Video call</SidebarLink>
          <SidebarLink to="/admin/code">Code</SidebarLink>
          <SidebarLink to="/admin/settings">Cài đặt</SidebarLink>
        </nav>
      </aside>

      <div className="flex-1 ml-64">
        <AdminHeader setSidebarOpen={setSidebarOpen} />
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;


