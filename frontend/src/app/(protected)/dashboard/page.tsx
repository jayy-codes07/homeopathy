"use client";
import Loading from "@/components/Loading";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { showToast } from "nextjs-toast-notify";
import { Patient } from "@/types";

const getFollowupBadge = (date: Date | string | undefined) => {
  if (!date)
    return {
      label: "Not Set",
      cls: "text-[var(--color-on-surface-variant)] bg-[var(--color-surface-container-high)]",
    };
  const diff = Math.ceil(
    (new Date(date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
  );
  if (diff < 0)
    return {
      label: "Overdue",
      cls: "text-[var(--color-on-error-container)] bg-[var(--color-error-container)]",
    };
  if (diff <= 3)
    return {
      label: `${diff}d left`,
      cls: "text-[var(--color-on-tertiary-container)] bg-[color:var(--color-tertiary-container)]/30",
    };
  return {
    label: new Date(date).toLocaleDateString(),
    cls: "text-[var(--color-on-primary-container)] bg-[color:var(--color-primary-container)]/30",
  };
};

// Pure presentation helper — no new data, just framing what we already fetch
const getTimeOfDay = () => {
  const hour = new Date().getHours();
  if (hour < 12) return "morning";
  if (hour < 17) return "afternoon";
  return "evening";
};

const SearchIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="11" cy="11" r="8" /><path d="m21 21-4.3-4.3" />
  </svg>
);
const PlusIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 12h14" /><path d="M12 5v14" />
  </svg>
);
const ChevronIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m9 18 6-6-6-6" />
  </svg>
);
const ChevronLeftIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="m15 18-6-6 6-6" />
  </svg>
);
const LeafIcon = () => (
  <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
    <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 4.18 2 8 0 5.5-4.78 10-10 10Z" />
    <path d="M2 21c0-3 1.85-5.36 5.08-6C9.5 14.52 12 13 13 12" />
  </svg>
);

const LIMIT = 10;

const Page = () => {
  const [patient, setPatient] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); // NEW: search now hits the backend, debounced so it doesn't fire on every keystroke
  const [currentPage, setCurrentPage] = useState(1); // NEW
  const [totalPages, setTotalPages] = useState(1); // NEW
  const [totalPatients, setTotalPatients] = useState(0); // NEW
  const [error, setError] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false); // NEW: lets us tell "first load" apart from "refetching after search/page change"
  const router = useRouter();

  const functionFetchData = async (page: number, searchTerm: string) => {
    const patientData = await api.get("/patient/all-patient", {
      params: { page, limit: LIMIT, search: searchTerm },
    });
    const data = patientData.data.data;
    // Backend returns a plain [] (not the usual { patient, totalPatients, ... } object)
    // when there are zero patients in the whole collection — handle that shape here
    // so .map()/.filter() never run on undefined.
    if (Array.isArray(data)) {
      setPatient([]);
      setTotalPages(1);
      setTotalPatients(0);
      return;
    }
    setPatient(data.patient);
    setTotalPages(data.totalPages);
    setTotalPatients(data.totalPatients);
  };

  // One-time: auth check + doctor name for greeting
  useEffect(() => {
    setDoctorName(localStorage.getItem("username") || "");
    if (!localStorage.getItem("doctorJWT")) router.push("login");
  }, []);

  // Debounce the raw search input before it triggers a fetch
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  // Any time the debounced search changes, jump back to page 1
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Actual fetch — runs whenever the page or the (debounced) search changes
  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        await functionFetchData(currentPage, debouncedSearch);
        setHasLoadedOnce(true);
      } catch (error: any) {
        const message = error.response?.data?.message || "Failed to fetch patients";
        setError(message);
        showToast.error(message, {
          duration: 4000,
          position: "top-right",
          transition: "bounceIn",
          icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, debouncedSearch]);

  // No more client-side filtering — the backend already returns only matching, paginated results
  const filtered = patient;

  // Derived stats now only reflect the CURRENT PAGE, not your whole patient base —
  // flagging this clearly since it's a behavior change from before pagination existed.
  // If you want these to reflect ALL patients again, the backend would need a separate
  // lightweight "stats" endpoint that counts across the full collection.
  const overdueCount = patient.filter((p) => {
    if (!p.followUpDate) return false;
    return new Date(p.followUpDate).getTime() < new Date().getTime();
  }).length;
  const dueSoonCount = patient.filter((p) => {
    if (!p.followUpDate) return false;
    const diff = Math.ceil((new Date(p.followUpDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
    return diff >= 0 && diff <= 3;
  }).length;

  const todayLabel = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" });

  return loading && !hasLoadedOnce ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)] p-6 md:p-10 font-sans">

      {/* Greeting Header */}
      <div className="mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-widest text-[var(--color-on-surface-variant)] font-semibold mb-1">
            {todayLabel}
          </p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-on-surface)]">
            Good {getTimeOfDay()}{doctorName ? `, ${doctorName.split(" ")[0]}` : ""}.
          </h1>
          <p className="text-[var(--color-on-surface-variant)] mt-1 text-sm">
            Your patients and pending follow-ups, at a glance.
          </p>
        </div>
        <button
          onClick={() => router.push("/patients/add")}
          className="rounded-xl bg-[var(--color-primary)] hover:opacity-90 px-5 py-3 text-[var(--color-on-primary)] transition-all duration-200 font-semibold text-sm shadow-sm flex items-center gap-2 w-fit"
        >
          <PlusIcon />
          Add Patient
        </button>
      </div>

      {/* Stat tiles */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        <div className="bg-[color:var(--color-primary-container)]/20 border border-[var(--color-primary-container)]/40 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--color-on-primary-container)] font-semibold mb-1">Total Patients</p>
          <p className="text-3xl font-semibold text-[var(--color-on-surface)]">{patient.length}</p>
        </div>
        <div className="bg-[var(--color-error-container)]/60 border border-[color:var(--color-error)]/20 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--color-on-error-container)] font-semibold mb-1">Overdue Follow-ups</p>
          <p className="text-3xl font-semibold text-[var(--color-on-surface)]">{overdueCount}</p>
        </div>
        <div className="bg-[color:var(--color-tertiary-container)]/20 border border-[color:var(--color-tertiary-container)]/40 rounded-xl p-5">
          <p className="text-xs uppercase tracking-wider text-[var(--color-on-tertiary-container)] font-semibold mb-1">Due Soon (3 days)</p>
          <p className="text-3xl font-semibold text-[var(--color-on-surface)]">{dueSoonCount}</p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-6">
        <div className="relative">
          <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)]">
            <SearchIcon />
          </span>
          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] pl-12 pr-5 py-3.5 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-[var(--color-on-surface)] placeholder-[var(--color-outline)] transition-colors text-sm"
          />
          {loading && hasLoadedOnce && (
            <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)] text-xs">
              Searching...
            </span>
          )}
        </div>
      </div>

      {/* Patient Rows */}
      <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-2xl overflow-hidden">
        {filtered.map((p, idx) => {
          const badge = getFollowupBadge(p.followUpDate);
          return (
            <div
              key={p._id}
              onClick={() => router.push(`/patients/${p._id}`)}
              className={`flex items-center gap-4 px-5 py-6 cursor-pointer hover:bg-[var(--color-surface-container-low)] transition-colors duration-150 ${idx !== filtered.length - 1 ? "border-b border-[var(--color-outline-variant)]/30" : ""
                }`}
            >
              <div className="h-10 w-10 rounded-full bg-[color:var(--color-primary-container)]/30 flex items-center justify-center text-[var(--color-on-primary-container)] text-sm font-bold flex-shrink-0">
                {p.patientName[0].toUpperCase()}
              </div>

              <div className="flex-1 min-w-0">
                <h2 className="text-sm font-semibold text-[var(--color-on-surface)] truncate">{p.patientName}</h2>
                <p className="text-xs text-[var(--color-on-surface-variant)] truncate mt-0.5">
                  {p.age} yrs · {p.gender} · {p.diagnosis}
                </p>
              </div>

              <div className="hidden sm:block text-sm text-[var(--color-on-surface-variant)] flex-shrink-0 w-32">
                {p.phoneNumber}
              </div>

              <span className={`text-xs font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${badge.cls}`}>
                {badge.label}
              </span>

              <span className="text-[var(--color-outline)] flex-shrink-0">
                <ChevronIcon />
              </span>
            </div>
          );
        })}

        {/* Empty State */}
        {filtered.length === 0 && !loading && (
          <div className="text-center py-24">
            <div className="flex justify-center text-[var(--color-outline-variant)] mb-4">
              <LeafIcon />
            </div>
            <p className="text-[var(--color-on-surface-variant)] text-lg">No patients found</p>
            <p className="text-[var(--color-outline)] text-sm mt-1">
              {search ? "Try a different search term" : "Add your first patient to get started"}
            </p>
          </div>
        )}
      </div>

      {/* Pagination */}
      {totalPatients > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 mt-5">
          <p className="text-sm text-[var(--color-on-surface-variant)]">
            Showing {(currentPage - 1) * LIMIT + 1}-{Math.min(currentPage * LIMIT, totalPatients)} of {totalPatients} patients
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
              disabled={currentPage === 1}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-container-low)] transition-colors"
            >
              <ChevronLeftIcon /> Prev
            </button>
            <span className="text-sm text-[var(--color-on-surface)] px-2">
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 px-3 py-2 rounded-lg border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] text-sm disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[var(--color-surface-container-low)] transition-colors"
            >
              Next <ChevronIcon />
            </button>
          </div>
        </div>
      )}

      {error && (
        <div className="mt-6 rounded-xl border border-[color:var(--color-error)]/20 bg-[var(--color-error-container)] p-4 text-[var(--color-on-error-container)] text-sm">
          {error}
        </div>
      )}
    </div>
  );
};

export default Page;