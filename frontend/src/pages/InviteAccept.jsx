import { useEffect, useState } from "react";
import { Check, Link as LinkIcon, Users } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { tripService } from "../services";
import { Alert, Button, LoadingState } from "../components/ui";

function InviteAccept() {
  const { token } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [trip, setTrip] = useState(null);
  const [accepting, setAccepting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function loadInvite() {
      try {
        const response = await tripService.getInviteInfo(token);
        setTrip(response.data.trip);
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    loadInvite();
  }, [token]);

  async function handleAccept() {
    if (!user) {
      sessionStorage.setItem("pendingInvite", `/invite/${token}`);
      navigate("/login");
      return;
    }

    setAccepting(true);
    setError("");
    try {
      const response = await tripService.acceptInvite(token);
      navigate(`/trips/${response.data.tripId}`, { replace: true });
    } catch (requestError) {
      setError(requestError.message);
      setAccepting(false);
    }
  }

  if (loading) return <LoadingState label="กำลังตรวจสอบลิงก์เชิญ..." />;
  if (error) {
    return <Alert>{error}</Alert>;
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <section className="w-full max-w-lg rounded-3xl border border-[#e4eade] bg-white p-7 text-center shadow-[0_24px_60px_-36px_rgba(23,61,45,0.7)] sm:p-10">
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-[#d9edb8] text-[#173d2d]"><LinkIcon size={28} /></span>
        <p className="mt-6 text-sm font-semibold text-[#6b9355]">คำเชิญเข้าร่วมทริป</p>
        <h1 className="mt-2 text-2xl font-bold text-[#1d3b2e]">{trip.name}</h1>
        <p className="mt-3 text-sm leading-6 text-[#7a8b7e]">คุณได้รับคำเชิญให้เข้าร่วมทริปนี้ เมื่อกดยืนยันคุณจะเห็นแผนการเดินทาง สมาชิก และค่าใช้จ่ายของทริป</p>
        {trip.description && <p className="mt-4 rounded-xl bg-[#f7f8f2] px-4 py-3 text-sm text-[#52735e]">{trip.description}</p>}
        {error && <div className="mt-5 text-left"><Alert>{error}</Alert></div>}
        <div className="mt-6 flex flex-wrap justify-center gap-3 text-xs text-[#91a094]"><span className="inline-flex items-center gap-1.5"><Users size={15} /> เข้าร่วมเป็นสมาชิก</span><span className="inline-flex items-center gap-1.5"><Check size={15} /> ตอบรับได้ครั้งเดียว</span></div>
        <Button size="lg" fullWidth className="mt-7" onClick={handleAccept} disabled={accepting}>{accepting ? "กำลังเข้าร่วมทริป..." : user ? "ตอบรับคำเชิญ" : "เข้าสู่ระบบเพื่อเข้าร่วม"}</Button>
      </section>
    </div>
  );
}

export default InviteAccept;
