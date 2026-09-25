import { Navigate, Outlet } from "react-router-dom";
import { useAdminAuth } from "../../context/useAdminAuth";

export function RequireAdmin() {
  const { loading, session } = useAdminAuth();

  if (loading) {
    return <p className="admin-muted">Checking admin session…</p>;
  }

  if (!session) {
    return <Navigate to="/admin/login" replace />;
  }

  return <Outlet />;
}
