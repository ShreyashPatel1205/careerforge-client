import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F7F5F1]">
        <p className="text-[13px] text-[#6B7080]" style={{ fontFamily: "'IBM Plex Mono', ui-monospace, monospace" }}>
          Loading…
        </p>
      </div>
    );
  }

  if (!user) return <Navigate to="/login" replace />;

  return children;
}
