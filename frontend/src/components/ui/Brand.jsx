import { Compass } from "lucide-react";
import { Link } from "react-router-dom";

function Brand({ compact = false, inverted = false, className = "" }) {
    return (
        <Link
            to="/"
            aria-label="TripMate - หน้าหลัก"
            className={`inline-flex items-center gap-3 ${className}`}
        >
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[#d9edb8] text-[#173d2d] shadow-sm shadow-black/5">
                <Compass size={23} strokeWidth={2.2} />
            </span>
            {!compact && (
                <span className={`text-xl font-extrabold tracking-tight ${inverted ? "text-white" : "text-[#173d2d]"}`}>
                    Trip<span className="text-[#6b9355]">Mate</span>
                </span>
            )}
        </Link>
    );
}

export default Brand;