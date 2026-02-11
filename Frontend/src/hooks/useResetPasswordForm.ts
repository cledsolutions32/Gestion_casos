import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";

import { useAuth } from "@/lib/auth-context";

const INITIAL_FORM = { password: "", confirmPassword: "" };

export function useResetPasswordForm() {
  const { updatePassword, error, clearError } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [validationError, setValidationError] = useState<string | null>(null);

  const handleChange = useCallback(
    (field: "password" | "confirmPassword", value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      clearError();
      setValidationError(null);
    },
    [clearError],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      // Validaciones
      if (!form.password.trim()) {
        setValidationError("La contraseña es requerida");

        return;
      }

      if (form.password.length < 6) {
        setValidationError("La contraseña debe tener al menos 6 caracteres");

        return;
      }

      if (form.password !== form.confirmPassword) {
        setValidationError("Las contraseñas no coinciden");

        return;
      }

      setIsSubmitting(true);
      clearError();
      setValidationError(null);

      try {
        await updatePassword(form.password);
        setSuccess(true);
        // Opcional: cerrar sesión después de actualizar la contraseña
        setTimeout(() => {
          navigate("/login", { replace: true });
        }, 2000);
      } catch {
        // Error manejado en AuthContext
      } finally {
        setIsSubmitting(false);
      }
    },
    [form.password, form.confirmPassword, updatePassword, navigate, clearError],
  );

  const isLoading = isSubmitting;
  const displayError = validationError || error;
  const isDisabled =
    !form.password.trim() || !form.confirmPassword.trim() || isLoading;

  return {
    form,
    error: displayError,
    isLoading,
    isDisabled,
    success,
    handleChange,
    handleSubmit,
  };
}
