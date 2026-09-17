interface FormTextareaProps {
    label: string
    icon: string
    iconColor?: string
    value: string
    onChange: (value: string) => void
    placeholder?: string
    rows?: number
    required?: boolean
}

// Extracted from the follow-up form so every open-ended clinical note field
// shares one set of styles instead of drifting apart across pages.
const FormTextarea = ({
    label,
    icon,
    iconColor = "var(--color-tertiary)",
    value,
    onChange,
    placeholder,
    rows = 3,
    required = false,
}: FormTextareaProps) => {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-on-surface-variant)] mb-2">
                <span className="material-symbols-outlined text-base" style={{ color: iconColor }}>{icon}</span>
                {label}
            </label>
            <textarea
                required={required}
                rows={rows}
                value={value}
                placeholder={placeholder}
                onChange={(e) => onChange(e.target.value)}
                className="w-full bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-3 text-[var(--color-on-surface)] placeholder-[var(--color-outline)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors resize-none"
            />
        </div>
    )
}

export default FormTextarea
