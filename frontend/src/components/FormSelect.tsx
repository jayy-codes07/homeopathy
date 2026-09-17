interface FormSelectProps {
    label: string
    icon: string
    iconColor?: string
    value: string
    onChange: (value: string) => void
    options: { value: string; label: string }[]
    placeholder?: string
}

// Select counterpart to FormTextarea, sharing its label and control styling.
const FormSelect = ({
    label,
    icon,
    iconColor = "var(--color-tertiary)",
    value,
    onChange,
    options,
    placeholder = "—",
}: FormSelectProps) => {
    return (
        <div>
            <label className="flex items-center gap-1.5 text-sm font-semibold text-[var(--color-on-surface-variant)] mb-2">
                <span className="material-symbols-outlined text-base" style={{ color: iconColor }}>{icon}</span>
                {label}
            </label>
            <select
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full appearance-none bg-[var(--color-background)] border border-[var(--color-outline-variant)] rounded-xl px-4 py-3 text-[var(--color-on-surface)] focus:outline-none focus:border-[var(--color-primary)] focus:ring-1 focus:ring-[var(--color-primary)] transition-colors"
            >
                <option value="">{placeholder}</option>
                {options.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                ))}
            </select>
        </div>
    )
}

export default FormSelect
