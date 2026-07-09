import React, { useState } from "react";
import { Mail } from "lucide-react";
import { Link } from "react-router-dom";
import front from "../../assests/images/front.png"; // Fixed assets spelling
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

      console.log("Sending link to:", email);
      setMessage("Reset link has been sent to your email successfully!");
    } catch (err) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout>

      <div className="w-[390px] bg-white p-[35px] rounded-[18px] shadow-[0_20px_50px_rgba(124,58,237,0.12)]">
        
        {/* Header Block */}
        <div className="text-center mb-6">
          <div className="w-[60px] h-[60px] mx-auto text-white rounded-xl flex items-center justify-center text-[22px] text-on-primary shadow-lg hover:shadow-indigo-500/20 transition-all transform hover:-translate-y-1 active:scale-95">
            <img src={front} alt="logo" className="rounded-xl" />
          </div>
          <h2 className="mt-3 text-2xl font-semibold text-gray-800">Forgot Password?</h2>
          <p className="text-[13px] text-gray-500">Enter your email to reset password</p>
        </div>

        {error && (
          <div className="p-2.5 text-xs font-medium bg-red-50 text-red-600 border border-red-100 rounded-lg mb-4 text-center">
            {error}
          </div>
        )}

        {message && (
          <div className="p-2.5 text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-lg mb-4 text-center">
            {message}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email input field */}
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

          {/* Submit Trigger Link */}
          <button 
            type="submit"
            disabled={isLoading}
            className="w-full py-[13px] bg-[#5b4bdb] hover:bg-[#4c3ec7] disabled:bg-purple-300 text-white rounded-lg font-semibold text-[15px] transition-colors duration-200"
          >
            {isLoading ? "Sending Link..." : "Send Reset Link"}
          </button>
        </form>

        {/* Remember navigation loop link */}
        <p className="text-center mt-6 text-[13px] text-gray-700">
          Remember password?
          <Link to="/login" className="text-purple-600 font-semibold ml-1 hover:underline">Login</Link>
        </p>
      </div>
    
    </AuthLayout>
  );
};

export default ForgotPassword;