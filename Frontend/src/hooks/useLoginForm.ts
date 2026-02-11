import { useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";

import { useAuth } from "@/lib/auth-context";

const INITIAL_FORM = { email: "", password: "" };

export function useLoginForm() {
  const { signIn, error, clearError, isLoading: authLoading } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [form, setForm] = useState(INITIAL_FORM);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ??
    "/cases";

  const handleChange = useCallback(
    (field: "email" | "password", value: string) => {
      setForm((prev) => ({ ...prev, [field]: value }));
      clearError();
    },
    [clearError],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!form.email.trim() || !form.password) return;
      setIsSubmitting(true);
      clearError();
      try {
        await signIn(form.email, form.password);
        navigate(from, { replace: true });
      } catch {
        // Error manejado en AuthContext
      } finally {
        setIsSubmitting(false);
      }
    },
    [form.email, form.password, signIn, navigate, from, clearError],
  );

  const isLoading = authLoading || isSubmitting;
  const isDisabled = !form.email.trim() || !form.password || isLoading;

  return {
    form,
    error,
    isLoading,
    isDisabled,
    handleChange,
    handleSubmit,
  };
}
