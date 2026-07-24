import React from "react";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import illustration from "../../assests/images/getStarted.png";
import Navbar from "../../components/common/Navbar";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen bg-white">

      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="grid min-h-[calc(100vh-80px)] lg:grid-cols-2">

        {/* Left Illustration */}
        <div className="hidden lg:flex items-center justify-center bg-white px-10">
          <img
            src={illustration}
            alt="Knowledge Guru"
            className="w-full max-w-3xl object-contain scale-125"
          />
        </div>

        {/* Right Form Container */}
        <div className="flex items-center justify-center px-6 py-10 bg-white">

          <div className="w-full max-w-[520px] bg-white rounded-3xl shadow-xl border border-gray-100 p-10 relative">

            {/* 🟢 Back to Home Link inside Form Card */}
            <div className="mb-6">
              <Link
                to="/"
                className="inline-flex items-center gap-2 text-sm font-medium text-gray-500 hover:text-purple-600 transition-colors duration-200"
              >
                <ArrowLeft size={18} />
                <span>Back to Home</span>
              </Link>
            </div>

            {children}

          </div>

        </div>

      </div>

    </div>
  );
};

export default AuthLayout;