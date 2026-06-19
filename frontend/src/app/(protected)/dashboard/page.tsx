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

const Page = () => {
  const [patient, setPatient] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const functionFetchData = async () => {
    const patientData = await api.get("/patient/all-patient");
    setPatient(patientData.data.data.patient);
  };

  useEffect(() => {
    try {
      if (!localStorage.getItem("doctorJWT")) router.push("login");
      const load = async () => {
        setLoading(true);
        await functionFetchData();
        setLoading(false);
      };
      load();
    } catch (error: any) {
      const message = error.response?.data?.message || "Failed to fetch patients";
      setError(message);
      showToast.error(message, {
        duration: 4000,
        position: "top-right",
        transition: "bounceIn",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
      });
    }
  }, []);

  const filtered = patient.filter((p) =>
    p.patientName.toLowerCase().includes(search.toLowerCase())
  );

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-[var(--color-background)] text-[var(--color-on-surface)] p-6 md:p-10 font-sans">

      {/* Header */}
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-on-surface)]">
            Patients
          </h1>
          <p className="text-[var(--color-on-surface-variant)] mt-1 text-sm">
            Manage and monitor patient records
          </p>
        </div>
        <button
          onClick={() => router.push("/patients/add")}
          className="rounded-xl bg-[var(--color-primary)] hover:opacity-90 px-5 py-3 text-[var(--color-on-primary)] transition-all duration-200 font-semibold text-sm shadow-sm flex items-center gap-2"
        >
          <span className="material-symbols-outlined text-base">add</span>
          Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <div className="relative">
          <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[var(--color-outline)] text-xl">
            search
          </span>
          <input
            type="text"
            placeholder="Search by patient name..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] pl-12 pr-5 py-3.5 focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] outline-none text-[var(--color-on-surface)] placeholder-[var(--color-outline)] transition-colors text-sm"
          />
        </div>
      </div>

      {/* Patient Cards */}
      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((p) => {
          const badge = getFollowupBadge(p.followUpDate);
          return (
            <div
              key={p._id}
              onClick={() => router.push(`/patients/${p._id}`)}
              className="cursor-pointer rounded-xl bg-[var(--color-surface-container-lowest)] p-6 border border-[var(--color-outline-variant)]/40 hover:border-[var(--color-primary)]/40 transition-all duration-200 hover:-translate-y-0.5 shadow-[0_2px_8px_rgba(26,28,27,0.06)] hover:shadow-[0_10px_24px_rgba(26,28,27,0.10)]"
            >
              {/* Top */}
              <div className="flex items-center gap-4 mb-5">
                <div className="h-12 w-12 rounded-full bg-[color:var(--color-primary-container)]/30 border border-[var(--color-primary-container)] flex items-center justify-center text-[var(--color-on-primary-container)] text-lg font-bold flex-shrink-0">
                  {p.patientName[0].toUpperCase()}
                </div>
                <div className="flex-1 min-w-0">
                  <h2 className="text-base font-semibold truncate text-[var(--color-on-surface)]">
                    {p.patientName}
                  </h2>
                  <div className="flex gap-2 mt-1.5">
                    <span className="rounded-full bg-[color:var(--color-secondary-container)]/30 px-2.5 py-0.5 text-xs font-medium text-[var(--color-on-secondary-container)]">
                      {p.age} yrs
                    </span>
                    <span className="rounded-full bg-[var(--color-surface-container-high)] px-2.5 py-0.5 text-xs font-medium text-[var(--color-on-surface-variant)]">
                      {p.gender}
                    </span>
                  </div>
                </div>
              </div>

              {/* Info */}
              <div className="space-y-3">
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-0.5">
                    Diagnosis
                  </p>
                  <p className="text-[var(--color-on-surface)] text-sm truncate">{p.diagnosis}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-wider text-[var(--color-on-surface-variant)] mb-0.5">
                    Medicine
                  </p>
                  <p className="text-[var(--color-on-surface)] text-sm truncate">{p.medicine}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 pt-3 border-t border-[var(--color-outline-variant)]/40">
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--color-outline)] mb-0.5">
                      Phone
                    </p>
                    <p className="text-[var(--color-on-surface)] text-sm">{p.phoneNumber}</p>
                  </div>
                  <div>
                    <p className="text-xs uppercase tracking-wider text-[var(--color-outline)] mb-1">
                      Follow Up
                    </p>
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${badge.cls}`}>
                      {badge.label}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty State */}
      {filtered.length === 0 && !loading && (
        <div className="text-center py-24">
          <span className="material-symbols-outlined text-[var(--color-outline-variant)] text-6xl mb-4">
            local_florist
          </span>
          <p className="text-[var(--color-on-surface-variant)] text-lg mt-4">No patients found</p>
          <p className="text-[var(--color-outline)] text-sm mt-1">
            {search ? "Try a different search term" : "Add your first patient to get started"}
          </p>
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