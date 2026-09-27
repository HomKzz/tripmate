export function parseDate(date, endOfDay = false) {
    if (!date) return null;

    const value = String(date);
    const normalizedValue = /^\d{4}-\d{2}-\d{2}$/.test(value)
        ? `${value}T${endOfDay ? "23:59:59" : "00:00:00"}`
        : value;
    const parsedDate = new Date(normalizedValue);

    return Number.isNaN(parsedDate.getTime()) ? null : parsedDate;
}

export function formatDate(date, options = {}) {
    const parsedDate = parseDate(date);

    if (!parsedDate) return "ยังไม่ระบุวันที่";

    return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        ...options
    }).format(parsedDate);
}

export function getTripDuration(startDate, endDate) {
    const start = parseDate(startDate);
    const end = parseDate(endDate);

    if (!start || !end) return 0;

    return Math.max(1, Math.ceil((end - start) / 86400000) + 1);
}

export function getTripStatus(startDate, endDate) {
    const today = new Date();
    const start = parseDate(startDate);
    const end = parseDate(endDate, true);

    if (!start || !end) return { key: "unknown", label: "ยังไม่ระบุวันที่" };
    if (today < start) return { key: "upcoming", label: "กำลังจะไป" };
    if (today > end) return { key: "completed", label: "เดินทางแล้ว" };

    return { key: "ongoing", label: "กำลังเดินทาง" };
}