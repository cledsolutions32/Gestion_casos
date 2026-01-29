import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { Spinner } from "@heroui/spinner";

type ProtectedRouteProps = {
  children: React.ReactNode;
};

/**
 * Protege rutas que requieren autenticación.
 * Redirige a /login si no hay sesión (guardando la ruta para volver después).
 */
export function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { session, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F4F4F5]">
        <Spinner />
      </div>
    );
  }

  if (!session) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
}
