function TextField({ label, value, placeholder = "-", className = "" }) {
    const displayValue = value === null || value === undefined || value === "" ? placeholder : value;

    return (
        <div className={className}>
            <p className="text-xs font-semibold text-[#7a8b7e]">{label}</p>
            <div className="mt-2 min-h-11 rounded-xl border border-[#e4eade] bg-[#f7f9f3] px-4 py-3 text-sm leading-5 text-[#365544]">
                {displayValue}
            </div>
        </div>
    );
}

export default TextField;
