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
import TripMembers from "./pages/TripMembers";
import InviteAccept from "./pages/InviteAccept";
import AIPlanner from "./pages/AIPlanner";

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

                <Route
                    path="/invite/:token"
                    element={<InviteAccept />}
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

                    <Route
                        path="/trip-members"
                        element={<TripMembers />}
                    />

                    <Route
                        path="/trip-members/:id"
                        element={<TripMembers />}
                    />

                    <Route
                        path="/ai-planner"
                        element={<AIPlanner />}
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