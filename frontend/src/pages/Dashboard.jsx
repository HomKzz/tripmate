import { useEffect, useState } from "react";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Map,
  Plus,
  Receipt,
} from "lucide-react";
import { Link } from "react-router-dom";
import { expenseService, itineraryService, tripService } from "../services";
import { useAuth } from "../context/authContext";
import { formatDate, getTripStatus, parseDate } from "../utils/trip";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  LoadingState,
  PageHeader,
  StatCard,
  TripCard,
} from "../components/ui";

function formatDateTime(value) {
  const date = parseDate(value);
  if (!date) return "ยังไม่ระบุเวลา";

  return new Intl.DateTimeFormat("th-TH", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function formatAmount(amount, currency) {
  return new Intl.NumberFormat("th-TH", {
    maximumFractionDigits: 2,
  }).format(Number(amount || 0)) + ` ${currency || ""}`;
}

function Dashboard() {
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [activities, setActivities] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const tripResponse = await tripService.getAll();
        const nextTrips = tripResponse.data || [];
        const activeTrips = nextTrips.filter((trip) => getTripStatus(trip.start_date, trip.end_date).key !== "completed");

        const detailResponses = await Promise.all(
          activeTrips.map(async (trip) => {
            const [itineraryResponse, expenseResponse] = await Promise.all([
              itineraryService.getAll(trip.id),
              expenseService.getAll(trip.id),
            ]);

            return {
              trip,
              itinerary: itineraryResponse.data || [],
              expenses: expenseResponse.data || [],
            };
          }),
        );

        setTrips(nextTrips);
        setActivities(
          detailResponses
            .flatMap(({ trip, itinerary }) => itinerary.map((item) => ({ ...item, tripName: trip.name, tripId: trip.id })))
            .filter((item) => !item.start_datetime || parseDate(item.start_datetime) >= new Date())
            .sort((first, second) => (parseDate(first.start_datetime)?.getTime() || 0) - (parseDate(second.start_datetime)?.getTime() || 0))
            .slice(0, 4),
        );
        setExpenses(
          detailResponses
            .flatMap(({ trip, expenses: tripExpenses }) => tripExpenses.map((expense) => ({ ...expense, tripName: trip.name, tripId: trip.id })))
            .sort((first, second) => (parseDate(second.expense_date)?.getTime() || 0) - (parseDate(first.expense_date)?.getTime() || 0))
            .slice(0, 4),
        );
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    fetchDashboard();
  }, []);

  if (loading) return <LoadingState label="กำลังเตรียมภาพรวมการเดินทาง..." />;
  if (error) return <Alert>{error}</Alert>;

  const upcomingTrips = trips
    .filter((trip) => getTripStatus(trip.start_date, trip.end_date).key === "upcoming")
    .sort((first, second) => (parseDate(first.start_date)?.getTime() || 0) - (parseDate(second.start_date)?.getTime() || 0));
  const ongoingTrips = trips.filter((trip) => getTripStatus(trip.start_date, trip.end_date).key === "ongoing");
  const nextTrip = ongoingTrips[0] || upcomingTrips[0];
  const completedTrips = trips.filter((trip) => getTripStatus(trip.start_date, trip.end_date).key === "completed");

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={user?.name ? `สวัสดี, ${user.name}` : "ยินดีต้อนรับนักเดินทาง"}
        title="ภาพรวมการเดินทาง"
        description="ดูสิ่งสำคัญของทุกทริปได้ในหน้าเดียว"
        action={<Button as={Link} to="/trips"><Plus size={18} />จัดการทริป</Button>}
      />

      {trips.length === 0 ? (
        <EmptyState
          icon={<Map size={31} />}
          title="เริ่มต้นการเดินทางครั้งแรกของคุณ"
          description="สร้างทริปเพื่อวางแผนกิจกรรม ชวนเพื่อน และจัดการค่าใช้จ่ายไว้ด้วยกัน"
          actionLabel="เรื่มต้นการเดินทาง"
          onAction={() => window.location.assign("/trips")}
        />
      ) : (
        <>
          {nextTrip && (
            <Card className="!bg-[#244336] overflow-hidden border-0 text-white shadow-[0_24px_60px_-36px_rgba(23,61,45,0.8)]">
              <div className="relative flex flex-col gap-6 p-6 sm:p-8 lg:flex-row lg:items-center lg:justify-between">
                <div className="absolute -right-8 -top-24 h-64 w-64 rounded-full border border-[#d9edb8]/10" />
                <div className="relative">
                  <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#b9d3a9]">{ongoingTrips.length ? "กำลังเดินทาง" : "ทริปถัดไป"}</p>
                  <h2 className="mt-3 text-2xl font-extrabold sm:text-3xl">{nextTrip.name}</h2>
                  <p className="mt-2 max-w-xl text-sm leading-6 text-[#c1d3c4]">{nextTrip.description || "ทุกช่วงเวลาของการเดินทาง ถูกจัดเก็บไว้ในที่เดียว"}</p>
                  <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm text-[#d9edb8]"><span className="inline-flex items-center gap-2"><CalendarDays size={16} />{formatDate(nextTrip.start_date)} – {formatDate(nextTrip.end_date)}</span></div>
                </div>
                <Button as={Link} to={`/trips/${nextTrip.id}`} variant="success" className="relative w-full shrink-0 lg:w-auto">เปิดรายละเอียด<ArrowUpRight size={17} /></Button>
              </div>
            </Card>
          )}

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Map} label="ทริปทั้งหมด" value={trips.length} hint="ทุกแผนการเดินทางของคุณ" />
            <StatCard icon={CalendarDays} label="กำลังจะไป" value={upcomingTrips.length} hint="รอวันเริ่มต้น" tone="lime" />
            <StatCard icon={Clock3} label="กำลังเดินทาง" value={ongoingTrips.length} hint="ทริปที่กำลังดำเนินอยู่" tone="blue" />
            <StatCard icon={CheckCircle2} label="เดินทางแล้ว" value={completedTrips.length} hint="ความทรงจำที่เก็บไว้" tone="sand" />
          </div>

          <div className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_1fr]">
            <section>
              <div className="mb-4 flex items-center justify-between gap-4"><h2 className="text-xl font-bold text-[#1d3b2e]">ทริปที่กำลังจะมาถึง</h2><Link to="/trips" className="inline-flex items-center gap-1 text-sm font-semibold text-[#52735e] hover:text-[#1d3b2e]">ดูทั้งหมด <ArrowUpRight size={16} /></Link></div>
              {upcomingTrips.length > 0 ? <div className="grid gap-4 sm:grid-cols-2">{upcomingTrips.slice(0, 2).map((trip) => <TripCard key={trip.id} trip={trip} />)}</div> : <Card className="p-6"><p className="text-sm text-[#7a8b7e]">ยังไม่มีทริปที่กำลังจะมาถึง</p></Card>}
            </section>

            <section>
              <h2 className="mb-4 text-xl font-bold text-[#1d3b2e]">กิจกรรมใกล้ถึง</h2>
              <Card className="divide-y divide-[#edf0e8] p-0">
                {activities.length > 0 ? activities.map((item) => (
                  <Link key={`${item.tripId}-${item.id}`} to={`/trips/${item.tripId}`} className="block p-4 transition hover:bg-[#f7f8f2]"><div className="flex items-start gap-3"><span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#edf4e8] text-[#52735e]"><Clock3 size={17} /></span><div className="min-w-0"><p className="truncate text-sm font-semibold text-[#1d3b2e]">{item.title}</p><p className="mt-1 truncate text-xs text-[#7a8b7e]">{item.tripName}{item.location ? ` · ${item.location}` : ""}</p><p className="mt-1 text-xs font-medium text-[#6b9355]">{formatDateTime(item.start_datetime)}</p></div></div></Link>
                )) : <p className="p-6 text-sm text-[#7a8b7e]">ยังไม่มีกิจกรรมที่กำลังจะถึง</p>}
              </Card>
            </section>
          </div>

          <section>
            <h2 className="mb-4 text-xl font-bold text-[#1d3b2e]">ค่าใช้จ่ายล่าสุด</h2>
            <Card className="divide-y divide-[#edf0e8] p-0">
              {expenses.length > 0 ? expenses.map((expense) => (
                <Link key={`${expense.tripId}-${expense.id}`} to={`/trips/${expense.tripId}`} className="flex items-center justify-between gap-4 p-4 transition hover:bg-[#f7f8f2]"><span className="flex min-w-0 items-center gap-3"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-[#f8f0e2] text-[#a87942]"><Receipt size={17} /></span><span className="min-w-0"><span className="block truncate text-sm font-semibold text-[#1d3b2e]">{expense.title}</span><span className="mt-1 block truncate text-xs text-[#7a8b7e]">{expense.tripName} · {formatDate(expense.expense_date)}</span></span></span><span className="shrink-0 text-sm font-bold text-[#52735e]">{formatAmount(expense.amount, expense.currency)}</span></Link>
              )) : <p className="p-6 text-sm text-[#7a8b7e]">ยังไม่มีรายการค่าใช้จ่าย</p>}
            </Card>
          </section>
        </>
      )}
    </div>
  );
}

export default Dashboard;