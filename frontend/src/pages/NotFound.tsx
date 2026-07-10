import React from "react";
import { AlertTriangle, Home } from "lucide-react";

const NotFound: React.FC = () => {
  const handleBackToHome = (e: React.MouseEvent) => {
    e.preventDefault();
    window.history.pushState({}, "", "/");
    window.dispatchEvent(new Event("popstate"));
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-emerald-50/55 via-teal-50/30 to-emerald-100/20 py-20 px-6 flex flex-col items-center justify-center text-center">
      <div className="max-w-md bg-white p-8 rounded-3xl border border-gray-100 shadow-xl flex flex-col items-center gap-6 animate-in fade-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-rose-50 border border-rose-100 rounded-2xl flex items-center justify-center">
          <AlertTriangle className="w-8 h-8 text-rose-600" />
        </div>

        <h1 className="text-5xl font-black text-gray-800 tracking-tight">404</h1>
        <h3 className="text-lg font-bold text-gray-700 mt-[-10px]">Page Not Found</h3>
        
        <p className="text-sm text-gray-500 font-semibold leading-relaxed">
          The requested page route does not exist or you do not have permission to view it with your active session role.
        </p>

        <button
          onClick={handleBackToHome}
          className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm py-2.5 rounded-xl transition-colors cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-100 mt-2"
        >
          <Home className="w-4 h-4" />
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default NotFound;
