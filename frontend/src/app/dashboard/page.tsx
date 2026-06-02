"use client";
import Loading from "@/components/Loading";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { showToast } from "nextjs-toast-notify";
import { Patient } from "@/types";
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
      const message =
        error.response?.data?.message || "Failed to fetch patients";
      setError(message);
      showToast.error(message, {
        duration: 4000,
        position: "top-right",
        transition: "bounceIn",
        icon: '<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
      });
    }
  }, []);

  return loading ? (
    <Loading />
  ) : (
    <div className="min-h-screen bg-slate-50 p-6">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Patients</h1>
          <p className="text-slate-500">Manage and monitor patient records</p>
        </div>

        <button
          onClick={() => router.push("/patients/add")}
          className="rounded-xl bg-blue-600 px-5 py-3 font-medium text-white shadow transition hover:bg-blue-700"
        >
          + Add Patient
        </button>
      </div>

      {/* Search */}
      <div className="mb-8">
        <input
          type="text"
          placeholder="Search by patient name..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
        />
      </div>

      {/* Cards */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {patient
          .filter((p) =>
            p.patientName.toLowerCase().includes(search.toLowerCase()),
          )
          .map((p) => (
            <div
              key={p._id}
              onClick={() => router.push(`/patients/${p._id}`)}
              className="group cursor-pointer overflow-hidden rounded-3xl bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
            >
              {/* Header */}
              <div className="bg-gradient-to-r from-cyan-500 to-blue-600 p-5 text-white">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-semibold">{p.patientName}</h2>

                    <p className="text-sm text-blue-100">
                      {p.age} Years • {p.gender}
                    </p>
                  </div>

                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-white/20 text-lg font-bold">
                    {p.patientName[0].toUpperCase()}
                  </div>
                </div>
              </div>

              {/* Body */}
              <div className="space-y-4 p-5">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Diagnosis
                  </p>
                  <p className="mt-1 line-clamp-2 text-slate-700">
                    {p.diagnosis}
                  </p>
                </div>

                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Medicine
                  </p>
                  <p className="mt-1 line-clamp-2 text-slate-700">
                    {p.medicine}
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-4 border-t pt-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Phone
                    </p>

                    <p className="text-sm font-medium text-slate-700">
                      {p.phoneNumber}
                    </p>
                  </div>

                  <div>
                    <p className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Follow Up
                    </p>

                    <p className="text-sm font-medium text-emerald-600">
                      {p.followUpDate
                        ? new Date(p.followUpDate).toLocaleDateString()
                        : "Not Set"}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
      </div>
      {error && <p className="text-red-500 text-center">{error}</p>}

      {/* Empty State */}
      {!patient.length && (
        <div className="mt-20 text-center">
          <h3 className="text-xl font-semibold text-slate-700">
            No Patients Found
          </h3>
          <p className="mt-2 text-slate-500">
            Start by adding your first patient.
          </p>
        </div>
      )}
    </div>
  );
};

export default Page;
