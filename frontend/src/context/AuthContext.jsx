import {
    useEffect,
    useState
} from "react";

import { getProfile } from "../services";
import { AuthContext } from "./authContext";

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function checkAuth() {
            const token = localStorage.getItem("token");

            if (!token) {
                setLoading(false);
                return;
            }

            try {
                const data = await getProfile();

                setUser(data.data);

            } catch (error) {
                console.error(error);

                localStorage.removeItem("token");
                localStorage.removeItem("user");

                setUser(null);

            } finally {
                setLoading(false);
            }
        }

        checkAuth();
    }, []);

    function login(token, userData) {
        localStorage.setItem("token", token);
        localStorage.setItem(
            "user",
            JSON.stringify(userData)
        );

        setUser(userData);
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");

        setUser(null);
    }

    return (
        <AuthContext.Provider
            value={{
                user,
                loading,
                login,
                logout
            }}
        >
            {children}
        </AuthContext.Provider>
    );
}