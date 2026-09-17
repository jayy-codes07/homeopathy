import { useState } from "react";
import { CaseFormData, PersonalHistory, PresentingComplaint } from "@/types";
import FormTextarea from "./FormTextarea";
import FormSelect from "./FormSelect";

interface CaseFormProps {
    value: CaseFormData
    onChange: (value: CaseFormData) => void
    // Drives whether the menses field is shown; hidden for male patients.
    gender?: "MALE" | "FEMALE" | "OTHER"
    onBack: () => void
    onSubmit: () => void
    loading: boolean
    error: string
}

const THERMAL_OPTIONS = [
    { value: "HOT", label: "Hot" },
    { value: "CHILLY", label: "Chilly" },
    { value: "AMBITHERMAL", label: "Ambithermal" },
]

// The Personal History rows of the paper form, in the order they are printed.
// thermalReactivity is handled separately as a select.
const PERSONAL_HISTORY_FIELDS: { key: keyof PersonalHistory; label: string; icon: string }[] = [
    { key: "appetite", label: "Appetite", icon: "restaurant" },
    { key: "desires", label: "Desires", icon: "favorite" },
    { key: "aversion", label: "Aversion", icon: "block" },
    { key: "intolerance", label: "Intolerance", icon: "warning" },
    { key: "thirst", label: "Thirst", icon: "local_drink" },
    { key: "bowel", label: "Bowel", icon: "gastroenterology" },
    { key: "urine", label: "Urine", icon: "water_drop" },
    { key: "sleep", label: "Sleep", icon: "bedtime" },
    { key: "dream", label: "Dream", icon: "cloud" },
    { key: "perspiration", label: "Perspiration", icon: "humidity_high" },
    { key: "addiction", label: "Addiction", icon: "smoking_rooms" },
    { key: "menses", label: "Menses", icon: "calendar_month" },
    { key: "mentals", label: "Mentals", icon: "psychology" },
]

const PRESENTING_COMPLAINT_FIELDS: { key: keyof PresentingComplaint; label: string; icon: string; placeholder: string }[] = [
    {
        key: "locationExtension", label: "Location & Extension", icon: "my_location",
        placeholder: "Tissues, organs, systems. Extension & spread, duration & frequency...",
    },
    {
        key: "sensation", label: "Sensation", icon: "touch_app",
        placeholder: "Including pathology — e.g. stitching pain, burning...",
    },
    {
        key: "modalities", label: "Modalities", icon: "compare_arrows",
        placeholder: "What makes it better or worse, and A/F...",
    },
    {
        key: "concomitants", label: "Concomitants", icon: "add_circle",
        placeholder: "Accompanying symptoms, if any...",
    },
]

// Step 2 of registration: section 1 of the Acute Case Record. Later sections
// (physical examination, diagnosis, treatment) nest under Case the same way.
const CaseForm = ({ value, onChange, gender, onBack, onSubmit, loading, error }: CaseFormProps) => {

    const [showPersonalHistory, setShowPersonalHistory] = useState(false)

    const handleSubmit = (e: React.SyntheticEvent) => {
        e.preventDefault()
        onSubmit()
    }

    const setInterrogation = (patch: Partial<CaseFormData["interrogation"]>) =>
        onChange({ ...value, interrogation: { ...value.interrogation, ...patch } })

    const setPresentingComplaint = (key: keyof PresentingComplaint, fieldValue: string) =>
        setInterrogation({
            presentingComplaint: { ...value.interrogation.presentingComplaint, [key]: fieldValue },
        })

    const setPersonalHistory = (key: keyof PersonalHistory, fieldValue: string) =>
        setInterrogation({
            personalHistory: { ...value.interrogation.personalHistory, [key]: fieldValue },
        })

    // Menses is not applicable to male patients; every other field always shows.
    const personalHistoryFields = PERSONAL_HISTORY_FIELDS
        .filter((field) => field.key !== "menses" || gender !== "MALE")

    return (
        <div className="mx-5 bg-[var(--color-surface-container-lowest)] border border-[var(--color-outline-variant)]/40 rounded-2xl p-6 md:p-8 shadow-[0_2px_8px_rgba(26,28,27,0.06)] mb-8">
            <div className="mb-8 border-b border-[var(--color-outline-variant)]/40 pb-6">
                <h1 className="text-2xl md:text-3xl font-semibold text-[var(--color-on-surface)]">
                    Interrogation
                </h1>
                <p className="text-[var(--color-on-surface-variant)] text-sm mt-1">
                    Record why the patient came in, in their own words. Only the chief complaint is required.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-10">

                {/* 1.1 Presenting Complaint */}
                <div>
                    <div className="flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-[var(--color-tertiary)] text-xl">monitor_heart</span>
                        <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Presenting Complaint</h2>
                    </div>

                    <div className="space-y-5">
                        <FormTextarea
                            label="Chief Complaint & Symptoms *"
                            icon="monitor_heart"
                            iconColor="var(--color-tertiary)"
                            required
                            rows={6}
                            value={value.chiefComplaint}
                            placeholder="In the patient's own words — what they are complaining of, location, sensation, duration, what makes it better or worse..."
                            onChange={(chiefComplaint) => onChange({ ...value, chiefComplaint })}
                        />

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            {PRESENTING_COMPLAINT_FIELDS.map((field) => (
                                <FormTextarea
                                    key={field.key}
                                    label={field.label}
                                    icon={field.icon}
                                    iconColor="var(--color-tertiary)"
                                    rows={3}
                                    value={value.interrogation.presentingComplaint[field.key]}
                                    placeholder={field.placeholder}
                                    onChange={(fieldValue) => setPresentingComplaint(field.key, fieldValue)}
                                />
                            ))}
                        </div>
                    </div>
                </div>

                {/* 1.2 History of Present Illness / 1.3 Past History */}
                <div>
                    <div className="flex items-center gap-2 mb-5">
                        <span className="material-symbols-outlined text-[var(--color-secondary)] text-xl">history</span>
                        <h2 className="text-base font-semibold text-[var(--color-on-surface)]">History</h2>
                    </div>

                    <div className="space-y-5">
                        <FormTextarea
                            label="History of Present Illness"
                            icon="timeline"
                            iconColor="var(--color-secondary)"
                            rows={4}
                            value={value.interrogation.historyOfPresentIllness}
                            placeholder="Origin, duration and progress of each symptom in chronological order, mode of onset, probable causes, treatment and outcome..."
                            onChange={(historyOfPresentIllness) => setInterrogation({ historyOfPresentIllness })}
                        />

                        <FormTextarea
                            label="Past History"
                            icon="event_repeat"
                            iconColor="var(--color-secondary)"
                            rows={3}
                            value={value.interrogation.pastHistory}
                            placeholder="Previous illnesses, surgeries, treatments — e.g. dengue fever 2 years ago..."
                            onChange={(pastHistory) => setInterrogation({ pastHistory })}
                        />
                    </div>
                </div>

                {/* Personal History — collapsed by default, it is a long section */}
                <div>
                    <button
                        type="button"
                        onClick={() => setShowPersonalHistory(!showPersonalHistory)}
                        className="w-full flex items-center justify-between gap-2 mb-5 text-left"
                    >
                        <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[var(--color-primary)] text-xl">clinical_notes</span>
                            <div>
                                <h2 className="text-base font-semibold text-[var(--color-on-surface)]">Personal History</h2>
                                <p className="text-xs text-[var(--color-on-surface-variant)] mt-0.5">
                                    Thermal reactivity, appetite, sleep, mentals and more — all optional
                                </p>
                            </div>
                        </div>
                        <span className={`material-symbols-outlined text-[var(--color-on-surface-variant)] transition-transform duration-200 ${showPersonalHistory ? "rotate-180" : ""}`}>
                            expand_more
                        </span>
                    </button>

                    {showPersonalHistory && (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FormSelect
                                label="Thermal Reactivity"
                                icon="device_thermostat"
                                iconColor="var(--color-primary)"
                                value={value.interrogation.personalHistory.thermalReactivity}
                                options={THERMAL_OPTIONS}
                                onChange={(thermalReactivity) => setPersonalHistory("thermalReactivity", thermalReactivity)}
                            />

                            {personalHistoryFields.map((field) => (
                                <FormTextarea
                                    key={field.key}
                                    label={field.label}
                                    icon={field.icon}
                                    iconColor="var(--color-primary)"
                                    rows={2}
                                    value={value.interrogation.personalHistory[field.key] ?? ""}
                                    onChange={(fieldValue) => setPersonalHistory(field.key, fieldValue)}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {
                    error && (
                        <div className="bg-[var(--color-error-container)] border border-[color:var(--color-error)]/20 text-[var(--color-on-error-container)] rounded-xl p-4">
                            <p className="text-sm font-medium">{error}</p>
                        </div>
                    )
                }

                <div className="pt-4 border-t border-[var(--color-outline-variant)]/40 flex flex-col-reverse md:flex-row gap-3">
                    <button
                        type="button"
                        onClick={onBack}
                        disabled={loading}
                        className="md:w-auto px-6 py-4 rounded-xl font-semibold border border-[var(--color-outline-variant)] text-[var(--color-on-surface-variant)] hover:bg-[var(--color-surface-container-low)] hover:text-[var(--color-primary)] transition-all duration-200"
                    >
                        Back
                    </button>
                    <button
                        type="submit"
                        disabled={loading}
                        className={`flex-1 py-4 rounded-xl font-semibold transition duration-200 active:scale-[0.99]
                ${loading
                                ? "bg-[var(--color-surface-container-high)] cursor-wait text-[var(--color-on-surface-variant)]"
                                : "bg-[var(--color-primary)] hover:opacity-90 text-[var(--color-on-primary)] shadow-sm"
                            }`}
                    >
                        {loading ? "Saving..." : "Complete Registration"}
                    </button>
                </div>
            </form>
        </div>
    )
}

export default CaseForm
