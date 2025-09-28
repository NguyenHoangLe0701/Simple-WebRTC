import React from "react";
import { Link } from "react-router-dom";

function ForgotPassword() {
  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Xử lý quên mật khẩu"); // Thêm logic reset password tại đây
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-4xl bg-white rounded-lg shadow p-8">
        {/* Header với logo bên trái và form bên phải */}
        <div className="flex items-center justify-between mb-6">
          {/* Logo bên trái */}
          <div className="flex-shrink-0 mr-6 w-64">
            <a href="/">
              <img
                src="images/icons/logo-simplewebrtc.svg"
                alt="SimpleWebRTC Logo"
                className="w-60 h-16  mb-48 ml-10 "
              />
            </a>
          </div>

          {/* Form và nội dung bên phải */}
          <div className="w-2/3">
            {/* Nội dung */}
            <h1 className="text-2xl font-bold mb-2 text-left">
              Forgot Password?
            </h1>
            <p className="text-gray-600 text-left mb-6">
              Enter your email address below, and we’ll send you a link to reset
              your password.{" "}
              
            </p>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="form-element">
                <label
                  htmlFor="email"
                  className="block text-lg font-medium text-gray-700"
                >
                  Email
                </label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  className="mt-1 block w-4/5 rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
                  required
                />
              </div>

              <div className="form-element mb-5">
                <button
                  type="submit"
                  className="w-48 bg-brand-bg text-white font-semibold py-2 px-4 rounded-3xl hover:bg-primaryHover transition"
                >
                  Reset Password
                </button>
              </div>
             
            </form>
           <p className="mt-5"> <Link to="/login" className="text-[#00b0eb] mt-5 ">
                Back to Login
              </Link>
              .</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ForgotPassword;