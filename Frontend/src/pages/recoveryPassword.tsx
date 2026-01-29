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
        form={form}
        error={error}
        isLoading={isLoading}
        isDisabled={isDisabled}
        success={success}
        onFieldChange={handleChange}
        onSubmit={handleSubmit}
      />
    </LoginLayout>
  );
}
