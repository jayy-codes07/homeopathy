"use client";

import React, { useState } from "react";
import { CaseFormData, Patient } from "@/types";
import api from "@/utils/api";
import { useRouter } from "next/navigation";
import PatientForm from "@/components/PatientForm";
import CaseForm from "@/components/CaseForm";
import { buildCasePayload, emptyCaseFormData } from "@/utils/case";
type PatientFormData = Omit<Patient, "_id">;

const Page = () => {

  const [step, setStep] = useState<1 | 2>(1);
  const [basicInfo, setBasicInfo] = useState<PatientFormData | null>(null);
  const [caseData, setCaseData] = useState<CaseFormData>(emptyCaseFormData());
  // Remembered so a retry after a failed case POST does not re-register the
  // patient — the unique {doctor, phoneNumber} index would reject it.
  const [createdPatientId, setCreatedPatientId] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false)
  const router = useRouter();

  // Step 1 only collects and advances; nothing is persisted until step 2 is
  // submitted, so an abandoned registration leaves no half-made patient behind.
  const handleNext = (data: PatientFormData) => {
    setBasicInfo(data);
    setError("");
    setStep(2);
  };

  const handleSubmit = async () => {
    if (!basicInfo) return;
    try {
      setLoading(true);
      setError("");

      let patientId = createdPatientId;
      if (!patientId) {
        const response = await api.post("/patient/register", basicInfo);
        patientId = response.data.data._id as string;
        setCreatedPatientId(patientId);
      }

      await api.post(`/case/create-case/${patientId}`, buildCasePayload(caseData));
      router.push(`/patients/${patientId}`);
    } catch (error: any) {
      setError(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Auth is enforced by AuthGate in the (protected) layout.
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

      <div className="mx-5 mb-4 flex items-center gap-2 text-sm text-[var(--color-on-surface-variant)]">
        <span className={step === 1 ? "font-semibold text-[var(--color-primary)]" : ""}>1. Basic Information</span>
        <span className="material-symbols-outlined text-base">chevron_right</span>
        <span className={step === 2 ? "font-semibold text-[var(--color-primary)]" : ""}>2. Interrogation</span>
      </div>

      {step === 1 ? (
        <PatientForm
          mode="add"
          initialData={basicInfo ?? undefined}
          submitLabel="Next"
          onSubmit={handleNext}
          loading={false}
          error={error}
        />
      ) : (
        <CaseForm
          value={caseData}
          onChange={setCaseData}
          gender={basicInfo?.gender}
          onBack={() => setStep(1)}
          onSubmit={handleSubmit}
          loading={loading}
          error={error}
        />
      )}
    </div>
  );
};

export default Page;
