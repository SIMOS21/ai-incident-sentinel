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
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-200 mb-2">
            Accès Refusé
          </h2>
          <p className="text-slate-400 mb-6">
            Vous devez être administrateur pour accéder à cette page.
          </p>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-3 bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold rounded-xl"
          >
            Retour
          </button>
        </div>
      </div>
    );
  }

  return children;
}
