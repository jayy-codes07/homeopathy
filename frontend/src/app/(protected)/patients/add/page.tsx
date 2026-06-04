"use client";

import React, { useEffect, useState } from "react";
import { Patient } from "@/types";
import Loading from "@/components/Loading";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
type PatientForm = Omit<Patient, "_id">;

const Page = () => {
  const [patient, setPatient] = useState<PatientForm>({
    patientName: "",
    age: 0,
    gender: "OTHER",
    diagnosis: "",
    medicine: "",
    phoneNumber: "",
    address: "",
    diet: "VEG",
    familySize: 0,
    occupation: "",
    followUpDate: new Date(),
  });
  const [error, setError] = useState("");
  const [pauseClick, setPauseClick] = useState(false)
  const router = useRouter();

  const handleSubmit = async (e: React.SyntheticEvent) => {
    e.preventDefault()
    const createNewPatient = async () => {
      const response = await api.post("/patient/register", patient)
      router.push(`/patients/${response.data.data._id}`);
    }
    try {


      setPauseClick(true)

      await createNewPatient()
      setPauseClick(false)

    } catch (error: any) {
      setError(
        error.response?.data?.message ||
        "error while sending response to backend",
      );

    }

  };

  useEffect(() => {
    if (!localStorage.getItem("doctorJWT")) router.push("/login")
  }, [])

  return (

    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6">
      <div className="w-full max-w-2xl bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
          Patient Registration
        </h1>

        <form onSubmit={handleSubmit} className="space-y-6">

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            <div className="flex flex-col gap-1">
              <label htmlFor="patientName" className="text-sm font-medium text-gray-700">Patient Name *</label>
              <input
                id="patientName"
                required
                type="text"
                placeholder="John Doe"
                className="px-4 py-2 border border-gray-300 text-black/90 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={patient.patientName}
                onChange={(e) => setPatient({ ...patient, patientName: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="age" className="text-sm font-medium text-gray-700">Age *</label>
              <input
                id="age"
                required
                type="number"
                placeholder="e.g., 45"
                className="px-4 py-2 border border-gray-300 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={patient.age || ""}
                onChange={(e) => setPatient({ ...patient, age: Number(e.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="phoneNumber" className="text-sm font-medium text-gray-700">Phone Number *</label>
              <input
                id="phoneNumber"
                required
                type="tel"
                placeholder="+1 234 567 8900"
                className="px-4 py-2 border border-gray-300 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={patient.phoneNumber}
                onChange={(e) => setPatient({ ...patient, phoneNumber: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="gender" className="text-sm font-medium text-gray-700">Gender *</label>
              <select
                id="gender"
                required
                className="px-4 py-2 border border-gray-300 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white"
                value={patient.gender}
                onChange={(e) => setPatient({ ...patient, gender: e.target.value as 'MALE' | "FEMALE" | "OTHER" })}
              >
                <option value="MALE">Male</option>
                <option value="FEMALE">Female</option>
                <option value="OTHER">Other</option>
              </select>
            </div>

            <div className="flex flex-col gap-1 md:col-span-2">
              <label htmlFor="address" className="text-sm font-medium text-gray-700">Address</label>
              <input
                id="address"
                type="text"
                placeholder="123 Main St, City"
                className="px-4 py-2 border border-gray-300 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={patient.address}
                onChange={(e) => setPatient({ ...patient, address: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="diagnosis" className="text-sm font-medium text-gray-700">Diagnosis *</label>
              <input
                id="diagnosis"
                required
                type="text"
                placeholder="e.g., Hypertension"
                className="px-4 py-2 border border-gray-300 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={patient.diagnosis}
                onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="medicine" className="text-sm font-medium text-gray-700">Medicine *</label>
              <input
                id="medicine"
                required
                type="text"
                placeholder="e.g., Lisinopril"
                className="px-4 py-2 border border-gray-300 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={patient.medicine}
                onChange={(e) => setPatient({ ...patient, medicine: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="diet" className="text-sm font-medium text-gray-700">Diet</label>
              <select
                id="diet"
                className="px-4 py-2 border border-gray-300 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition bg-white"
                value={patient.diet}
                onChange={(e) => setPatient({ ...patient, diet: e.target.value as "VEG" | "NON VEG" | "MIXED" })}
              >
                <option value="VEG">Veg</option>
                <option value="NON VEG">Non-Veg</option>
                <option value="MIXED">Mixed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="familySize" className="text-sm font-medium text-gray-700">Family Size</label>
              <input
                id="familySize"
                type="number"
                placeholder="e.g., 4"
                className="px-4 py-2 border border-gray-300 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={patient.familySize || ""}
                onChange={(e) => setPatient({ ...patient, familySize: Number(e.target.value) })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="occupation" className="text-sm font-medium text-gray-700">Occupation</label>
              <input
                id="occupation"
                type="text"
                placeholder="e.g., Teacher"
                className="px-4 py-2 border border-gray-300 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={patient.occupation}
                onChange={(e) => setPatient({ ...patient, occupation: e.target.value })}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="followUpDate" className="text-sm font-medium text-gray-700">Follow-up Date</label>
              {/* FIX: Handled Date string formatting for HTML input */}
              <input
                id="followUpDate"
                type="date"
                name="followUpDate"
                className="px-4 py-2 border border-gray-300 text-black/90 rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none transition"
                value={patient.followUpDate instanceof Date ? patient.followUpDate.toISOString().split("T")[0] : patient.followUpDate}
                onChange={(e) => setPatient({ ...patient, followUpDate: new Date(e.target.value) })}
              />
            </div>
          </div>

          {error && (
            <div className="rounded-lg bg-red-50 p-4 border border-red-200">
              <p className="text-sm font-medium text-red-600">{error}</p>
            </div>
          )}

          <button
            type="submit"
            className={`w-full mt-4 bg-blue-600 text-white font-semibold py-3 px-4 rounded-lg hover:bg-blue-700  ${pauseClick ? "cursor-wait bg-blue-600/45" : ""} focus:ring-4 focus:ring-blue-200 transition-all active:scale-[0.99]`}
          >
            {pauseClick ? "Creating New Patient Please Wait" : "Register Patient"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Page;
