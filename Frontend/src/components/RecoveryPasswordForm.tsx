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
        <Button as={Link} to="/login" color="default" radius="sm" className="w-full text-white">
          Volver al login
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-center justify-center max-w-md border-[1px] border-[#D9D9D9] rounded-lg p-8 bg-white gap-4"
      noValidate
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
            id="recovery-error"
            role="alert"
            className="w-full rounded-md bg-danger-50 border border-danger-200 px-3 py-2 text-sm text-danger-700"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col items-start justify-center w-full gap-2">
          <label htmlFor="email" className={pharagraph({ size: "sm" })}>
            Email
          </label>
          <Input
            id="email"
            name="email"
            type="email"
            placeholder="ejemplo@gmail.com"
            radius="sm"
            variant="bordered"
            value={form.email}
            onValueChange={(value) => onFieldChange("email", value)}
            autoComplete="email"
            isDisabled={isLoading}
            isInvalid={!!error}
            aria-invalid={!!error}
            aria-describedby={error ? "recovery-error" : undefined}
          />
        </div>

        <Button
          type="submit"
          className="w-full text-white"
          color="default"
          radius="sm"
          isLoading={isLoading}
          isDisabled={isDisabled}
          aria-busy={isLoading}
          aria-disabled={isDisabled}
        >
          {isLoading ? "Enviando..." : "Enviar enlace de recuperación"}
        </Button>

        <p className={pharagraph({ size: "sm" })}>
          <Link to="/login" className={pharagraph({ size: "sm", underline: true })}>
            Volver al login
          </Link>
        </p>
      </div>
    </form>
  );
}
