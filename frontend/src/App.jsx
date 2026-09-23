import {
    BrowserRouter,
    Routes,
    Route,
    Link
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";

import ProtectedRoute from "./components/ProtectedRoute";

import { useAuth } from "./context/AuthContext";

function Navigation() {
    const { user, logout } = useAuth();

    return (
        <nav>
            <Link to="/">TripMate</Link>
            {" | "}

            {user ? (
                <>
                    <Link to="/trips">
                        My Trips
                    </Link>

                    {" | "}

                    <span>
                        {user.name}
                    </span>

                    {" | "}

                    <button onClick={logout}>
                        Logout
                    </button>
                </>
            ) : (
                <>
                    <Link to="/login">
                        Login
                    </Link>

                    {" | "}

                    <Link to="/register">
                        Register
                    </Link>
                </>
            )}
        </nav>
    );
}

function App() {
    return (
        <BrowserRouter>

            <Navigation />

            <Routes>

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />

                <Route
                    path="/trips"
                    element={
                        <ProtectedRoute>
                            <Trips />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/trips/:id"
                    element={
                        <ProtectedRoute>
                            <TripDetail />
                        </ProtectedRoute>
                    }
                />

                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Trips />
                        </ProtectedRoute>
                    }
                />

            </Routes>

        </BrowserRouter>
    );
}

export default App;