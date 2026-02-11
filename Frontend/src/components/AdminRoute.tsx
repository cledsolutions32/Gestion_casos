import { Navigate } from "react-router-dom";
import { Spinner } from "@heroui/spinner";

import { ProtectedRoute } from "@/components/ProtectedRoute";
import { useAuth } from "@/lib/auth-context";
import { useUsers } from "@/lib/users-context";

type AdminRouteProps = {
  children: React.ReactNode;
};

/**
 * Protege rutas que requieren permiso de admin.
 * Debe usarse dentro de rutas ya protegidas por autenticación.
 * Redirige a /cases si el usuario no tiene rol "admin".
 */
function AdminRouteGuard({ children }: AdminRouteProps) {
  const { user } = useAuth();
  const { users, isLoading } = useUsers();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F4F5]">
        <Spinner />
      </div>
    );
  }

  const profile = user ? users.find((u) => u.id === user.id) : null;

  if (!profile || profile.rol !== "admin") {
    return <Navigate replace to="/cases" />;
  }

  return <>{children}</>;
}

/**
 * Protege rutas que solo pueden ver usuarios con permiso "admin".
 * Redirige a /login si no hay sesión y a /cases si no es admin.
 */
export function AdminRoute({ children }: AdminRouteProps) {
  return (
    <ProtectedRoute>
      <AdminRouteGuard>{children}</AdminRouteGuard>
    </ProtectedRoute>
  );
}
