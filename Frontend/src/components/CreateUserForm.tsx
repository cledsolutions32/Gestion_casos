import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Select, SelectItem } from "@heroui/select";
import { pharagraph, title } from "@/components/primitives";
import { useUsers } from "@/lib/users-context";
import { AlertCircleIcon } from "./icons";

const ROLES = [
  { key: "usuario", label: "Usuario" },
  { key: "admin", label: "Admin" }
];

type UserToEdit = {
  id: string;
  email: string;
  nombre: string | null;
  rol: string;
};

type CreateUserFormProps = {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  /** Si se proporciona, el formulario se usa en modo edición (actualizar sin enviar correo) */
  userToEdit?: UserToEdit | null;
};

export function CreateUserForm({ isOpen, onOpenChange, userToEdit }: CreateUserFormProps) {
  const { createUser, updateUser } = useUsers();
  const [nombre, setNombre] = useState("");
  const [email, setEmail] = useState("");
  const [rol, setRol] = useState<string>("usuario");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const isEditMode = Boolean(userToEdit);

  useEffect(() => {
    if (userToEdit) {
      setNombre(userToEdit.nombre ?? "");
      setEmail(userToEdit.email ?? "");
      setRol(userToEdit.rol ?? "usuario");
    } else {
      setNombre("");
      setEmail("");
      setRol("usuario");
    }
    setError(null);
    setSuccess(false);
  }, [userToEdit, isOpen]);

  const handleClose = () => {
    setNombre("");
    setEmail("");
    setRol("usuario");
    setError(null);
    setSuccess(false);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    const result = isEditMode && userToEdit
      ? await updateUser({ id: userToEdit.id, email, nombre, rol })
      : await createUser({ email, nombre, rol });

    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(handleClose, 2000);
    } else {
      setError(result.error || (isEditMode ? "Error al actualizar usuario" : "Error al invitar usuario"));
    }
  };

  const isDisabled = !nombre.trim() || !email.trim() || isLoading;

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={(open) => !success && onOpenChange(open)}
      placement="center"
      size="md"
      onClose={handleClose}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <h2 className={title({ size: "lg", fontWeight: "bold" })}>
              {isEditMode ? "Editar usuario" : "Crear usuario"}
            </h2>
          </ModalHeader>
          <ModalBody className="gap-4">
            {success ? (
              <>
              <div className="flex flex-col items-center justify-center gap-2">
                <div className="flex flex-row items-center justify-center gap-2">
                  <AlertCircleIcon />
                  <p className={title({ size: "lg", fontWeight: "bold" })}>
                    {isEditMode ? "Usuario actualizado" : "Invitación enviada"}
                  </p>
                  </div>
                <div className="flex flex-col items-center justify-center gap-2">
                  <p className={pharagraph({ size: "sm" })}>
                    {isEditMode
                      ? "La información del usuario se ha actualizado correctamente."
                      : "El usuario recibirá un correo para crear su contraseña y acceder a la plataforma."}
                  </p>
                </div>
              </div>
              </>
            ) : (
              <>
                {error && (
                  <div
                    role="alert"
                    className="rounded-md bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700"
                  >
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label htmlFor="nombre" className={pharagraph({ size: "sm" })}>
                    Nombre
                  </label>
                  <Input
                    id="nombre"
                    placeholder="Ej: Juan Pérez"
                    radius="sm"
                    variant="bordered"
                    value={nombre}
                    onValueChange={setNombre}
                    isDisabled={isLoading}
                    autoFocus
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="email" className={pharagraph({ size: "sm" })}>
                    Correo
                  </label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="ejemplo@correo.com"
                    radius="sm"
                    variant="bordered"
                    value={email}
                    onValueChange={setEmail}
                    isDisabled={isLoading}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="rol" className={pharagraph({ size: "sm" })}>
                    Acceso
                  </label>
                  <Select
                    id="rol"
                    placeholder="Selecciona un rol"
                    selectedKeys={[rol]}
                    onSelectionChange={(keys) => {
                      const v = Array.from(keys)[0];
                      if (v) setRol(String(v));
                    }}
                    radius="sm"
                    variant="bordered"
                    isDisabled={isLoading}
                    aria-label="Rol del usuario"
                    listboxProps={{
                      className: "[&_li]:!bg-transparent [&_li]:!text-[#2C2C2C] [&_li:hover]:!bg-primary [&_li:hover]:!text-[#2C2C2C]",
                    }}
                  >
                    {ROLES.map((r) => (
                      <SelectItem key={r.key}>{r.label}</SelectItem>
                    ))}
                  </Select>
                </div>
              </>
            )}
            {!success && !isEditMode && (
              <div className="flex justify-center items-center gap-2 bg-[#F9FAFB] rounded-md p-4 border border-gray">
                <span><AlertCircleIcon /></span>
                <p className={pharagraph({ size: "sm" })}>
                Cuando <span className="font-bold">guardes</span> el nuevo usuario, recibirá un correo electrónico para que cree su contraseña y acceda a la plataforma.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {!success && (
              <>
              <Button
                type="button"
                variant="solid"
                color="default"
                onPress={handleClose}
                isDisabled={isLoading}
                className="text-white"
              >
                <span className={title({ size: "sm", fontWeight: "semibold", color: "white" })}>
                  Cancelar
                </span>
              </Button>
              <Button
                type="submit"
                color="primary"
                isLoading={isLoading}
                isDisabled={isDisabled}
                className="text-default font-bold"
              >
                <span className={title({ size: "sm", fontWeight: "semibold", color: "brown" })}>
                  {isEditMode ? "Guardar cambios" : "Guardar Usuario"}
                </span>
              </Button>
              </>
            )}
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
