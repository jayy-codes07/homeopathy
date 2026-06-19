"use client";

import React, { useEffect, useState } from "react";
import { Patient } from "@/types";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import PatientForm from "@/components/PatientForm";
type PatientFormData = Omit<Patient, "_id">;

const Page = () => {

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const router = useRouter();

  const handleSubmit = async (data: PatientFormData) => {
    try {
      setLoading(true);
      const response = await api.post("/patient/register", data);
      router.push(`/patients/${response.data.data._id}`);
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!localStorage.getItem("doctorJWT")) router.push("/login")
  }, [])

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6 font-sans">

      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary)] transition-all duration-200 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>

      <PatientForm mode="add" onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
};

export default Page;