import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "react-router-dom";

import { pharagraph, title } from "@/components/primitives";

type ResetPasswordFormProps = {
  form: { password: string; confirmPassword: string };
  error: string | null;
  isLoading: boolean;
  isDisabled: boolean;
  success: boolean;
  onFieldChange: (field: "password" | "confirmPassword", value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function ResetPasswordForm({
  form,
  error,
  isLoading,
  isDisabled,
  success,
  onFieldChange,
  onSubmit,
}: ResetPasswordFormProps) {
  if (success) {
    return (
      <div
        className="flex flex-col items-center justify-center max-w-sm border-[1px] border-[#D9D9D9] rounded-lg p-8 bg-white gap-4"
        role="status"
      >
        <div className="flex flex-col items-center justify-center w-full">
          <h1 className={title({ size: "lg", fontWeight: "bold" })}>
            Contraseña actualizada
          </h1>
          <p className={pharagraph({ size: "sm" })}>
            Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar
            sesión con tu nueva contraseña.
          </p>
        </div>
        <Button
          as={Link}
          className="w-full text-white"
          color="default"
          radius="sm"
          to="/login"
        >
          Ir al inicio de sesión
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
          Crear contraseña
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center w-full gap-4">
        {error && (
          <div
            className="w-full rounded-md bg-danger-50 border border-danger-200 px-3 py-2 text-sm text-danger-700"
            id="reset-error"
            role="alert"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col items-start justify-center w-full gap-2">
          <label className={pharagraph({ size: "sm" })} htmlFor="password">
            Contraseña
          </label>
          <Input
            aria-describedby={error ? "reset-error" : undefined}
            aria-invalid={!!error}
            autoComplete="new-password"
            id="password"
            isDisabled={isLoading}
            isInvalid={!!error}
            name="password"
            placeholder="********"
            radius="sm"
            type="password"
            value={form.password}
            variant="bordered"
            onValueChange={(value) => onFieldChange("password", value)}
          />
        </div>

        <div className="flex flex-col items-start justify-center w-full gap-2">
          <label
            className={pharagraph({ size: "sm" })}
            htmlFor="confirmPassword"
          >
            Confirmar contraseña
          </label>
          <Input
            aria-invalid={!!error}
            autoComplete="new-password"
            id="confirmPassword"
            isDisabled={isLoading}
            isInvalid={!!error}
            name="confirmPassword"
            placeholder="********"
            radius="sm"
            type="password"
            value={form.confirmPassword}
            variant="bordered"
            onValueChange={(value) => onFieldChange("confirmPassword", value)}
          />
        </div>

        <Button
          className="w-full text-white"
          color="default"
          isDisabled={isDisabled}
          isLoading={isLoading}
          radius="sm"
          type="submit"
        >
          Guardar contraseña
        </Button>

        {/* <p className={pharagraph({ size: "sm" })}>
          <Link to="/login" className="text-primary hover:underline">
            Volver al inicio de sesión
          </Link>
        </p> */}
      </div>
    </form>
  );
}
