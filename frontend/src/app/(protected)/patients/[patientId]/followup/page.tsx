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
    <div className="min-h-screen bg-black text-white p-6">

      {/* Back Button */}
      <button
        onClick={() => router.back()}
        className="mb-6 px-4 py-2 rounded-xl border border-zinc-700 bg-zinc-900 hover:bg-zinc-800 transition"
      >
        ← Back
      </button>

      {/* Form Card */}
      <div className="max-w-4xl mx-auto bg-zinc-800 rounded-2xl p-8 shadow-lg">

        <div className="mb-8">
          <h1 className="text-3xl font-bold">Add Followup</h1>
          <p className="text-zinc-400 text-sm mt-1">
            Record patient follow-up details
          </p>
        </div>

        <form onSubmit={submitform} className="space-y-6">

          {/* Symptoms */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
              Symptoms
            </label>
            <input
              type="text"
              required
              value={formData.symptoms}
              placeholder="Enter Symptoms"
              onChange={(e) =>
                setFormData({ ...formData, symptoms: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500"
            />
          </div>

          {/* Advice */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-green-400 mb-2">
              Advice
            </label>
            <input
              type="text"
              value={formData.advise}
              placeholder="Enter Advice"
              onChange={(e) =>
                setFormData({ ...formData, advise: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-green-500"
            />
          </div>

          {/* Medicine */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-purple-400 mb-2">
              Medicine
            </label>
            <input
              type="text"
              required
              value={formData.medicine}
              placeholder="Enter Medicine"
              onChange={(e) =>
                setFormData({ ...formData, medicine: e.target.value })
              }
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-purple-500"
            />
          </div>

          {/* Follow-up Date */}
          <div>
            <label className="block text-xs uppercase tracking-wider text-orange-400 mb-2">
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
              className="w-full bg-zinc-900 border border-zinc-700 rounded-xl px-4 py-3 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Error */}
          {error && (
            <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-xl p-3">
              {error}
            </div>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={submitloading}
            className={`w-full py-4 rounded-xl font-semibold transition
          ${submitloading
                ? "bg-zinc-700 cursor-wait"
                : "bg-blue-600 hover:bg-blue-700"
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