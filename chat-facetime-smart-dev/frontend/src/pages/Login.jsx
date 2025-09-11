import React from "react";

function Login() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-lg shadow p-8">
        {/* Logo */}
        <header className="flex justify-center mb-6">
          <a
            href="https://simplewebrtc.com"
            className="text-2xl font-bold text-pink-600"
          >
            SimpleWebRTC
          </a>
        </header>

        {/* Nội dung */}
        <h1 className="text-2xl font-bold mb-2 text-center">Welcome back!</h1>
        <p className="text-gray-600 text-center mb-6">
          Don’t have an account yet?{" "}
          <a href="/" className="text-blue-600 hover:underline">
            Register
          </a>
          .
        </p>

        {/* Form */}
        <form method="post" className="space-y-4">
          <div>
            <label
              htmlFor="unInput"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="text"
              id="unInput"
              name="email"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div>
            <label
              htmlFor="passInput"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              type="password"
              id="passInput"
              name="password"
              className="mt-1 block w-full rounded-md border border-gray-300 p-2 shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-200 focus:ring-opacity-50"
            />
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              Sign in
            </button>
          </div>

          <aside className="text-center mt-3">
            <a
              href="/forgot_password"
              className="text-sm text-blue-600 hover:underline"
            >
              Forgot your password?
            </a>
          </aside>
        </form>
      </div>
    </div>
  );
}

export default Login;
