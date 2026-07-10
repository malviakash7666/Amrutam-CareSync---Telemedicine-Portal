import React, { useState, useEffect } from "react";
import { ToastProvider } from "./context/ToastContext";
import { AuthProvider } from "./context/AuthContext";
import { useAuth } from "./hooks/useAuth";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import FindDoctors from "./pages/FindDoctors";
import PatientDashboard from "./pages/PatientDashboard";
import DoctorDashboard from "./pages/DoctorDashboard";
import AdminDashboard from "./pages/AdminDashboard";
import NotFound from "./pages/NotFound";

const MainRouter: React.FC = () => {
  const { user } = useAuth();
  const [path, setPath] = useState(window.location.pathname);

  useEffect(() => {
    const handleLocationChange = () => {
      setPath(window.location.pathname);
    };
    window.addEventListener("popstate", handleLocationChange);
    return () => {
      window.removeEventListener("popstate", handleLocationChange);
    };
  }, []);

  const renderView = () => {
    // If path is root "/" or "/about", render Home page
    if (path === "/" || path === "/about") {
      return <Home />;
    }

    // If user is not authenticated and trying to access other pages, direct to NotFound
    if (!user) {
      return <NotFound />;
    }

    // Role-based routing
    if (user.role === "PATIENT") {
      if (path === "/find-doctors") {
        return <FindDoctors />;
      }
      if (path === "/consultations") {
        return <PatientDashboard />;
      }
    }

    if (user.role === "DOCTOR") {
      if (path === "/schedule" || path === "/appointments") {
        return <DoctorDashboard />;
      }
    }

    if (user.role === "ADMIN") {
      if (path === "/analytics" || path === "/audit-logs") {
        return <AdminDashboard />;
      }
    }

    // Default fallback is NotFound if path doesn't match role views
    return <NotFound />;
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col font-sans antialiased">
      <Navbar />
      {renderView()}
    </div>
  );
};

const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <MainRouter />
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
