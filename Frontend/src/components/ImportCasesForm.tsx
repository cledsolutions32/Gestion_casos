import { useState, useRef, useCallback } from "react";
import { Button } from "@heroui/button";
import {
  Modal,
  ModalContent,
  ModalBody,
  ModalFooter,
  ModalHeader,
} from "@heroui/modal";
import { Spinner } from "@heroui/spinner";

import { AlertCircleIcon, FileIcon } from "./icons";

import { API_URL, getAuthHeaderOnly } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useCases } from "@/lib/cases-context";
import { pharagraph, title } from "@/components/primitives";

type ImportCasesFormProps = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
};

export function ImportCasesForm({
  isOpen,
  onClose,
  onSuccess,
}: ImportCasesFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [importResult, setImportResult] = useState<{
    success: number;
    skipped: number;
    errors: number;
    totalRows: number;
    validCasesFound: number;
    created?: number;
    updated?: number;
    errorMessages: string[];
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();
  const { refreshCases } = useCases();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (file) {
      // Validar extensión
      const validExtensions = [".xlsx", ".xls"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (!validExtensions.includes(fileExtension)) {
        setError("Solo se permiten archivos Excel (.xlsx, .xls)");
        setSelectedFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        return;
      }
      setError(null);
      setSelectedFile(file);
    } else {
      setSelectedFile(null);
    }
  };

  const handleSubmit = async () => {
    const file = selectedFile || fileInputRef.current?.files?.[0];

    if (!file) {
      setError("Por favor selecciona un archivo Excel");

      return;
    }

    setIsLoading(true);
    setError(null);
    setSuccess(false);
    setImportResult(null);

    try {
      const formData = new FormData();

      formData.append("file", file);

      const response = await fetch(`${API_URL}/cases/import`, {
        method: "POST",
        headers: getAuthHeaderOnly(session?.access_token),
        body: formData,
      }).catch((fetchError) => {
        // Error de red o conexión
        throw new Error(
          fetchError.message === "Failed to fetch"
            ? `No se pudo conectar con el servidor. Verifica que el backend esté corriendo en ${API_URL}`
            : `Error de conexión: ${fetchError.message}`,
        );
      });

      const data = await response.json().catch(() => {
        // Si la respuesta no es JSON, intentar obtener el texto
        return { message: `Error ${response.status}: ${response.statusText}` };
      });

      if (!response.ok) {
        setError((data?.message as string) || "Error al importar los casos");
        if (data?.errors && Array.isArray(data.errors)) {
          setImportResult({
            success: 0,
            skipped: 0,
            errors: data.errors.length,
            totalRows: data.summary?.totalRows || 0,
            validCasesFound: data.summary?.validCasesFound || 0,
            errorMessages: data.errors,
          });
        }

        return;
      }

      // Éxito
      setSuccess(true);
      setImportResult({
        success: data.summary?.success || 0,
        skipped: data.summary?.skipped || 0,
        errors: data.summary?.errors || 0,
        totalRows: data.summary?.totalRows || 0,
        validCasesFound: data.summary?.validCasesFound || 0,
        created: data.summary?.created || 0,
        updated: data.summary?.updated || 0,
        errorMessages: data.errors || [],
      });

      // Refrescar la lista de casos
      if (refreshCases) {
        await refreshCases();
      }

      // Limpiar el input de archivo y el estado
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    } catch (err) {
      console.error("Error al importar:", err);
      const errorMessage =
        err instanceof Error ? err.message : "Error al importar los casos";

      setError(errorMessage);

      // Si es un error de conexión, dar más información
      if (
        errorMessage.includes("conectar") ||
        errorMessage.includes("Failed to fetch")
      ) {
        setError(
          `${errorMessage}. Asegúrate de que el backend esté corriendo en ${API_URL}`,
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleClose = () => {
    if (!isLoading) {
      const wasSuccess = success;

      setError(null);
      setSuccess(false);
      setImportResult(null);
      setSelectedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
      onClose();
      // Si se cerró después de una importación exitosa, llamar a onSuccess para refrescar la lista
      if (wasSuccess && onSuccess) {
        onSuccess();
      }
    }
  };

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();

    const file = e.dataTransfer.files?.[0];

    if (file) {
      const validExtensions = [".xlsx", ".xls"];
      const fileExtension = file.name
        .toLowerCase()
        .substring(file.name.lastIndexOf("."));

      if (!validExtensions.includes(fileExtension)) {
        setError("Solo se permiten archivos Excel (.xlsx, .xls)");
        setSelectedFile(null);

        return;
      }
      setError(null);
      setSelectedFile(file);
      if (fileInputRef.current) {
        const dataTransfer = new DataTransfer();

        dataTransfer.items.add(file);
        fileInputRef.current.files = dataTransfer.files;
      }
    }
  }, []);

  const handleFileClick = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveFile = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedFile(null);
    setError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      scrollBehavior="inside"
      size="2xl"
      onClose={handleClose}
    >
      <ModalContent>
        {() => (
          <>
            <ModalHeader>
              <span className={title({ size: "lg", fontWeight: "bold" })}>
                Importar Casos
              </span>
            </ModalHeader>

            <ModalBody>
              {isLoading ? (
                <div className="bg-white rounded-lg border border-default-200 p-8 flex flex-col items-center justify-center text-center">
                  <div className="bg-yellow-400 rounded-full p-4 mb-4 shadow-md flex items-center justify-center">
                    <Spinner color="default" size="md" variant="spinner" />
                  </div>
                  <p className={title({ size: "md", fontWeight: "bold" })}>
                    Cargando Casos
                  </p>
                  <p
                    className={`${pharagraph({ size: "sm", color: "default" })} mt-2`}
                  >
                    Esto puede tardar un momento.
                  </p>
                </div>
              ) : success && importResult ? (
                <div className="flex flex-col gap-4">
                  <div
                    className={`flex items-center gap-2 ${importResult.success > 0 ? "text-success" : "text-warning"}`}
                  >
                    <AlertCircleIcon />
                    <p className={title({ size: "md", fontWeight: "bold" })}>
                      {importResult.success > 0
                        ? "Importación completada"
                        : "Importación completada con errores"}
                    </p>
                  </div>
                  <div className="space-y-2">
                    <p className={pharagraph({ size: "sm" })}>
                      <strong>Resumen de la importación:</strong>
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      <li>
                        Total de filas procesadas: {importResult.totalRows}
                      </li>
                      <li>
                        Casos válidos encontrados:{" "}
                        {importResult.validCasesFound}
                      </li>
                      {importResult.created !== undefined &&
                        importResult.created > 0 && (
                          <li className="text-success">
                            Casos creados: {importResult.created}
                          </li>
                        )}
                      {importResult.updated !== undefined &&
                        importResult.updated > 0 && (
                          <li className="text-primary">
                            Casos actualizados: {importResult.updated}
                          </li>
                        )}
                      {importResult.skipped > 0 && (
                        <li className="text-warning">
                          Casos omitidos (sin cambios): {importResult.skipped}
                        </li>
                      )}
                      {importResult.errors > 0 && (
                        <li className="text-danger">
                          Errores: {importResult.errors}
                        </li>
                      )}
                    </ul>
                    {importResult.errorMessages.length > 0 && (
                      <div className="mt-4">
                        <p className={pharagraph({ size: "sm" })}>
                          <strong>
                            Detalles de errores (
                            {importResult.errorMessages.length}):
                          </strong>
                        </p>
                        <div className="max-h-60 overflow-y-auto mt-2 p-3 bg-danger-50 border border-danger-200 rounded text-xs">
                          <ul className="list-disc list-inside space-y-1">
                            {importResult.errorMessages.map((msg, idx) => (
                              <li key={idx} className="break-words">
                                {msg}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col gap-4">
                  {error && (
                    <div
                      className="rounded-md bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700"
                      role="alert"
                    >
                      {error}
                    </div>
                  )}

                  {/* Área de drag and drop */}
                  {selectedFile ? (
                    <div className="bg-white rounded-lg border border-default-200 p-8 flex flex-col items-center justify-center text-center">
                      <div className="bg-yellow-400 rounded-full p-4 mb-4 shadow-md flex items-center justify-center">
                        <FileIcon />
                      </div>
                      <p
                        className={pharagraph({ size: "sm", color: "default" })}
                      >
                        Archivo Cargado
                      </p>
                      <p
                        className={`${title({ size: "md", fontWeight: "bold" })} mt-2 mb-4`}
                      >
                        {selectedFile.name}
                      </p>
                      <button
                        className="text-red underline text-sm hover:text-danger-600 transition-colors"
                        type="button"
                        onClick={handleRemoveFile}
                      >
                        Quitar Archivo
                      </button>
                    </div>
                  ) : (
                    <div
                      className={`
                        min-h-[250px] flex items-center justify-center relative border-2 border-dashed rounded-lg p-12 cursor-pointer
                        transition-colors border-default-300 hover:border-primary hover:bg-default-50
                        ${isLoading ? "opacity-50 cursor-not-allowed" : ""}
                      `}
                      onClick={handleFileClick}
                      onDragOver={handleDragOver}
                      onDrop={handleDrop}
                    >
                      <input
                        ref={fileInputRef}
                        accept=".xlsx,.xls"
                        className="hidden"
                        disabled={isLoading}
                        type="file"
                        onChange={handleFileChange}
                      />
                      <div className="flex flex-col items-center justify-center text-center">
                        <p
                          className={pharagraph({
                            size: "sm",
                            color: "default",
                          })}
                        >
                          Selecciona o arrastra en esta area el archivo excel
                          para cargar los casos en la plataforma
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </ModalBody>

            <ModalFooter className="justify-end gap-3">
              {success ? (
                <Button color="primary" variant="solid" onPress={handleClose}>
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "brown",
                    })}
                  >
                    Cerrar
                  </span>
                </Button>
              ) : (
                <>
                  <Button
                    className="bg-default text-white"
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
                    className="bg-primary text-white"
                    color="primary"
                    isDisabled={!selectedFile || isLoading}
                    isLoading={isLoading}
                    variant="solid"
                    onPress={handleSubmit}
                  >
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "white",
                      })}
                    >
                      {isLoading ? "Importando..." : "Subir Casos"}
                    </span>
                  </Button>
                </>
              )}
            </ModalFooter>
          </>
        )}
      </ModalContent>
    </Modal>
  );
}
