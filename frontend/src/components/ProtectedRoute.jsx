/**
 * Composant de protection des routes
 * frontend/src/components/ProtectedRoute.jsx
 */

import { Navigate } from "react-router-dom";
import { authService } from "../services/authService";

export default function ProtectedRoute({ children, requireAdmin = false }) {
  // Vérifier si l'utilisateur est authentifié
  if (!authService.isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  // Si la route nécessite admin, vérifier le rôle
  if (requireAdmin && !authService.isAdmin()) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-950">
        <div className="text-center p-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-full bg-red-500/10 border border-red-500/20 mb-4">
            <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            Access Denied
          </h2>
          <p className="text-slate-400 mb-6">
            You need administrator privileges to access this page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  return children;
}
