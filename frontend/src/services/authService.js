/**
 * Service d'authentification Frontend
 * frontend/src/services/authService.js
 */

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/v1/auth";

export const authService = {
  /**
   * Connexion utilisateur
   */
  async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.detail || "Connexion échouée");
      }

      const data = await response.json();
      
      // Stocker le token et les infos utilisateur
      localStorage.setItem("token", data.access_token);
      localStorage.setItem("user", JSON.stringify(data.user));
      
      return data;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Déconnexion
   */
  logout() {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  },

  /**
   * Obtenir le token
   */
  getToken() {
    return localStorage.getItem("token");
  },

  /**
   * Vérifier si l'utilisateur est connecté
   */
  isAuthenticated() {
    return !!this.getToken();
  },

  /**
   * Obtenir l'utilisateur courant
   */
  getCurrentUser() {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  },

  /**
   * Vérifier si l'utilisateur est admin
   */
  isAdmin() {
    const user = this.getCurrentUser();
    return user?.role === "admin";
  },

  /**
   * Récupérer les infos utilisateur depuis l'API
   */
  async fetchCurrentUser() {
    const token = this.getToken();
    if (!token) return null;

    try {
      const response = await fetch(`${API_URL}/me`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        this.logout();
        return null;
      }

      const user = await response.json();
      localStorage.setItem("user", JSON.stringify(user));
      return user;
    } catch (error) {
      console.error("Error fetching user:", error);
      return null;
    }
  },

  /**
   * Ajouter le token aux requêtes
   */
  getAuthHeaders() {
    const token = this.getToken();
    return {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    };
  },
};
