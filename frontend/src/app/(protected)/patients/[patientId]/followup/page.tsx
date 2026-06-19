"use client"

import React, { SyntheticEvent, use, useState } from 'react'
import { Followup } from '@/types'
import { useRouter } from 'next/navigation'
import api from '@/utils/api'

type Followuptypes = Omit<Followup, "_id">
const Page = ({ params }: { params: Promise<{ patientId: string }> }) => {

  const patientid = use(params).patientId

  const [formData, setFormData] = useState<Followuptypes>({
    followUpDate: new Date(),
    symptoms: "",
    advise: "",
    medicine: "",
    patientId: patientid
  })
  const [submitloading, setSubmitloading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()
  const submitform = async (e: SyntheticEvent) => {
    e.preventDefault()

    try {
      setSubmitloading(true)
      await api.post(`/followup/create-followup/${patientid}`, formData)
      router.push(`/patients/${patientid}`)
      setSubmitloading(false)
    } catch (error: any) {
      setError(error.response?.data?.message || "problem while sending to backend")
    } finally {
      setSubmitloading(false)
    }
  }
  return (
    <div className="min-h-screen bg-[var(--color-background)] p-4 md:p-8 lg:p-10 font-sans">

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary)] transition-all duration-200 text-sm"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>

      {/* Form Card */}
      <div className="max-w-3xl mx-auto bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-2xl shadow-[0_2px_8px_rgba(26,28,27,0.06)] p-6 md:p-8 lg:p-10">

        {/* Header */}
        <div className="flex items-center gap-4 mb-8 pb-6 border-b border-[var(--color-outline-variant)]/40">
          <div className="w-12 h-12 rounded-full bg-[color:var(--color-primary-container)]/30 flex items-center justify-center flex-shrink-0">
            <span className="material-symbols-outlined text-[var(--color-primary)] text-2xl">event_note</span>
          </div>
          <div>
            <h1 className="text-2xl font-semibold text-[var(--color-on-surface)]">Add Follow-up</h1>
            <p className="text-[var(--color-on-surface-variant)] text-sm mt-0.5">
              Record this patient&apos;s visit details
            </p>
          </div>
        </div>

        <form onSubmit={submitform} className="space-y-7">

          {/* Quick facts row: date + medicine side by side */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-on-surface-variant)] mb-2">
                <span className="material-symbols-outlined text-base text-[var(--color-secondary)]">calendar_month</span>
                Follow Up Date
              </label>
              <input
                type="date"
                required
                value={
                  formData.followUpDate instanceof Date
                    ? formData.followUpDate.toISOString().split("T")[0]
                    : ""
                }
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    followUpDate: new Date(e.target.value),
                  })
                }
                className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-3 text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
              />
            </div>

            <div>
              <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-on-surface-variant)] mb-2">
                <span className="material-symbols-outlined text-base text-[var(--color-primary)]">medication</span>
                Medicine
              </label>
              <input
                type="text"
                required
                value={formData.medicine}
                placeholder="e.g. Lycopodium 30C"
                onChange={(e) =>
                  setFormData({ ...formData, medicine: e.target.value })
                }
                className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-3 text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
              />
            </div>
          </div>

          {/* Symptoms — full width textarea, room for real clinical notes */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-on-surface-variant)] mb-2">
              <span className="material-symbols-outlined text-base text-[var(--color-tertiary)]">monitor_heart</span>
              Symptoms
            </label>
            <textarea
              required
              rows={3}
              value={formData.symptoms}
              placeholder="Describe current symptoms and any changes since last visit..."
              onChange={(e) =>
                setFormData({ ...formData, symptoms: e.target.value })
              }
              className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-3 text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors resize-none"
            />
          </div>

          {/* Advice — full width textarea */}
          <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-on-surface-variant)] mb-2">
              <span className="material-symbols-outlined text-base text-[var(--color-secondary)]">edit_note</span>
              Advice
            </label>
            <textarea
              rows={3}
              value={formData.advise}
              placeholder="Dosage instructions, diet, lifestyle advice..."
              onChange={(e) =>
                setFormData({ ...formData, advise: e.target.value })
              }
              className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-3 text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors resize-none"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-[var(--color-error-container)] border border-[color:var(--color-error)]/20 text-[var(--color-on-error-container)] rounded-xl p-3 text-sm">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitloading}
            className={`w-full py-4 rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2
          ${submitloading
                ? "bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] cursor-wait"
                : "bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90"
              }`}
          >
            {submitloading ? "Adding Followup..." : "Add Followup"}
          </button>

        </form>
      </div>
    </div>
  )
}

export default Page