import { useState, useEffect } from "react";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { Select, SelectItem } from "@heroui/select";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import { title } from "@/components/primitives";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

const ESTADOS = [
  "Abierto",
  "Validando",
  "Programado",
  "En proceso",
  "Novedad",
  "Cerrado",
];

type AddNovedadFormProps = {
  isOpen: boolean;
  onClose: () => void;
  casoId: string;
  onSuccess?: () => void;
};

export function AddNovedadForm({
  isOpen,
  onClose,
  casoId,
  onSuccess,
}: AddNovedadFormProps) {
  const [texto, setTexto] = useState("");
  const [estado, setEstado] = useState<string>("Novedad");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Limpiar el formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setTexto("");
      setEstado("Novedad");
      setError(null);
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!texto.trim()) {
      setError("El texto de la novedad es obligatorio.");

      return;
    }

    setIsLoading(true);
    try {
      // Crear la novedad
      const novedadResponse = await fetch(
        `${API_URL}/cases/${casoId}/novedades`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ texto: texto.trim() }),
        },
      );

      const novedadData = await novedadResponse.json().catch(() => ({}));

      if (!novedadResponse.ok) {
        setError(
          (novedadData?.message as string) || "Error al crear la novedad.",
        );
        setIsLoading(false);

        return;
      }

      // Actualizar el estado del caso si se seleccionó un estado
      if (estado) {
        try {
          const estadoResponse = await fetch(`${API_URL}/cases/${casoId}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ estado }),
          });

          if (!estadoResponse.ok) {
            const estadoData = await estadoResponse.json().catch(() => ({}));

            console.error(
              "Error al actualizar el estado:",
              estadoData?.message,
            );
            // No lanzamos error aquí porque la novedad ya se creó exitosamente
          }
        } catch (err) {
          console.error("Error al actualizar el estado:", err);
          // No lanzamos error aquí porque la novedad ya se creó exitosamente
        }
      }

      // Limpiar el formulario y cerrar el modal
      setTexto("");
      setEstado("Novedad");
      setError(null);

      if (onSuccess) {
        await onSuccess();
      }

      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al crear la novedad.",
      );
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      classNames={{
        base: "bg-white",
        header:
          "flex items-center justify-between border-b border-default-200 pb-4",
        body: "pt-6",
        footer: "border-t border-default-200 pt-4",
      }}
      isDismissable={!isLoading}
      isKeyboardDismissDisabled={isLoading}
      isOpen={isOpen}
      placement="center"
      size="xl"
      onClose={handleClose}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <span className={title({ size: "lg", fontWeight: "bold" })}>
              Agregar Novedad
            </span>
          </ModalHeader>
          <ModalBody className="gap-6">
            {error && (
              <div
                className="rounded-md bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className={title({ size: "sm", fontWeight: "normal" })}>
                Descripción
              </label>
              <Textarea
                isRequired
                classNames={{
                  base: "w-full",
                  input: "resize-y",
                  inputWrapper: "border-default-200",
                }}
                isDisabled={isLoading}
                minRows={6}
                placeholder="Describe la novedad a reportar"
                radius="sm"
                value={texto}
                variant="bordered"
                onValueChange={setTexto}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={title({ size: "sm", fontWeight: "normal" })}>
                Cambiar estado del caso a
              </label>
              <Select
                classNames={{
                  base: "w-full",
                  trigger: "border-default-200",
                }}
                isDisabled={isLoading}
                listboxProps={{
                  className:
                    "[&_li]:!bg-transparent [&_li]:!text-[#2C2C2C] [&_li:hover]:!bg-default [&_li:hover]:!text-white",
                }}
                placeholder="Selecciona un estado"
                radius="sm"
                selectedKeys={estado ? [estado] : []}
                variant="bordered"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;

                  setEstado(selected || "Novedad");
                }}
              >
                {ESTADOS.map((estadoOption) => (
                  <SelectItem key={estadoOption}>{estadoOption}</SelectItem>
                ))}
              </Select>
            </div>
          </ModalBody>
          <ModalFooter className="flex justify-end gap-3">
            <Button
              color="default"
              isDisabled={isLoading}
              variant="solid"
              onPress={handleClose}
            >
              <span
                className={title({
                  size: "sm",
                  fontWeight: "bold",
                  color: "white",
                })}
              >
                Cancelar
              </span>
            </Button>
            <Button
              color="primary"
              isLoading={isLoading}
              type="submit"
              variant="solid"
            >
              <span
                className={title({
                  size: "sm",
                  fontWeight: "bold",
                  color: "black",
                })}
              >
                Reportar Novedad
              </span>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
