import { LogOut, Menu } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useAuth } from "../../context/authContext";
import { Button, Brand } from "../ui";

function Navbar({ onMenuClick }) {
    const { user, logout } = useAuth();
    const location = useLocation();
    const path = location.pathname;
    const pageTitle = path === "/"
        ? "ภาพรวม"
        : path === "/trips"
            ? "ทริปของฉัน"
            : path.includes("trip-members") || path.includes("/invite/")
                ? "สมาชิกและคำเชิญ"
                : path.startsWith("/ai-planner")
                    ? "วางแผนทริปด้วย AI"
            : path.includes("expense-splits")
                ? "คิดค่าใช้จ่ายรายคน"
                : path.startsWith("/trips/")
                    ? "รายละเอียดทริป"
                    : "ทริปของฉัน";
    const initial = user?.name?.charAt(0).toUpperCase() || "T";

    return (
        <header className="sticky top-0 z-30 flex h-[76px] items-center justify-between border-b border-[#e7ebdf]/80 bg-[#f7f8f2]/90 px-4 backdrop-blur-xl sm:px-6 xl:px-10">
            <div className="flex items-center gap-3">
                <button type="button" onClick={onMenuClick} className="rounded-xl p-2.5 text-[#52735e] hover:bg-[#edf4e8] lg:hidden" aria-label="เปิดเมนู"><Menu size={22} /></button>
                <Brand className="lg:hidden" />
                <div className="hidden lg:block"><p className="text-xs font-medium text-[#91a094]">วันนี้คุณวางแผนไปไหนกันดี?</p><h2 className="mt-0.5 text-base font-bold text-[#1d3b2e]">{pageTitle}</h2></div>
            </div>
            {user && (
                <div className="flex items-center gap-3">
                    <div className="hidden text-right sm:block"><p className="text-sm font-semibold text-[#365544]">{user.name}</p><p className="text-xs text-[#91a094]">นักเดินทาง</p></div>
                    <span className="flex h-10 w-10 items-center justify-center rounded-full border-4 border-white bg-[#d9edb8] text-sm font-extrabold text-[#246b4d] shadow-sm">{initial}</span>
                    <Button variant="ghost" size="sm" onClick={logout} className="!px-2.5" aria-label="ออกจากระบบ"><LogOut size={17} /></Button>
                </div>
            )}
        </header>
    );
}

export default Navbar;