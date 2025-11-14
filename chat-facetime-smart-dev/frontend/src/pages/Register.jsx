import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Eye, EyeOff, AlertCircle, CheckCircle, User, Mail, Lock, UserCheck } from "lucide-react";

function Register() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    fullName: ""
  });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [validationErrors, setValidationErrors] = useState({});
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError("");
    setSuccess("");
    setValidationErrors({});
  };

  const validateForm = () => {
    const errors = {};
    
    // Validate username
    if (!formData.username) {
      errors.username = "Username không được để trống";
    } else if (formData.username.length < 3) {
      errors.username = "Username phải có ít nhất 3 ký tự";
    }
    
    // Validate email
    if (!formData.email) {
      errors.email = "Email không được để trống";
    } else if (!formData.email.includes('@')) {
      errors.email = "Email phải chứa ký tự @";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      errors.email = "Email không hợp lệ";
    }
    
    // Validate password
    if (!formData.password) {
      errors.password = "Mật khẩu không được để trống";
    } else if (formData.password.length < 6) {
      errors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    } else if (!/(?=.*[A-Z])/.test(formData.password)) {
      errors.password = "Mật khẩu phải chứa ít nhất 1 chữ hoa";
    } else if (!/(?=.*\d)/.test(formData.password)) {
      errors.password = "Mật khẩu phải chứa ít nhất 1 số";
    }
    
    // Validate full name
    if (!formData.fullName) {
      errors.fullName = "Họ tên không được để trống";
    } else if (formData.fullName.length < 2) {
      errors.fullName = "Họ tên phải có ít nhất 2 ký tự";
    }
    
    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setLoading(true);
    setError("");
    setSuccess("");

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem('token', data.token);
        localStorage.setItem('user', JSON.stringify({
          id: data.id,
          username: data.username,
          email: data.email,
          fullName: data.fullName,
          role: data.role
        }));
        
        setSuccess("Đăng ký thành công! Đang chuyển hướng...");
        setTimeout(() => navigate('/'), 2000);
      } else {
        setError(data.error || "Đăng ký thất bại");
      }
    } catch (error) {
      setError("Lỗi kết nối server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-6 sm:px-6 sm:py-8">
      <div className="w-full max-w-2xl bg-white rounded-lg shadow p-4 sm:p-6 md:p-8">
        {/* Header với logo bên trái và form bên phải */}
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

          {/* Form và nội dung bên phải */}
          <div className="w-full md:w-2/3">
            {/* Nội dung */}
            <p className="text-sm sm:text-base text-gray-600 text-center md:text-left mb-4 sm:mb-6">
              Đã có tài khoản?{" "}
              <Link to="/login" className="text-[#00b0eb] hover:text-[#0077B6] transition duration-300">
                Đăng nhập tại đây
              </Link>
            </p>
            <h1 className="text-xl sm:text-2xl md:text-3xl mb-2 text-center md:text-left font-bold">
              Tạo tài khoản để bắt đầu sử dụng hệ thống
            </h1>

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
                  htmlFor="username"
                  className="block text-sm font-medium text-gray-700"
                >
                  Username
                </label>
                <div className="relative">
                  <input
                    className={`mt-1 block w-full rounded-md border p-2 sm:p-2.5 pl-9 sm:pl-10 text-sm sm:text-base shadow-sm focus:ring focus:ring-opacity-50 ${
                      validationErrors.username 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    type="text"
                    id="username"
                    name="username"
                    value={formData.username}
                    onChange={handleChange}
                    required
                    placeholder="Nhập username"
                  />
                  <User className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                </div>
                {validationErrors.username && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.username}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-gray-700"
                >
                  Email
                </label>
                <div className="relative">
                  <input
                    className={`mt-1 block w-full rounded-md border p-2 sm:p-2.5 pl-9 sm:pl-10 text-sm sm:text-base shadow-sm focus:ring focus:ring-opacity-50 ${
                      validationErrors.email 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Nhập email"
                  />
                  <Mail className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                </div>
                {validationErrors.email && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.email}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="fullName"
                  className="block text-sm font-medium text-gray-700"
                >
                  Họ và tên
                </label>
                <div className="relative">
                  <input
                    className={`mt-1 block w-full rounded-md border p-2 sm:p-2.5 pl-9 sm:pl-10 text-sm sm:text-base shadow-sm focus:ring focus:ring-opacity-50 ${
                      validationErrors.fullName 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    required
                    placeholder="Nhập họ và tên"
                  />
                  <UserCheck className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                </div>
                {validationErrors.fullName && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.fullName}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700"
                >
                  Mật khẩu
                </label>
                <div className="relative">
                  <input
                    className={`mt-1 block w-full rounded-md border p-2 sm:p-2.5 pl-9 sm:pl-10 pr-9 sm:pr-10 text-sm sm:text-base shadow-sm focus:ring focus:ring-opacity-50 ${
                      validationErrors.password 
                        ? 'border-red-300 focus:border-red-500 focus:ring-red-200' 
                        : 'border-gray-300 focus:border-blue-500 focus:ring-blue-200'
                    }`}
                    type={showPassword ? "text" : "password"}
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    placeholder="Nhập mật khẩu"
                  />
                  <Lock className="absolute left-2.5 sm:left-3 top-2.5 sm:top-3 h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-2.5 sm:pr-3 flex items-center"
                  >
                    {showPassword ? (
                      <EyeOff className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    ) : (
                      <Eye className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-gray-400" />
                    )}
                  </button>
                </div>
                {validationErrors.password && (
                  <p className="mt-1 text-xs sm:text-sm text-red-600">{validationErrors.password}</p>
                )}
                <div className="mt-2 text-xs text-gray-500">
                  <p>Mật khẩu phải có:</p>
                  <ul className="list-disc list-inside space-y-0.5 sm:space-y-1">
                    <li>Ít nhất 6 ký tự</li>
                    <li>Ít nhất 1 chữ hoa (A-Z)</li>
                    <li>Ít nhất 1 số (0-9)</li>
                  </ul>
                </div>
              </div>

              <div className="form-element space-y-2">
                <div className="checkbox-wrapper flex items-start">
                  <input 
                    type="checkbox" 
                    name="tos" 
                    id="tos" 
                    required 
                    className="mt-1 mr-2 flex-shrink-0"
                  />
                  <label htmlFor="tos" className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed">
                    Tôi đã đọc và đồng ý với{" "}
                    <a
                      href="#"
                      className="text-[#00b0eb] hover:text-[#0077B6] transition duration-300"
                    >
                      Điều khoản sử dụng
                    </a>
                  </label>
                </div>
                <div className="checkbox-wrapper flex items-start">
                  <input
                    type="checkbox"
                    name="privacy_policy"
                    id="privacy_policy"
                    required
                    className="mt-1 mr-2 flex-shrink-0"
                  />
                  <label
                    htmlFor="privacy_policy"
                    className="text-xs sm:text-sm md:text-base text-gray-700 leading-relaxed"
                  >
                    Tôi đã đọc và đồng ý với{" "}
                    <a
                      href="#"
                      className="text-[#00b0eb] hover:text-[#0077B6] transition duration-300"
                    >
                      Chính sách bảo mật
                    </a>
                  </label>
                </div>
              </div>

              <div className="form-element">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto sm:min-w-[160px] bg-brand-bg text-white font-semibold py-2.5 sm:py-2 px-4 rounded-3xl hover:bg-primaryHover transition disabled:opacity-50 disabled:cursor-not-allowed text-sm sm:text-base"
                >
                  {loading ? "Đang đăng ký..." : "Đăng ký"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Register;
