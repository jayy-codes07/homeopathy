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
   <div className="min-h-screen bg-black text-white p-6">

  {/* Header */}
  <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
    <div>
      <h1 className="text-3xl font-bold">Patients</h1>
      <p className="text-zinc-400">
        Manage and monitor patient records
      </p>
    </div>

    <button
      onClick={() => router.push("/patients/add")}
      className="rounded-xl bg-blue-900/50 border border-blue-700 px-5 py-3 text-blue-400 hover:bg-blue-900 transition"
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
      className="w-full rounded-2xl bg-zinc-800 border border-zinc-700 px-4 py-3 focus:border-blue-500 focus:outline-none"
    />
  </div>

  {/* Patient Cards */}
  <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
    {patient
      .filter((p) =>
        p.patientName.toLowerCase().includes(search.toLowerCase())
      )
      .map((p) => (
        <div
          key={p._id}
          onClick={() => router.push(`/patients/${p._id}`)}
          className="cursor-pointer rounded-2xl bg-zinc-800 p-6 transition hover:border-blue-500 border border-transparent"
        >

          {/* Top */}
          <div className="flex items-center justify-between mb-6">

            <div className="flex items-center gap-4">
              <div className="h-14 w-14 rounded-full bg-blue-900 flex items-center justify-center text-blue-400 text-xl font-bold">
                {p.patientName[0].toUpperCase()}
              </div>

              <div>
                <h2 className="text-xl font-semibold">
                  {p.patientName}
                </h2>

                <div className="flex gap-2 mt-1">
                  <span className="rounded-full bg-blue-900/40 px-3 py-1 text-xs text-blue-400">
                    {p.age} yrs
                  </span>

                  <span className="rounded-full bg-purple-900/40 px-3 py-1 text-xs text-purple-400">
                    {p.gender}
                  </span>
                </div>
              </div>
            </div>

          </div>

          {/* Info */}
          <div className="space-y-4">

            <div>
              <p className="text-xs uppercase tracking-wider text-red-400 mb-1">
                Diagnosis
              </p>
              <p>{p.diagnosis}</p>
            </div>

            <div>
              <p className="text-xs uppercase tracking-wider text-blue-400 mb-1">
                Medicine
              </p>
              <p>{p.medicine}</p>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-3 border-t border-zinc-700">

              <div>
                <p className="text-xs uppercase tracking-wider text-zinc-500">
                  Phone
                </p>
                <p>{p.phoneNumber}</p>
              </div>

              <div>
                <p className="text-xs uppercase tracking-wider text-green-400">
                  Follow Up
                </p>
                <p className="text-green-400">
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

  {error && (
    <div className="mt-6 rounded-xl border border-red-700 bg-red-900/20 p-4 text-red-400">
      {error}
    </div>
  )}

</div>
  );
};

export default Page;
