import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "./components/ThemeProvider";
import { Toaster } from "./components/ui/Toaster";
import PublicLayout from "./layouts/PublicLayout";
import DashboardLayout from "./layouts/DashboardLayout";
import Landing from "./pages/Landing";
import Login from "./pages/Login";
import Setup from "./pages/Setup";
import Dashboard from "./pages/Dashboard";
import Transactions from "./pages/Transactions";
import Users from "./pages/Users";
import SettingsPage from "./pages/Settings";
import ProfilePage from "./pages/Profile";
import AuditLog from "./pages/AuditLog";

const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const expiresAt = payload.exp * 1000;

    if (Date.now() >= expiresAt) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return false;
    }

    return true;
  } catch (e) {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    return false;
  }
};

const ProtectedRoute = ({ children }: { children: React.ReactElement }) => {
  if (!isAuthenticated()) {
    return <Navigate to="/" replace />;
  }
  return children;
};

function App() {
  const [checking, setChecking] = React.useState(true);
  const [needsSetup, setNeedsSetup] = React.useState(false);

  React.useEffect(() => {
    import("./lib/api").then(({ checkSetup }) => {
      checkSetup().then((isSetup) => {
        setNeedsSetup(!isSetup);
        setChecking(false);
      });
    });
  }, []);

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <ThemeProvider defaultTheme="light" storageKey="vite-ui-theme">
      <BrowserRouter>
        <Routes>
          {needsSetup ? (
            <>
              <Route path="/setup" element={<Setup />} />
              <Route path="*" element={<Navigate to="/setup" replace />} />
            </>
          ) : (
            <>
              <Route element={<PublicLayout />}>
                <Route path="/" element={<Landing />} />
              </Route>
              <Route path="/login" element={<Login />} />
              <Route path="/setup" element={<Navigate to="/login" replace />} />
              <Route element={<ProtectedRoute><DashboardLayout /></ProtectedRoute>}>
                <Route path="/dashboard" element={<Dashboard />} />
                <Route path="/transactions" element={<Transactions />} />
                <Route path="/users" element={<Users />} />
                <Route path="/settings" element={<SettingsPage />} />
                <Route path="/audit-log" element={<AuditLog />} />
                <Route path="/profile" element={<ProfilePage />} />
              </Route>
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          )}
        </Routes>
      </BrowserRouter>
      <Toaster />
    </ThemeProvider>
  );
}

export default App;
