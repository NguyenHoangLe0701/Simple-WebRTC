import { Routes, Route, useLocation, Navigate } from "react-router-dom";
import Header from "./components/Header";
import Footer from "./components/Footer";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Home from "./pages/Home";
import Contact from "./pages/Contact";
import FAQ from "./pages/FAQ";
import SectionNewsletter from "./components/SectionNewsletter";
import Consulting from "./pages/Consulting";
import Pricing from "./pages/Pricing";
import ForgotPassword from "./pages/ForgotPassword";
import DocsPage from "./pages/DocsPage";
import AdminDashboard from "./pages/AdminDashboard";
import ChatRoom from "./pages/ChatRoom";

function App() {
  const location = useLocation(); // Lấy thông tin route hiện tại

 // Ẩn Header/Footer trên các trang full-layout (bao gồm tất cả /chat/* routes)
 const hideHeaderFooterPaths = ["/login", "/register", "/forgotpassword", "/docspage", "/admin"];
 const showHeaderFooter = !hideHeaderFooterPaths.includes(location.pathname) && !location.pathname.startsWith("/chat");

  return (
    <div className="font-sans">
      {showHeaderFooter && <Header />}
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/docspage" element={<DocsPage />} />
        <Route path="/consulting" element={<Consulting/>}/>
        <Route path="/newsletter" element={<SectionNewsletter />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgotpassword" element={<ForgotPassword />} />
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/chat" element={<ChatRoom />} />
        <Route path="/chat/:roomId" element={<ChatRoom />} />
        <Route path="/room/:roomId" element={<ChatRoom />} />
        <Route path="/go/chat" element={<Navigate to="/chat" replace />} />
      </Routes>
      {showHeaderFooter && <Footer />}
    </div>
  );
}

export default App;