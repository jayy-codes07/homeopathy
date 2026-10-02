"use client"

import React, { use, useEffect, useState } from 'react'
import { CaseFormData, Patient } from '@/types'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'
import CaseForm from '@/components/CaseForm'
import Loading from '@/components/Loading'
import { buildCasePayload, emptyCaseFormData } from '@/utils/case'

// Adds a further case record to an existing patient — a new acute episode,
// separate from the one taken at registration.
const Page = ({ params }: { params: Promise<{ patientId: string }> }) => {

  const patientid = use(params).patientId

  const [patient, setPatient] = useState<Patient>()
  const [caseData, setCaseData] = useState<CaseFormData>(emptyCaseFormData())
  const [loading, setLoading] = useState(true)
  const [submitLoading, setSubmitLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  // Fetched for the patient's name and for gender, which decides whether the
  // menses field is shown.
  useEffect(() => {
    const fetchPatient = async () => {
      try {
        const response = await api.get(`/patient/${patientid}`)
        setPatient(response.data.data)
      } catch (error: any) {
        setError(error.response?.data?.message || "Error fetching patient")
      } finally {
        setLoading(false)
      }
    }
    fetchPatient()
  }, [])

  const handleSubmit = async () => {
    try {
      setSubmitLoading(true)
      setError("")
      await api.post(`/case/create-case/${patientid}`, buildCasePayload(caseData))
      router.push(`/patients/${patientid}`)
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to save case")
    } finally {
      setSubmitLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-6 font-sans">

      <button
        onClick={() => router.push(`/patients/${patientid}`)}
        className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary)] transition-all duration-200 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>

      {patient && (
        <div className="mx-5 mb-4 text-sm text-[var(--color-on-surface-variant)]">
          New case record for <span className="font-semibold text-[var(--color-on-surface)]">{patient.patientName}</span>
        </div>
      )}

      <CaseForm
        mode="create"
        value={caseData}
        onChange={setCaseData}
        gender={patient?.gender}
        onBack={() => router.push(`/patients/${patientid}`)}
        onSubmit={handleSubmit}
        loading={submitLoading}
        error={error}
      />
    </div>
  )
}

export default Page
