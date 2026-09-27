import { ArrowUpRight, CalendarDays, Compass, Crown } from "lucide-react";
import { Link } from "react-router-dom";
import { formatDate, getTripDuration, getTripStatus } from "../../utils/trip";
import Badge from "./Badge";
import Card from "./Card";

const statusStyles = {
    upcoming: "bg-[#edf6d8] text-[#577733]",
    ongoing: "bg-[#e3f0e9] text-[#246b4d]",
    completed: "bg-[#f1f3ef] text-[#7a8b7e]",
    unknown: "bg-[#f8f0e2] text-[#a87942]"
};

function TripCard({ trip }) {
    const status = getTripStatus(trip.start_date, trip.end_date);
    const duration = getTripDuration(trip.start_date, trip.end_date);

    return (
        <Card as={Link} to={`/trips/${trip.id}`} interactive className="group flex h-full flex-col overflow-hidden !p-0">
            <div className="relative h-28 overflow-hidden bg-[#173d2d] p-5 text-white">
                <div className="absolute -right-8 -top-12 h-36 w-36 rounded-full border border-white/10" />
                <div className="absolute -right-3 top-7 h-20 w-20 rounded-full border border-[#d9edb8]/20" />
                <div className="relative flex items-start justify-between gap-3">
                    <div>
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#b9d3a9]">TRIP #{trip.id}</p>
                        <h2 className="mt-2 truncate text-xl font-bold">{trip.name}</h2>
                    </div>
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-white/10 text-[#d9edb8]">
                        <Compass size={22} />
                    </span>
                </div>
            </div>

            <div className="flex flex-1 flex-col p-5 sm:p-6">
                <div className="flex flex-wrap items-center gap-2">
                    <Badge className={statusStyles[status.key]}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {status.label}
                    </Badge>
                    <Badge className="bg-[#f8f0e2] text-[#a87942]">
                        <Crown size={12} />
                        {trip.role === "owner" ? "เจ้าของทริป" : "สมาชิก"}
                    </Badge>
                </div>

                <p className="mt-4 line-clamp-2 min-h-12 text-sm leading-6 text-[#7a8b7e]">
                    {trip.description || "วางแผนการเดินทางที่ดี พร้อมทุกช่วงเวลาสำคัญของคุณ"}
                </p>

                <div className="mt-5 flex items-center gap-2 text-sm font-medium text-[#52735e]">
                    <CalendarDays size={17} className="text-[#6b9355]" />
                    {formatDate(trip.start_date, { year: undefined })} – {formatDate(trip.end_date, { year: undefined })}
                </div>
                {duration > 0 && <p className="mt-1.5 pl-[25px] text-xs text-[#9aa79d]">ใช้เวลาเดินทาง {duration} วัน</p>}
            </div>

            <div className="flex items-center justify-between border-t border-[#edf0e8] px-5 py-4 text-sm font-semibold text-[#52735e] sm:px-6">
                ดูแผนทริป
                <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
            </div>
        </Card>
    );
}

export default TripCard;