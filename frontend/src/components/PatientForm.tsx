import { Patient } from "@/types";
import { useState } from "react";
interface PatientFormProps {
    mode: "add" | "edit"
    initialData?: Patient // what type? hint: look at add/page.tsx line 8
    onSubmit: (data: Omit<Patient, "_id">) => void             // who should handle the API call — form or parent?
    loading: boolean
    error: string
}

const PatientForm = ({ mode, initialData, onSubmit, loading, error }: PatientFormProps) => {

    type PatientForm = Omit<Patient, "_id">;

    const [patient, setPatient] = useState<PatientForm>(initialData ?? {
        patientName: "",
        age: 0,
        gender: "OTHER",
        diagnosis: "",
        medicine: "",
        phoneNumber: "",
        address: "",
        diet: "VEG",
        familySize: 0,
        occupation: "",
        followUpDate: new Date(),
    });

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault()
        onSubmit(patient)
    }

    const inputClass = "w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] text-[var(--color-on-surface)] rounded-xl px-4 py-3 focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] placeholder-[var(--color-outline)] transition-colors"
    const labelClass = "block text-sm font-semibold text-[var(--color-on-surface-variant)] mb-2"

    return (
        <div className="mx-5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-2xl p-6 md:p-8 shadow-[0_2px_8px_rgba(26,28,27,0.06)] mb-8">
            <div className="mb-8 border-b border-[var(--color-outline-variant)]/40 pb-6">
                <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-on-surface)]">
                    {mode === "add" ? "Patient Registration" : "Edit Patient"}
                </h1>
                <p className="text-[var(--color-on-surface-variant)] text-sm mt-1">
                    Enter the details below to register a new patient into the system.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">

                {/* Section: Basic Information */}
                <div>
                    <div className="flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">person</span>
                        <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Basic Information</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="md:col-span-2">
                            <label htmlFor="patientName" className={labelClass}>Patient Name *</label>
                            <input
                                id="patientName"
                                required
                                type="text"
                                placeholder="John Doe"
                                className={inputClass}
                                value={patient.patientName}
                                onChange={(e) => setPatient({ ...patient, patientName: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="age" className={labelClass}>Age *</label>
                            <input
                                id="age"
                                required
                                type="number"
                                placeholder="e.g., 45"
                                className={inputClass}
                                value={patient.age || ""}
                                onChange={(e) => setPatient({ ...patient, age: Number(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label htmlFor="gender" className={labelClass}>Gender *</label>
                            <select
                                id="gender"
                                required
                                className={`${inputClass} appearance-none`}
                                value={patient.gender}
                                onChange={(e) => setPatient({ ...patient, gender: e.target.value as "MALE" | "FEMALE" | "OTHER" })}
                            >
                                <option value="MALE">Male</option>
                                <option value="FEMALE">Female</option>
                                <option value="OTHER">Other</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="phoneNumber" className={labelClass}>Phone Number *</label>
                            <input
                                id="phoneNumber"
                                required
                                type="tel"
                                placeholder="+1 234 567 8900"
                                className={inputClass}
                                value={patient.phoneNumber}
                                onChange={(e) => setPatient({ ...patient, phoneNumber: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="address" className={labelClass}>Address</label>
                            <input
                                id="address"
                                type="text"
                                placeholder="123 Main St, City"
                                className={inputClass}
                                value={patient.address}
                                onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Clinical Details */}
                <div>
                    <div className="flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-[var(--color-tertiary)] text-xl">medical_services</span>
                        <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Clinical Details</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="diagnosis" className={labelClass}>Diagnosis *</label>
                            <input
                                id="diagnosis"
                                required
                                type="text"
                                placeholder="e.g., Hypertension"
                                className={inputClass}
                                value={patient.diagnosis}
                                onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="medicine" className={labelClass}>Medicine *</label>
                            <input
                                id="medicine"
                                required
                                type="text"
                                placeholder="e.g., Lycopodium 30C"
                                className={inputClass}
                                value={patient.medicine}
                                onChange={(e) => setPatient({ ...patient, medicine: e.target.value })}
                            />
                        </div>
                    </div>
                </div>

                {/* Section: Lifestyle & Follow-up */}
                <div>
                    <div className="flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-[var(--color-secondary)] text-xl">calendar_month</span>
                        <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Lifestyle & Follow-up</h2>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div>
                            <label htmlFor="diet" className={labelClass}>Diet</label>
                            <select
                                id="diet"
                                className={`${inputClass} appearance-none`}
                                value={patient.diet}
                                onChange={(e) => setPatient({ ...patient, diet: e.target.value as Patient["diet"] })}
                            >
                                <option value="VEG">Veg</option>
                                <option value="NON VEG">Non-Veg</option>
                                <option value="MIXED">Mixed</option>
                            </select>
                        </div>

                        <div>
                            <label htmlFor="familySize" className={labelClass}>Family Size</label>
                            <input
                                id="familySize"
                                type="number"
                                placeholder="e.g., 4"
                                className={inputClass}
                                value={patient.familySize || ""}
                                onChange={(e) => setPatient({ ...patient, familySize: Number(e.target.value) })}
                            />
                        </div>

                        <div>
                            <label htmlFor="occupation" className={labelClass}>Occupation</label>
                            <input
                                id="occupation"
                                type="text"
                                placeholder="e.g., Teacher"
                                className={inputClass}
                                value={patient.occupation}
                                onChange={(e) => setPatient({ ...patient, occupation: e.target.value })}
                            />
                        </div>

                        <div>
                            <label htmlFor="followUpDate" className={labelClass}>Follow-up Date</label>
                            <input
                                id="followUpDate"
                                type="date"
                                name="followUpDate"
                                className={inputClass}
                                value={
                                    patient.followUpDate
                                        ? new Date(patient.followUpDate).toISOString().split("T")[0]
                                        : ""
                                }
                                onChange={(e) => setPatient({ ...patient, followUpDate: new Date(e.target.value) })}
                            />
                        </div>
                    </div>
                </div>

                {
                    error && (
                        <div className="bg-[var(--color-error-container)] border border-[color:var(--color-error)]/20 text-[var(--color-on-error-container)] rounded-xl p-4">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )
                }

                <div className="pt-4 border-t border-[var(--color-outline-variant)]/40">
                    <button
                        type="submit"
                        disabled={loading}
                        className={`w-full py-4 rounded-xl font-semibold transition duration-200 active:scale-[0.99]
                ${loading
                                ? "bg-[var(--color-surface-container-high)] cursor-wait text-[var(--color-on-surface-variant)]"
                                : "bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-on-primary)] shadow-sm"
                            }`}
                    >
                        {loading
                            ? "Saving..."
                            : mode === "add" ? "Register Patient" : "Save Changes"
                        }
                    </button>
                </div>
            </form >
        </div >
    )
}

export default PatientForm