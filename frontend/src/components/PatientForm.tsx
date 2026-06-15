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

    return <div className="max-w-4xl mx-auto bg-zinc-800 rounded-2xl p-8 shadow-lg">
        <div className="mb-8 border-b border-zinc-700/50 pb-6">
            <h1 className="text-3xl font-bold">Patient Registration</h1>
            <p className="text-zinc-400 text-sm mt-1">
                Enter the details below to register a new patient into the system.
            </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

                <div>
                    <label htmlFor="patientName" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Patient Name *
                    </label>
                    <input
                        id="patientName"
                        required
                        type="text"
                        placeholder="John Doe"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                        value={patient.patientName}
                        onChange={(e) => setPatient({ ...patient, patientName: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="age" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Age *
                    </label>
                    <input
                        id="age"
                        required
                        type="number"
                        placeholder="e.g., 45"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                        value={patient.age || ""}
                        onChange={(e) => setPatient({ ...patient, age: Number(e.target.value) })}
                    />
                </div>

                <div>
                    <label htmlFor="phoneNumber" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Phone Number *
                    </label>
                    <input
                        id="phoneNumber"
                        required
                        type="tel"
                        placeholder="+1 234 567 8900"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                        value={patient.phoneNumber}
                        onChange={(e) => setPatient({ ...patient, phoneNumber: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="gender" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Gender *
                    </label>
                    <select
                        id="gender"
                        required
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                        value={patient.gender}
                        onChange={(e) => setPatient({ ...patient, gender: e.target.value as "MALE" | "FEMALE" | "OTHER" })}
                    >
                        <option value="MALE">Male</option>
                        <option value="FEMALE">Female</option>
                        <option value="OTHER">Other</option>
                    </select>
                </div>

                <div className="md:col-span-2">
                    <label htmlFor="address" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Address
                    </label>
                    <input
                        id="address"
                        type="text"
                        placeholder="123 Main St, City"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                        value={patient.address}
                        onChange={(e) => setPatient({ ...patient, address: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="diagnosis" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Diagnosis *
                    </label>
                    <input
                        id="diagnosis"
                        required
                        type="text"
                        placeholder="e.g., Hypertension"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                        value={patient.diagnosis}
                        onChange={(e) => setPatient({ ...patient, diagnosis: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="medicine" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Medicine *
                    </label>
                    <input
                        id="medicine"
                        required
                        type="text"
                        placeholder="e.g., Lisinopril"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                        value={patient.medicine}
                        onChange={(e) => setPatient({ ...patient, medicine: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="diet" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Diet
                    </label>
                    <select
                        id="diet"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors appearance-none"
                        value={patient.diet}
                        onChange={(e) => setPatient({ ...patient, diet: e.target.value as Patient["diet"] })}
                    >
                        <option value="VEG">Veg</option>
                        <option value="NON VEG">Non-Veg</option>
                        <option value="MIXED">Mixed</option>
                    </select>
                </div>

                <div>
                    <label htmlFor="familySize" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Family Size
                    </label>
                    <input
                        id="familySize"
                        type="number"
                        placeholder="e.g., 4"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                        value={patient.familySize || ""}
                        onChange={(e) => setPatient({ ...patient, familySize: Number(e.target.value) })}
                    />
                </div>

                <div>
                    <label htmlFor="occupation" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Occupation
                    </label>
                    <input
                        id="occupation"
                        type="text"
                        placeholder="e.g., Teacher"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 placeholder-zinc-600 transition-colors"
                        value={patient.occupation}
                        onChange={(e) => setPatient({ ...patient, occupation: e.target.value })}
                    />
                </div>

                <div>
                    <label htmlFor="followUpDate" className="block text-xs uppercase tracking-wider text-blue-400 mb-2">
                        Follow-up Date
                    </label>
                    <input
                        id="followUpDate"
                        type="date"
                        name="followUpDate"
                        className="w-full bg-zinc-900 border border-zinc-700 text-white rounded-xl px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors [color-scheme:dark]"
                        value={
                            patient.followUpDate instanceof Date
                                ? patient.followUpDate.toISOString().split("T")[0]
                                : patient.followUpDate
                        }
                        onChange={(e) => setPatient({ ...patient, followUpDate: new Date(e.target.value) })}
                    />
                </div>
            </div>

            {
                error && (
                    <div className="bg-red-900/30 border border-red-700 text-red-400 rounded-xl p-4 mt-2">
                        <p className="text-sm font-medium">{error}</p>
                    </div>
                )
            }

            <div className="pt-4 border-t border-zinc-700/50">
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full py-4 rounded-xl font-semibold transition duration-200 shadow-lg shadow-blue-900/20 active:scale-[0.99]
                ${loading
                            ? "bg-zinc-700 cursor-wait text-zinc-300 shadow-none"
                            : "bg-blue-600 hover:bg-blue-700 text-white"
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

}

export default PatientForm