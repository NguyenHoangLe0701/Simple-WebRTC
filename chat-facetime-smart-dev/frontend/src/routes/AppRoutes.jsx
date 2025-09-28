import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import AdminDashboard from '../pages/AdminDashboard';
import ChatRoom from '../pages/ChatRoom';
import Consulting from '../pages/Consulting';
import Contact from '../pages/Contact';
import DocsPage from '../pages/DocsPage';
import FAQ from '../pages/FAQ';
import ForgotPassword from '../pages/ForgotPassword';
import Pricing from '../pages/Pricing';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/admin" element={<AdminDashboard />} />
      <Route path="/chat" element={<ChatRoom />} />
      <Route path="/chat/:roomId" element={<ChatRoom />} />
      <Route path="/consulting" element={<Consulting />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/docs" element={<DocsPage />} />
      <Route path="/faq" element={<FAQ />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/pricing" element={<Pricing />} />
    </Routes>
  );
};

export default AppRoutes;
