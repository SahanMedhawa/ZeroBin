import React, { useState } from "react";
import WmaAuthService from "../../../api/wmaApi";
import { Link, useNavigate } from "react-router-dom";

const WMALogin = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const navigate = useNavigate();
  const [isUser, setIsUser] = useState(true);

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await WmaAuthService.wmaLogin({ email, password });
      console.log("Login successful", response);
      navigate("/wma/dashboard");
    } catch (error) {
      setError(error.message);
    }
  };
  return (
    <div>
      <form className="space-y-5" onSubmit={handleLogin}>
        <div>
          <label htmlFor="wma-email" className="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            type="email"
            name="email"
            id="wma-email"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            placeholder="you@wma.com"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="wma-password" className="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            type="password"
            name="password"
            id="wma-password"
            placeholder="••••••••"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button
          type="submit"
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 focus:ring-4 focus:ring-emerald-300 transition-all duration-200 shadow-lg hover:shadow-xl"
        >
          Sign In
        </button>
        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
            <p className="text-sm text-red-600">{error}</p>
          </div>
        )}
        <p className="text-center text-sm text-gray-600 mt-6">
          Don't have an account?{" "}
          <Link to="/register" className="font-semibold text-emerald-600 hover:text-emerald-700">
            Sign up
          </Link>
        </p>
      </form>
    </div>
  );
};

export default WMALogin;
