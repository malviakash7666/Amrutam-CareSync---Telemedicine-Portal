import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { 
  Menu, 
  X, 
  User as UserIcon, 
  LogOut, 
  Lock, 
  Mail, 
  UserCheck, 
  Phone, 
  Activity,
  Eye,
  EyeOff 
} from "lucide-react";

const Navbar: React.FC = () => {
  const { user, login, signup, logout } = useAuth();
  const toast = useToast();

  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [isLoginView, setIsLoginView] = useState(true);

  const navigate = (to: string) => {
    window.history.pushState({}, "", to);
    window.dispatchEvent(new Event("popstate"));
    setMobileMenuOpen(false);
  };

  // Form states
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState<"PATIENT" | "DOCTOR">("PATIENT");
  const [authLoading, setAuthLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);

    try {
      if (isLoginView) {
        await login(email, password);
        toast.success("Logged in successfully!");
      } else {
        await signup({
          email,
          passwordHash: password,
          role,
          firstName,
          lastName,
          phone,
        });
        toast.success("Account created successfully!");
      }
      setAuthModalOpen(false);
      resetForm();
    } catch (err: any) {
      toast.error(err.message || "Authentication failed. Check your credentials.");
    } finally {
      setAuthLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully.");
    } catch (err) {
      toast.error("Logout failed.");
    }
  };

  const resetForm = () => {
    setEmail("");
    setPassword("");
    setFirstName("");
    setLastName("");
    setPhone("");
    setRole("PATIENT");
  };

  return (
    <>
      <nav className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-100 px-6 py-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          {/* Logo */}
          <div onClick={() => navigate("/")} className="flex items-center gap-2 cursor-pointer font-bold text-xl text-emerald-600">
            <Activity className="w-6 h-6 animate-pulse" />
            <span>Amrutam CareSync</span>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-gray-600">
            <button onClick={() => navigate("/")} className="hover:text-emerald-600 transition-colors text-emerald-600 cursor-pointer bg-transparent border-0 font-semibold">Home</button>
            {user?.role === "PATIENT" && (
              <>
                <button onClick={() => navigate("/find-doctors")} className="hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">Find Doctors</button>
                <button onClick={() => navigate("/consultations")} className="hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">Consultations</button>
              </>
            )}
            {user?.role === "DOCTOR" && (
              <>
                <button onClick={() => navigate("/schedule")} className="hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">My Schedule</button>
                <button onClick={() => navigate("/appointments")} className="hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">Appointments</button>
              </>
            )}
            {user?.role === "ADMIN" && (
              <>
                <button onClick={() => navigate("/analytics")} className="hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">Analytics</button>
                <button onClick={() => navigate("/audit-logs")} className="hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">Security Audit</button>
              </>
            )}
            <button onClick={() => navigate("/about")} className="hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">About Us</button>
          </div>

          {/* User Auth Controls */}
          <div className="hidden md:flex items-center gap-4">
            {user ? (
              <div className="flex items-center gap-3">
                <div className="flex flex-col text-right">
                  <span className="text-sm font-bold text-gray-800">
                    {user.profile?.firstName} {user.profile?.lastName}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 px-2 py-0.5 rounded-full bg-emerald-50 self-end uppercase">
                    {user.role}
                  </span>
                </div>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 text-sm border border-rose-200 hover:bg-rose-50 text-rose-600 rounded-lg font-semibold transition-all cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                  Logout
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setIsLoginView(true);
                  setAuthModalOpen(true);
                }}
                className="flex items-center gap-2 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all font-semibold cursor-pointer shadow-md shadow-emerald-100"
              >
                <UserIcon className="w-4 h-4" />
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Toggle */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-600 hover:text-emerald-600 transition-colors"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden mt-4 pt-4 border-t border-gray-100 flex flex-col gap-4 text-sm font-semibold text-gray-600">
            <button onClick={() => navigate("/")} className="text-left hover:text-emerald-600 transition-colors text-emerald-600 cursor-pointer bg-transparent border-0 font-semibold">Home</button>
            {user?.role === "PATIENT" && (
              <>
                <button onClick={() => navigate("/find-doctors")} className="text-left hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">Find Doctors</button>
                <button onClick={() => navigate("/consultations")} className="text-left hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">Consultations</button>
              </>
            )}
            {user?.role === "DOCTOR" && (
              <>
                <button onClick={() => navigate("/schedule")} className="text-left hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">My Schedule</button>
                <button onClick={() => navigate("/appointments")} className="text-left hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">Appointments</button>
              </>
            )}
            <button onClick={() => navigate("/about")} className="text-left hover:text-emerald-600 transition-colors cursor-pointer bg-transparent border-0 font-semibold">About Us</button>

            <div className="border-t border-gray-100 pt-4 flex flex-col gap-3">
              {user ? (
                <>
                  <div className="flex flex-col">
                    <span className="text-gray-800 font-bold">
                      {user.profile?.firstName} {user.profile?.lastName}
                    </span>
                    <span className="text-xs text-emerald-600 uppercase">{user.role}</span>
                  </div>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center justify-center gap-2 w-full py-2 border border-rose-200 text-rose-600 rounded-lg hover:bg-rose-50 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </>
              ) : (
                <button
                  onClick={() => {
                    setIsLoginView(true);
                    setAuthModalOpen(true);
                    setMobileMenuOpen(false);
                  }}
                  className="flex items-center justify-center gap-2 w-full py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 cursor-pointer shadow-md"
                >
                  <UserIcon className="w-4 h-4" />
                  Sign In
                </button>
              )}
            </div>
          </div>
        )}
      </nav>

      {/* Authentication Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-emerald-50 border-b border-emerald-100">
              <h3 className="font-bold text-emerald-800 text-lg flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-600" />
                {isLoginView ? "Sign In to Amrutam" : "Create Amrutam Account"}
              </h3>
              <button
                onClick={() => {
                  setAuthModalOpen(false);
                  resetForm();
                }}
                className="text-emerald-800/60 hover:text-emerald-800 transition-colors p-1 rounded-lg hover:bg-emerald-100/50"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleAuthSubmit} className="p-6 flex flex-col gap-4">
              {!isLoginView && (
                <div className="grid grid-cols-2 gap-3">
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">First Name</label>
                    <input
                      type="text"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="John"
                      className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div className="flex flex-col gap-1">
                    <label className="text-xs font-semibold text-gray-500">Last Name</label>
                    <input
                      type="text"
                      required
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Doe"
                      className="border border-gray-200 p-2 rounded-lg text-sm focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              {!isLoginView && (
                <div className="flex flex-col gap-1">
                  <label className="text-xs font-semibold text-gray-500">Phone Number</label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="123-456-7890"
                      className="border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm w-full focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@email.com"
                    className="border border-gray-200 pl-10 pr-4 py-2 rounded-lg text-sm w-full focus:outline-none focus:border-emerald-500"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-xs font-semibold text-gray-500">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="border border-gray-200 pl-10 pr-10 py-2 rounded-lg text-sm w-full focus:outline-none focus:border-emerald-500"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 cursor-pointer"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {!isLoginView && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-gray-500">Register as:</label>
                  <div className="flex gap-4">
                    <label className="flex items-center gap-2 text-sm text-gray-600 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        checked={role === "PATIENT"}
                        onChange={() => setRole("PATIENT")}
                        className="accent-emerald-600"
                      />
                      <span>Patient</span>
                    </label>
                    <label className="flex items-center gap-2 text-sm text-gray-600 font-semibold cursor-pointer">
                      <input
                        type="radio"
                        checked={role === "DOCTOR"}
                        onChange={() => setRole("DOCTOR")}
                        className="accent-emerald-600"
                      />
                      <span>Doctor</span>
                    </label>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={authLoading}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg transition-colors cursor-pointer disabled:opacity-50 mt-2"
              >
                {authLoading ? "Please wait..." : isLoginView ? "Login" : "Sign Up"}
              </button>

              {/* Toggle text */}
              <div className="text-center text-xs text-gray-500 mt-2">
                {isLoginView ? "New to Amrutam?" : "Already have an account?"}{" "}
                <button
                  type="button"
                  onClick={() => setIsLoginView(!isLoginView)}
                  className="text-emerald-600 hover:underline font-bold"
                >
                  {isLoginView ? "Create account" : "Sign In"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
