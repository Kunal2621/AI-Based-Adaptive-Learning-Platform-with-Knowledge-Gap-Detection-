import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import front from "../../assests/images/front.png";
import AuthLayout from "./AuthLayout";

const ForgotPassword = () => {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setError("Please enter your email address.");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setMessage("");

      // TODO: Connect your backend API here
      console.log("Reset password for:", email);

      setMessage("Password reset link has been sent successfully.");
    } catch (err) {
      setError("Something went wrong. Please try again.");
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
          Forgot Password?
        </h1>

        <p className="mt-2 text-gray-500">
          Enter your email to receive a password reset link.
        </p>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-5 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Success */}
      {message && (
        <div className="mb-5 rounded-xl border border-green-200 bg-green-50 p-3 text-sm text-green-700">
          {message}
        </div>
      )}

      <form
        onSubmit={handleSubmit}
        className="space-y-5"
      >

        {/* Email */}
        <div>

          <label className="block mb-2 text-sm font-medium text-gray-700">
            Email Address
          </label>

          <div className="flex items-center rounded-xl border border-gray-300 px-4 py-3 focus-within:border-purple-600 focus-within:ring-2 focus-within:ring-purple-200">

            <Mail
              size={18}
              className="text-gray-400"
            />

            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="ml-3 w-full bg-transparent outline-none"
            />

          </div>

        </div>

        {/* Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-primary hover:bg-primary-container text-on-primary px-6 py-2.5 rounded-xl font-label-md transition-all transform active:scale-95 shadow-sm"
        >
          {isLoading ? "Sending..." : "Send Reset Link"}
        </button>

      </form>

      {/* Footer */}
      <div className="mt-8 text-center text-sm text-gray-600">

        Remember your password?

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

export default ForgotPassword;