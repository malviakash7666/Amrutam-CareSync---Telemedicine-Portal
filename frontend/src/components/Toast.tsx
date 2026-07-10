import React from "react";
import { CheckCircle2, XCircle, AlertCircle, X } from "lucide-react";

interface ToastProps {
  id: string;
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, onClose }) => {
  const typeStyles = {
    success: {
      bg: "bg-emerald-50 border-emerald-200 text-emerald-800 shadow-emerald-100",
      progress: "bg-emerald-500",
      icon: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />,
    },
    error: {
      bg: "bg-rose-50 border-rose-200 text-rose-800 shadow-rose-100",
      progress: "bg-rose-500",
      icon: <XCircle className="w-5 h-5 text-rose-500 shrink-0" />,
    },
    info: {
      bg: "bg-sky-50 border-sky-200 text-sky-800 shadow-sky-100",
      progress: "bg-sky-500",
      icon: <AlertCircle className="w-5 h-5 text-sky-500 shrink-0" />,
    },
  };

  const activeStyle = typeStyles[type];

  return (
    <div
      className={`flex items-center gap-3 p-4 border rounded-xl shadow-lg transition-all duration-300 transform translate-y-0 opacity-100 pointer-events-auto ${activeStyle.bg}`}
      role="alert"
    >
      {activeStyle.icon}
      <div className="flex-1 text-sm font-medium pr-2">{message}</div>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors p-1 rounded-lg hover:bg-black/5"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};

export default Toast;
