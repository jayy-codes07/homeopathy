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
    <div>
      <button onClick={() => { router.back() }}>Back</button>
      <form onSubmit={submitform}>

        <div>
          <label htmlFor="symptoms">symptoms</label>
          <input type="text" required value={formData.symptoms} placeholder='Enter Symptoms' onChange={(e) => { setFormData({ ...formData, symptoms: e.target.value }) }} />
        </div>
        <div>
          <label htmlFor="advise">advise</label>
          <input type="text" value={formData.advise} placeholder='Enter advise' onChange={(e) => { setFormData({ ...formData, advise: e.target.value }) }} />
        </div>
        <div>
          <label htmlFor="medicine">medicine</label>
          <input type="text" required value={formData.medicine} placeholder='Enter medicine' onChange={(e) => { setFormData({ ...formData, medicine: e.target.value }) }} />
        </div>

        <div>
          <label htmlFor="followUpDate">followUpDate</label>
          <input type="date" required
            value={formData.followUpDate instanceof Date
              ? formData.followUpDate.toISOString().split("T")[0]
              : ""}
            placeholder='Enter followUpDate' onChange={(e) => { setFormData({ ...formData, followUpDate: new Date(e.target.value) }) }} />
        </div>

        <input type="submit" value="add Followup" className={`${submitloading ? "cursor-wait bg-gra-800" : ""}`} />
      </form>
      {error ? error : ""}
    </div>
  )
}

export default Page