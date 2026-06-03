"use client"

import React, { use, useEffect, useState } from 'react'
import { Followup, Patient } from '@/types'
import api from '@/utils/api'
import Loading from '@/components/Loading'
import { redirect, useRouter } from 'next/navigation'


const Page = ({ params }: { params: Promise<{ patientId: string }> }) => {
  const patientid = use(params).patientId

  const [patient, setPatient] = useState<Patient>()
  const [followups, setFollowups] = useState<Followup[]>([])
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
        console.log(followups);


        setLoading(false)
      } catch (error: any) {
        setError(
          error.response?.data?.message ||
          "error while sending response to backend",
        );
      } finally {
        setLoading(false)

      }
    }
    fetchData()

  }, [])
  if (loading) return <Loading />
  return (
    <div className="bg-[#000000d9] p-4 md:p-8 lg:p-10 font-sans pb-24">

      <button
        onClick={() => router.back()}
        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-400 hover:bg-gray-100 hover:text-gray-600 hover:shadow-sm mb-6 lg:mb-8 transition-all duration-200"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6" />
        </svg>
        Back
      </button>

      <div className="bg-[#323232] rounded-2xl p-6 lg:p-8 flex flex-col md:flex-row md:items-center justify-between text-white mb-6 lg:mb-8 gap-6 shadow-sm transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
        <div className="flex items-center gap-5 lg:gap-6">
          <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-full bg-[#1e446d] flex items-center justify-center text-xl lg:text-2xl font-medium tracking-wide text-[#7bb1f0]">
            {patient?.patientName.split(" ").map((n) => n[0]).join("").toUpperCase() || ""}
          </div>
          <div>
            <h1 className="text-2xl lg:text-3xl font-semibold mb-2 lg:mb-3">{patient?.patientName}</h1>
            <div className="flex flex-wrap items-center gap-2 lg:gap-3 text-sm font-medium">
              <span className="flex items-center gap-1.5 bg-[#253648] text-[#7bb1f0] px-3 py-1.5 rounded-full cursor-default hover:bg-[#2d4258] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="18" x="3" y="4" rx="2" ry="2" /><line x1="16" x2="16" y1="2" y2="6" /><line x1="8" x2="8" y1="2" y2="6" /><line x1="3" x2="21" y1="10" y2="10" /></svg>
                {patient?.age} yrs
              </span>
              <span className="flex items-center gap-1.5 bg-[#253648] text-[#7bb1f0] px-3 py-1.5 rounded-full cursor-default hover:bg-[#2d4258] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2a4 4 0 0 0-4 4v2a4 4 0 0 0 8 0V6a4 4 0 0 0-4-4Z" /><path d="M12 12v10" /><path d="M8 17h8" /></svg>
                {patient?.gender}
              </span>
              <span className="flex items-center gap-1.5 bg-[#173a14] text-[#55b749] px-3 py-1.5 rounded-full cursor-default hover:bg-[#1d4719] transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="14" height="20" x="5" y="2" rx="2" ry="2" /><path d="M12 18h.01" /></svg>
                {patient?.phoneNumber}
              </span>
            </div>
          </div>
        </div>
        <div className="text-left md:text-right">
          <div className="text-xs text-gray-400 uppercase tracking-widest font-semibold mb-1.5">Next Followup</div>
          <div className="text-[#55b749] font-medium text-lg lg:text-xl">{patient?.followUpDate ? new Date(patient.followUpDate).toLocaleDateString() : "Not set"}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-4 lg:mb-6">
        {/* Diagnosis */}
        <div className="bg-[#323232] rounded-2xl p-5 lg:p-6 border-l-4 border-[#cf6666] shadow-sm text-white relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="text-xs text-[#cf6666] uppercase tracking-widest font-semibold mb-2">Diagnosis</div>
          <div className="text-lg lg:text-xl">{patient?.diagnosis}</div>
        </div>
        {/* Medicine */}
        <div className="bg-[#323232] rounded-2xl p-5 lg:p-6 border-l-4 border-[#6688cf] shadow-sm text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="text-xs text-[#6688cf] uppercase tracking-widest font-semibold mb-2">Medicine</div>
          <div className="text-lg lg:text-xl">{patient?.medicine}</div>
        </div>
        {/* Diet */}
        <div className="bg-[#323232] rounded-2xl p-5 lg:p-6 border-l-4 border-[#769e55] shadow-sm text-white transition-all duration-300 hover:shadow-lg hover:-translate-y-1">
          <div className="text-xs text-[#769e55] uppercase tracking-widest font-semibold mb-2">Diet</div>
          <div className="text-lg lg:text-xl">{patient?.diet}</div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 lg:gap-6 mb-6 lg:mb-10">
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
      </div>

      {/* Followup History */}
      <div className="bg-[#323232] rounded-2xl p-6 lg:p-8 shadow-sm text-white transition-all duration-300 hover:shadow-lg">
        <div className="flex justify-between items-center mb-6 pb-5 border-b border-gray-600/50">
          <div className="flex items-center gap-4 lg:gap-6">
            <h2 className="text-xl lg:text-2xl font-medium">Followup history</h2>
            <span className="bg-[#253648] text-[#7bb1f0] px-3 py-1 rounded-full text-sm font-medium">
              {followups.length > 0 ? `${followups.length} visits` : "0 visits by Patient"}
            </span>
          </div>

         <button className="hidden lg:flex bg-[#244165] hover:bg-[#1a304b] text-blue-100 font-medium px-4 py-2.5 rounded-xl shadow transition-all duration-200 hover:scale-105 hover:shadow-md items-center gap-2 text-sm " onClick={() => redirect(`/patients/${patientid}/followup`)}>
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
              <line x1="16" x2="16" y1="2" y2="6" />
              <line x1="8" x2="8" y1="2" y2="6" />
              <line x1="3" x2="21" y1="10" y2="10" />
              <line x1="12" x2="12" y1="14" y2="18" />
              <line x1="10" x2="14" y1="16" y2="16" />
            </svg>
            Add followup
          </button>
        </div>

        <div className="space-y-0 lg:max-w-4xl">
          {followups.map((data, idx) => (<div key={idx} className="relative pl-8 pb-8 border-l border-gray-600/50 last:border-transparent last:pb-0 group">
            {/* Timeline Dot */}
            <div className="absolute w-3.5 h-3.5 rounded-full bg-[#323232] border-[3px] border-[#4e82c5] -left-[7.5px] top-1.5 transition-transform duration-300 group-hover:scale-125"></div>

            <div className="flex justify-between items-start mb-5">
              <div className="text-lg lg:text-xl font-medium group-hover:text-blue-200 transition-colors duration-200">{data.followUpDate ? new Date(data.followUpDate).toLocaleDateString() : "not set"}</div>
              {followups[0] ? <span className="bg-[#173a14] text-[#55b749] px-3 py-1 rounded-md text-sm font-medium">Latest</span> : ""}
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
          </div>))}


        </div>
      </div>

      {/* 3. Mobile ONLY Floating Action Button - Hides on laptop screens */}
      <div className="fixed bottom-8 right-8 lg:hidden z-50">
        <button className="bg-[#244165] hover:bg-[#1a304b] text-blue-100 font-medium px-5 py-3.5 rounded-xl shadow-lg transition-all duration-200 hover:scale-105 hover:shadow-2xl flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect width="18" height="18" x="3" y="4" rx="2" ry="2" />
            <line x1="16" x2="16" y1="2" y2="6" />
            <line x1="8" x2="8" y1="2" y2="6" />
            <line x1="3" x2="21" y1="10" y2="10" />
            <line x1="12" x2="12" y1="14" y2="18" />
            <line x1="10" x2="14" y1="16" y2="16" />
          </svg>
          Add followup
        </button>
      </div>

    </div>
  )
}


export default Page