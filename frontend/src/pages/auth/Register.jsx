import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, User } from "lucide-react";
import authService from "../../services/authService";
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

  // Keep your existing handleSubmit()
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

      const data = await authService.register(
        fullName,
        email,
        password,
        role
      );

      localStorage.setItem("token", data.token);
      localStorage.setItem("userRole", data.role);
      localStorage.setItem("fullName", data.fullName);

      if (data.role === "Student") {
        navigate("/student/dashboard");
      } else if (data.role === "Teacher") {
        navigate("/teacher/dashboard");
      } else {
        navigate("/admin/dashboard");
      }
    } catch (err) {
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
      {/* Logo */}
      <div className="flex justify-center mb-5">
        <img
          src={front}
          alt="Knowledge Guru"
          className="w-16 h-16 rounded-xl shadow-md"
        />
      </div>

      {/* Heading */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-900">
          Create Account
        </h1>

        <p className="mt-2 text-gray-500">
          Join Knowledge Guru and start learning smarter.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">

        {/* Role */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Select Role
          </label>

          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full rounded-xl border border-gray-300 px-4 py-3 outline-none focus:border-purple-600 focus:ring-2 focus:ring-purple-200"
          >
            <option>Student</option>
            <option>Teacher</option>
            <option>Admin</option>
          </select>
        </div>

        {/* Full Name */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Full Name
          </label>

          <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-200">

            <User size={18} className="text-gray-400" />

            <input
              type="text"
              placeholder="Enter your full name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="ml-3 w-full bg-transparent outline-none"
            />
          </div>
        </div>

        {/* Email */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Email Address
          </label>

          <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-200">

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

        {/* Continue in Part 2 */}
                {/* Password */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Password
          </label>

          <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-200">

            <Lock size={18} className="text-gray-400" />

            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="ml-3 w-full bg-transparent outline-none"
            />

            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? (
                <EyeOff size={20} className="text-gray-500" />
              ) : (
                <Eye size={20} className="text-gray-500" />
              )}
            </button>

          </div>
        </div>

        {/* Confirm Password */}
        <div>
          <label className="block mb-2 text-sm font-medium text-gray-700">
            Confirm Password
          </label>

          <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-200">

            <Lock size={18} className="text-gray-400" />

            <input
              type={showConfirm ? "text" : "password"}
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="ml-3 w-full bg-transparent outline-none"
            />

            <button
              type="button"
              onClick={() => setShowConfirm(!showConfirm)}
            >
              {showConfirm ? (
                <EyeOff size={20} className="text-gray-500" />
              ) : (
                <Eye size={20} className="text-gray-500" />
              )}
            </button>

          </div>
        </div>

        {/* Register Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-label-md transition-all transform active:scale-95 shadow-sm"
        >
          {isLoading ? "Creating Account..." : "Create Account"}
        </button>

      </form>

      {/* Divider */}
      <div className="my-7 flex items-center">
        <div className="flex-1 h-px bg-gray-300"></div>

        <span className="mx-3 text-sm text-gray-400">
          OR
        </span>

        <div className="flex-1 h-px bg-gray-300"></div>
      </div>

      {/* Google Signup */}
      <button className="w-full rounded-xl border border-gray-300 py-3 font-medium transition hover:bg-gray-50">
        🌐 Continue with Google
      </button>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-600">
        Already have an account?

        <Link
          to="/login"
          className="ml-2 font-semibold text-purple-600 hover:underline"
        >
          Login
        </Link>
      </div>

    </AuthLayout>
  );
};

export default Register;