import { LoaderCircle } from "lucide-react";
import { loadingStateSizes, responsiveClasses } from "./responsive";

function LoadingState({ label = "กำลังโหลด...", size = "lg" }) {
    return (
        <div className={`flex flex-col items-center justify-center ${responsiveClasses(size, loadingStateSizes)}`} role="status">
            <LoaderCircle className="animate-spin text-[#6b9355]" size={28} />
            <p className="mt-3 text-sm font-medium text-[#7a8b7e]">{label}</p>
        </div>
    );
}

export default LoadingState;