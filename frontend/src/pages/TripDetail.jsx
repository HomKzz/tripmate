import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  ListChecks,
  Map,
  Plus,
  Receipt,
  Users,
  WalletCards,
} from "lucide-react";
import { tripService, itineraryService, expenseService } from "../services";
import { formatDate, getTripDuration } from "../utils/trip";
import { ExpenseModal } from "../components/trips";
import {
  Alert,
  Button,
  EmptyState,
  LoadingState,
  StatCard,
} from "../components/ui";

function TripDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [itinerary, setItinerary] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);

  async function handleExpenseCreated() {
    const response = await expenseService.getAll(id);
    setExpenses(response.data);
  }

  useEffect(() => {
    const fetchTripDetail = async () => {
      try {
        const [
          tripResponse,
          membersResponse,
          itineraryResponse,
          expensesResponse,
        ] = await Promise.all([
          tripService.getById(id),
          tripService.getMembers(id),
          itineraryService.getAll(id),
          expenseService.getAll(id),
        ]);

        setTrip(tripResponse.data.trip);
        setMembers(membersResponse.data);
        setItinerary(itineraryResponse.data);
        setExpenses(expensesResponse.data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    };

    fetchTripDetail();
  }, [id]);

  if (loading) {
    return <LoadingState label="กำลังเปิดสมุดทริปของคุณ..." />;
  }

  if (error) {
    return <Alert>{error}</Alert>;
  }

  if (!trip) {
    return (
      <EmptyState
        icon={<Map size={30} />}
        title="ไม่พบทริปนี้"
        description="ทริปอาจถูกลบไปแล้ว หรือคุณไม่มีสิทธิ์เข้าชม"
        actionLabel="กลับไปหน้าทริปของฉัน"
        onAction={() => navigate("/trips")}
      />
    );
  }

  // Total expenses
  const totalExpenses = expenses.reduce(
    (total, expense) => total + Number(expense.amount || 0),
    0,
  );

  return (
    <div className="max-w-7xl mx-auto">
      {/* Trip Header */}
      <section className="relative mb-6 overflow-hidden rounded-3xl bg-[#173d2d] p-6 text-white shadow-[0_24px_60px_-36px_rgba(23,61,45,0.7)] sm:p-8">
        <div className="absolute -right-14 -top-24 h-72 w-72 rounded-full border border-[#d9edb8]/10" />
        <div className="absolute right-20 top-12 h-32 w-32 rounded-full border border-[#d9edb8]/10" />
        <Button
          variant="ghost"
          size="sm"
          onClick={() => navigate("/trips")}
          className="relative mb-6 !px-0 !text-[#b9d3a9] hover:!bg-transparent hover:!text-white"
        >
          <ArrowLeft size={16} />
          กลับไปหน้าทริปของฉัน
        </Button>

        <div className="relative flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex min-w-0 items-start gap-4">
            <div className="flex mt-3 h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#d9edb8] text-[#173d2d]">
              <Map size={31} strokeWidth={2.1} />
            </div>
            <div className="min-w-0">
              <div className="mb-2 flex flex-wrap items-center gap-3">
                <h1 className="break-words text-2xl font-bold tracking-tight sm:text-3xl">
                  {trip.name}
                </h1>
                {/* <span className="inline-flex items-center gap-1.5 rounded-full bg-white/10 px-2.5 py-1 text-xs font-semibold text-[#d9edb8]">
                  <CheckCircle2 size={13} /> ซิงก์อยู่
                </span> */}
              </div>
              <p className="max-w-2xl text-sm leading-6 text-[#b9d3a9]">
                {trip.description ||
                  "ทุกช่วงเวลาของการเดินทาง ถูกจัดเก็บไว้ในที่เดียว"}
              </p>
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-[#c1d3c4] sm:text-sm">
                <span className="inline-flex items-center gap-1.5">
                  <CalendarDays size={15} className="text-[#d9edb8]" />
                  {formatDate(trip.start_date, { year: undefined })} –{" "}
                  {formatDate(trip.end_date, { year: undefined })}
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Users size={15} className="text-[#d9edb8]" />
                  {members.length} ท่าน
                </span>
                {/* <span>TRIP #{trip.id}</span> */}
              </div>
            </div>
          </div>
          <Button
            variant="success"
            onClick={() => setIsExpenseModalOpen(true)}
            className="w-full lg:w-auto"
          >
            <Plus size={19} />
            เพิ่มค่าใช้จ่าย
          </Button>
        </div>
      </section>

      {/* Summary Cards */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          icon={Users}
          label="เพื่อนร่วมทาง"
          value={members.length}
          hint="คนในทริปนี้"
          tone="blue"
        />
        <StatCard
          icon={ListChecks}
          label="กิจกรรมในแผน"
          value={itinerary.length}
          hint="รายการที่วางไว้"
          tone="lime"
        />
        <StatCard
          icon={WalletCards}
          label="รายการค่าใช้จ่าย"
          value={expenses.length}
          hint="รายการทั้งหมด"
          tone="sand"
        />
        <StatCard
          icon={CalendarDays}
          label="ระยะเวลาเดินทาง"
          value={`${getTripDuration(trip.start_date, trip.end_date)} วัน`}
          hint="นับจากวันเริ่มต้น"
          tone="green"
        />
      </div>

      {/* Main Content */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Members */}
        <section className="overflow-hidden rounded-2xl border border-[#e4eade] bg-white shadow-[0_12px_35px_-28px_rgba(23,61,45,0.45)]">
          <div className="flex items-center justify-between border-b border-[#edf0e8] px-5 py-5 sm:px-6">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1d3b2e]">
                <Users size={19} className="text-[#6b9355]" />
                เพื่อนร่วมทาง
              </h2>
              <p className="mt-1 text-sm text-[#91a094]">ทุกคนในทริปนี้</p>
            </div>
            <span className="rounded-full bg-[#edf4e8] px-2.5 py-1 text-xs font-semibold text-[#52735e]">
              {members.length} คน
            </span>
          </div>
          <div className="p-4 sm:p-6">
            {members.length === 0 ? (
              <p className="py-5 text-center text-sm text-[#91a094]">
                ยังไม่มีสมาชิกในทริปนี้
              </p>
            ) : (
              <div className="space-y-2">
                {members.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-3 rounded-xl p-3 transition hover:bg-[#f7f9f3]"
                  >
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf4e8] text-sm font-bold text-[#52735e]">
                      {member.name?.charAt(0)?.toUpperCase() || "?"}
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-[#365544]">
                        {member.name}
                      </p>
                      <p className="truncate text-xs text-[#91a094]">
                        {member.email}
                      </p>
                    </div>
                    {member.role && (
                      <span className="ml-auto shrink-0 rounded-full bg-[#f8f0e2] px-2.5 py-1 text-[11px] font-semibold text-[#a87942]">
                        {member.role === "owner" ? "เจ้าของ" : "สมาชิก"}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Itinerary */}
        <section className="overflow-hidden rounded-2xl border border-[#e4eade] bg-white shadow-[0_12px_35px_-28px_rgba(23,61,45,0.45)]">
          <div className="flex items-center justify-between border-b border-[#edf0e8] px-5 py-5 sm:px-6">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1d3b2e]">
                <ListChecks size={19} className="text-[#6b9355]" />
                กิจกรรมในแผน
              </h2>
              <p className="mt-1 text-sm text-[#91a094]">
                ลำดับการเดินทางของคุณ
              </p>
            </div>
            <span className="rounded-full bg-[#edf6d8] px-2.5 py-1 text-xs font-semibold text-[#577733]">
              {itinerary.length} กิจกรรม
            </span>
          </div>
          <div className="p-4 sm:p-6">
            {itinerary.length === 0 ? (
                <EmptyState 
                icon={<ListChecks size={24} className="text-[#6b9355]" />}
                title="ยังไม่มีรายการกิจกรรม"
                description="คุณสามารถเพิ่มกิจกรรมในแผนการเดินทางของคุณได้ เพื่อให้ทุกคนในทริปทราบถึงสิ่งที่ต้องทำ"
                actionLabel="เพิ่มกิจกรรม"
                onAction={() => navigate(`/trips/${id}/itinerary`)}
                />
            ) : (
              <ol className="space-y-5">
                {itinerary.map((item, index) => (
                  <li key={item.id} className="flex gap-3.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-[#edf4e8] text-xs font-bold text-[#52735e]">
                      {index + 1}
                    </span>
                    <div className="min-w-0 border-b border-[#edf0e8] pb-4 last:border-0 last:pb-0">
                      <p className="text-xs font-medium text-[#6b9355]">
                        {formatDate(item.start_datetime, { year: undefined })}
                      </p>
                      <h3 className="mt-1 font-semibold text-[#365544]">
                        {item.title}
                      </h3>
                      {item.description && (
                        <p className="mt-1 text-sm leading-6 text-[#7a8b7e]">
                          {item.description}
                        </p>
                      )}
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </div>
        </section>

        {/* Expenses */}
        <section className="overflow-hidden rounded-2xl border border-[#e4eade] bg-white shadow-[0_12px_35px_-28px_rgba(23,61,45,0.45)] lg:col-span-2">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e8] px-5 py-5 sm:px-6">
            <div>
              <h2 className="flex items-center gap-2 text-lg font-bold text-[#1d3b2e]">
                <Receipt size={19} className="text-[#6b9355]" />
                ค่าใช้จ่ายในทริป
              </h2>
              <p className="mt-1 text-sm text-[#91a094]">
                ภาพรวมรายจ่ายของทุกคนในทริป
              </p>
            </div>
            {/* <div className="text-right">
              <p className="text-xs text-[#91a094]">ยอดรวม</p>
              <p className="mt-0.5 text-xl font-extrabold text-[#246b4d]">
                <span className="mr-1 text-sm font-medium text-[#91a094]">
                  {expenses[0]?.currency || "THB"}
                </span>
                {totalExpenses.toLocaleString()}
              </p>
            </div> */}
          </div>
          <div className="p-4 sm:p-6">
            {expenses.length === 0 ? (
              <div className="py-10 text-center text-sm text-[#91a094]">
                ยังไม่มีค่าใช้จ่ายในทริปนี้
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full min-w-[560px] text-sm">
                  <thead>
                    <tr className="border-b border-[#edf0e8] text-left">
                      <th className="pb-3 font-semibold text-[#7a8b7e]">
                        รายการ
                      </th>
                      <th className="pb-3 font-semibold text-[#7a8b7e]">
                        จำนวนเงิน
                      </th>
                      <th className="pb-3 font-semibold text-[#7a8b7e]">
                        สกุลเงิน
                      </th>
                      <th className="pb-3 font-semibold text-[#7a8b7e]">
                        ผู้จ่าย
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {expenses.map((expense) => (
                      <tr
                        key={expense.id}
                        className="border-b border-[#f1f4ed] last:border-0"
                      >
                        <td className="py-4 font-semibold text-[#365544]">
                          {expense.title}
                        </td>
                        <td className="py-4 font-bold text-[#1d3b2e]">
                          {Number(expense.amount || 0).toLocaleString()}
                        </td>
                        <td className="py-4 text-[#7a8b7e]">
                          {expense.currency}
                        </td>
                        <td className="py-4 text-[#7a8b7e]">
                          {expense.paid_by_name || "ไม่ทราบ"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </section>
      </div>
      <ExpenseModal
        tripId={id}
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
        onCreated={handleExpenseCreated}
      />
    </div>
  );
}

export default TripDetail;
