import { Case, PersonalHistory, PresentingComplaint } from "@/types";
import { THERMAL_LABELS } from "@/utils/case";

interface CaseDetailsProps {
    caseRecord: Case
    onEdit: () => void
}

const PRESENTING_COMPLAINT_LABELS: { key: keyof PresentingComplaint; label: string }[] = [
    { key: "locationExtension", label: "Location & Extension" },
    { key: "sensation", label: "Sensation" },
    { key: "modalities", label: "Modalities" },
    { key: "concomitants", label: "Concomitants" },
]

const PERSONAL_HISTORY_LABELS: { key: keyof PersonalHistory; label: string }[] = [
    { key: "thermalReactivity", label: "Thermal Reactivity" },
    { key: "appetite", label: "Appetite" },
    { key: "desires", label: "Desires" },
    { key: "aversion", label: "Aversion" },
    { key: "intolerance", label: "Intolerance" },
    { key: "thirst", label: "Thirst" },
    { key: "bowel", label: "Bowel" },
    { key: "urine", label: "Urine" },
    { key: "sleep", label: "Sleep" },
    { key: "dream", label: "Dream" },
    { key: "perspiration", label: "Perspiration" },
    { key: "addiction", label: "Addiction" },
    { key: "menses", label: "Menses" },
    { key: "mentals", label: "Mentals" },
]

const Field = ({ label, value }: { label: string; value: string }) => (
    <div>
        <div className="text-xs text-[var(--color-on-surface-variant)] uppercase tracking-widest font-semibold mb-1">{label}</div>
        <div className="text-[var(--color-on-surface)] text-sm whitespace-pre-wrap">{value}</div>
    </div>
)

// Read-only view of one case. Fields the doctor left blank are not stored, so
// anything absent is simply not rendered.
const CaseDetails = ({ caseRecord, onEdit }: CaseDetailsProps) => {

    const interrogation = caseRecord.interrogation ?? {}

    const presentingComplaint = PRESENTING_COMPLAINT_LABELS
        .map((field) => ({ ...field, value: interrogation.presentingComplaint?.[field.key] }))
        .filter((field): field is typeof field & { value: string } => Boolean(field.value))

    const personalHistory = PERSONAL_HISTORY_LABELS
        .map((field) => {
            const raw = interrogation.personalHistory?.[field.key]
            const value = field.key === "thermalReactivity" && raw
                ? THERMAL_LABELS[raw as keyof typeof THERMAL_LABELS] ?? raw
                : raw
            return { ...field, value }
        })
        .filter((field): field is typeof field & { value: string } => Boolean(field.value))

    const hasHistory = Boolean(interrogation.historyOfPresentIllness || interrogation.pastHistory)

    return (
        <div className="border border-[var(--color-outline-variant)]/40 rounded-2xl p-5 lg:p-6 bg-[var(--color-surface-container-low)]">

            <div className="flex justify-between items-start gap-4 mb-5 pb-4 border-b border-[var(--color-outline-variant)]/40">
                <div className="text-sm font-medium text-[var(--color-secondary)]">
                    {caseRecord.createdAt ? new Date(caseRecord.createdAt).toLocaleDateString() : "Date not set"}
                </div>
                <button
                    onClick={onEdit}
                    className="bg-[color:var(--color-primary-container)]/30 border border-[var(--color-primary-container)] text-[var(--color-on-primary-container)] hover:opacity-90 font-medium px-3 py-1.5 rounded-lg transition-all duration-200 text-xs flex-shrink-0"
                >
                    Edit Case
                </button>
            </div>

            <div className="space-y-6">
                <Field label="Chief Complaint & Symptoms" value={caseRecord.chiefComplaint} />

                {presentingComplaint.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                        {presentingComplaint.map((field) => (
                            <Field key={field.key} label={field.label} value={field.value} />
                        ))}
                    </div>
                )}

                {hasHistory && (
                    <div className="space-y-5 pt-1">
                        {interrogation.historyOfPresentIllness && (
                            <Field label="History of Present Illness" value={interrogation.historyOfPresentIllness} />
                        )}
                        {interrogation.pastHistory && (
                            <Field label="Past History" value={interrogation.pastHistory} />
                        )}
                    </div>
                )}

                {personalHistory.length > 0 && (
                    <div className="pt-4 border-t border-[var(--color-outline-variant)]/40">
                        <div className="text-xs text-[var(--color-primary)] uppercase tracking-widest font-semibold mb-4">
                            Personal History
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            {personalHistory.map((field) => (
                                <Field key={field.key} label={field.label} value={field.value} />
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CaseDetails
