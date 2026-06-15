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
        setError(error.response?.data?.message || "error while sending response to backend")
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleDeletePatient = async () => {
    try {
      const confirmed = confirm("Are you sure you want to delete this patient?")
      if (!confirmed) return
      await api.delete(`/patient/${patientid}`)

      // 2. redirect to dashboard
      router.push("/dashboard")

    } catch (error: any) {
      setError(error.response?.data?.message || "Failed to delete patient")
    }
  }
  const handleDeletefollowup = async (id: string) => {
    try {
      const confirmed = confirm("Are you sure you want to delete this patient?")
      if (!confirmed) return
      await api.delete(`/followup/patient-followup/${id}`)
      setFollowups(prev => prev.filter(f => f._id !== id))
    } catch (error: any) {
      console.log(error.response)
      setError(error.response?.data?.message || "Failed to delete patient")
    }
  }

  const handleSaveFollowup = async (id: string) => {
    if (!editData) return   // safety check
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
    <div className="bg-[#000000d9] p-4 md:p-8 lg:p-10 font-sans pb-24">

      {/* Back Button */}
      <div className='flex justify-between py-2'>
        <button
          onClick={() => router.push("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:shadow-sm mb-6 lg:mb-8 transition-all duration-200"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="m15 18-6-6 6-6" />
          </svg>
          Back
        </button>
        <div className='flex gap-5 items-center justify-center  '>
          <button className='flex items-center gap-2 mb-6 lg:mb-8 font-medium px-4 py-2.5 rounded-xl shadow transition-all duration-200 hover:scale-105 text-sm bg-red-700 hover:bg-red-800 text-white' onClick={handleDeletePatient}>
            delete Patient
          </button>
          <button
            onClick={() => setShowEdit(true)}
            className="flex items-center gap-2 mb-6 lg:mb-8  bg-[#244165] hover:bg-[#1a304b] text-blue-100 font-medium px-4 py-2.5 rounded-xl shadow transition-all duration-200 hover:scale-105 text-sm"
          >
            Edit Patient
          </button></div>
      </div>

      {/* Patient Header Card */}
      <div className="bg-[#323232] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between text-white mb-6 lg:mb-8 gap-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center gap-5 lg:gap-6">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#1e446d] flex items-center justify-center text-xl lg:text-2xl font-medium tracking-wide text-[#7bb1f0]">
            {patient?.patientName.split(" ").map((n) => n[0]).join("").toUpperCase() || ""}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold mb-2 lg:mb-3">{patient?.patientName}</h1>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-sm font-medium">
              <span className="flex items-center gap-1.5 bg-[#253648] text-[#7bb1f0] px-3 py-1.5 rounded-full cursor-default hover:bg-[#2d4258] transition-colors">
                {patient?.age} yrs
              </span>
              <span className="flex items-center gap-1.5 bg-[#253648] text-[#7bb1f0] px-3 py-1.5 rounded-full cursor-default hover:bg-[#2d4258] transition-colors">
                {patient?.gender}
              </span>
              <span className="flex items-center gap-1.5 bg-[#173a14] text-[#55b749] px-3 py-1.5 rounded-full cursor-default hover:bg-[#1d4719] transition-colors">
                {patient?.phoneNumber}
              </span>
            </div>
          </div>
        </div>
        <div className="text-left md:text-right">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5">Next Followup</div>
          <div className="text-[#55b749] font-medium text-lg lg:text-xl">
            {patient?.followUpDate ? new Date(patient.followUpDate).toLocaleDateString() : "Not set"}
          </div>
        </div>
      </div>
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
      {!showEdit && <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
        <div className="bg-[#323232] rounded-2xl p-5 lg:p-6 border-l-4 border-[#cf6666] shadow-sm text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="text-xs text-[#cf6666] uppercase tracking-widest font-semibold mb-2">Diagnosis</div>
          <div className="text-lg lg:text-xl">{patient?.diagnosis}</div>
        </div>
        <div className="bg-[#323232] rounded-2xl p-5 lg:p-6 border-l-4 border-[#6688cf] shadow-sm text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="text-xs text-[#6688cf] uppercase tracking-widest font-semibold mb-2">Medicine</div>
          <div className="text-lg lg:text-xl">{patient?.medicine}</div>
        </div>
        <div className="bg-[#323232] rounded-2xl p-5 lg:p-6 border-l-4 border-[#769e55] shadow-sm text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="text-xs text-[#769e55] uppercase tracking-widest font-semibold mb-2">Diet</div>
          <div className="text-lg lg:text-xl">{patient?.diet}</div>
        </div>
      </div>}

      {/* Occupation, Family Size, Address */}
      {!showEdit && <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-10">
        <div className="bg-[#323232] rounded-2xl p-5 lg:p-6 shadow-sm text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Occupation</div>
          <div className="text-lg lg:text-xl">{patient?.occupation}</div>
        </div>
        <div className="bg-[#323232] rounded-2xl p-5 lg:p-6 shadow-sm text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Family Size</div>
          <div className="text-lg lg:text-xl">{patient?.familySize}</div>
        </div>
        <div className="bg-[#323232] rounded-2xl p-5 lg:p-6 shadow-sm text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1 cursor-default">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Address</div>
          <div className="text-lg lg:text-xl">{patient?.address}</div>
        </div>
      </div>}

      {/* Followup History */}
      <div className="bg-[#323232] rounded-2xl p-6 lg:p-8 shadow-sm text-white transition-all duration-300 hover:shadow-lg">

        {/* Followup Header */}
        <div className="flex justify-between items-center mb-6 pb-5 border-b border-gray-600/50">
          <div className="flex items-center gap-4 lg:gap-6">
            <h2 className="text-xl lg:text-2xl font-medium">Followup history</h2>
            <span className="bg-[#253648] text-[#7bb1f0] px-3 py-1 rounded-full text-sm font-medium">
              {followups.length > 0 ? `${followups.length} visits` : "0 visits by Patient"}
            </span>
          </div>
          <button
            className="hidden lg:flex bg-[#244165] hover:bg-[#1a304b] text-blue-100 font-medium px-4 py-2.5 rounded-xl shadow transition-all duration-200 hover:scale-105 hover:shadow-md items-center gap-2 text-sm"
            onClick={() => router.push(`/patients/${patientid}/followup`)}
          >
            Add followup
          </button>
        </div>

        {/* Followup List */}
        <div className="space-y-0 lg:max-w-4xl">
          {followups.map((data, idx) => (
            <div key={idx} className="relative pl-8 pb-8 border-l border-gray-600/50 last:border-transparent last:pb-0 group">

              {editingId === data._id ? (
                // EDIT MODE
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2 block">Symptoms</label>
                    <input
                      className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3"
                      value={editData?.symptoms || ""}
                      onChange={(e) => setEditData({ ...editData!, symptoms: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2 block">Medicine</label>
                    <input
                      className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3"
                      value={editData?.medicine || ""}
                      onChange={(e) => setEditData({ ...editData!, medicine: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2 block">Advice</label>
                    <textarea
                      className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3"
                      value={editData?.advise || ""}
                      onChange={(e) => setEditData({ ...editData!, advise: e.target.value })}
                    />
                  </div>
                  <div className="col-span-2 flex gap-3 justify-end">
                    <button
                      onClick={() => setEditingId(null)}
                      className="px-4 py-2 rounded-xl border border-zinc-600 text-zinc-300 hover:bg-zinc-700"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveFollowup(data._id)}
                      className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                // VIEW MODE
                <>
                  <div className="absolute w-3.5 h-3.5 rounded-full bg-[#323232] border-[3px] border-[#4e82c5] left-[-7.5px] top-1.5 transition-transform duration-300 group-hover:scale-125"></div>

                  <div className="flex justify-between items-start mb-5">
                    <div className="text-lg lg:text-xl font-medium group-hover:text-blue-200 transition-colors duration-200">
                      {data.followUpDate ? new Date(data.followUpDate).toLocaleDateString() : "not set"}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Symptoms</div>
                      <div className="text-gray-200 lg:text-lg">{data.symptoms}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Medicine</div>
                      <div className="text-gray-200 lg:text-lg">{data.medicine}</div>
                    </div>
                    <div className="col-span-1 md:col-span-2">
                      <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-2">Advice</div>
                      <div className="text-gray-200 lg:text-lg">{data.advise}</div>
                    </div>
                  </div>

                  <div className="flex justify-end mt-4">
                    <div>
                      <button className='flex bg-[#244165] hover:bg-[#1a304b] text-blue-100 font-medium px-4 py-2.5 rounded-xl shadow transition-all duration-200 hover:scale-105 hover:shadow-md items-center gap-2 text-sm'
                        onClick={() => handleDeletefollowup(data._id)}>
                        Delete
                      </button>
                    </div>
                    <button
                      className="flex bg-[#244165] hover:bg-[#1a304b] text-blue-100 font-medium px-4 py-2.5 rounded-xl shadow transition-all duration-200 hover:scale-105 hover:shadow-md items-center gap-2 text-sm"
                      onClick={() => {
                        setEditingId(data._id)
                        setEditData(data)
                      }}
                    >
                      <svg width="16px" height="16px" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg" fill="none">
                        <path fill="#ffffff" fillRule="evenodd" d="M15.198 3.52a1.612 1.612 0 012.223 2.336L6.346 16.421l-2.854.375 1.17-3.272L15.197 3.521zm3.725-1.322a3.612 3.612 0 00-5.102-.128L3.11 12.238a1 1 0 00-.253.388l-1.8 5.037a1 1 0 001.072 1.328l4.8-.63a1 1 0 00.56-.267L18.8 7.304a3.612 3.612 0 00.122-5.106zM12 17a1 1 0 100 2h6a1 1 0 100-2h-6z" />
                      </svg>
                      Edit followup
                    </button>
                  </div>
                </>
              )}

            </div>
          ))}
        </div>

      </div>
      <div className='text-red-400 text-2xl'>{error}</div>
      {/* Mobile Floating Action Button */}
      <div className="fixed bottom-8 right-8 lg:hidden z-50">
        <button
          className="bg-[#244165] hover:bg-[#1a304b] text-blue-100 font-medium px-5 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl flex items-center gap-2"
          onClick={() => router.push(`/patients/${patientid}/followup`)}
        >
          Add followup
        </button>
      </div>

    </div>
  )
}

export default Page