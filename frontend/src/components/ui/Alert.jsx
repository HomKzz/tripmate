import { AlertCircle, CheckCircle2 } from "lucide-react";

function Alert({ children, variant = "error" }) {
    const isSuccess = variant === "success";
    const Icon = isSuccess ? CheckCircle2 : AlertCircle;

    return (
        <div
            className={`flex items-start gap-3 rounded-xl border px-4 py-3 text-sm ${isSuccess ? "border-[#c7dfb7] bg-[#f0f7ea] text-[#4a763d]" : "border-[#f3c9c4] bg-[#fff5f3] text-[#b25147]"}`}
            role={isSuccess ? "status" : "alert"}
        >
            <Icon className="mt-0.5 shrink-0" size={18} />
            <span>{children}</span>
        </div>
    );
}

export default Alert;