import { useState } from "react";
import AuthService from "../../api/userApi";
import { Link, useNavigate } from "react-router-dom";
import WMALogin from "../wma/auth/WMALogin";
import { loginCollector } from '../../api/collectorApi';
import { toast } from 'react-toastify';

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loginType, setLoginType] = useState("user");
  
  const [collectorNIC, setCollectorNIC] = useState('');
  const [truckNumber, setTruckNumber] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const checkResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/check-email`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const emailCheck = await checkResponse.json();

      if (emailCheck.exists && emailCheck.authMethod === 'google' && !emailCheck.hasPasswordAuth) {
        setError("This account uses Google Sign-In. Please click 'Continue with Google' below to login.");
        return;
      }

      const response = await AuthService.login({ email, password });
      console.log("Login successful", response);
      if (response.isAdmin) {
        navigate("/admin/dashboard");
      } else {
        navigate("/user/dashboard");
      }
    } catch (error) {
      setError(error.message || "Login failed. Please try again.");
    }
  };

  const handleGoogleSuccess = () => {
    window.location.href = `${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/users/auth/google`;
  };

  const handleCollectorLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const data = await loginCollector(collectorNIC, truckNumber);
      localStorage.setItem('collectorInfo', JSON.stringify(data));
      localStorage.setItem('collectorToken', data.token);
      toast.success('Login successful!');
      navigate('/collector/dashboard');
    } catch (error) {
      console.error('Login error:', error);
      setError(error.message || 'Invalid NIC or Truck Number');
      toast.error(error.message || 'Invalid NIC or Truck Number');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Logo and Brand */}
        <div className="text-center">
          <div className="flex justify-center mb-4">
            <div className="relative">
              <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-xl transform hover:scale-105 transition-transform duration-300">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
              </div>
              <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-teal-400 rounded-full flex items-center justify-center">
                <span className="text-xs font-bold text-white">0</span>
              </div>
            </div>
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
            ZeroBin
          </h1>
          <p className="text-gray-600 text-sm">Smart Waste Management System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-3xl shadow-2xl overflow-hidden border border-gray-100">
          {/* Tabs */}
          <div className="bg-gray-50 px-6 pt-6">
            <div className="flex space-x-1 bg-gray-200 rounded-xl p-1">
              <button
                onClick={() => setLoginType("user")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  loginType === "user"
                    ? "bg-white text-emerald-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                User
              </button>
              <button
                onClick={() => setLoginType("wma")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  loginType === "wma"
                    ? "bg-white text-emerald-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                WMA
              </button>
              <button
                onClick={() => setLoginType("collector")}
                className={`flex-1 py-2.5 text-sm font-semibold rounded-lg transition-all duration-200 ${
                  loginType === "collector"
                    ? "bg-white text-emerald-600 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Collector
              </button>
            </div>
          </div>

          {/* Form Content */}
          <div className="p-8">
            {/* USER LOGIN */}
            {loginType === "user" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Welcome Back</h2>
                <form className="space-y-5" onSubmit={handleLogin}>
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                      Email Address
                    </label>
                    <input
                      type="email"
                      id="email"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                      Password
                    </label>
                    <input
                      type="password"
                      id="password"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="••••••••"
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

                  <div className="relative my-6">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="bg-white px-4 text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={handleGoogleSuccess}
                    className="w-full flex items-center justify-center px-4 py-3 border-2 border-gray-300 rounded-xl bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-400 focus:ring-4 focus:ring-gray-200 transition-all duration-200 font-medium"
                  >
                    <svg className="w-5 h-5 mr-3" viewBox="0 0 24 24">
                      <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                      <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                      <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                      <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                    </svg>
                    Continue with Google
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
            )}

            {/* WMA LOGIN */}
            {loginType === "wma" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">WMA Portal</h2>
                <WMALogin />
              </div>
            )}

            {/* COLLECTOR LOGIN */}
            {loginType === "collector" && (
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Collector Portal</h2>
                <form className="space-y-5" onSubmit={handleCollectorLogin}>
                  <div>
                    <label htmlFor="collectorNIC" className="block text-sm font-medium text-gray-700 mb-2">
                      Collector NIC
                    </label>
                    <input
                      type="text"
                      id="collectorNIC"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter your NIC"
                      required
                      value={collectorNIC}
                      onChange={(e) => setCollectorNIC(e.target.value)}
                    />
                  </div>
                  <div>
                    <label htmlFor="truckNumber" className="block text-sm font-medium text-gray-700 mb-2">
                      Truck Number
                    </label>
                    <input
                      type="text"
                      id="truckNumber"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                      placeholder="Enter truck number"
                      required
                      value={truckNumber}
                      onChange={(e) => setTruckNumber(e.target.value)}
                    />
                  </div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 text-white py-3 rounded-xl font-semibold hover:from-emerald-600 hover:to-teal-700 focus:ring-4 focus:ring-emerald-300 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? (
                      <span className="flex items-center justify-center">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        Signing in...
                      </span>
                    ) : (
                      'Sign In'
                    )}
                  </button>
                  {error && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-xl">
                      <p className="text-sm text-red-600">{error}</p>
                    </div>
                  )}
                  <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                    <p className="text-sm text-gray-700">
                      <strong>Note:</strong> Contact your WMA administrator if you need assistance.
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Login;
