import React from "react";
import LeftPanel from "./LeftPanel";

const AuthLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex bg-gray-50">

      {/* Left Side */}
      <LeftPanel />

      {/* Right Side */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6">
        {children}
      </div>

    </div>
  );
};

export default AuthLayout;