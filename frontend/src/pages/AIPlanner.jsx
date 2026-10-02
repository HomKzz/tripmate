import { useEffect, useState } from "react";
import { CalendarDays, Check, CheckCircle2, Compass, LoaderCircle, MapPin, Sparkles, Users, WalletCards } from "lucide-react";
import { Alert, Button, PageHeader } from "../components/ui";
import { aiService, itineraryService, tripService } from "../services";

const travelStyles = ["ชิลและพักผ่อน", "กินและคาเฟ่", "ธรรมชาติ", "เที่ยวคุ้มงบ"];

function AIPlanner() {
    const [trips, setTrips] = useState([]);
    const [selectedTripId, setSelectedTripId] = useState("");
    const [form, setForm] = useState({
        destination: "",
        startDate: "",
        endDate: "",
        travelers: "2",
        budget: "",
        style: travelStyles[0],
        interests: "",
    });
    const [plan, setPlan] = useState(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSavingPlan, setIsSavingPlan] = useState(false);
    const [savingActivityKey, setSavingActivityKey] = useState("");
    const [savedActivityKeys, setSavedActivityKeys] = useState([]);
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");

    useEffect(() => {
        async function loadTrips() {
            try {
                const response = await tripService.getAll();
                setTrips(response.data);
            } catch (requestError) {
                setError(requestError.message);
            }
        }

        loadTrips();
    }, []);

    function updateField(event) {
        const { name, value } = event.target;
        setForm((current) => ({ ...current, [name]: value }));
        setError("");
        setSuccess("");
    }

    async function handleSubmit(event) {
        event.preventDefault();
        setIsSubmitting(true);
        setError("");

        try {
            const response = await aiService.createPlan(form);
            setPlan(response.data);
            setSelectedTripId("new");
            setSavedActivityKeys([]);
            setSuccess("");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    function activityKey(dayIndex, activityIndex) {
        return `${dayIndex}-${activityIndex}`;
    }

    function toDateTime(date, time, fallbackTime) {
        if (!date) return null;
        return `${date}T${time || fallbackTime}`;
    }

    function getPlanActivities() {
        return (plan?.days || []).flatMap((day, dayIndex) =>
            (day.activities || []).map((activity, activityIndex) => ({
                day,
                activity,
                dayIndex,
                activityIndex,
            })),
        );
    }

    async function createTripFromPlan() {
        if (!plan || isSavingPlan) return;

        setIsSavingPlan(true);
        setError("");
        setSuccess("");

        try {
            const tripResponse = await tripService.create({
                name: `${form.destination} ทริป`,
                description: plan.summary || "ทริปที่สร้างจากแผน AI",
                start_date: form.startDate,
                end_date: form.endDate,
            });
            const newTripId = tripResponse.data.id;
            const activities = getPlanActivities();

            for (const { day, activity } of activities) {
                await itineraryService.create(newTripId, {
                    title: activity.title,
                    description: activity.description || null,
                    location: activity.location || null,
                    start_datetime: toDateTime(day.date, activity.start_time, "09:00"),
                    end_datetime: toDateTime(day.date, activity.end_time, "10:00"),
                });
            }

            setSelectedTripId(String(newTripId));
            setSavedActivityKeys(activities.map(({ dayIndex, activityIndex }) => activityKey(dayIndex, activityIndex)));
            setSuccess(`สร้างทริป "${tripResponse.data.name}" และเพิ่มกิจกรรมทั้งหมดแล้ว`);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setIsSavingPlan(false);
        }
    }

    async function addActivity(day, activity, dayIndex, activityIndex) {
        if (!selectedTripId || selectedTripId === "new") {
            setError("กดสร้างทริปพร้อมแบบร่างก่อน หรือเลือกทริปเดิม");
            return;
        }

        const key = activityKey(dayIndex, activityIndex);
        setSavingActivityKey(key);
        setError("");

        try {
            await itineraryService.create(selectedTripId, {
                title: activity.title,
                description: activity.description || null,
                location: activity.location || null,
                start_datetime: toDateTime(day.date, activity.start_time, "09:00"),
                end_datetime: toDateTime(day.date, activity.end_time, "10:00"),
            });
            setSavedActivityKeys((current) => [...current, key]);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setSavingActivityKey("");
        }
    }

    async function addDayActivities(day, dayIndex) {
        if (!selectedTripId || selectedTripId === "new") {
            setError("กดสร้างทริปพร้อมแบบร่างก่อน หรือเลือกทริปเดิม");
            return;
        }

        const activities = day.activities || [];
        for (let activityIndex = 0; activityIndex < activities.length; activityIndex += 1) {
            const key = activityKey(dayIndex, activityIndex);
            if (!savedActivityKeys.includes(key)) {
                await addActivity(day, activities[activityIndex], dayIndex, activityIndex);
            }
        }
    }

    return (
        <div className="space-y-8">
            <PageHeader
                eyebrow="TRIPMATE AI"
                title="คิดว่าจะเที่ยวอะไรยังไงดี?"
                description="บอกความต้องการของคุณ แล้วให้ผู้ช่วยช่วยร่างแผนการเดินทางที่เหมาะกับทริปนี้"
            />

            {error && <Alert>{error}</Alert>}
            {success && <Alert variant="success">{success}</Alert>}

            <div className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)]">
                <form onSubmit={handleSubmit} className="rounded-3xl border border-[#e4eade] bg-white p-5 shadow-[0_12px_35px_-28px_rgba(23,61,45,0.45)] sm:p-7">
                    <div className="mb-6 flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#edf4e8] text-[#52735e]"><Compass size={22} /></span>
                        <div>
                            <h2 className="font-bold text-[#1d3b2e]">ข้อมูลทริป</h2>
                            <p className="mt-1 text-xs text-[#91a094]">กรอกเท่าที่รู้ ไม่จำเป็นต้องครบทุกช่อง</p>
                        </div>
                    </div>

                    <div className="space-y-5">
                        <label className="block">
                            <span className="text-sm font-semibold text-[#365544]">อยากไปที่ไหน?</span>
                            <span className="relative mt-2 block"><MapPin className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b9355]" size={18} /><input required name="destination" value={form.destination} onChange={updateField} placeholder="เช่น เชียงใหม่, โตเกียว" className="w-full rounded-xl border border-[#dce5d7] bg-white py-3 pl-11 pr-4 text-sm text-[#1d3b2e] outline-none placeholder:text-[#a1ada3] focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc]" /></span>
                        </label>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block"><span className="text-sm font-semibold text-[#365544]">วันเริ่มต้น</span><span className="relative mt-2 block"><CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b9355]" size={17} /><input required type="date" name="startDate" value={form.startDate} onChange={updateField} className="w-full rounded-xl border border-[#dce5d7] bg-white py-3 pl-11 pr-3 text-sm text-[#1d3b2e] outline-none focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc]" /></span></label>
                            <label className="block"><span className="text-sm font-semibold text-[#365544]">วันสิ้นสุด</span><span className="relative mt-2 block"><CalendarDays className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b9355]" size={17} /><input required type="date" name="endDate" value={form.endDate} onChange={updateField} className="w-full rounded-xl border border-[#dce5d7] bg-white py-3 pl-11 pr-3 text-sm text-[#1d3b2e] outline-none focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc]" /></span></label>
                        </div>

                        <div className="grid gap-4 sm:grid-cols-2">
                            <label className="block"><span className="text-sm font-semibold text-[#365544]">จำนวนคน</span><span className="relative mt-2 block"><Users className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b9355]" size={17} /><input required min="1" type="number" name="travelers" value={form.travelers} onChange={updateField} className="w-full rounded-xl border border-[#dce5d7] bg-white py-3 pl-11 pr-3 text-sm text-[#1d3b2e] outline-none focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc]" /></span></label>
                            <label className="block"><span className="text-sm font-semibold text-[#365544]">งบประมาณรวม</span><span className="relative mt-2 block"><WalletCards className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6b9355]" size={17} /><input min="0" type="number" name="budget" value={form.budget} onChange={updateField} placeholder="เช่น 10000" className="w-full rounded-xl border border-[#dce5d7] bg-white py-3 pl-11 pr-3 text-sm text-[#1d3b2e] outline-none placeholder:text-[#a1ada3] focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc]" /></span></label>
                        </div>

                        <label className="block"><span className="text-sm font-semibold text-[#365544]">สไตล์การเที่ยว</span><select name="style" value={form.style} onChange={updateField} className="mt-2 w-full rounded-xl border border-[#dce5d7] bg-white px-3 py-3 text-sm text-[#1d3b2e] outline-none focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc]">{travelStyles.map((style) => <option key={style}>{style}</option>)}</select></label>
                        <label className="block"><span className="text-sm font-semibold text-[#365544]">สิ่งที่อยากทำหรือข้อจำกัด</span><textarea name="interests" value={form.interests} onChange={updateField} rows="3" placeholder="เช่น อยากไปร้านกาแฟ ไม่เดินเยอะ อยากเที่ยวกับเด็ก" className="mt-2 w-full resize-none rounded-xl border border-[#dce5d7] bg-white px-3 py-3 text-sm text-[#1d3b2e] outline-none placeholder:text-[#a1ada3] focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc]" /></label>
                    </div>

                    <Button type="submit" size="lg" className="mt-6 w-full" disabled={isSubmitting}>
                        <Sparkles size={18} />{isSubmitting ? "กำลังสร้างแผน..." : "เริ่มสร้างแผนทริป"}
                    </Button>
                </form>

                {plan ? (
                    <section className="flex max-h-[720px] flex-col overflow-hidden rounded-3xl border border-[#e4eade] bg-white shadow-[0_12px_35px_-28px_rgba(23,61,45,0.45)]">
                        <div className="border-b border-[#edf0e8] px-6 py-5 sm:px-8">
                            <div className="flex items-center gap-2 text-[#4a763d]"><CheckCircle2 size={19} /><span className="text-xs font-bold uppercase tracking-[0.16em]">แผนร่างจาก AI</span></div>
                            <h2 className="mt-3 text-xl font-bold text-[#1d3b2e]">{plan.summary || "แผนการเดินทางของคุณ"}</h2>
                            <p className="mt-2 text-sm text-[#7a8b7e]">งบประมาณโดยประมาณ {Number(plan.estimated_total || 0).toLocaleString()} บาท</p>
                            <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                                <select value={selectedTripId} onChange={(event) => { setSelectedTripId(event.target.value); setSavedActivityKeys([]); setSuccess(""); }} className="min-w-0 flex-1 rounded-xl border border-[#dce5d7] bg-white px-3 py-2.5 text-sm text-[#1d3b2e] outline-none focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc]">
                                    <option value="new">สร้างทริปใหม่จากแบบร่าง</option>
                                    {trips.map((trip) => <option key={trip.id} value={trip.id}>เพิ่มเข้า: {trip.name}</option>)}
                                </select>
                                {selectedTripId === "new" && <Button size="sm" onClick={createTripFromPlan} disabled={isSavingPlan}>{isSavingPlan ? <><LoaderCircle className="animate-spin" size={16} />กำลังสร้างทริป...</> : "สร้างทริปพร้อมแบบร่าง"}</Button>}
                            </div>
                        </div>
                        <div className="min-h-0 flex-1 space-y-5 overflow-y-auto p-6 sm:p-8">
                            {plan.days?.map((day, dayIndex) => (
                                <div key={`${day.date || "day"}-${dayIndex}`}>
                                    <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold text-[#52735e]">วันที่ {dayIndex + 1}{day.date ? ` · ${day.date}` : ""}</h3><Button size="xs" variant="outline" onClick={() => addDayActivities(day, dayIndex)} disabled={!selectedTripId || selectedTripId === "new" || !day.activities?.length || savingActivityKey !== ""}><Check size={14} />เพิ่มทั้งวัน</Button></div>
                                    <div className="mt-3 space-y-2">
                                        {day.activities?.map((activity, activityIndex) => (
                                            <div key={`${activity.title || "activity"}-${activityIndex}`} className="rounded-xl border border-[#edf0e8] bg-[#f8faf5] p-3">
                                                <div className="flex items-start justify-between gap-3"><p className="text-sm font-semibold text-[#365544]">{activity.title}</p><span className="shrink-0 text-xs text-[#7a8b7e]">{activity.start_time}–{activity.end_time}</span></div>
                                                {activity.description && <p className="mt-1 text-xs leading-5 text-[#7a8b7e]">{activity.description}</p>}
                                                <div className="mt-2 flex items-center justify-between gap-3"><p className="text-xs font-semibold text-[#6b9355]">ประมาณ {Number(activity.estimated_cost || 0).toLocaleString()} บาท</p><Button size="xs" variant={savedActivityKeys.includes(activityKey(dayIndex, activityIndex)) ? "secondary" : "outline"} onClick={() => addActivity(day, activity, dayIndex, activityIndex)} disabled={!selectedTripId || selectedTripId === "new" || savedActivityKeys.includes(activityKey(dayIndex, activityIndex)) || savingActivityKey !== ""}>{savingActivityKey === activityKey(dayIndex, activityIndex) ? <LoaderCircle className="animate-spin" size={14} /> : savedActivityKeys.includes(activityKey(dayIndex, activityIndex)) ? <Check size={14} /> : null}{savedActivityKeys.includes(activityKey(dayIndex, activityIndex)) ? "เพิ่มแล้ว" : "เพิ่มลงแผน"}</Button></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {plan.notes?.length > 0 && <div className="rounded-xl bg-[#f8f0e2] p-4 text-xs leading-5 text-[#8f6d3d]"><p className="font-bold">คำแนะนำ</p>{plan.notes.map((note, index) => <p key={index} className="mt-1">{note}</p>)}</div>}
                        </div>
                    </section>
                ) : (
                    <aside className="relative overflow-hidden rounded-3xl bg-[#173d2d] p-6 text-white sm:p-8">
                        <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full border border-[#d9edb8]/10" />
                        <Sparkles className="relative text-[#d9edb8]" size={24} />
                        <h2 className="relative mt-6 text-2xl font-bold">แผนที่เข้ากับคุณ</h2>
                        <p className="relative mt-3 text-sm leading-6 text-[#c1d3c4]">AI จะช่วยจัดลำดับสถานที่ แบ่งเวลา และคุมงบประมาณให้เหมาะกับสไตล์ของคุณ</p>
                        <div className="relative mt-8 space-y-3 text-sm text-[#dcebd2]">
                            {["จัดแผนเที่ยวรายวัน", "คำนวณงบประมาณคร่าว ๆ", "ปรับแผนตามความชอบ", "ตรวจแผนก่อนบันทึกจริง"].map((item) => <div key={item} className="flex items-center gap-3 rounded-xl bg-white/10 px-4 py-3"><span className="h-2 w-2 rounded-full bg-[#d9edb8]" />{item}</div>)}
                        </div>
                    </aside>
                )}
            </div>
        </div>
    );
}

export default AIPlanner;
