import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User, KeyRound } from "lucide-react";
import authService from "../../services/authService";
import front from "../../assests/images/banner.svg";
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
  const [otp, setOtp] = useState("");

  const [isOtpSent, setIsOtpSent] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Auto Reset local flags on open
  useEffect(() => {
    localStorage.removeItem("isRegistered");
    localStorage.removeItem("registeredEmail");
  }, []);

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
      await authService.register(fullName, email, password, role);
      setIsOtpSent(true);
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError("");
      await authService.verifyOtp(email, otp);
      alert("Email Verified Successfully! Redirecting to Login.");
      navigate("/login");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid OTP");
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
        <h1 className="text-4xl font-bold text-gray-900">
          {isOtpSent ? "Enter OTP" : "Create Account"}
        </h1>
        <p className="mt-2 text-gray-500">
          {isOtpSent ? `OTP sent to ${email}` : "Join Knowledge Guru and start learning."}
        </p>
      </div>

      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {!isOtpSent ? (
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Select Role</label>
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
            <label className="block mb-2 text-sm font-medium text-gray-700">Full Name</label>
            <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-purple-600">
              <User size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="Enter full name"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Email Address</label>
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
            <label className="block mb-2 text-sm font-medium text-gray-700">Password</label>
            <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-purple-600">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none"
              />
              <button type="button" onClick={() => setShowPassword(!showPassword)}>
                {showPassword ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-gray-500" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Confirm Password</label>
            <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-purple-600">
              <Lock size={18} className="text-gray-400" />
              <input
                type={showConfirm ? "text" : "password"}
                placeholder="Confirm password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none"
              />
              <button type="button" onClick={() => setShowConfirm(!showConfirm)}>
                {showConfirm ? <EyeOff size={20} className="text-gray-500" /> : <Eye size={20} className="text-gray-500" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl font-medium transition-all"
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div>
            <label className="block mb-2 text-sm font-medium text-gray-700">Enter OTP</label>
            <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3">
              <KeyRound size={18} className="text-gray-400" />
              <input
                type="text"
                placeholder="6-digit OTP"
                maxLength="6"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                className="ml-3 w-full bg-transparent outline-none text-center font-bold tracking-widest text-lg"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 rounded-xl font-medium"
          >
            {isLoading ? "Verifying..." : "Verify OTP & Continue"}
          </button>
        </form>
      )}

      <div className="mt-8 text-center text-sm text-gray-600">
        Already have an account?
        <Link to="/login" className="ml-2 font-semibold text-purple-600 hover:underline">
          Login
        </Link>
      </div>
    </AuthLayout>
  );
};

export default Register;