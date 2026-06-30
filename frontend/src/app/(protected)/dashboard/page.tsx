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
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPatients, setTotalPatients] = useState(0);
  const [error, setError] = useState("");
  const [doctorName, setDoctorName] = useState("");
  const [hasLoadedOnce, setHasLoadedOnce] = useState(false);
  const router = useRouter();

  const functionFetchData = async (page: number, searchTerm: string) => {
    const patientData = await api.get("/patient/all-patient", {
      params: { page, limit: LIMIT, search: searchTerm },
    });
    const data = patientData.data.data;
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

  useEffect(() => {
    setDoctorName(localStorage.getItem("username") || "");
    if (!localStorage.getItem("doctorJWT")) router.push("login");
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(search), 400);
    return () => clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

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
          icon: '<svg height="20" width="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512" xml:space="preserve"><path style="fill:#ff5050" d="M356.796 503.409H81.897c-10.122 0-18.327-8.205-18.327-18.327v-73.306c0-10.122 8.205-18.327 18.327-18.327h274.899c10.122 0 18.327 8.205 18.327 18.327v73.306c0 10.123-8.205 18.327-18.327 18.327"/><circle style="fill:#ff5050" cx="219.347" cy="219.347" r="210.756"/><path style="fill:#c84146" d="M265.163 384.286c-116.398 0-210.756-94.359-210.756-210.756 0-46.507 15.097-89.472 40.611-124.329C42.635 87.544 8.591 149.456 8.591 219.347c0 116.397 94.358 210.756 210.756 210.756 69.89 0 131.802-34.044 170.144-86.427-34.857 25.515-77.82 40.61-124.328 40.61"/><circle style="fill:#e4eaf8" cx="219.347" cy="219.347" r="64.143"/><circle style="fill:#afb9d2" cx="219.347" cy="219.347" r="27.49"/><circle style="fill:#5b5d6e" cx="475.919" cy="329.306" r="27.49"/><path style="fill:#464655" d="M489.664 343.051c-15.182 0-27.49-12.307-27.49-27.49 0-4.028.914-7.827 2.472-11.273-9.545 4.31-16.217 13.864-16.217 25.018 0 15.182 12.307 27.49 27.49 27.49 11.154 0 20.708-6.671 25.018-16.217-3.446 1.558-7.244 2.472-11.273 2.472"/><path d="M219.347 255.427c19.895 0 36.081-16.186 36.081-36.081a8.591 8.591 0 0 0-17.182 0c0 10.421-8.478 18.899-18.899 18.899s-18.899-8.478-18.899-18.899 8.478-18.899 18.899-18.899a8.591 8.591 0 0 0 0-17.182c-19.895 0-36.081 16.186-36.081 36.081s16.186 36.081 36.081 36.081"/><path d="M219.347 292.081c40.106 0 72.734-32.628 72.734-72.734s-32.628-72.734-72.734-72.734-72.734 32.628-72.734 72.734 32.628 72.734 72.734 72.734m0-128.287c30.632 0 55.553 24.921 55.553 55.553S249.979 274.9 219.347 274.9s-55.553-24.921-55.553-55.553 24.921-55.553 55.553-55.553M100.315 421.512h-.092c-4.744 0-8.545 3.846-8.545 8.591s3.892 8.591 8.636 8.591a8.591 8.591 0 0 0 .001-17.182m0 36.654h-.092c-4.744 0-8.545 3.846-8.545 8.591s3.892 8.591 8.636 8.591a8.59 8.59 0 0 0 8.591-8.591 8.59 8.59 0 0 0-8.59-8.591m238.155-36.654h-.092c-4.744 0-8.545 3.846-8.545 8.591s3.892 8.591 8.636 8.591a8.591 8.591 0 0 0 .001-17.182m0 36.654h-.092c-4.744 0-8.545 3.846-8.545 8.591s3.892 8.591 8.636 8.591a8.591 8.591 0 0 0 .001-17.182"/><path d="M512 329.306c0-19.895-16.186-36.081-36.081-36.081s-36.081 16.186-36.081 36.081c0 16.41 11.017 30.287 26.039 34.648-3.529 19.755-13.429 37.849-28.393 51.597-14.927 13.713-33.763 22.031-53.771 23.889v-27.664c0-12.908-9.134-23.718-21.276-26.318 46.666-40.254 76.256-99.791 76.256-166.111C438.694 98.399 340.294 0 219.347 0S0 98.399 0 219.347c0 66.321 29.589 125.857 76.256 166.111-12.143 2.6-21.276 13.41-21.276 26.318v73.306C54.98 499.925 67.055 512 81.897 512h274.899c14.842 0 26.917-12.075 26.917-26.917V456.66c24.33-1.901 47.29-11.821 65.396-28.456 18.332-16.843 30.243-39.198 34.053-63.548 16.437-3.363 28.838-17.935 28.838-35.35M17.181 219.347c0-111.474 90.692-202.166 202.166-202.166s202.166 90.692 202.166 202.166-90.692 202.166-202.166 202.166S17.181 330.821 17.181 219.347m349.351 265.736c0 5.369-4.367 9.736-9.736 9.736H81.897c-5.369 0-9.736-4.367-9.736-9.736v-73.306c0-5.369 4.367-9.736 9.736-9.736h16.2c34.756 23.144 76.453 36.653 121.25 36.653s86.494-13.509 121.25-36.653h16.2c5.369 0 9.736 4.367 9.736 9.736zm109.387-136.877c-10.421 0-18.899-8.478-18.899-18.899s8.478-18.899 18.899-18.899 18.899 8.478 18.899 18.899-8.478 18.899-18.899 18.899"/><path d="M297.739 73.538a166 166 0 0 1 17.423 10.833 8.56 8.56 0 0 0 4.972 1.591 8.591 8.591 0 0 0 4.986-15.591 183 183 0 0 0-19.232-11.957 8.59 8.59 0 0 0-11.637 3.488c-2.251 4.175-.689 9.385 3.488 11.636M171.293 395.652a8.6 8.6 0 0 0 2.26.304 8.592 8.592 0 0 0 2.25-16.884c-50.009-13.599-91.279-50.536-110.397-98.803a8.591 8.591 0 0 0-15.974 6.328c21.101 53.275 66.657 94.042 121.861 109.055m211.515-202.448c.67 4.23 4.322 7.246 8.474 7.246q.673.001 1.356-.108a8.59 8.59 0 0 0 7.138-9.83c-5.73-36.13-22.055-69.39-47.209-96.184a8.591 8.591 0 0 0-12.526 11.76c22.788 24.275 37.577 54.399 42.767 87.116"/></svg>',
        });
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [currentPage, debouncedSearch]);

  const filtered = patient;

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