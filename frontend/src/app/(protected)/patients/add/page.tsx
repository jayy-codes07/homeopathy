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
    <div className="min-h-screen bg-black text-white p-6">

      <button
        onClick={() => router.push("/dashboard")}
        className="mb-6 px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition">
        ← Back
      </button>

      <PatientForm mode="add" onSubmit={handleSubmit} loading={loading} error={error} />
    </div>
  );
};

export default Page;
