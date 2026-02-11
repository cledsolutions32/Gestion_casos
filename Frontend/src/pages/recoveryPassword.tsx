import LoginLayout from "@/layouts/loginLayout";
import { RecoveryPasswordForm } from "@/components/RecoveryPasswordForm";
import { useRecoveryPasswordForm } from "@/hooks/useRecoveryPasswordForm";

export default function RecoveryPasswordPage() {
  const {
    form,
    error,
    isLoading,
    isDisabled,
    success,
    handleChange,
    handleSubmit,
  } = useRecoveryPasswordForm();

  return (
    <LoginLayout>
      <RecoveryPasswordForm
        error={error}
        form={form}
        isDisabled={isDisabled}
        isLoading={isLoading}
        success={success}
        onFieldChange={handleChange}
        onSubmit={handleSubmit}
      />
    </LoginLayout>
  );
}
