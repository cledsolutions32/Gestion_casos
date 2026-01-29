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
            Tu contraseña ha sido actualizada correctamente. Ya puedes iniciar sesión con tu nueva contraseña.
          </p>
        </div>
        <Button as={Link} to="/login" color="default" radius="sm" className="w-full text-white">
          Ir al inicio de sesión
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
          Crear contraseña
        </h1>
      </div>

      <div className="flex flex-col items-center justify-center w-full gap-4">
        {error && (
          <div
            id="reset-error"
            role="alert"
            className="w-full rounded-md bg-danger-50 border border-danger-200 px-3 py-2 text-sm text-danger-700"
          >
            {error}
          </div>
        )}

        <div className="flex flex-col items-start justify-center w-full gap-2">
          <label htmlFor="password" className={pharagraph({ size: "sm" })}>
            Contraseña
          </label>
          <Input
            id="password"
            name="password"
            type="password"
            placeholder="********"
            radius="sm"
            variant="bordered"
            value={form.password}
            onValueChange={(value) => onFieldChange("password", value)}
            autoComplete="new-password"
            isDisabled={isLoading}
            isInvalid={!!error}
            aria-invalid={!!error}
            aria-describedby={error ? "reset-error" : undefined}
          />
        </div>

        <div className="flex flex-col items-start justify-center w-full gap-2">
          <label htmlFor="confirmPassword" className={pharagraph({ size: "sm" })}>
            Confirmar contraseña
          </label>
          <Input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            placeholder="********"
            radius="sm"
            variant="bordered"
            value={form.confirmPassword}
            onValueChange={(value) => onFieldChange("confirmPassword", value)}
            autoComplete="new-password"
            isDisabled={isLoading}
            isInvalid={!!error}
            aria-invalid={!!error}
          />
        </div>

        <Button
          type="submit"
          className="w-full text-white"
          color="default"
          radius="sm"
          isLoading={isLoading}
          isDisabled={isDisabled}
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
