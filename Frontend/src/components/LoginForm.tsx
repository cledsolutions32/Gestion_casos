import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { pharagraph, title } from "@/components/primitives";
import { Link } from "react-router-dom";

type LoginFormProps = {
  form: { email: string; password: string };
  error: string | null;
  isLoading: boolean;
  isDisabled: boolean;
  onFieldChange: (field: "email" | "password", value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
};

export function LoginForm({
  form,
  error,
  isLoading,
  isDisabled,
  onFieldChange,
  onSubmit,
}: LoginFormProps) {
  return (
    <form
      onSubmit={onSubmit}
      className="flex flex-col items-center justify-center max-w-sm border-[1px] border-[#D9D9D9] rounded-lg p-8 bg-white gap-4"
      noValidate
    >
      <div className="flex flex-col items-center justify-center w-full">
        <h1 className={title({ size: "lg", fontWeight: "bold" })}>Bienvenido</h1>
        <p className={pharagraph({ size: "sm" })}>
          Por favor ingresa tus credenciales para acceder
        </p>
      </div>

      <div className="flex flex-col items-center justify-center w-full gap-4">
        {error && (
          <div
            id="login-error"
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
            aria-describedby={error ? "login-error" : undefined}
          />
        </div>

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
            autoComplete="current-password"
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
          Entrar
        </Button>
      </div>
      <Link to="/recovery-password" className={pharagraph({ size: "sm", underline: true })}>Olvide mi contraseña</Link>
    </form>
  );
}
