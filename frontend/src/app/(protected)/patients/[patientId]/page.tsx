"use client"

import React, { use, useEffect, useState } from 'react'
import { Followup, Patient } from '@/types'
import api from '@/utils/api'
import Loading from '@/components/Loading'
import { useRouter } from 'next/navigation'
import PatientForm from '@/components/PatientForm'

const Page = ({ params }: { params: Promise<{ patientId: string }> }) => {
  const patientid = use(params).patientId

  const [patient, setPatient] = useState<Patient>()
  const [followups, setFollowups] = useState<Followup[]>([])
  const [showEdit, setShowEdit] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editData, setEditData] = useState<Followup | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const router = useRouter()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const patientres = await api.get(`/patient/${patientid}`)
        setPatient(patientres.data.data)
        const followupres = await api.get(`/followup/patient-followup/${patientid}`)
        setFollowups(followupres.data.data)
      } catch (error: any) {
        setError(error.response?.data?.message || "Error fetching data")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDeletePatient = async () => {
    const confirmed = confirm("Are you sure you want to delete this patient?")
    if (!confirmed) return
    try {
      await api.delete(`/patient/${patientid}`)
      router.push("/dashboard")
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete patient")
    }
  }

  const handleDeleteFollowup = async (id: string) => {
    const confirmed = confirm("Are you sure you want to delete this followup?")
    if (!confirmed) return
    try {
      await api.delete(`/followup/patient-followup/${id}`)
      setFollowups(prev => prev.filter(f => f._id !== id))
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete followup")
    }
  }

  const handleSaveFollowup = async (id: string) => {
    if (!editData) return
    try {
      await api.patch(`/followup/patient-followup/${id}`, editData)
      setEditingId(null)
      setFollowups(prev => prev.map(f => f._id === id ? editData : f))
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update followup")
    }
  }

  const handleEditPatient = async (data: Omit<Patient, "_id">) => {
    try {
      setEditLoading(true)
      await api.patch(`/patient/${patientid}`, data)
      setPatient({ ...data, _id: patient!._id })
      setShowEdit(false)
    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to update patient")
    } finally {
      setEditLoading(false)
    }
  }

  if (loading) return <Loading />

  return (
    <div className="bg-[var(--color-background)] min-h-screen p-4 md:p-8 lg:p-10 font-sans pb-24">

      {/* Top Bar */}
      <div className="flex justify-between items-center py-2 mb-6 lg:mb-8">
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 border border-[var(--color-outline-variant)] rounded-xl text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary)] transition-all duration-200 text-sm"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
        <div className="flex gap-3 items-center">
          <button
            className="flex items-center gap-2 font-medium px-4 py-2 rounded-xl text-sm bg-[var(--color-error-container)] border border-[color:var(--color-error)]/20 text-[var(--color-on-error-container)] hover:opacity-90 transition-all duration-200"
            onClick={handleDeletePatient}
          >
            Delete
          </button>
          <button
            onClick={() => setShowEdit(!showEdit)}
            className="flex items-center gap-2 bg-[var(--color-primary)] text-[var(--color-on-primary)] font-medium px-4 py-2 rounded-xl hover:opacity-90 transition-all duration-200 text-sm"
          >
            {showEdit ? "Cancel Edit" : "Edit Patient"}
          </button>
        </div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 shadow-[0_2px_8px_rgba(26,28,27,0.06)] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between text-[var(--color-on-surface)] mb-6 lg:mb-8 gap-6">
        <div className="flex items-center gap-5 lg:gap-6">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[color:var(--color-primary-container)]/30 border border-[var(--color-primary-container)] flex items-center justify-center text-xl lg:text-2xl font-bold text-[var(--color-on-primary-container)]">
            {patient?.patientName.split(" ").splice(0, 2).map((n) => n[0]).join("").toUpperCase() || ""}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold mb-2 lg:mb-3 text-[var(--color-on-surface)]">{patient?.patientName}</h1>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-sm">
              <span className="bg-[color:var(--color-secondary-container)]/30 text-[var(--color-on-secondary-container)] px-3 py-1.5 rounded-full font-medium">
                {patient?.age} yrs
              </span>
              <span className="bg-[var(--color-surface-container-high)] text-[var(--color-on-surface-variant)] px-3 py-1.5 rounded-full font-medium">
                {patient?.gender}
              </span>
              <span className="bg-[color:var(--color-primary-container)]/30 text-[var(--color-on-primary-container)] px-3 py-1.5 rounded-full font-medium">
                {patient?.phoneNumber}
              </span>
            </div>
          </div>
        </div>
        <div className="flex flex-col md:items-end gap-3">
          {patient?.medicine && (
            <div className="flex items-center gap-2 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 rounded-xl px-4 py-2.5">
              <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">local_florist</span>
              <div>
                <div className="text-[10px] text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold leading-none mb-1">Current Remedy</div>
                <div className="text-[var(--color-on-surface)] font-semibold text-sm">{patient.medicine}</div>
              </div>
            </div>
          )}
          <div className="text-left md:text-right">
            <div className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-1.5">Next Followup</div>
            <div className="text-[var(--color-on-tertiary-container)] font-medium text-lg lg:text-xl">
              {patient?.followUpDate ? new Date(patient.followUpDate).toLocaleDateString() : "Not set"}
            </div>
          </div>
        </div>
      </div>

      {/* Edit Form */}
      {showEdit && (
        <PatientForm
          mode="edit"
          initialData={patient}
          onSubmit={handleEditPatient}
          loading={editLoading}
          error={error}
        />
      )}

      {/* Diagnosis, Medicine, Diet */}
      {!showEdit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-4 lg:mb-5">
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 border-l-[3px] border-l-[var(--color-tertiary)] rounded-2xl p-5 lg:p-6">
            <div className="text-xs text-[var(--color-tertiary)] uppercase tracking-widest font-semibold mb-2">Diagnosis</div>
            <div className="text-[var(--color-on-surface)] text-lg">{patient?.diagnosis}</div>
          </div>
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 border-l-[3px] border-l-[var(--color-primary)] rounded-2xl p-5 lg:p-6">
            <div className="text-xs text-[var(--color-primary)] uppercase tracking-widest font-semibold mb-2">Medicine</div>
            <div className="text-[var(--color-on-surface)] text-lg">{patient?.medicine}</div>
          </div>
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 border-l-[3px] border-l-[var(--color-secondary)] rounded-2xl p-5 lg:p-6">
            <div className="text-xs text-[var(--color-secondary)] uppercase tracking-widest font-semibold mb-2">Diet</div>
            <div className="text-[var(--color-on-surface)] text-lg">{patient?.diet}</div>
          </div>
        </div>
      )}

      {/* Occupation, Family Size, Address */}
      {!showEdit && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-5 mb-6 lg:mb-10">
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-2xl p-5 lg:p-6">
            <div className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-2">Occupation</div>
            <div className="text-[var(--color-on-surface)] text-lg">{patient?.occupation}</div>
          </div>
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-2xl p-5 lg:p-6">
            <div className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-2">Family Size</div>
            <div className="text-[var(--color-on-surface)] text-lg">{patient?.familySize}</div>
          </div>
          <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-2xl p-5 lg:p-6">
            <div className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-2">Address</div>
            <div className="text-[var(--color-on-surface)] text-lg">{patient?.address}</div>
          </div>
        </div>
      )}

      {/* Followup History */}
      <div className="bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-2xl p-6 lg:p-8">

        {/* Header */}
        <div className="flex justify-between items-center mb-6 pb-5 border-b border-[var(--color-outline-variant)]/40">
          <div className="flex items-center gap-4">
            <h2 className="text-xl lg:text-2xl font-medium text-[var(--color-on-surface)]">Followup history</h2>
            <span className="bg-[color:var(--color-primary-container)]/30 text-[var(--color-on-primary-container)] px-3 py-1 rounded-full text-xs font-medium">
              {followups.length > 0 ? `${followups.length} visits` : "0 visits"}
            </span>
          </div>
          <button
            className="hidden lg:flex bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-on-primary)] font-medium px-4 py-2 rounded-xl transition-all duration-200 items-center gap-2 text-sm"
            onClick={() => router.push(`/patients/${patientid}/followup`)}
          >
            + Add followup
          </button>
        </div>

        {/* Followup List */}
        <div className="space-y-0 lg:max-w-4xl">
          {followups.length === 0 && (
            <div className="text-center py-12 text-[var(--color-outline)]">
              <p>No followup records yet</p>
              <p className="text-sm mt-1">Add the first followup for this patient</p>
            </div>
          )}
          {followups.map((data, idx) => (
            <div key={idx} className="relative pl-8 pb-8 border-l border-[var(--color-outline-variant)]/40 last:border-transparent last:pb-0 group">

              {editingId === data._id ? (
                // EDIT MODE
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-[var(--color-surface-container-low)] border border-[var(--color-outline-variant)]/40 rounded-2xl p-5">
                  <div>
                    <label className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-2 block">Symptoms</label>
                    <input
                      className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-sm"
                      value={editData?.symptoms || ""}
                      onChange={(e) => setEditData({ ...editData!, symptoms: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-2 block">Medicine</label>
                    <input
                      className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-sm"
                      value={editData?.medicine || ""}
                      onChange={(e) => setEditData({ ...editData!, medicine: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-2 block">Advice</label>
                    <textarea
                      className="w-full bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] text-sm"
                      value={editData?.advise || ""}
                      onChange={(e) => setEditData({ ...editData!, advise: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 flex gap-3 justify-end pt-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-xl border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-lowest)] text-sm"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveFollowup(data._id)}
                      className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-[var(--color-on-primary)] hover:opacity-90 text-sm"
                    >
                      Save Changes
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <>
                  <div className="absolute w-3 h-3 rounded-full bg-[var(--color-surface-container-lowest)] border-2 border-[var(--color-primary)] left-[-6.5px] top-1.5 transition-transform duration-300 group-hover:scale-125"></div>

                  <div className="flex justify-between items-start mb-4">
                    <div className="text-sm font-medium text-[var(--color-secondary)]">
                      {data.followUpDate ? new Date(data.followUpDate).toLocaleDateString() : "not set"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-5 gap-x-8 mb-4">
                    <div>
                      <div className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-1">Symptoms</div>
                      <div className="text-[var(--color-on-surface-variant)] text-sm">{data.symptoms}</div>
                    </div>
                    <div>
                      <div className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-1">Medicine</div>
                      <div className="text-[var(--color-on-surface-variant)] text-sm">{data.medicine}</div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <div className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-1">Advice</div>
                      <div className="text-[var(--color-on-surface-variant)] text-sm">{data.advise}</div>
                    </div>
                  </div>

                  <div className="flex justify-end gap-2 mt-2">
                    <button
                      className="bg-[var(--color-error-container)] border border-[color:var(--color-error)]/20 text-[var(--color-on-error-container)] hover:opacity-90 font-medium px-3 py-1.5 rounded-lg transition-all duration-200 text-xs"
                      onClick={() => handleDeleteFollowup(data._id)}
                    >
                      Delete
                    </button>
                    <button
                      className="bg-[color:var(--color-primary-container)]/30 border border-[var(--color-primary-container)] text-[var(--color-on-primary-container)] hover:opacity-90 font-medium px-3 py-1.5 rounded-lg transition-all duration-200 flex items-center gap-1.5 text-xs"
                      onClick={() => { setEditingId(data._id); setEditData(data) }}
                    >
                      <svg width="12px" height="12px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
                        <path fill="currentColor" fillRule="evenodd" d="M15.198 3.52a1.612 1.612 0 012.223 2.336L6.346 16.421l-2.854.375 1.17-3.272L15.197 3.521zm3.725-1.322a3.612 3.612 0 00-5.102-.128L3.11 12.238a1 1 0 00-.253.388l-1.8 5.037a1 1 0 001.072 1.328l4.8-.63a1 1 0 00.56-.267L18.8 7.304a3.612 3.612 0 00.122-5.106zM12 17a1 1 0 100 2h6a1 1 0 100-2h-6z" />
                      </svg>
                      Edit
                    </button>
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {error && <div className="mt-4 text-[var(--color-on-error-container)] text-sm border border-[color:var(--color-error)]/20 bg-[var(--color-error-container)] rounded-xl p-3">{error}</div>}

      {/* Mobile FAB */}
      <div className="fixed bottom-8 right-8 lg:hidden z-50">
        <button
          className="bg-[var(--color-primary)] text-[var(--color-on-primary)] font-medium px-5 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:opacity-90 flex items-center gap-2 text-sm"
          onClick={() => router.push(`/patients/${patientid}/followup`)}
        >
          + Add followup
        </button>
      </div>

    </div>
  )
}

export default Page