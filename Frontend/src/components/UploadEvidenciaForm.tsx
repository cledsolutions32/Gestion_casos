import { useState, useEffect, useRef } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import { useAuth } from "@/lib/auth-context";
import { API_URL, getAuthHeaderOnly } from "@/lib/api";
import { title } from "@/components/primitives";

type UploadEvidenciaFormProps = {
  isOpen: boolean;
  onClose: () => void;
  casoId: string;
  onSuccess?: () => void;
};

export function UploadEvidenciaForm({
  isOpen,
  onClose,
  casoId,
  onSuccess,
}: UploadEvidenciaFormProps) {
  const { session } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Limpiar el formulario cuando se cierra el modal
  useEffect(() => {
    if (!isOpen) {
      setFile(null);
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
    const selectedFile = e.target.files?.[0];

    if (selectedFile) {
      // Validar tipo de archivo
      const allowedTypes = [
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "application/pdf",
      ];

      if (!allowedTypes.includes(selectedFile.type)) {
        setError(
          "Solo se permiten archivos de imagen (.jpg, .jpeg, .png, .gif, .webp) y PDFs (.pdf)",
        );
        setFile(null);

        return;
      }

      // Validar tamaño (10MB máximo)
      const maxSize = 10 * 1024 * 1024; // 10MB

      if (selectedFile.size > maxSize) {
        setError("El archivo no puede ser mayor a 10MB");
        setFile(null);

        return;
      }

      setFile(selectedFile);
      setError(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!file) {
      setError("Por favor selecciona un archivo.");

      return;
    }

    setIsLoading(true);
    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(`${API_URL}/cases/${casoId}/evidencias`, {
        method: "POST",
        headers: getAuthHeaderOnly(session?.access_token),
        body: formData,
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError((data?.message as string) || "Error al subir la evidencia.");
        setIsLoading(false);

        return;
      }

      // Limpiar el formulario y cerrar el modal
      setFile(null);
      setError(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }

      if (onSuccess) {
        await onSuccess();
      }

      handleClose();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Error al subir la evidencia.",
      );
      setIsLoading(false);
    } finally {
      setIsLoading(false);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return bytes + " B";
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(2) + " KB";

    return (bytes / (1024 * 1024)).toFixed(2) + " MB";
  };

  return (
    <Modal
      isDismissable={!isLoading}
      isKeyboardDismissDisabled={isLoading}
      isOpen={isOpen}
      placement="center"
      size="md"
      onClose={handleClose}
    >
      <ModalContent>
        <form onSubmit={handleSubmit}>
          <ModalHeader>
            <span className={title({ size: "lg", fontWeight: "bold" })}>
              Subir Evidencia
            </span>
          </ModalHeader>
          <ModalBody className="gap-4">
            {error && (
              <div
                className="rounded-md bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700"
                role="alert"
              >
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className={title({ size: "sm", fontWeight: "semibold" })}>
                Seleccionar archivo
              </label>
              <input
                ref={fileInputRef}
                accept="image/*,.pdf"
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-full file:border-0
                  file:text-sm file:font-semibold
                  file:bg-default-100 file:text-default-700
                  hover:file:bg-default-200
                  disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={isLoading}
                type="file"
                onChange={handleFileChange}
              />
              {file && (
                <div className="mt-2 p-3 bg-default-50 rounded-lg">
                  <p className={title({ size: "sm", fontWeight: "normal" })}>
                    <strong>Archivo seleccionado:</strong> {file.name}
                  </p>
                  <p
                    className={title({
                      size: "sm",
                      fontWeight: "normal",
                      color: "grayDark",
                    })}
                  >
                    Tamaño: {formatFileSize(file.size)} | Tipo: {file.type}
                  </p>
                </div>
              )}
              <p
                className={title({
                  size: "sm",
                  fontWeight: "normal",
                  color: "grayDark",
                })}
              >
                Formatos permitidos: JPG, PNG, GIF, WEBP, PDF (máx. 10MB)
              </p>
            </div>
          </ModalBody>
          <ModalFooter>
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
              isDisabled={!file}
              isLoading={isLoading}
              type="submit"
              variant="solid"
            >
              <span
                className={title({
                  size: "sm",
                  fontWeight: "bold",
                  color: "default",
                })}
              >
                Subir Archivo
              </span>
            </Button>
          </ModalFooter>
        </form>
      </ModalContent>
    </Modal>
  );
}
