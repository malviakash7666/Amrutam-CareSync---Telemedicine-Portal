import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useToast } from "../hooks/useToast";
import { doctorService } from "../services/doctorService";
import type { DoctorProfile } from "../services/doctorService";
import DoctorCard from "../components/DoctorCard";
import BookingModal from "../components/BookingModal";
import { Search, Filter } from "lucide-react";

const FindDoctors: React.FC = () => {
  const { user } = useAuth();
  const toast = useToast();

  const [doctors, setDoctors] = useState<DoctorProfile[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [specialty, setSpecialty] = useState("All");
  const [activeDoctor, setActiveDoctor] = useState<DoctorProfile | null>(null);

  const specialties = ["All", "Cardiology", "Dermatology", "Pediatrics", "General Medicine"];

  const fetchDoctors = async () => {
    setLoading(true);
    try {
      const data = await doctorService.getDoctors({
        search: searchQuery || undefined,
        specialization: specialty === "All" ? undefined : specialty,
      });
      setDoctors(data);
    } catch (err) {
      toast.error("Failed to load doctor profiles.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDoctors();
  }, [specialty]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchDoctors();
  };

  const handleBookTrigger = (doc: DoctorProfile) => {
    if (!user) {
      toast.error("Please Sign In from the navigation header to book a consultation.");
      return;
    }
    setActiveDoctor(doc);
  };

  return (
    <div className="flex-1 bg-gradient-to-br from-emerald-50/60 via-teal-50/40 to-emerald-100/30 px-6 py-10">
      <div className="max-w-7xl mx-auto flex flex-col gap-8">
        {/* Search header */}
        <div className="flex flex-col gap-4 text-center max-w-2xl mx-auto">
          <h2 className="text-3xl font-black text-gray-800">
            Find Your Care Specialist
          </h2>
          <p className="text-sm text-gray-500 font-semibold leading-relaxed">
            Search verified healthcare professionals and book virtual consultation slots securely.
          </p>

          <form onSubmit={handleSearchSubmit} className="bg-white p-2.5 border border-gray-100 rounded-xl shadow-lg flex items-center gap-2 mt-2">
            <div className="flex items-center gap-2 flex-1 pl-3">
              <Search className="w-5 h-5 text-gray-400 shrink-0" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Doctor name, specialization..."
                className="text-sm text-gray-700 focus:outline-none w-full"
              />
            </div>
            <button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs py-2 px-4 rounded-lg cursor-pointer transition-colors"
            >
              Search
            </button>
          </form>
        </div>

        {/* Filters and Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Specialties Sidebar */}
          <div className="lg:col-span-1 bg-white/70 backdrop-blur-md border border-white/40 p-6 rounded-2xl shadow-md h-fit flex flex-col gap-4">
            <h3 className="font-extrabold text-gray-800 text-sm flex items-center gap-2 border-b border-gray-100 pb-2">
              <Filter className="w-4 h-4 text-emerald-600" />
              Filter Specialty
            </h3>
            <div className="flex flex-col gap-1.5">
              {specialties.map((spec) => (
                <button
                  key={spec}
                  onClick={() => setSpecialty(spec)}
                  className={`text-left px-3.5 py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
                    specialty === spec
                      ? "bg-emerald-600 text-white shadow-md shadow-emerald-200"
                      : "text-gray-600 hover:bg-emerald-50 hover:text-emerald-700"
                  }`}
                >
                  {spec}
                </button>
              ))}
            </div>
          </div>

          {/* Catalog grid */}
          <div className="lg:col-span-3">
            {loading ? (
              <div className="text-center py-20 text-gray-500 font-semibold">
                Searching verified doctors...
              </div>
            ) : doctors.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {doctors.map((doc) => (
                  <DoctorCard
                    key={doc.id}
                    doctor={doc}
                    onBook={() => handleBookTrigger(doc)}
                  />
                ))}
              </div>
            ) : (
              <div className="bg-white border border-gray-100 rounded-2xl p-16 text-center flex flex-col items-center gap-3">
                <Search className="w-12 h-12 text-gray-300" />
                <h4 className="font-bold text-gray-700">No doctors match your query</h4>
                <p className="text-xs text-gray-400 mt-1">
                  Try adjusting filters or checking the spelling of search queries.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Booking slot modal */}
      {activeDoctor && (
        <BookingModal
          doctor={activeDoctor}
          onClose={() => setActiveDoctor(null)}
          onSuccess={() => fetchDoctors()}
        />
      )}
    </div>
  );
};

export default FindDoctors;
