import { useId } from "react";

function FormField({ label, hint, error, className = "", id, ...props }) {
    const generatedId = useId();
    const fieldId = id || generatedId;
    const hintId = hint ? `${fieldId}-hint` : undefined;
    const errorId = error ? `${fieldId}-error` : undefined;

    return (
        <div className={className}>
            <label htmlFor={fieldId} className="text-sm font-semibold text-[#365544]">{label}</label>
            <input
                id={fieldId}
                className={`mt-2 w-full rounded-xl border bg-white px-4 py-3 text-sm text-[#1d3b2e] outline-none transition placeholder:text-[#a1ada3] focus:ring-4 disabled:cursor-not-allowed disabled:bg-[#f5f7f2] ${error ? "border-[#d78b82] focus:border-[#c56a5f] focus:ring-[#fbe9e6]" : "border-[#dce5d7] focus:border-[#83a76c] focus:ring-[#e5efdc]"}`}
                aria-invalid={Boolean(error)}
                aria-describedby={[hintId, errorId].filter(Boolean).join(" ") || undefined}
                {...props}
            />
            {hint && !error && <p id={hintId} className="mt-1.5 text-xs leading-5 text-[#91a094]">{hint}</p>}
            {error && <p id={errorId} className="mt-1.5 text-xs font-medium text-[#b25147]">{error}</p>}
        </div>
    );
}

export default FormField;