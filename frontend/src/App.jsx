import {
    BrowserRouter,
    Routes,
    Route
} from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import Trips from "./pages/Trips";
import Dashboard from "./pages/Dashboard";
import TripDetail from "./pages/TripDetail";
import ExpenseSplits from "./pages/ExpenseSplits";

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
                        element={<Dashboard />}
                    />

                    <Route
                        path="/trips"
                        element={<Trips />}
                    />

                    <Route
                        path="/trips/:id"
                        element={<TripDetail />}
                    />

                    <Route
                        path="/trips/:id/expense-splits"
                        element={<ExpenseSplits />}
                    />

                    <Route
                        path="/expense-splits"
                        element={<ExpenseSplits />}
                    />

                    <Route
                        path="/expense-splits/:id"
                        element={<ExpenseSplits />}
                    />

                </Route>

            </Routes>

        </BrowserRouter>
    );
}

export default App;