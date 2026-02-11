import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "react-router-dom";

import { pharagraph, title } from "@/components/primitives";

type RecoveryPasswordFormProps = {
  form: { email: string };
  error: string | null;
  isLoading: boolean;
  isDisabled: boolean;
  success: boolean;
  onFieldChange: (field: "email", value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function RecoveryPasswordForm({
  form,
  error,
  isLoading,
  isDisabled,
  success,
  onFieldChange,
  onSubmit,
}: RecoveryPasswordFormProps) {
  if (success) {
    return (
      <div
        className="flex flex-col items-center justify-center max-w-sm border-[1px] border-[#D9D9D9] rounded-lg p-8 bg-white gap-4"
        role="status"
      >
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className={title({ size: "lg", fontWeight: "bold" })}>
            Revisa tu correo
          </h1>
          <p className={pharagraph({ size: "sm" })}>
            Te hemos enviado un enlace a <strong>{form.email}</strong> para
            restablecer tu contraseña.
          </p>
        </div>
        <Button
          as={Link}
          className="w-full text-white"
          color="default"
          radius="sm"
          to="/login"
        >
          Volver al login
        </Button>
      </div>
    );
  }

  return (
    <form
      noValidate
      className="flex flex-col items-center justify-center max-w-md border-[1px] border-[#D9D9D9] rounded-lg p-8 bg-white gap-4"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <h1 className={title({ size: "lg", fontWeight: "bold" })}>
          Recuperar contraseña
        </h1>
        <p className={pharagraph({ size: "sm" })}>
          Enviaremos un link para que recuperes tu contraseña
        </p>
      </div>

      <div className="flex flex-col items-center justify-center w-full gap-4">
        {error && (
          <div
            className="w-full rounded-md bg-danger-50 border border-danger-200 px-3 py-2 text-sm text-danger-700"
            id="recovery-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col items-start justify-center w-full gap-2">
          <label className={pharagraph({ size: "sm" })} htmlFor="email">
            Email
          </label>
          <Input
            aria-describedby={error ? "recovery-error" : undefined}
            aria-invalid={!!error}
            autoComplete="email"
            id="email"
            isDisabled={isLoading}
            isInvalid={!!error}
            name="email"
            placeholder="ejemplo@gmail.com"
            radius="sm"
            type="email"
            value={form.email}
            variant="bordered"
            onValueChange={(value) => onFieldChange("email", value)}
          />
        </div>

        <Button
          aria-busy={isLoading}
          aria-disabled={isDisabled}
          className="w-full text-white"
          color="default"
          isDisabled={isDisabled}
          isLoading={isLoading}
          radius="sm"
          type="submit"
        >
          {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
        </Button>

        <p className={pharagraph({ size: "sm" })}>
          <Link
            className={pharagraph({ size: "sm", underline: true })}
            to="/login"
          >
            Volver al login
          </Link>
        </p>
      </div>
    </form>
  );
}
