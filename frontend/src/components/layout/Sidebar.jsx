import { Link, useLocation } from "react-router-dom";
import { Calculator, LayoutDashboard, Map, X } from "lucide-react";
import Brand from "../ui/Brand";

const menus = [
    { name: "ภาพรวม", path: "/", icon: LayoutDashboard },
    { name: "ทริปของฉัน", path: "/trips", icon: Map },
    { name: "คิดค่าใช้จ่ายรายคน", path: "/expense-splits", icon: Calculator }
];

function Sidebar({ isOpen, onClose }) {
    const location = useLocation();

    return (
        <>
            {isOpen && <button type="button" className="fixed inset-0 z-40 bg-[#102b20]/45 backdrop-blur-sm lg:hidden" onClick={onClose} aria-label="ปิดเมนู" />}
            <aside className={`fixed inset-y-0 left-0 z-50 flex w-72 -translate-x-full flex-col bg-[#173d2d] px-5 py-6 text-white transition-transform duration-300 lg:translate-x-0 ${isOpen ? "translate-x-0" : ""}`}>
                <div className="flex items-center justify-between">
                    <Brand inverted />
                    <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#a4bda9] hover:bg-white/10 hover:text-white lg:hidden" aria-label="ปิดเมนู"><X size={20} /></button>
                </div>

                <p className="mt-12 px-3 text-[10px] font-bold uppercase tracking-[0.2em] text-[#91af98]">จัดการการเดินทาง</p>
                <nav className="mt-3 space-y-1.5" aria-label="เมนูหลัก">
                    {menus.map(({ name, path, icon: Icon }) => {
                        const active = path === "/" ? location.pathname === "/" : location.pathname.startsWith(path);
                        return (
                            <Link key={path} to={path} onClick={onClose} className={`flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-semibold transition ${active ? "bg-[#d9edb8] text-[#173d2d] shadow-lg shadow-black/10" : "text-[#c1d3c4] hover:bg-white/10 hover:text-white"}`}>
                                <Icon size={20} />
                                {name}
                            </Link>
                        );
                    })}
                </nav>
{/* 
                <div className="mt-auto rounded-2xl border border-white/10 bg-white/5 p-4">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#d9edb8]/15 text-[#d9edb8]"><Compass size={22} /></span>
                    <p className="mt-4 text-sm font-semibold">ออกแบบให้การเดินทางง่ายขึ้น</p>
                    <p className="mt-1 text-xs leading-5 text-[#a4bda9]">วางแผน จัดการ และเก็บความทรงจำดี ๆ ไว้ด้วยกัน</p>
                </div> */}
            </aside>
        </>
    );
}

export default Sidebar;