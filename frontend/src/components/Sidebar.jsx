import { NavLink } from "react-router-dom";
import { useState, useEffect } from "react";
import { authService } from "../services/authService";

const navItems = [
  {
    to: "/",
    label: "Dashboard",
    exact: true,
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
    ),
  },
  {
    to: "/incidents",
    label: "Incidents",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    ),
  },
  {
    to: "/analytics",
    label: "Analytics",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    ),
  },
];

const adminItem = {
  to: "/admin",
  label: "Admin",
  badge: "CTRL",
  accent: true,
  icon: (
    <>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </>
  ),
};

const settingsItem = {
  to: "/settings",
  label: "Settings",
  icon: (
    /* Horizontal sliders / adjustments icon — distinct from Admin gear */
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
      d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 7a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  ),
};

export default function Sidebar() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    setUser(currentUser);
  }, []);

  const handleLogout = () => {
    authService.logout();
  };

  return (
    <div className="fixed left-0 top-0 h-screen w-64 bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border-r border-slate-800/60 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950 dark:border-slate-800 light:from-white light:via-gray-50 light:to-white light:border-gray-200 flex flex-col shadow-2xl z-30">

      {/* ===== Header ===== */}
      <div className="p-6 border-b border-slate-800/60 dark:border-slate-800 light:border-gray-200">
        <div className="flex items-center space-x-2.5 mb-1">
          <div className="w-8 h-8 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-md shadow-cyan-500/20 flex-shrink-0">
            <svg className="w-4.5 h-4.5 text-white w-[18px] h-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <h1 className="text-xl font-black bg-gradient-to-r from-cyan-400 via-blue-500 to-indigo-600 bg-clip-text text-transparent">
            AI Sentinel
          </h1>
        </div>
        <p className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-500 flex items-center space-x-1.5 ml-0.5">
          <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse inline-block" />
          <span>Incident Monitor</span>
        </p>
      </div>

      {/* ===== Navigation ===== */}
      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">

        {/* Main nav */}
        <div className="space-y-1">
          {navItems.map(({ to, label, icon }) => (
            <NavLink
              key={to}
              to={to}
              end={to === "/"}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                  isActive
                    ? "bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white shadow-lg shadow-cyan-500/20 backdrop-blur-sm"
                    : "text-slate-400 dark:text-slate-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-gray-100"
                }`
              }
            >
              <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {icon}
              </svg>
              <span className="font-medium text-sm">{label}</span>
            </NavLink>
          ))}
        </div>

        {/* Divider */}
        <div className="pt-3 pb-2">
          <p className="px-4 text-xs font-semibold uppercase tracking-widest text-slate-600 dark:text-slate-600 light:text-gray-400">
            System
          </p>
        </div>

        {/* Admin — only if admin role */}
        {user?.role === "admin" && (
          <NavLink
            to={adminItem.to}
            className={({ isActive }) =>
              `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-gradient-to-r from-purple-600/80 to-pink-600/80 text-white shadow-lg shadow-purple-500/20"
                  : "text-slate-400 dark:text-slate-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-gray-100"
              }`
            }
          >
            <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {adminItem.icon}
            </svg>
            <span className="font-medium text-sm flex-1">{adminItem.label}</span>
            <span className="px-1.5 py-0.5 text-xs font-bold bg-purple-500/20 text-purple-300 rounded border border-purple-500/30">
              {adminItem.badge}
            </span>
          </NavLink>
        )}

        {/* Settings */}
        <NavLink
          to={settingsItem.to}
          className={({ isActive }) =>
            `flex items-center space-x-3 px-4 py-2.5 rounded-xl transition-all duration-200 group ${
              isActive
                ? "bg-gradient-to-r from-cyan-600/80 to-blue-600/80 text-white shadow-lg shadow-cyan-500/20"
                : "text-slate-400 dark:text-slate-400 light:text-gray-600 hover:text-white dark:hover:text-white light:hover:text-gray-900 hover:bg-slate-800/60 dark:hover:bg-slate-800/60 light:hover:bg-gray-100"
            }`
          }
        >
          <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {settingsItem.icon}
          </svg>
          <span className="font-medium text-sm">{settingsItem.label}</span>
        </NavLink>
      </nav>

      {/* ===== User Footer ===== */}
      <div className="p-4 border-t border-slate-800/60 dark:border-slate-800 light:border-gray-200 space-y-3">
        {/* User info */}
        <div className="flex items-center space-x-3 px-1">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-cyan-500/20 flex-shrink-0">
            {user?.username?.charAt(0).toUpperCase() || "U"}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-slate-200 dark:text-slate-200 light:text-gray-900 truncate">
              {user?.username || "User"}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-500 light:text-gray-500 flex items-center space-x-1">
              <span className={`w-1.5 h-1.5 rounded-full inline-block ${user?.role === "admin" ? "bg-purple-400" : "bg-blue-400"}`} />
              <span className="capitalize">{user?.role || "viewer"}</span>
            </p>
          </div>
        </div>

        {/* Logout */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center space-x-2 px-4 py-2 bg-red-500/8 hover:bg-red-500/15 text-red-400 hover:text-red-300 rounded-xl transition-all border border-transparent hover:border-red-500/20"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
          <span className="text-sm font-semibold">Sign Out</span>
        </button>
      </div>
    </div>
  );
}
