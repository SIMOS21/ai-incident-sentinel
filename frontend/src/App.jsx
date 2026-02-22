import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";

// Pages
import Dashboard from "./pages/Dashboard";
import Incidents from "./pages/Incidents";
import Analytics from "./pages/Analytics";
import Settings from "./pages/Settings";
import Admin from "./pages/Admin";
import Login from "./pages/Login";

// Components
import Sidebar from "./components/Sidebar";
import Topbar from "./components/Topbar";
import ProtectedRoute from "./components/ProtectedRoute";

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          {/* Route publique - Page de connexion */}
          <Route path="/login" element={<Login />} />

          {/* Routes protégées - Nécessitent une authentification */}
          <Route
            path="/*"
            element={
              <ProtectedRoute>
                <div className="flex min-h-screen">
                  {/* Sidebar */}
                  <Sidebar />
                  
                  {/* Contenu principal */}
                  <div className="flex-1 ml-64">
                    <Topbar />
                    <div className="pt-16">
                      <Routes>
                        {/* Dashboard */}
                        <Route path="/" element={<Dashboard />} />
                        
                        {/* Incidents */}
                        <Route path="/incidents" element={<Incidents />} />
                        
                        {/* Analytics */}
                        <Route path="/analytics" element={<Analytics />} />
                        
                        {/* Settings */}
                        <Route path="/settings" element={<Settings />} />
                        
                        {/* Admin - Nécessite le rôle admin */}
                        <Route
                          path="/admin"
                          element={
                            <ProtectedRoute requireAdmin={true}>
                              <Admin />
                            </ProtectedRoute>
                          }
                        />
                      </Routes>
                    </div>
                  </div>
                </div>
              </ProtectedRoute>
            }
          />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
