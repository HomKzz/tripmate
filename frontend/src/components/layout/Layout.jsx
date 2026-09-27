import { useState } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

function Layout() {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    return (
        <div className="min-h-screen bg-[#f7f8f2]">
            <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
            <div className="min-h-screen lg:pl-72">
                <Navbar onMenuClick={() => setIsSidebarOpen(true)} />
                <main className="px-4 py-6 sm:px-6 sm:py-8 xl:px-10">
                    <div className="mx-auto max-w-7xl"><Outlet /></div>
                </main>
            </div>
        </div>
    );
}

export default Layout;