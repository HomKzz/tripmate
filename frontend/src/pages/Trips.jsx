import { useEffect, useState } from "react";
import { CalendarDays, CheckCircle2, Compass, Map, Plus, Search, SlidersHorizontal } from "lucide-react";
import { tripService } from "../services";
import { getTripStatus, parseDate } from "../utils/trip";
import { Alert, Button, EmptyState, Grid, LoadingState, PageHeader, StatCard, TripCard } from "../components/ui";
import { CreateTripModal } from "../components/trips";
import { useAuth } from "../context/authContext";

function Trips() {
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortOrder, setSortOrder] = useState("start-asc");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const { user } = useAuth();

  function handleTripCreated(trip) {
    setTrips((currentTrips) => [trip, ...currentTrips]);
  }

  useEffect(() => {
    const fetchTrips = async () => {
      try {
        const response = await tripService.getAll();
        setTrips(response.data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTrips();
  }, []);

  const tripStats = trips.reduce(
    (stats, trip) => {
      const status = getTripStatus(trip.start_date, trip.end_date).key;
      stats.total += 1;
      if (status === "upcoming") stats.upcoming += 1;
      if (status === "ongoing") stats.ongoing += 1;
      if (status === "completed") stats.completed += 1;
      return stats;
    },
    { total: 0, upcoming: 0, ongoing: 0, completed: 0 }
  );

  const visibleTrips = trips
    .filter((trip) => {
      const matchesSearch = (trip.name || "")
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all"
        || getTripStatus(trip.start_date, trip.end_date).key === statusFilter;
      return matchesSearch && matchesStatus;
    })
    .sort((firstTrip, secondTrip) => {
      if (sortOrder === "name") return firstTrip.name.localeCompare(secondTrip.name);
      const firstDate = parseDate(firstTrip.start_date)?.getTime() || 0;
      const secondDate = parseDate(secondTrip.start_date)?.getTime() || 0;
      return sortOrder === "start-desc" ? secondDate - firstDate : firstDate - secondDate;
    });

  return (
    <div className="space-y-8">
      <PageHeader
        eyebrow={user?.name ? `สวัสดี, ${user.name} 👋` : "ยินดีต้อนรับนักเดินทาง"}
        title="แผนการเดินทางของคุณ"
        description="ทุกการเดินทางเริ่มต้นจากแผนที่ดี จัดเก็บรายละเอียดและความทรงจำไว้ในที่เดียว"
        action={<Button onClick={() => setIsCreateModalOpen(true)}><Plus size={18} />สร้างทริปใหม่</Button>}
      />

      {error && <Alert>{error}</Alert>}
      {loading && <LoadingState label="กำลังเปิดสมุดทริปของคุณ..." />}

      {!loading && !error && trips.length === 0 && (
        <EmptyState
          icon={<Compass size={31} />}
          title="ยังไม่มีทริปของคุณ"
          description="เริ่มสร้างทริปแรก เพื่อเก็บแผนงาน เพื่อนร่วมทาง และค่าใช้จ่ายไว้ด้วยกัน"
          actionLabel="สร้างทริปแรก"
          onAction={() => setIsCreateModalOpen(true)}
        />
      )}

      {!loading && !error && trips.length > 0 && (
        <>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            <StatCard icon={Map} label="ทริปทั้งหมด" value={tripStats.total} hint="ทุกแผนการเดินทางของคุณ" />
            <StatCard icon={CalendarDays} label="กำลังจะไป" value={tripStats.upcoming} hint="รอวันเริ่มต้น" tone="lime" />
            <StatCard icon={Map} label="กำลังเดินทาง" value={tripStats.ongoing} hint="สนุกกับทุกช่วงเวลา" tone="blue" />
            <StatCard icon={CheckCircle2} label="เดินทางแล้ว" value={tripStats.completed} hint="ความทรงจำที่เก็บไว้" tone="sand" />
          </div>

          <div className="flex flex-col gap-3 rounded-2xl border border-[#e4eade] bg-white p-3 sm:flex-row sm:items-center sm:p-4">
            <label className="relative min-w-0 flex-1">
              <span className="sr-only">ค้นหาทริป</span>
              <Search className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[#9aa79d]" size={18} />
              <input type="search" value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="ค้นหาชื่อทริป..." className="w-full rounded-xl border border-transparent bg-[#f7f8f2] py-2.5 pl-11 pr-4 text-sm text-[#1d3b2e] outline-none transition placeholder:text-[#9aa79d] focus:border-[#b6cea5] focus:bg-white focus:ring-4 focus:ring-[#edf4e8]" />
            </label>
            <div className="flex gap-3">
              <div className="relative min-w-0 flex-1 sm:flex-none">
                <SlidersHorizontal className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-[#6b9355]" size={16} />
                <select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="กรองตามสถานะ" className="w-full appearance-none rounded-xl border border-[#e4eade] bg-white py-2.5 pl-9 pr-8 text-sm font-medium text-[#52735e] outline-none focus:border-[#83a76c] focus:ring-4 focus:ring-[#edf4e8] sm:w-auto">
                  <option value="all">ทุกสถานะ</option>
                  <option value="upcoming">กำลังจะไป</option>
                  <option value="ongoing">กำลังเดินทาง</option>
                  <option value="completed">เดินทางแล้ว</option>
                </select>
              </div>
              <select value={sortOrder} onChange={(event) => setSortOrder(event.target.value)} aria-label="เรียงลำดับทริป" className="min-w-0 flex-1 rounded-xl border border-[#e4eade] bg-white px-3 py-2.5 text-sm font-medium text-[#52735e] outline-none focus:border-[#83a76c] focus:ring-4 focus:ring-[#edf4e8] sm:flex-none">
                <option value="start-asc">วันเริ่มใกล้ที่สุด</option>
                <option value="start-desc">วันเริ่มไกลที่สุด</option>
                <option value="name">ชื่อ ก–ฮ</option>
              </select>
            </div>
          </div>

          {visibleTrips.length === 0 ? (
            <EmptyState size="md" icon={<Search size={29} />} title="ไม่พบทริปที่ค้นหา" description="ลองเปลี่ยนคำค้นหาหรือตัวกรองสถานะ แล้วลองอีกครั้ง" />
          ) : (
            <Grid columns={{ base: 1, md: 2 }}>
              {visibleTrips.map((trip) => <TripCard key={trip.id} trip={trip} />)}
            </Grid>
          )}
        </>
      )}

      <CreateTripModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreated={handleTripCreated}
      />
    </div>
  );
}

export default Trips;
