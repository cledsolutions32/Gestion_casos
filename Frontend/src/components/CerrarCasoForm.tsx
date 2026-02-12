import { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { today, type DateValue } from "@internationalized/date";

import { useAuth } from "@/lib/auth-context";
import { API_URL, getAuthHeaders, getAuthHeaderOnly } from "@/lib/api";
import { title } from "@/components/primitives";
import { SearchIcon } from "@/components/icons";

type CerrarCasoFormProps = {
  isOpen: boolean;
  onClose: () => void;
  casoId: string;
  onSuccess?: () => void;
};

export function CerrarCasoForm({
  isOpen,
  onClose,
  casoId,
  onSuccess,
}: CerrarCasoFormProps) {
  const { session } = useAuth();
  const [fechaCierre, setFechaCierre] = useState<DateValue>(
    today("America/Bogota"),
  );
  const [descripcion, setDescripcion] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpiar el formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFechaCierre(today("America/Bogota"));
      setDescripcion("");
      setFiles([]);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }, [isOpen]);

  const handleClose = () => {
    if (!isLoading) {
      onClose();
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = Array.from(e.target.files || []);

    if (selectedFiles.length > 0) {
      // Validar tipos de archivo (imágenes y PDFs)
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];
      const invalidFiles = selectedFiles.filter(
        (file) => !allowedTypes.includes(file.type),
      );

      if (invalidFiles.length > 0) {
        setError(
          "Solo se permiten archivos de imagen (.jpg, .jpeg, .png, .gif, .webp) y PDFs (.pdf)",
        );

        return;
      }

      // Validar tamaño (10MB máximo por archivo)
      const maxSize = 10 * 1024 * 1024; // 10MB
      const oversizedFiles = selectedFiles.filter(
        (file) => file.size > maxSize,
      );

      if (oversizedFiles.length > 0) {
        setError("Los archivos no pueden ser mayores a 10MB cada uno");

        return;
      }

      setFiles(selectedFiles);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    setIsLoading(true);
    try {
      // Primero, crear una novedad con la descripción si existe
      if (descripcion.trim()) {
        try {
          await fetch(`${API_URL}/cases/${casoId}/novedades`, {
            method: "POST",
            headers: getAuthHeaders(session?.access_token),
            body: JSON.stringify({ texto: descripcion.trim() }),
          });
        } catch (err) {
          console.error("Error al crear la novedad:", err);
          // Continuar aunque falle la novedad
        }
      }

      // Subir las evidencias si hay archivos
      if (files.length > 0) {
        const uploadPromises = files.map(async (file) => {
          const formData = new FormData();

          formData.append("file", file);

          const response = await fetch(
            `${API_URL}/cases/${casoId}/evidencias`,
            {
              method: "POST",
              headers: getAuthHeaderOnly(session?.access_token),
              body: formData,
            },
          );

          if (!response.ok) {
            const data = await response.json().catch(() => ({}));

            throw new Error(
              (data?.message as string) || "Error al subir la evidencia",
            );
          }

          return response.json();
        });

        await Promise.all(uploadPromises);
      }

      // Actualizar el estado del caso a "Cerrado" y la fecha de cierre si es necesario
      // Nota: Puedes agregar un campo fecha_cierre al modelo si es necesario
      await fetch(`${API_URL}/cases/${casoId}`, {
        method: "PATCH",
        headers: getAuthHeaders(session?.access_token),
        body: JSON.stringify({ estado: "Cerrado" }),
      });

      // Limpiar el formulario y cerrar el modal
      setFechaCierre(today("America/Bogota"));
      setDescripcion("");
      setFiles([]);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onSuccess) {
        await onSuccess();
      }

      handleClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al cerrar el caso.");
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Modal
      classNames={{
        base: "bg-white",
        header: "flex items-center justify-between pb-4",
        body: "pt-6",
        footer: "pt-4",
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
              Cerrar Caso
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
                Fecha de Cierre
              </label>
              <DatePicker
                classNames={{
                  base: "w-full",
                  inputWrapper: "border-default-200",
                }}
                granularity="day"
                isDisabled={isLoading}
                labelPlacement="outside-top"
                radius="sm"
                value={fechaCierre}
                variant="bordered"
                onChange={(value) => setFechaCierre(value as DateValue)}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={title({ size: "sm", fontWeight: "normal" })}>
                Descripción
              </label>
              <Textarea
                classNames={{
                  base: "w-full",
                  input: "resize-y",
                  inputWrapper: "border-default-200",
                }}
                isDisabled={isLoading}
                minRows={4}
                placeholder="Notas Sobre Cierre de Caso"
                radius="sm"
                value={descripcion}
                variant="bordered"
                onValueChange={setDescripcion}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className={title({ size: "sm", fontWeight: "normal" })}>
                Agregar Evidencias
              </label>
              <div className="relative">
                <input
                  ref={fileInputRef}
                  multiple
                  accept="image/*,.pdf"
                  className="hidden"
                  disabled={isLoading}
                  id="file-input-evidencias"
                  type="file"
                  onChange={handleFileChange}
                />
                <label
                  className="flex items-center gap-2 w-full px-3 py-2 border border-default-200 rounded-lg cursor-pointer hover:bg-default-50 transition-colors"
                  htmlFor="file-input-evidencias"
                >
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "normal",
                      color: "grayDark",
                    })}
                  >
                    {files.length > 0
                      ? `${files.length} ${files.length === 1 ? "archivo seleccionado" : "archivos seleccionados"}`
                      : "Seleccionar Archivos"}
                  </span>
                  <div className="ml-auto">
                    <SearchIcon />
                  </div>
                </label>
              </div>
              {files.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-2">
                  {files.map((file, index) => (
                    <div
                      key={index}
                      className="px-2 py-1 bg-default-100 rounded text-sm"
                    >
                      {file.name}
                    </div>
                  ))}
                </div>
              )}
              <p
                className={title({
                  size: "sm",
                  fontWeight: "normal",
                  color: "grayDark",
                })}
              >
                Formatos permitidos: JPG, PNG, GIF, WEBP, PDF (máx. 10MB por
                archivo)
              </p>
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
                  fontWeight: "semibold",
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
                  fontWeight: "semibold",
                  color: "white",
                })}
              >
                Cerrar Caso
              </span>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
