import { useEffect, useState } from "react";
import { ArrowLeft, Calculator, Check, Save } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { expenseService, tripService } from "../services";
import {
  Alert,
  Button,
  Grid,
  LoadingState,
  PageHeader,
  TripCard,
} from "../components/ui";

function splitEvenly(amount, members) {
  if (members.length === 0) return [];

  const totalCents = Math.round(Number(amount) * 100);
  const baseCents = Math.floor(totalCents / members.length);
  const remainder = totalCents % members.length;

  return members.map((member, index) => ({
    user_id: member.id,
    share_amount: ((baseCents + (index < remainder ? 1 : 0)) / 100).toFixed(2),
  }));
}

function ExpenseSplits() {
  const { id } = useParams();
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [expenses, setExpenses] = useState([]);
  const [splits, setSplits] = useState({});
  const [selectedExpenseId, setSelectedExpenseId] = useState(null);
  const [savingId, setSavingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const activeTripId = id;
  const isOwner = members.some(
    (member) => Number(member.id) === Number(user?.id) && member.role === "owner",
  );

  useEffect(() => {
    if (id) return;

    async function loadTrips() {
      try {
        const response = await tripService.getAll();
        setTrips(response.data);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadTrips();
  }, [id]);

  useEffect(() => {
    if (!activeTripId) {
      return;
    }

    async function loadData() {
      try {
        const [
          tripResponse,
          membersResponse,
          expensesResponse,
          splitsResponse,
        ] = await Promise.all([
          tripService.getById(activeTripId),
          tripService.getMembers(activeTripId),
          expenseService.getAll(activeTripId),
          expenseService.getSplits(activeTripId),
        ]);

        const loadedMembers = membersResponse.data;
        const loadedSplits = splitsResponse.data.reduce((result, split) => {
          if (!result[split.expense_id]) result[split.expense_id] = [];
          result[split.expense_id].push({
            user_id: split.user_id,
            share_amount: Number(split.share_amount).toFixed(2),
          });
          return result;
        }, {});

        setTrip(tripResponse.data.trip);
        setMembers(loadedMembers);
        setExpenses(expensesResponse.data);
        setSplits(loadedSplits);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [activeTripId]);

  function getExpenseSplits(expense) {
    return splits[expense.id] || [];
  }

  function updateShare(expense, userId, value) {
    if (!isOwner) return;

    setSuccess("");
    setSplits((current) => ({
      ...current,
      [expense.id]: getExpenseSplits(expense).map((split) =>
        split.user_id === userId ? { ...split, share_amount: value } : split,
      ),
    }));
  }

  function toggleMember(expense, memberId) {
    if (!isOwner) return;

    const selectedIds = new Set(
      getExpenseSplits(expense).map((split) => split.user_id),
    );
    if (selectedIds.has(memberId)) selectedIds.delete(memberId);
    else selectedIds.add(memberId);

    const selectedMembers = members.filter((member) =>
      selectedIds.has(member.id),
    );
    setSplits((current) => ({
      ...current,
      [expense.id]: splitEvenly(expense.amount, selectedMembers),
    }));
    setSuccess("");
  }

  async function saveSplits(expense) {
    if (!isOwner) return;

    setSavingId(expense.id);
    setError("");
    setSuccess("");

    try {
      const expenseSplits = getExpenseSplits(expense);
      await expenseService.saveSplits(expense.id, expenseSplits);
      setSplits((current) => ({ ...current, [expense.id]: expenseSplits }));
      setSuccess(`บันทึกการแบ่งค่าใช้จ่าย "${expense.title}" แล้ว`);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setSavingId(null);
    }
  }

  const selectedExpense =
    expenses.find((expense) => expense.id === selectedExpenseId) || expenses[0];

  if (loading) return <LoadingState label="กำลังโหลดการแบ่งค่าใช้จ่าย..." />;
  if (error && !trip && activeTripId) return <Alert>{error}</Alert>;

  return (
    <div className="mx-auto max-w-5xl">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          {id && (
            <Button
              as={Link}
              to={`/trips/${id}`}
              variant="ghost"
              size="sm"
              className="mb-4 !px-0"
            >
              <ArrowLeft size={16} /> กลับไปรายละเอียดทริป
            </Button>
          )}
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#d9edb8] text-[#173d2d]">
              <Calculator size={24} />
            </span>
            <div>
              <h1 className="text-2xl font-bold text-[#1d3b2e]">
                คิดค่าใช้จ่ายรายบุคคล
              </h1>
              <p className="mt-1 text-sm text-[#7a8b7e]">
                เลือกคนที่ต้องจ่ายในแต่ละรายการ ระบบจะหารยอดให้เท่ากัน
              </p>
            </div>
          </div>
        </div>
        {activeTripId && (
          <p className="text-sm text-[#7a8b7e]">
            สมาชิก {members.length} คน · รายการ {expenses.length} รายการ
          </p>
        )}
      </div>

      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}
      {success && (
        <div className="mb-4">
          <Alert variant="success">{success}</Alert>
        </div>
      )}

      {!activeTripId ? (
        trips.length === 0 ? (
          <div className="rounded-2xl border border-[#e4eade] bg-white p-10 text-center text-sm text-[#91a094]">
            ยังไม่มีทริปให้เลือก
          </div>
        ) : (
          <div className="space-y-5">
            <PageHeader
              title="เลือกทริป"
              description="เลือกทริปที่ต้องการคำนวณค่าใช้จ่ายรายบุคคล"
            />
            <Grid columns={{ base: 1, md: 2 }}>
              {trips.map((tripOption) => (
                <TripCard
                  key={tripOption.id}
                  trip={tripOption}
                  to={`/expense-splits/${tripOption.id}`}
                />
              ))}
            </Grid>
          </div>
        )
      ) : expenses.length === 0 ? (
        <div className="rounded-2xl border border-[#e4eade] bg-white p-10 text-center text-sm text-[#91a094]">
          ยังไม่มีค่าใช้จ่ายให้แบ่ง
        </div>
      ) : (
        <div className="grid gap-5 lg:grid-cols-[minmax(240px,0.8fr)_minmax(0,1.6fr)]">
          <section className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-[#e4eade] bg-white shadow-[0_12px_35px_-28px_rgba(23,61,45,0.45)] lg:h-[calc(100vh-310px)] lg:min-h-[420px]">
            <div className="border-b border-[#edf0e8] px-5 py-4">
              <h2 className="font-bold text-[#1d3b2e]">รายจ่ายทั้งหมด</h2>
              <p className="mt-1 text-xs text-[#91a094]">
                คลิกรายการเพื่อเลือกคนที่ต้องจ่าย
              </p>
            </div>
            <div className="min-h-0 flex-1 divide-y divide-[#edf0e8] overflow-y-auto">
              {expenses.map((expense) => {
                const saved = Boolean(splits[expense.id]?.length);
                const selected = selectedExpense?.id === expense.id;
                return (
                  <button
                    key={expense.id}
                    type="button"
                    onClick={() => setSelectedExpenseId(expense.id)}
                    className={`w-full px-5 py-4 text-left transition ${selected ? "bg-[#f0f7ea]" : "hover:bg-[#f8faf5]"}`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-[#365544]">
                          {expense.title}
                        </span>
                        <span className="mt-1 block text-sm font-bold text-[#1d3b2e]">
                          {Number(expense.amount).toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}{" "}
                          {expense.currency}
                        </span>
                      </span>
                      <span
                        className={`shrink-0 rounded-full px-2 py-1 text-[10px] font-semibold ${saved ? "bg-[#edf6d8] text-[#577733]" : "bg-[#f8f0e2] text-[#a87942]"}`}
                      >
                        {saved ? "ดำเนินการแล้ว" : "ยังไม่ได้ดำเนินการ"}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="flex h-[520px] flex-col overflow-hidden rounded-2xl border border-[#e4eade] bg-white shadow-[0_12px_35px_-28px_rgba(23,61,45,0.45)] lg:h-[calc(100vh-310px)] lg:min-h-[420px]">
            {selectedExpense &&
              (() => {
                const expenseSplits = getExpenseSplits(selectedExpense);
                const splitTotal = expenseSplits.reduce(
                  (total, split) => total + Number(split.share_amount || 0),
                  0,
                );
                const isComplete =
                  Math.abs(splitTotal - Number(selectedExpense.amount)) < 0.005;
                return (
                  <>
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0e8] px-5 py-4 sm:px-6">
                      <div>
                        <h2 className="font-bold text-[#1d3b2e]">
                          {selectedExpense.title}
                        </h2>
                        <p className="mt-1 text-sm text-[#7a8b7e]">
                          ยอดทั้งหมด{" "}
                          {Number(selectedExpense.amount).toLocaleString(
                            undefined,
                            { minimumFractionDigits: 2 },
                          )}{" "}
                          {selectedExpense.currency}
                        </p>
                      </div>
                      <Button
                        size="sm"
                        onClick={() => saveSplits(selectedExpense)}
                        disabled={
                          !isOwner ||
                          !expenseSplits.length ||
                          !isComplete ||
                          savingId === selectedExpense.id
                        }
                        title={!isOwner ? "เฉพาะเจ้าของทริปเท่านั้นที่แก้ไขได้" : undefined}
                      >
                        <Save size={16} />{" "}
                        {!isOwner
                          ? "เฉพาะเจ้าของทริป"
                          : savingId === selectedExpense.id
                            ? "กำลังบันทึก..."
                            : "บันทึก"}
                      </Button>
                    </div>
                    <div className="min-h-0 flex-1 overflow-y-auto p-5 sm:p-6">
                      {!expenseSplits.length && (
                        <p className="mb-4 rounded-xl bg-[#f8f0e2] px-4 py-3 text-sm text-[#a87942]">
                          ยังไม่ได้ดำเนินการ กรุณาเลือกคนที่ต้องจ่าย
                        </p>
                      )}
                      <div className="grid gap-3 sm:grid-cols-2">
                        {members.map((member) => {
                          const split = expenseSplits.find(
                            (item) => item.user_id === member.id,
                          );
                          const selected = Boolean(split);
                          return (
                            <label
                              key={member.id}
                              className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${selected ? "border-[#b9d3a9] bg-[#f7fbf3]" : "border-[#edf0e8] opacity-70"}`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() =>
                                  toggleMember(selectedExpense, member.id)
                                }
                                disabled={!isOwner}
                                className="sr-only"
                              />
                              <span
                                className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-md border ${selected ? "border-[#6b9355] bg-[#6b9355] text-white" : "border-[#cbd8c5] bg-white text-transparent"}`}
                              >
                                <Check size={15} />
                              </span>
                              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#edf4e8] text-sm font-bold text-[#52735e]">
                                {member.name?.charAt(0)?.toUpperCase() || "?"}
                              </span>
                              <span className="min-w-0 flex-1">
                                <span className="block truncate text-sm font-semibold text-[#365544]">
                                  {member.name}
                                </span>
                                <span className="block truncate text-xs text-[#91a094]">
                                  {member.email}
                                </span>
                              </span>
                              {selected && (
                                <input
                                  type="number"
                                  min="0.01"
                                  step="0.01"
                                  value={split.share_amount}
                                  onChange={(event) =>
                                    updateShare(
                                      selectedExpense,
                                      member.id,
                                      event.target.value,
                                    )
                                  }
                                  disabled={!isOwner}
                                  className="w-24 rounded-lg border border-[#dce5d7] px-3 py-2 text-right text-sm text-[#1d3b2e] outline-none focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc]"
                                  aria-label={`ยอดของ ${member.name}`}
                                />
                              )}
                            </label>
                          );
                        })}
                      </div>
                      <div
                        className={`mt-4 flex justify-between border-t pt-4 text-sm font-semibold ${isComplete ? "border-[#dcebd2] text-[#4a763d]" : "border-[#f3c9c4] text-[#b25147]"}`}
                      >
                        <span>รวมยอดที่แบ่ง</span>
                        <span>
                          {splitTotal.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                          })}{" "}
                          /{" "}
                          {Number(selectedExpense.amount).toLocaleString(
                            undefined,
                            { minimumFractionDigits: 2 },
                          )}{" "}
                          {selectedExpense.currency}
                        </span>
                      </div>
                    </div>
                  </>
                );
              })()}
          </section>
        </div>
      )}
    </div>
  );
}

export default ExpenseSplits;
