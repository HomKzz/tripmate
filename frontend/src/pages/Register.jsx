import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { Alert, Button } from "../components/ui";
import { register } from "../services";

const fieldClass = "mt-2 w-full rounded-xl border border-[#dce5d7] bg-white px-4 py-3 text-sm text-[#1d3b2e] outline-none transition placeholder:text-[#a1ada3] focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc]";

function Register() {
    const navigate = useNavigate();
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setSuccess("");
        setLoading(true);
        try {
            await register(name, email, password);
            setSuccess("สมัครสมาชิกสำเร็จ กำลังพาไปหน้าเข้าสู่ระบบ...");
            setTimeout(() => navigate("/login"), 1000);
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="เริ่มต้นการเดินทาง"
            description="สร้างบัญชีเพื่อเก็บแผนทริป รายการงาน และค่าใช้จ่ายไว้ในที่เดียว"
            footer={<>มีบัญชีอยู่แล้ว? <Link to="/login" className="font-bold text-[#246b4d] hover:underline">เข้าสู่ระบบ</Link></>}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && <Alert>{error}</Alert>}
                {success && <Alert variant="success">{success}</Alert>}
                <div>
                    <label htmlFor="name" className="text-sm font-semibold text-[#365544]">ชื่อที่ใช้ใน TripMate</label>
                    <div className="relative"><UserRound size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa79d]" /><input id="name" type="text" value={name} onChange={(event) => setName(event.target.value)} placeholder="เช่น สมชาย" autoComplete="name" required className={`${fieldClass} pl-11`} /></div>
                </div>
                <div>
                    <label htmlFor="email" className="text-sm font-semibold text-[#365544]">อีเมล</label>
                    <div className="relative"><Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa79d]" /><input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required className={`${fieldClass} pl-11`} /></div>
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-semibold text-[#365544]">ตั้งรหัสผ่าน</label>
                    <div className="relative"><LockKeyhole size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa79d]" /><input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="อย่างน้อย 6 ตัวอักษร" autoComplete="new-password" minLength={6} required className={`${fieldClass} pl-11`} /></div>
                </div>
                <Button type="submit" size="lg" fullWidth disabled={loading}>
                    {loading ? <><LoaderCircle className="animate-spin" size={19} /> กำลังสร้างบัญชี...</> : "สร้างบัญชี"}
                </Button>
            </form>
        </AuthLayout>
    );
}

export default Register;