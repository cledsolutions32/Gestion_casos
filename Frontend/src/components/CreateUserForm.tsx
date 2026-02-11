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

import { AlertCircleIcon } from "./icons";

import { pharagraph, title } from "@/components/primitives";
import { useUsers } from "@/lib/users-context";

const ROLES = [
  { key: "usuario", label: "Usuario" },
  { key: "admin", label: "Admin" },
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

export function CreateUserForm({
  isOpen,
  onOpenChange,
  userToEdit,
}: CreateUserFormProps) {
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

    const result =
      isEditMode && userToEdit
        ? await updateUser({ id: userToEdit.id, email, nombre, rol })
        : await createUser({ email, nombre, rol });

    setIsLoading(false);

    if (result.success) {
      setSuccess(true);
      setTimeout(handleClose, 2000);
    } else {
      setError(
        result.error ||
          (isEditMode
            ? "Error al actualizar usuario"
            : "Error al invitar usuario"),
      );
    }
  };

  const isDisabled = !nombre.trim() || !email.trim() || isLoading;

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      size="md"
      onClose={handleClose}
      onOpenChange={(open) => !success && onOpenChange(open)}
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
                      {isEditMode
                        ? "Usuario actualizado"
                        : "Invitación enviada"}
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
                    className="rounded-md bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700"
                    role="alert"
                  >
                    {error}
                  </div>
                )}

                <div className="flex flex-col gap-2">
                  <label
                    className={pharagraph({ size: "sm" })}
                    htmlFor="nombre"
                  >
                    Nombre
                  </label>
                  <Input
                    autoFocus
                    id="nombre"
                    isDisabled={isLoading}
                    placeholder="Ej: Juan Pérez"
                    radius="sm"
                    value={nombre}
                    variant="bordered"
                    onValueChange={setNombre}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={pharagraph({ size: "sm" })} htmlFor="email">
                    Correo
                  </label>
                  <Input
                    id="email"
                    isDisabled={isLoading}
                    placeholder="ejemplo@correo.com"
                    radius="sm"
                    type="email"
                    value={email}
                    variant="bordered"
                    onValueChange={setEmail}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className={pharagraph({ size: "sm" })} htmlFor="rol">
                    Acceso
                  </label>
                  <Select
                    aria-label="Rol del usuario"
                    id="rol"
                    isDisabled={isLoading}
                    listboxProps={{
                      className:
                        "[&_li]:!bg-transparent [&_li]:!text-[#2C2C2C] [&_li:hover]:!bg-primary [&_li:hover]:!text-[#2C2C2C]",
                    }}
                    placeholder="Selecciona un rol"
                    radius="sm"
                    selectedKeys={[rol]}
                    variant="bordered"
                    onSelectionChange={(keys) => {
                      const v = Array.from(keys)[0];

                      if (v) setRol(String(v));
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
                <span>
                  <AlertCircleIcon />
                </span>
                <p className={pharagraph({ size: "sm" })}>
                  Cuando <span className="font-bold">guardes</span> el nuevo
                  usuario, recibirá un correo electrónico para que cree su
                  contraseña y acceda a la plataforma.
                </p>
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            {!success && (
              <>
                <Button
                  className="text-white"
                  color="default"
                  isDisabled={isLoading}
                  type="button"
                  variant="solid"
                  onPress={handleClose}
                >
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "white",
                    })}
                  >
                    Cancelar
                  </span>
                </Button>
                <Button
                  className="text-default font-bold"
                  color="primary"
                  isDisabled={isDisabled}
                  isLoading={isLoading}
                  type="submit"
                >
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "brown",
                    })}
                  >
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
