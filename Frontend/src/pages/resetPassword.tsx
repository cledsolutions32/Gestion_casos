import { Navigate } from "react-router-dom";

import LoginLayout from "@/layouts/loginLayout";
import { ResetPasswordForm } from "@/components/ResetPasswordForm";
import { useResetPasswordForm } from "@/hooks/useResetPasswordForm";
import { useAuth } from "@/lib/auth-context";

export default function ResetPasswordPage() {
  const { session, isLoading } = useAuth();
  const {
    form,
    error,
    isLoading: formLoading,
    isDisabled,
    success,
    handleChange,
    handleSubmit,
  } = useResetPasswordForm();

  // Si no hay sesión y ya terminó de cargar, redirigir al login
  // (Supabase autentica automáticamente cuando hacen clic en el enlace del correo)
  if (!isLoading && !session) {
    return <Navigate replace to="/login" />;
  }

  return (
    <LoginLayout>
      <ResetPasswordForm
        error={error}
        form={form}
        isDisabled={isDisabled}
        isLoading={formLoading || isLoading}
        success={success}
        onFieldChange={handleChange}
        onSubmit={handleSubmit}
      />
    </LoginLayout>
  );
}
