import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

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
            await registerUser(name, email, password);

            setSuccess("สมัครสมาชิกสำเร็จ กำลังไปหน้า Login...");

            setTimeout(() => {
                navigate("/login");
            }, 1000);

        } catch (error) {
            setError(error.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div>
            <h1>Register</h1>

            <form onSubmit={handleSubmit}>

                <div>
                    <label>Name</label>
                    <br />

                    <input
                        type="text"
                        value={name}
                        onChange={(event) =>
                            setName(event.target.value)
                        }
                        placeholder="Your name"
                    />
                </div>

                <br />

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

                {success && (
                    <p>{success}</p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? "กำลังสมัครสมาชิก..."
                        : "Register"}
                </button>

            </form>
        </div>
    );
}

export default Register;