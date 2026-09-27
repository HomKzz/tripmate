import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Trips from "./pages/Trips";
import TripDetail from "./pages/TripDetail";

import ProtectedRoute from "./components/ProtectedRoute";
import Layout from "./components/layout/Layout";

function App() {
    return (
        <BrowserRouter>

            <Routes>

                {/* Public pages */}

                <Route
                    path="/login"
                    element={<Login />}
                />

                <Route
                    path="/register"
                    element={<Register />}
                />


                {/* Protected pages */}

                <Route
                    element={
                        <ProtectedRoute>
                            <Layout />
                        </ProtectedRoute>
                    }
                >

                    <Route
                        path="/"
                        element={<Trips />}
                    />

                    <Route
                        path="/trips"
                        element={<Trips />}
                    />

                    <Route
                        path="/trips/:id"
                        element={<TripDetail />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;