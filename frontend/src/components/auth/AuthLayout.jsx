import { Check, MapPin, Mountain, Sparkles } from "lucide-react";
import Brand from "../ui/Brand";

function AuthLayout({ title, description, children, footer }) {
    return (
        <main className="min-h-screen bg-[#f7f8f2] lg:grid lg:grid-cols-[minmax(0,1.05fr)_minmax(480px,0.95fr)]">
            <section className="relative hidden min-h-screen overflow-hidden bg-[#173d2d] p-12 text-white lg:flex lg:flex-col">
                <div className="absolute -right-32 top-20 h-[430px] w-[430px] rounded-full border border-[#d9edb8]/10" />
                <div className="absolute -right-20 top-32 h-[300px] w-[300px] rounded-full border border-[#d9edb8]/10" />
                <div className="absolute -bottom-48 -left-20 h-[480px] w-[480px] rounded-full bg-[#d9edb8]/10 blur-3xl" />
                <div className="relative"><Brand inverted /></div>

                <div className="relative my-auto max-w-xl py-14">
                    <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3.5 py-2 text-xs font-semibold text-[#d9edb8]">
                        <Sparkles size={14} />
                        ทุกการเดินทางเริ่มต้นจากแผนที่ดี
                    </span>
                    <h1 className="mt-7 text-5xl font-extrabold leading-[1.15] tracking-tight">เก็บทุกความทรงจำ<br />ในที่เดียว</h1>
                    <p className="mt-5 max-w-md text-base leading-8 text-[#c1d3c4]">จัดการกำหนดการ เพื่อนร่วมทาง และค่าใช้จ่ายได้ง่าย ๆ เพื่อให้ทุกทริปเป็นเรื่องราวที่คุ้มค่า</p>

                    <div className="mt-10 max-w-sm rounded-3xl border border-white/10 bg-white/10 p-5 backdrop-blur-sm">
                        <div className="flex items-center justify-between">
                            <span className="text-xs font-semibold uppercase tracking-wider text-[#b9d3a9]">Next adventure</span>
                            <Mountain size={22} className="text-[#d9edb8]" />
                        </div>
                        <p className="mt-5 text-2xl font-bold">เชียงใหม่ · 4 วัน</p>
                        <div className="mt-2 flex items-center gap-2 text-sm text-[#c1d3c4]"><MapPin size={16} /> ป่าพยานธารราช และเมืองลำพูน</div>
                    </div>
                </div>

                <p className="relative text-sm text-[#a4bda9]">วางแผนง่าย เดินทางสนุก · TripMate</p>
            </section>

            <section className="flex min-h-screen flex-col px-6 py-7 sm:px-10 lg:px-16">
                <div className="lg:hidden"><Brand /></div>
                <div className="my-auto w-full max-w-[420px] self-center py-12">
                    <div className="mb-9">
                        <h2 className="text-3xl font-extrabold tracking-tight text-[#1d3b2e] sm:text-4xl">{title}</h2>
                        <p className="mt-3 text-sm leading-6 text-[#7a8b7e]">{description}</p>
                    </div>
                    {children}
                    {footer && <div className="mt-7 text-center text-sm text-[#7a8b7e]">{footer}</div>}
                </div>
                <p className="flex items-center justify-center gap-1.5 text-center text-xs text-[#9aa79d]"><Check size={14} className="text-[#6b9355]" /> ออกแบบมาเพื่อให้การวางแผนทริปง่ายขึ้น</p>
            </section>
        </main>
    );
}

export default AuthLayout;