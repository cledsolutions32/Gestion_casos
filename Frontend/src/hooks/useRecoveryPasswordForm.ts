import { useState, useCallback, useRef } from "react";

import { useAuth } from "@/lib/auth-context";

const INITIAL_FORM = { email: "" };

export function useRecoveryPasswordForm() {
  const { resetPasswordForEmail, error, clearError } = useAuth();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const submittingRef = useRef(false);

  const handleChange = useCallback(
    (field: "email", value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      clearError();
    },
    [clearError],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      // Bloqueo síncrono: evita múltiples envíos antes de que actualice el estado
      if (submittingRef.current) return;
      if (!form.email.trim()) return;

      submittingRef.current = true;
      setIsSubmitting(true);
      clearError();
      try {
        await resetPasswordForEmail(form.email);
        setSuccess(true);
      } catch {
        // Error manejado en AuthContext
      } finally {
        submittingRef.current = false;
        setIsSubmitting(false);
      }
    },
    [form.email, resetPasswordForEmail, clearError],
  );

  const isLoading = isSubmitting;
  const isDisabled = !form.email.trim() || isLoading;

  return {
    form,
    error,
    isLoading,
    isDisabled,
    success,
    handleChange,
    handleSubmit,
  };
}
