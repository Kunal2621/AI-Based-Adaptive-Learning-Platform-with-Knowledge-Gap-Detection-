import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import authService from "../../services/authService"; // 
import front from "../../assests/images/front.png"; 
import AuthLayout from "./AuthLayout";

const Register = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [role, setRole] = useState("Student");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!fullName || !email || !password || !confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");

      // Live registration request hitting database via backend controllers [cite: 134, 187]
      const data = await authService.register(fullName, email, password, role);
      
      // Saving secure session tokens in Local Storage [cite: 155]
      localStorage.setItem('token', data.token);
      localStorage.setItem('userRole', data.role);
      localStorage.setItem('fullName', data.fullName);
      
      // Redirecting dynamically based on verified database role [cite: 206]
      if (data.role === "Student") navigate("/student/dashboard");
      else if (data.role === "Teacher") navigate("/teacher/dashboard");
      else if (data.role === "Admin") navigate("/admin/dashboard");
      
    } catch (err) {
      console.log(err);
      console.log(err.response);
      console.log(err.response?.data);

      setError(
        err.response?.data?.message ||
        err.response?.data?.error ||
         "Registration failed."
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>

      <div className="w-[390px] bg-white p-[35px] rounded-[18px] shadow-[0_20px_50px_rgba(124,58,237,0.12)]">
        
        {/* Logo Banner */}
        <div className="text-center mb-6">
          <div className="w-[60px] h-[60px] mx-auto text-white rounded-xl flex items-center justify-center text-[22px] text-on-primary shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-1 active:scale-95">
            <img src={front} alt="logo" className="rounded-xl" />
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-gray-800">Knowledge Guru</h2>
          <p className="text-[13px] text-gray-500">Where Ambition Meets Mastery</p>
        </div>

        {error && (
          <div className="p-2.5 text-xs font-medium bg-red-50 text-red-600 border border-red-100 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Role Choice */}
          <div className="mb-[18px]">
            <label className="block text-[13px] mb-2 text-gray-700">Select Role</label>
            <select 
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-3 py-3 border border-purple-200 rounded-lg outline-none bg-white text-gray-700 text-sm cursor-pointer"
            >
              <option value="Student">Student</option>
              <option value="Teacher">Teacher</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Full Name */}
          <div className="mb-[18px]">
            <label className="block text-[13px] mb-2 text-gray-700">Full Name</label>
            <div className="flex items-center gap-2.5 border border-purple-200 px-3 py-3 rounded-lg">
              <User size={18} className="text-gray-400 shrink-0" />
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Enter your name"
                className="border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="mb-[18px]">
            <label className="block text-[13px] mb-2 text-gray-700">Email Address</label>
            <div className="flex items-center gap-2.5 border border-purple-200 px-3 py-3 rounded-lg">
              <Mail size={18} className="text-gray-400 shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password */}
          <div className="mb-[18px]">
            <label className="block text-[13px] mb-2 text-gray-700">Password</label>
            <div className="flex items-center gap-2.5 border border-purple-200 px-3 py-3 rounded-lg">
              <Lock size={18} className="text-gray-400 shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="********"
                className="border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                disabled={isLoading}
              />
              <span
                onClick={() => setShowPassword(!showPassword)}
                className="cursor-pointer flex items-center text-gray-500 select-none"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* Confirm Password */}
          <div className="mb-[18px]">
            <label className="block text-[13px] mb-2 text-gray-700">Confirm Password</label>
            <div className="flex items-center gap-2.5 border border-purple-200 px-3 py-3 rounded-lg">
              <Lock size={18} className="text-gray-400 shrink-0" />
              <input
                type={showConfirm ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="********"
                className="border-none outline-none w-full text-sm text-gray-700 placeholder-gray-400 bg-transparent"
                disabled={isLoading}
              />
              <span
                onClick={() => setShowConfirm(!showConfirm)}
                className="cursor-pointer flex items-center text-gray-500 select-none"
              >
                {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
              </span>
            </div>
          </div>

          {/* Submit Action */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-[13px] bg-[#5b4bdb] hover:bg-[#4c3ec7] disabled:bg-purple-300 text-white rounded-lg font-semibold text-[15px] transition-colors duration-200"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>

        {/* Divider Grid */}
        <div className="flex items-center gap-2.5 justify-center my-5 text-xs text-gray-400">
          <span className="h-px bg-gray-200 flex-1"></span>
          OR
          <span className="h-px bg-gray-200 flex-1"></span>
        </div>

        {/* Google Signup */}
        <button className="w-full py-3 bg-white border border-purple-200 rounded-lg text-sm text-gray-700 flex items-center justify-center gap-2 hover:bg-purple-50 transition-colors duration-200">
          🌐 Sign up with Google
        </button>

        {/* Bottom Nav Redirect */}
        <p className="text-center mt-6 text-[13px] text-gray-700">
          Already have an account?
          <Link to="/login" className="text-purple-600 font-semibold ml-1 hover:underline">Login</Link>
        </p>
      </div>
    </AuthLayout>
  );
};

export default Register;