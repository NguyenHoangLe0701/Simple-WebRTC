import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle } from "lucide-react";
import api from "../services/api";

function Login() {
  const [formData, setFormData] = useState({
    usernameOrEmail: "",
    password: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      console.log('Sending login request:', formData);
      
      const response = await api.post('/api/auth/login', formData);
      console.log('Response data:', response.data);

      if (response.data) {
        // Store to sessionStorage (tab-scoped) to avoid token clobbering across tabs
        if (typeof sessionStorage !== 'undefined') {
          sessionStorage.setItem('token', response.data.token);
          sessionStorage.setItem('user', JSON.stringify({
            id: response.data.id,
            username: response.data.username,
            email: response.data.email,
            fullName: response.data.fullName,
            role: response.data.role
          }));
        }
        // Keep localStorage for backward compatibility if some code still reads it
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify({
          id: response.data.id,
          username: response.data.username,
          email: response.data.email,
          fullName: response.data.fullName,
          role: response.data.role
        }));
        
        setSuccess("Đăng nhập thành công! Đang chuyển hướng...");
        
        // Check if there's a redirect path stored (from room link)
        const redirectPath = sessionStorage.getItem('redirectAfterLogin');
        if (redirectPath) {
          sessionStorage.removeItem('redirectAfterLogin');
          setTimeout(() => navigate(redirectPath), 1000);
          return;
        }
        
        // Redirect based on role
        if (response.data.role === 'ADMIN') {
          setTimeout(() => navigate('/admin'), 1500);
        } else {
          setTimeout(() => navigate('/chat'), 1500);
        }
      }
    } catch (error) {
      console.error('Login error:', error);
      const errorMessage = error.response?.data?.error || "Đăng nhập thất bại";
      setError(errorMessage);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow p-4 sm:p-6 md:p-8">
        {/* Header với logo và tiêu đề cùng hàng */}
        <div className="flex flex-col md:flex-row items-center md:items-start md:justify-between mb-4 sm:mb-6">
          {/* Logo bên trái - ẩn trên mobile nhỏ, hiển thị trên tablet+ */}
          <div className="flex-shrink-0 mb-4 md:mb-0 md:mr-6 hidden sm:block">
            <a href="/">
              <img
                src="images/icons/logo-simplewebrtc.svg" 
                alt="SimpleWebRTC Logo"
                className="h-12 w-14 sm:h-14 sm:w-16 md:h-16 md:w-18"
              />
            </a>
          </div>

          {/* Tiêu đề và nội dung bên phải */}
          <div className="w-full md:w-2/3">
            {/* Tiêu đề và mô tả */}
            <h1 className="text-xl sm:text-2xl font-bold mb-2 text-center md:text-left">Chào mừng trở lại!</h1>
            <p className="text-sm sm:text-base text-gray-600 text-center md:text-left mb-4 sm:mb-6">
              Chưa có tài khoản?{" "}
              <Link to="/register" className="text-[#00b0eb] hover:text-[#0077B6] transition duration-300">
                Đăng ký ngay
              </Link>
            </p>

            {/* Alert Messages */}
            {error && (
              <div className="mb-4 p-2 sm:p-3 bg-red-100 border border-red-400 text-red-700 rounded-lg flex items-center text-sm sm:text-base">
                <AlertCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="break-words">{error}</span>
              </div>
            )}

            {success && (
              <div className="mb-4 p-2 sm:p-3 bg-green-100 border border-green-400 text-green-700 rounded-lg flex items-center text-sm sm:text-base">
                <CheckCircle className="h-4 w-4 sm:h-5 sm:w-5 mr-2 flex-shrink-0" />
                <span className="break-words">{success}</span>
              </div>
            )}

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3 sm:space-y-4">
              <div>
                <label
                  htmlFor="usernameOrEmail"
                  className="block text-sm sm:text-base font-medium text-gray-600"
                >
                  Username hoặc Email
                </label>
                <input
                  type="text"
                  id="usernameOrEmail"
                  name="usernameOrEmail"
                  value={formData.usernameOrEmail}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 sm:p-2.5 text-sm sm:text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="Nhập username hoặc email"
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm sm:text-base font-medium text-gray-600"
                >
                  Mật khẩu
                </label>
                <input
                  type="password"
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="mt-1 block w-full rounded-md border border-gray-300 p-2 sm:p-2.5 text-sm sm:text-base shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  placeholder="Nhập mật khẩu"
                />
              </div>

              {/* <div className="flex items-center justify-between">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-32 bg-brand-bg text-white font-semibold py-2 px-6 rounded-3xl hover:bg-primaryHover transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? "Đang đăng nhập..." : "Đăng nhập"}
                </button>
              </div> */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center sm:justify-between gap-3">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto sm:min-w-[128px] bg-brand-bg text-white font-semibold py-2.5 sm:py-2 px-6 rounded-3xl hover:bg-primaryHover transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? (
                    <div className="flex items-center justify-center gap-2">
                      {/* Spinner */}
                      <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      <span>Đăng nhập</span>
                    </div>
                  ) : (
                    "Đăng nhập"
                  )}
                </button>
                
                <aside className="text-center sm:text-left">
                  <Link
                    to="/forgotpassword"
                    className="text-sm sm:text-base text-[#00b0eb] hover:text-[#0077B6] transition duration-300"
                  >
                    Quên mật khẩu?
                  </Link>
                </aside>
              </div>

              {/* Removed hardcoded admin credentials hint */}
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Login;
