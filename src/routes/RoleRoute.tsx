import { Navigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

type Roles = ("admin" | "employee")[];

export function RoleRoute({
  allowed,
  children,
}: {
  allowed: Roles;
  children: JSX.Element;
}) {
  const { isAuthenticated, userRole, loading } = useAuth();

  if (loading) return null;

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (!allowed.includes(userRole as any)) {
    return <Navigate to="/" replace />;
  }

  return children;
}
