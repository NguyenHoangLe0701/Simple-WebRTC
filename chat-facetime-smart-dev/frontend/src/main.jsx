import React from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from "react-router-dom";
import './index.css'
import App from './App.jsx'

//Preload backend Render (đánh thức server Render khi user mới vào)
fetch("https://simple-webrtc-4drq.onrender.com/health")
  .then(() => console.log("✅ Render backend warmed up"))
  .catch(() => console.warn("⚠️ Could not warm up backend"));

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
