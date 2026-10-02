import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { LoaderCircle, LockKeyhole, Mail } from "lucide-react";
import AuthLayout from "../components/auth/AuthLayout";
import { Alert, Button } from "../components/ui";
import { useAuth } from "../context/authContext";
import { login as loginUser } from "../services";

const fieldClass = "mt-2 w-full rounded-xl border border-[#dce5d7] bg-white px-4 py-3 text-sm text-[#1d3b2e] outline-none transition placeholder:text-[#a1ada3] focus:border-[#83a76c] focus:ring-4 focus:ring-[#e5efdc] disabled:bg-[#f5f7f2]";

function Login() {
    const navigate = useNavigate();
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(event) {
        event.preventDefault();
        setError("");
        setLoading(true);
        try {
            const data = await loginUser(email, password);
            login(data.data.token, data.data.user);
            navigate("/");
        } catch (requestError) {
            setError(requestError.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <AuthLayout
            title="ยินดีต้อนรับกลับ"
            description="เข้าสู่ระบบเพื่อกลับไปวางแผนการเดินทางกับเพื่อนของคุณ"
            footer={<>ยังไม่มีบัญชีใช่ไหม? <Link to="/register" className="font-bold text-[#246b4d] hover:underline">เริ่มสมัครสมาชิก</Link></>}
        >
            <form onSubmit={handleSubmit} className="space-y-5">
                {error && <Alert>{error}</Alert>}
                <div>
                    <label htmlFor="email" className="text-sm font-semibold text-[#365544]">อีเมล</label>
                    <div className="relative">
                        <Mail size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa79d]" />
                        <input id="email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" autoComplete="email" required className={`${fieldClass} pl-11`} />
                    </div>
                </div>
                <div>
                    <label htmlFor="password" className="text-sm font-semibold text-[#365544]">รหัสผ่าน</label>
                    <div className="relative">
                        <LockKeyhole size={18} className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-[#9aa79d]" />
                        <input id="password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="กรอกรหัสผ่านของคุณ" autoComplete="current-password" required className={`${fieldClass} pl-11`} />
                    </div>
                </div>
                <Button type="submit" size="lg" fullWidth disabled={loading}>
                    {loading ? <><LoaderCircle className="animate-spin" size={19} /> กำลังเข้าสู่ระบบ...</> : "เข้าสู่ระบบ"}
                </Button>
            </form>
        </AuthLayout>
    );
}

export default Login;