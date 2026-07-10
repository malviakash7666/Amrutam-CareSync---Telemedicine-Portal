import { useContext } from "react";
import { ToastContext } from "../context/ToastContext";

/**
 * Custom hook to trigger styled toast notification messages across the app.
 */
export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return {
    success: (msg: string, duration?: number) => context.addToast(msg, "success", duration),
    error: (msg: string, duration?: number) => context.addToast(msg, "error", duration),
    info: (msg: string, duration?: number) => context.addToast(msg, "info", duration),
  };
};
