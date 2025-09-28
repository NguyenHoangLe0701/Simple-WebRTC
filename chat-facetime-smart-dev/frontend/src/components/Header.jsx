import { Link } from "react-router-dom";
import { MessageCircle, User, LogOut } from "lucide-react";
import { useState, useEffect } from "react";

function Header() {
  const [user, setUser] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setUser(null);
    setIsLoggedIn(false);
    window.location.href = '/';
  };

  return (
    <header className="flex items-center justify-between px-8 py-4 bg-hero-gradient">
      <Link to="/">
        <img src="/images/icons/logo-simplewebrtc.svg" alt="Logo" className="w-40 h-30" />
      </Link>
      
      <nav className="space-x-6 text-lg flex items-center">
        <Link to="/pricing" className="text-primary hover:text-primary/70 px-4">Pricing</Link>
        <Link to="/faq" className="text-primary hover:text-primary/70 px-4">FAQ</Link>
        <Link to="/docspage" className="text-primary hover:text-primary/70 px-4">Docs</Link>
        <Link to="/consulting" className="text-primary hover:text-primary/70 px-4">Consulting</Link>
        <Link to="/newsletter" className="text-primary hover:text-primary/70 px-4">Newsletter</Link>
        <Link to="/contact" className="text-primary hover:text-primary/70 px-4">Contact</Link>
        
        {isLoggedIn ? (
          <div className="flex items-center space-x-4">
            {/* Chat Button - Prominent like Discord */}
            <Link 
              to="/chat" 
              className="flex items-center space-x-2 bg-primary border-2 border-primary  text-white px-4 py-2 rounded-[30px]  hover:text-primaryHover hover:bg-white transition-colors font-medium"
            >
              <MessageCircle className="h-5 w-5" />
              <span>Chat</span>
            </Link>
            
            {/* User Menu */}
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
              </div>
              <div className="text-sm">
                <p className="font-medium text-#C084FC">{user?.fullName || user?.username}</p>
                <p className="text-#7B3F92 capitalize">{user?.role?.toLowerCase()}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-600 hover:text-gray-800 hover:bg-gray-100 rounded-lg"
                title="Đăng xuất"
              >
                <LogOut className="h-6 w-6" />
              </button>
            </div>
          </div>
        ) : (
          <Link 
            to="/login" 
            className="rounded-[30px] border-2 border-primary px-[20px] py-[5px] text-primary font-bold hover:text-primaryHover hover:border-[#00b0eb]"
          >
            Login
          </Link>
        )}
      </nav>
    </header>
  );
}

export default Header;
