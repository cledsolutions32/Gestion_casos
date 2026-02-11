import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Link } from "react-router-dom";

import { pharagraph, title } from "@/components/primitives";

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
      noValidate
      className="flex flex-col items-center justify-center max-w-sm border-[1px] border-[#D9D9D9] rounded-lg p-8 bg-white gap-4"
      onSubmit={onSubmit}
    >
      <div className="flex flex-col items-center justify-center w-full">
        <h1 className={title({ size: "lg", fontWeight: "bold" })}>
          Bienvenido
        </h1>
        <p className={pharagraph({ size: "sm" })}>
          Por favor ingresa tus credenciales para acceder
        </p>
      </div>

      <div className="flex flex-col items-center justify-center w-full gap-4">
        {error && (
          <div
            className="w-full rounded-md bg-danger-50 border border-danger-200 px-3 py-2 text-sm text-danger-700"
            id="login-error"
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
            aria-describedby={error ? "login-error" : undefined}
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

        <div className="flex flex-col items-start justify-center w-full gap-2">
          <label className={pharagraph({ size: "sm" })} htmlFor="password">
            Contraseña
          </label>
          <Input
            aria-invalid={!!error}
            autoComplete="current-password"
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

        <Button
          className="w-full text-white"
          color="default"
          isDisabled={isDisabled}
          isLoading={isLoading}
          radius="sm"
          type="submit"
        >
          Entrar
        </Button>
      </div>
      <Link
        className={pharagraph({ size: "sm", underline: true })}
        to="/recovery-password"
      >
        Olvide mi contraseña
      </Link>
    </form>
  );
}
