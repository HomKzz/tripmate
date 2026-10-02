import { useEffect, useState } from "react";
import { ArrowLeft, Clipboard, Link2, ShieldCheck, Trash2, Users } from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useAuth } from "../context/authContext";
import { tripService } from "../services";
import {
  Alert,
  Button,
  Card,
  EmptyState,
  Grid,
  LoadingState,
  PageHeader,
  TripCard,
} from "../components/ui";

const roleLabels = {
  owner: "เจ้าของทริป",
  member: "สมาชิก",
  treasurer: "เหรัญญิกจัดการเงิน",
};

function TripMembers() {
  const { id } = useParams();
  const { user } = useAuth();
  const [trips, setTrips] = useState([]);
  const [trip, setTrip] = useState(null);
  const [members, setMembers] = useState([]);
  const [inviteUrl, setInviteUrl] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [busyUserId, setBusyUserId] = useState(null);

  const currentMember = members.find((member) => Number(member.id) === Number(user?.id));
  const isOwner = currentMember?.role === "owner";

  useEffect(() => {
    setInviteUrl("");
    setSuccess("");
    setError("");
  }, [id]);

  async function loadTripMembers() {
    const [tripResponse, membersResponse] = await Promise.all([
      tripService.getById(id),
      tripService.getMembers(id),
    ]);
    setTrip(tripResponse.data.trip);
    setMembers(membersResponse.data);
  }

  useEffect(() => {
    async function load() {
      try {
        if (!id) {
          const response = await tripService.getAll();
          setTrips(response.data);
          return;
        }
        await loadTripMembers();
      } catch (requestError) {
        setError(requestError.message);
      } finally {
        setLoading(false);
      }
    }

    load();
  }, [id]);

  async function createInvite() {
    setError("");
    setSuccess("");
    try {
      const response = await tripService.getInviteLink(id);
      setInviteUrl(response.data.inviteUrl);
      await navigator.clipboard?.writeText(response.data.inviteUrl);
      setSuccess("สร้างและคัดลอกลิงก์เชิญแล้ว");
    } catch (requestError) {
      setError(requestError.message);
    }
  }

  async function updateRole(memberId, role) {
    setBusyUserId(memberId);
    setError("");
    setSuccess("");
    try {
      await tripService.updateMemberRole(id, memberId, role);
      setMembers((current) => current.map((member) => member.id === memberId ? { ...member, role } : member));
      setSuccess("เปลี่ยน role สำเร็จ");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId(null);
    }
  }

  async function removeMember(memberId) {
    if (!window.confirm("ต้องการลบสมาชิกคนนี้ออกจากทริปหรือไม่")) return;
    setBusyUserId(memberId);
    setError("");
    setSuccess("");
    try {
      await tripService.removeMember(id, memberId);
      setMembers((current) => current.filter((member) => member.id !== memberId));
      setSuccess("ลบสมาชิกออกจากทริปแล้ว");
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setBusyUserId(null);
    }
  }

  if (loading) return <LoadingState label="กำลังโหลดสมาชิกทริป..." />;
  if (error && !id) return <Alert>{error}</Alert>;

  if (!id) {
    return (
      <div className="space-y-5">
        <PageHeader title="เชิญเพื่อนเข้าทริป" description="เลือกทริปเพื่อสร้างลิงก์เชิญและจัดการสมาชิก" />
        {trips.length === 0 ? (
          <EmptyState icon={<Users size={30} />} title="ยังไม่มีทริป" description="สร้างทริปก่อนจึงจะเชิญเพื่อนเข้าร่วมได้" />
        ) : (
          <Grid columns={{ base: 1, md: 2 }}>
            {trips.map((tripOption) => <TripCard key={tripOption.id} trip={tripOption} to={`/trip-members/${tripOption.id}`} />)}
          </Grid>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="จัดการสมาชิก"
        title={trip?.name || "สมาชิกในทริป"}
        description="สร้างลิงก์เชิญ ดูสมาชิก และกำหนดผู้จัดการเงินของทริป"
        action={<Button as={Link} to="/trip-members" variant="ghost"><ArrowLeft size={17} />เลือกทริปอื่น</Button>}
      />

      {error && <Alert>{error}</Alert>}
      {success && <Alert variant="success">{success}</Alert>}

      <Card className="p-5 sm:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div>
            <div className="flex items-center gap-2 text-lg font-bold text-[#1d3b2e]"><Link2 size={20} className="text-[#6b9355]" />ลิงก์เชิญเพื่อน</div>
            <p className="mt-1 text-sm text-[#7a8b7e]">ลิงก์มีอายุ 7 วัน และผู้รับต้องเข้าสู่ระบบก่อนเข้าร่วม</p>
          </div>
          {isOwner && <Button onClick={createInvite}><Clipboard size={17} />สร้างและคัดลอกลิงก์</Button>}
        </div>
        {inviteUrl && <div className="mt-4 break-all rounded-xl bg-[#f7f8f2] px-4 py-3 text-sm text-[#52735e]">{inviteUrl}</div>}
        {!isOwner && <p className="mt-3 text-xs text-[#91a094]">เฉพาะเจ้าของทริปเท่านั้นที่สร้างลิงก์เชิญได้</p>}
      </Card>

      <Card className="p-0">
        <div className="flex items-center justify-between border-b border-[#edf0e8] px-5 py-4 sm:px-6">
          <div><h2 className="flex items-center gap-2 font-bold text-[#1d3b2e]"><Users size={19} className="text-[#6b9355]" />สมาชิกทั้งหมด</h2><p className="mt-1 text-sm text-[#91a094]">{members.length} คนในทริปนี้</p></div>
          {isOwner && <span className="text-xs font-semibold text-[#52735e]">คุณเป็นเจ้าของทริป</span>}
        </div>
        <div className="divide-y divide-[#edf0e8]">
          {members.map((member) => {
            const isMemberOwner = member.role === "owner";
            return (
              <div key={member.id} className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:px-6">
                <div className="flex min-w-0 flex-1 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#edf4e8] font-bold text-[#52735e]">{member.name?.charAt(0)?.toUpperCase() || "?"}</span>
                  <div className="min-w-0"><p className="truncate text-sm font-semibold text-[#365544]">{member.name}</p><p className="truncate text-xs text-[#91a094]">{member.email}</p></div>
                </div>
                <div className="flex items-center gap-2 sm:ml-auto">
                  {isMemberOwner ? <span className="inline-flex items-center gap-1.5 rounded-full bg-[#f8f0e2] px-3 py-1.5 text-xs font-semibold text-[#a87942]"><ShieldCheck size={14} />{roleLabels.owner}</span> : (
                    <select value={member.role} disabled={!isOwner || busyUserId === member.id} onChange={(event) => updateRole(member.id, event.target.value)} className="rounded-lg border border-[#dce5d7] bg-white px-3 py-2 text-xs font-semibold text-[#52735e] outline-none focus:border-[#83a76c] disabled:opacity-60">
                      <option value="member">{roleLabels.member}</option>
                      <option value="treasurer">{roleLabels.treasurer}</option>
                    </select>
                  )}
                  {isOwner && !isMemberOwner && <Button variant="cancel" size="xs" onClick={() => removeMember(member.id)} disabled={busyUserId === member.id} aria-label={`ลบ ${member.name}`}><Trash2 size={15} /></Button>}
                </div>
              </div>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

export default TripMembers;
