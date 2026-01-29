import LoginLayout from "@/layouts/loginLayout";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { pharagraph, title } from "@/components/primitives";

export default function LoginPage() {
  return (
    <LoginLayout>
      <div className="flex flex-col items-center justify-center w-full max-w-md border-[1px] border-[#D9D9D9] rounded-lg p-8 bg-white gap-4">
        <div className="flex flex-col items-center justify-center w-full">
            <h1 className={title({ size: "lg", fontWeight: "bold" })}>Bienvenido</h1>
            <p className={pharagraph({ size: "sm" })}>Por favor ingresa tus credenciales para acceder</p>
        </div>
        <div className="flex flex-col items-center justify-center w-full gap-4">
            <div className="flex flex-col items-start justify-center w-full gap-2">
                <label htmlFor="email">Email</label>
                <Input type="email" placeholder="ejemplo@gmail.com" radius="sm" variant="bordered"/>
            </div>
            <div className="flex flex-col items-start justify-center w-full gap-2">
                <label htmlFor="password">Contraseña</label>
                <Input type="password" placeholder="********" radius="sm" variant="bordered" />
            </div>
            <Button className="w-full text-white" color="default" radius="sm">Entrar</Button>
        </div>
      </div>
    </LoginLayout>
  );
}