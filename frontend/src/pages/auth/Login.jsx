import React, { useState } from "react";
import { Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import authService from "../../services/authService"; 
import front from "../../assests/images/front.png"; 
import AuthLayout from "./AuthLayout";
import { GoogleLogin } from '@react-oauth/google';

const Login = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [role, setRole] = useState("Student");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in all fields.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      
      const data = await authService.login(email, password, role);
      
      if (data.role === "Student") navigate("/student/dashboard");
      else if (data.role === "Teacher") navigate("/teacher/dashboard");
      else if (data.role === "Admin") navigate("/admin/dashboard");
      
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setIsLoading(true);
      setError("");

      const data = await authService.googleLogin(credentialResponse.credential, role);

      if (data.role === "Student") navigate("/student/dashboard");
      else if (data.role === "Teacher") navigate("/teacher/dashboard");
      else if (data.role === "Admin") navigate("/admin/dashboard");

    } catch (err) {
      setError(err.response?.data?.message || "Google Sign-In failed.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>
      <div className="flex justify-center mb-5">
        <img src={front} alt="Knowledge Guru" className="w-16 h-16 rounded-xl shadow-md" />
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">Welcome Back</h1>
        <p className="mt-2 text-gray-500 text-base">Log in to continue your learning journey</p>
      </div>

      {error && (
        <div className="mb-5 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Select Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600"
          >
            <option>Student</option>
            <option>Teacher</option>
            <option>Admin</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Email Address</label>
          <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-purple-600">
            <Mail size={18} className="text-gray-400" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="ml-3 w-full bg-transparent outline-none"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">Password</label>
          <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-purple-600">
            <Lock size={18} className="text-gray-400" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ml-3 w-full bg-transparent outline-none"
            />
            <button type="button" onClick={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-gray-500" />}
            </button>
          </div>
        </div>

        <div className="text-right">
          <Link to="/forgot-password" className="text-sm text-purple-600 hover:underline">
            Forgot Password?
          </Link>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all shadow-sm"
        >
          {isLoading ? "Logging in..." : "Login"}
        </button>
      </form>

      <div className="my-7 flex items-center">
        <div className="h-px flex-1 bg-gray-300"></div>
        <span className="mx-3 text-gray-400 text-sm">OR</span>
        <div className="h-px flex-1 bg-gray-300"></div>
      </div>

      <div className="flex justify-center w-full">
        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={() => setError("Google Sign-In failed.")}
          useOneTap
          shape="pill"
          width="100%"
        />
      </div>

      <div className="mt-8 text-center text-sm text-gray-600">
        Don't have an account?
        <button
          type="button"
          onClick={() => {
            localStorage.clear();
            navigate('/register');
          }}
          className="ml-2 font-semibold text-purple-600 hover:underline bg-transparent border-none cursor-pointer"
        >
          Register
        </button>
      </div>
    </AuthLayout>
  );
};

export default Login;