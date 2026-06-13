const Sidebar = () => {
    return (
        <aside className="w-64 h-screen bg-slate-800 text-white p-5">
            <h1 className="text-2xl font-bold mb-5">Dashboard</h1>

            <ul className="space-y-3">
                <li className="hover:text-blue-400 cursor-pointer">Home</li>
                <li className="hover:text-blue-400 cursor-pointer">Profile</li>
                <li className="hover:text-blue-400 cursor-pointer">Settings</li>
            </ul>
        </aside>
    );
};

export default Sidebar;