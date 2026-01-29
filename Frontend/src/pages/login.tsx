import { Navigate, useLocation } from "react-router-dom";
import LoginLayout from "@/layouts/loginLayout";
import { LoginForm } from "@/components/LoginForm";
import { useAuth } from "@/lib/auth-context";
import { useLoginForm } from "@/hooks/useLoginForm";

export default function LoginPage() {
  const { session } = useAuth();
  const location = useLocation();
  const { form, error, isLoading, isDisabled, handleChange, handleSubmit } = useLoginForm();

  const from = (location.state as { from?: { pathname: string } })?.from?.pathname ?? "/cases";

  if (session) {
    return <Navigate to={from} replace />;
  }

  return (
    <LoginLayout>
      <LoginForm
        form={form}
        error={error}
        isLoading={isLoading}
        isDisabled={isDisabled}
        onFieldChange={handleChange}
        onSubmit={handleSubmit}
      />
    </LoginLayout>
  );
}
