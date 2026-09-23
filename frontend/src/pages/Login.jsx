import { useState } from "react";
import { useNavigate } from "react-router-dom";

import { loginUser } from "../services/api";
import { useAuth } from "../context/AuthContext";

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
            const data = await loginUser(
                email,
                password
            );

            login(
                data.data.token,
                data.data.user
            );

            navigate("/trips");

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Login</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Email</label>
                    <br />

                    <input
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        placeholder="you@example.com"
                    />
                </div>

                <br />

                <div>
                    <label>Password</label>
                    <br />

                    <input
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
                        placeholder="Password"
                    />
                </div>

                <br />

                {error && (
                    <p>{error}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "กำลังเข้าสู่ระบบ..."
                        : "Login"}
                </button>

            </form>
        </div>
    );
}

export default Login;