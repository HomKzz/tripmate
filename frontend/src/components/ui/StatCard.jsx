const tones = {
    green: "bg-[#edf4e8] text-[#52735e]",
    lime: "bg-[#edf6d8] text-[#577733]",
    sand: "bg-[#f8f0e2] text-[#a87942]",
    blue: "bg-[#e8f1ef] text-[#427368]"
};

function StatCard({ icon: Icon, label, value, hint, tone = "green" }) {
    return (
        <div className="group rounded-2xl border border-[#e4eade] bg-white p-5 shadow-[0_8px_30px_-24px_rgba(23,61,45,0.35)] transition hover:-translate-y-0.5 hover:shadow-[0_16px_35px_-25px_rgba(23,61,45,0.5)]">
            <div className="flex items-start justify-between gap-3">
                <div>
                    <p className="text-sm font-medium text-[#7a8b7e]">{label}</p>
                    <p className="mt-2 text-3xl font-extrabold tracking-tight text-[#1d3b2e]">{value}</p>
                </div>
                <span className={`flex h-11 w-11 items-center justify-center rounded-xl ${tones[tone] || tones.green}`}>
                    <Icon size={21} />
                </span>
            </div>
            {hint && <p className="mt-3 text-xs text-[#91a094]">{hint}</p>}
        </div>
    );
}

export default StatCard;