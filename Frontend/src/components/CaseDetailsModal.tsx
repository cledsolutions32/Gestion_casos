import type { Case } from "@/types";

import { useEffect, useState } from "react";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";

import { title } from "./primitives";

import { useCases } from "@/lib/cases-context";

type CaseDetailsModalProps = {
  isOpen: boolean;
  onClose: () => void;
  caseId: string | null;
};

/** Formato DD/MM/YYYY para las fechas */
function formatDate(value: string | null | undefined): string {
  if (value == null || value === "" || value === undefined) return "—";

  let dateStr = String(value).trim();

  if (dateStr.includes("T")) {
    dateStr = dateStr.split("T")[0];
  }

  const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateMatch) {
    const [, year, month, day] = dateMatch;

    return `${day}/${month}/${year}`;
  }

  try {
    const d = new Date(dateStr + "T12:00:00");

    if (Number.isNaN(d.getTime())) return dateStr;
    const day = String(d.getDate()).padStart(2, "0");
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const year = d.getFullYear();

    return `${day}/${month}/${year}`;
  } catch {
    return dateStr;
  }
}

function formatCell<T>(value: T): string {
  if (value == null || (typeof value === "string" && value.trim() === ""))
    return "—";

  return String(value);
}

export function CaseDetailsModal({
  isOpen,
  onClose,
  caseId,
}: CaseDetailsModalProps) {
  const { getCaseById } = useCases();
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && caseId) {
      setIsLoading(true);
      setError(null);
      getCaseById(caseId)
        .then((data) => {
          setCaseData(data);
          if (!data) {
            setError("Caso no encontrado");
          }
        })
        .catch((err) => {
          setError(
            err instanceof Error
              ? err.message
              : "Error al cargar los detalles del caso",
          );
          setCaseData(null);
        })
        .finally(() => {
          setIsLoading(false);
        });
    } else {
      setCaseData(null);
      setError(null);
    }
  }, [isOpen, caseId, getCaseById]);

  const handleClose = () => {
    setCaseData(null);
    setError(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      placement="center"
      scrollBehavior="inside"
      size="2xl"
      onClose={handleClose}
    >
      <ModalContent>
        <ModalHeader>
          <span className={title({ size: "lg", fontWeight: "bold" })}>
            Detalles del Caso {caseData ? `#${caseData.aviso}` : ""}
          </span>
        </ModalHeader>
        <ModalBody>
          {isLoading ? (
            <div className="flex items-center justify-center py-8">
              <Spinner size="lg" />
            </div>
          ) : error ? (
            <div className="py-4">
              <p
                className={title({
                  size: "md",
                  fontWeight: "normal",
                  color: "red",
                })}
              >
                {error}
              </p>
            </div>
          ) : caseData ? (
            <div className="space-y-6">
              {/* Información General */}
              <div>
                <h3 className={title({ size: "md", fontWeight: "bold" })}>
                  Información General
                </h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Aviso:
                    </span>
                    <p className={title({ size: "sm", fontWeight: "normal" })}>
                      {formatCell(caseData.aviso)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Estado:
                    </span>
                    <div className="mt-1">
                      <div
                        className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium capitalize ${
                          caseData.estado === "Abierto"
                            ? "bg-green-dark text-white"
                            : caseData.estado === "Validando"
                              ? "bg-primary text-default"
                              : caseData.estado === "Programado"
                                ? "bg-blue text-white"
                                : caseData.estado === "En proceso"
                                  ? "bg-purple text-white"
                                  : caseData.estado === "Novedad"
                                    ? "bg-orange text-white"
                                    : caseData.estado === "Cerrado"
                                      ? "bg-gray-blue text-white"
                                      : caseData.estado === "Vencido"
                                        ? "bg-red text-white"
                                        : "bg-red-dark text-white"
                        }`}
                      >
                        <span
                          className={title({
                            size: "sm",
                            fontWeight: "medium",
                            color: "white",
                          })}
                        >
                          {formatCell(caseData.estado)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Prioridad:
                    </span>
                    <div className="mt-1">
                      <div
                        className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium capitalize whitespace-nowrap ${
                          caseData.prioridad === "Urgente"
                            ? "bg-red text-white"
                            : caseData.prioridad === "Muy elevado"
                              ? "bg-red text-white"
                              : caseData.prioridad === "Alto"
                                ? "bg-orange text-white"
                                : caseData.prioridad === "Medio"
                                  ? "bg-gray-dark text-"
                                  : caseData.prioridad === "Bajo"
                                    ? "bg-green text-white"
                                    : "bg-gray-blue text-white"
                        }`}
                      >
                        <span
                          className={title({
                            size: "sm",
                            fontWeight: "medium",
                            color: "white",
                          })}
                        >
                          {formatCell(caseData.prioridad)}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div>
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Días de Atraso:
                    </span>
                    <p
                      className={`${title({ size: "sm", fontWeight: "normal" })} ${
                        caseData.dias_atraso && caseData.dias_atraso > 0
                          ? "text-danger font-semibold"
                          : ""
                      }`}
                    >
                      {caseData.dias_atraso != null && caseData.dias_atraso > 0
                        ? `${caseData.dias_atraso} días`
                        : "—"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Descripción */}
              <div>
                <h3 className={title({ size: "md", fontWeight: "bold" })}>
                  Descripción
                </h3>
                <p
                  className={`mt-2 ${title({ size: "sm", fontWeight: "normal" })} whitespace-pre-wrap`}
                >
                  {formatCell(caseData.texto_breve)}
                </p>
              </div>

              {/* Tipología */}
              <div>
                <h3 className={title({ size: "md", fontWeight: "bold" })}>
                  Tipología
                </h3>
                <p
                  className={`mt-2 ${title({ size: "sm", fontWeight: "normal" })}`}
                >
                  {formatCell(caseData.tipologia)}
                </p>
              </div>

              {/* Ubicación */}
              <div>
                <h3 className={title({ size: "md", fontWeight: "bold" })}>
                  Ubicación
                </h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Zona:
                    </span>
                    <p className={title({ size: "sm", fontWeight: "normal" })}>
                      {formatCell(caseData.zona)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Código de Ubicación:
                    </span>
                    <p className={title({ size: "sm", fontWeight: "normal" })}>
                      {formatCell(caseData.ubicacion)}
                    </p>
                  </div>
                  <div className="md:col-span-2">
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Nombre de la Tienda:
                    </span>
                    <p className={title({ size: "sm", fontWeight: "normal" })}>
                      {formatCell(caseData.denominacion_ubicacion_tecnica)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Fechas */}
              <div>
                <h3 className={title({ size: "md", fontWeight: "bold" })}>
                  Fechas
                </h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Fecha de Creación:
                    </span>
                    <p className={title({ size: "sm", fontWeight: "normal" })}>
                      {formatDate(caseData.fecha_creacion)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Fin Avería Tiempo Respuesta:
                    </span>
                    <p className={title({ size: "sm", fontWeight: "normal" })}>
                      {formatDate(caseData.fin_averia_tiempo_respuesta)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Información del Sistema */}
              <div>
                <h3 className={title({ size: "md", fontWeight: "bold" })}>
                  Información del Sistema
                </h3>
                <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Creado en:
                    </span>
                    <p className={title({ size: "sm", fontWeight: "normal" })}>
                      {formatDate(caseData.created_at)}
                    </p>
                  </div>
                  <div>
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "default",
                      })}
                    >
                      Actualizado en:
                    </span>
                    <p className={title({ size: "sm", fontWeight: "normal" })}>
                      {formatDate(caseData.updated_at)}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </ModalBody>
        <ModalFooter>
          <Button color="default" variant="solid" onPress={handleClose}>
            <span
              className={title({
                size: "sm",
                fontWeight: "semibold",
                color: "white",
              })}
            >
              Cerrar
            </span>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
