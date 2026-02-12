import type { Case, Novedad, Evidencia } from "@/types";

import { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import { Button } from "@heroui/button";
import { Spinner } from "@heroui/spinner";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import {
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
} from "@heroui/modal";

import { title } from "@/components/primitives";
import { API_URL, getAuthHeaders } from "@/lib/api";
import { useCases } from "@/lib/cases-context";
import { useAuth } from "@/lib/auth-context";
import { useUsers } from "@/lib/users-context";
import DefaultLayout from "@/layouts/default";
import {
  AlerCircleWhiteIcon,
  ArrowLeftIcon,
  TrashIcon,
  DropdownIcon,
  FileDocumentIcon,
  UploadIcon,
  DownloadIcon,
  CloseIcon,
} from "@/components/icons";
import { AddNovedadForm } from "@/components/AddNovedadForm";
import { UploadEvidenciaForm } from "@/components/UploadEvidenciaForm";
import { CerrarCasoForm } from "@/components/CerrarCasoForm";

/** Formato "DD Mes, YYYY" para las fechas (ej: "10 Enero, 2026") */
function formatDate(value: string | null | undefined): string {
  if (value == null || value === "" || value === undefined) return "—";

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ];

  try {
    // Si es un timestamp ISO (contiene "T"), parsearlo usando la zona horaria local
    if (value.includes("T")) {
      const d = new Date(value);

      if (!Number.isNaN(d.getTime())) {
        const day = d.getDate();
        const month = d.getMonth();
        const year = d.getFullYear();

        return `${day} ${monthNames[month]}, ${year}`;
      }
    }

    // Si es solo una fecha (YYYY-MM-DD), parsearla directamente
    const dateMatch = String(value)
      .trim()
      .match(/^(\d{4})-(\d{2})-(\d{2})/);

    if (dateMatch) {
      const [, year, month, day] = dateMatch;
      const monthIndex = parseInt(month) - 1;

      return `${parseInt(day)} ${monthNames[monthIndex]}, ${year}`;
    }

    // Intentar parsear como fecha genérica
    const d = new Date(value);

    if (!Number.isNaN(d.getTime())) {
      const day = d.getDate();
      const month = d.getMonth();
      const year = d.getFullYear();

      return `${day} ${monthNames[month]}, ${year}`;
    }

    return String(value);
  } catch {
    return String(value);
  }
}

/** Formato para días de atraso */
function formatDiasAtraso(dias: number | null | undefined): string {
  if (dias == null || dias === undefined || dias === 0) return "—";

  return `${dias} ${dias === 1 ? "día" : "días"}`;
}

/** Calcula los días restantes hasta el vencimiento (diferencia entre fecha de hoy y fin_averia_tiempo_respuesta) */
function calcularDiasRestantes(fechaCierre: string | null): number | null {
  if (!fechaCierre) return null;

  try {
    // Obtener fecha de hoy (solo la parte de fecha, sin hora)
    const hoy = new Date();

    hoy.setHours(0, 0, 0, 0);

    // Parsear la fecha de cierre (puede venir en formato YYYY-MM-DD o ISO timestamp)
    const fechaCierreStr = fechaCierre.includes("T")
      ? fechaCierre.split("T")[0]
      : fechaCierre;
    const fechaFin = new Date(fechaCierreStr + "T00:00:00");

    if (Number.isNaN(fechaFin.getTime())) {
      return null;
    }

    // Calcular diferencia en milisegundos y convertir a días
    const diferenciaMs = fechaFin.getTime() - hoy.getTime();
    const diasRestantes = Math.ceil(diferenciaMs / (1000 * 60 * 60 * 24));

    return diasRestantes;
  } catch {
    return null;
  }
}

/** Formato para días restantes hasta vencimiento */
function formatDiasRestantes(dias: number | null | undefined): string {
  if (dias == null || dias === undefined) return "—";
  if (dias < 0)
    return `Vencido (${Math.abs(dias)} ${Math.abs(dias) === 1 ? "día" : "días"})`;
  if (dias === 0) return "Vence hoy";

  return `${dias} ${dias === 1 ? "Día" : "Días"}`;
}

function formatCell<T>(value: T): string {
  if (value == null || (typeof value === "string" && value.trim() === ""))
    return "—";

  return String(value);
}

export default function CaseDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { user, session } = useAuth();
  const { users } = useUsers();
  const authHeaders = getAuthHeaders(session?.access_token);
  const { getCaseById, refreshCases } = useCases();
  const isAdmin = useMemo(
    () =>
      user?.id ? users.find((u) => u.id === user.id)?.rol === "admin" : false,
    [user?.id, users],
  );
  const [caseData, setCaseData] = useState<Case | null>(null);
  const [novedades, setNovedades] = useState<Novedad[]>([]);
  const [evidencias, setEvidencias] = useState<Evidencia[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingNovedades, setIsLoadingNovedades] = useState(false);
  const [isLoadingEvidencias, setIsLoadingEvidencias] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isAddNovedadModalOpen, setIsAddNovedadModalOpen] = useState(false);
  const [isUploadEvidenciaModalOpen, setIsUploadEvidenciaModalOpen] =
    useState(false);
  const [isCerrarCasoModalOpen, setIsCerrarCasoModalOpen] = useState(false);
  const [evidenciaToDelete, setEvidenciaToDelete] = useState<Evidencia | null>(
    null,
  );
  const [deletingEvidenciaId, setDeletingEvidenciaId] = useState<string | null>(
    null,
  );
  const [evidenciaToView, setEvidenciaToView] = useState<Evidencia | null>(
    null,
  );
  const [downloadingEvidenciaId, setDownloadingEvidenciaId] = useState<
    string | null
  >(null);

  const loadNovedades = async (casoId: string) => {
    setIsLoadingNovedades(true);
    try {
      const response = await fetch(`${API_URL}/cases/${casoId}/novedades`, {
        method: "GET",
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      setNovedades(data || []);
    } catch (err) {
      console.error("Error al cargar las novedades:", err);
      setNovedades([]);
    } finally {
      setIsLoadingNovedades(false);
    }
  };

  const loadEvidencias = async (casoId: string) => {
    setIsLoadingEvidencias(true);
    try {
      const response = await fetch(`${API_URL}/cases/${casoId}/evidencias`, {
        method: "GET",
        headers: authHeaders,
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${await response.text()}`);
      }

      const data = await response.json();

      setEvidencias(data || []);
    } catch (err) {
      console.error("Error al cargar las evidencias:", err);
      setEvidencias([]);
    } finally {
      setIsLoadingEvidencias(false);
    }
  };

  useEffect(() => {
    if (id) {
      setIsLoading(true);
      setError(null);
      getCaseById(id)
        .then((data) => {
          setCaseData(data);
          if (!data) {
            setError("Caso no encontrado");
          } else {
            // Cargar novedades y evidencias cuando se carga el caso
            loadNovedades(id);
            loadEvidencias(id);
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
      setError("ID del caso no proporcionado");
      setIsLoading(false);
    }
  }, [id, getCaseById, location.key]);

  const handleNovedadSuccess = async () => {
    if (id) {
      await loadNovedades(id);
      // Recargar el caso para obtener el estado actualizado
      const updatedCase = await getCaseById(id);

      if (updatedCase) {
        setCaseData(updatedCase);
      }
      // Refrescar la lista de casos en el contexto
      await refreshCases();
    }
  };

  const handleEvidenciaSuccess = async () => {
    if (id) {
      await loadEvidencias(id);
    }
  };

  const handleRequestDelete = (evidencia: Evidencia) => {
    setEvidenciaToDelete(evidencia);
  };

  const handleViewEvidencia = (evidencia: Evidencia) => {
    setEvidenciaToView(evidencia);
  };

  const handleCloseViewEvidencia = () => {
    setEvidenciaToView(null);
  };

  const handleDownloadEvidencia = async (evidencia: Evidencia) => {
    if (!evidencia.url) return;
    setDownloadingEvidenciaId(evidencia.id);
    try {
      const response = await fetch(evidencia.url, { mode: "cors" });

      if (!response.ok) throw new Error("Error al obtener el archivo");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");

      a.href = url;
      a.download = evidencia.nombre_archivo;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch {
      // Si falla por CORS u otro motivo, abrir en nueva pestaña para que el usuario pueda guardar
      window.open(evidencia.url, "_blank", "noopener,noreferrer");
    } finally {
      setDownloadingEvidenciaId(null);
    }
  };

  const handleCancelDelete = () => {
    setEvidenciaToDelete(null);
  };

  const handleConfirmDelete = async () => {
    if (!evidenciaToDelete) return;

    setDeletingEvidenciaId(evidenciaToDelete.id);

    try {
      const response = await fetch(
        `${API_URL}/cases/evidencias/${evidenciaToDelete.id}`,
        {
          method: "DELETE",
          headers: authHeaders,
        },
      );

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          (data?.message as string) || "Error al eliminar la evidencia",
        );
      }

      // Recargar evidencias
      if (id) {
        await loadEvidencias(id);
      }

      setEvidenciaToDelete(null);
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Error al eliminar la evidencia",
      );
    } finally {
      setDeletingEvidenciaId(null);
    }
  };

  const handleUpdateEstado = async (nuevoEstado: string) => {
    if (!id || !caseData) return;

    try {
      const response = await fetch(`${API_URL}/cases/${id}`, {
        method: "PATCH",
        headers: authHeaders,
        body: JSON.stringify({ estado: nuevoEstado }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({}));

        throw new Error(
          (data?.message as string) || "Error al actualizar el estado",
        );
      }

      // Recargar el caso para obtener los datos actualizados
      const updatedCase = await getCaseById(id);

      if (updatedCase) {
        setCaseData(updatedCase);
      }
      // Refrescar la lista de casos en el contexto para que se actualice cuando vuelva a la lista
      await refreshCases();

      // Si el estado es "Cerrado", abrir el modal de cerrar caso
      if (nuevoEstado === "Cerrado") {
        setIsCerrarCasoModalOpen(true);
      }
    } catch (err) {
      alert(
        err instanceof Error ? err.message : "Error al actualizar el estado",
      );
    }
  };

  const getEstadoColor = (estado: string): string => {
    switch (estado) {
      case "Abierto":
        return "bg-cyan-400"; // Azul claro
      case "Validando":
        return "bg-orange-500"; // Naranja
      case "Programado":
        return "bg-blue-600"; // Azul oscuro
      case "En proceso":
        return "bg-purple-500"; // Morado
      case "Novedad":
        return "bg-orange-400"; // Naranja brillante
      case "Cerrado":
        return "bg-gray-500"; // Gris
      default:
        return "bg-gray-400";
    }
  };

  return (
    <DefaultLayout>
      <div className="w-full">
        {/* Botón de regreso */}
        <div className="mb-6 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Button
              startContent={<ArrowLeftIcon />}
              variant="light"
              onPress={() => navigate("/cases")}
            >
              <span className={title({ size: "sm", fontWeight: "semibold" })}>
                Volver a Casos
              </span>
            </Button>
            <h1 className={title({ size: "xxl", fontWeight: "bold" })}>
              Caso - {caseData ? `${caseData.aviso}` : ""}
            </h1>
          </div>
          {caseData && isAdmin && (
            <div className="flex-shrink-0">
              <Dropdown placement="bottom-end">
                <DropdownTrigger>
                  <Button
                    className="bg-primary text-black"
                    endContent={<DropdownIcon />}
                    size="sm"
                    variant="solid"
                  >
                    <span
                      className={title({
                        size: "sm",
                        fontWeight: "semibold",
                        color: "black",
                      })}
                    >
                      Marcar como
                    </span>
                  </Button>
                </DropdownTrigger>
                <DropdownMenu
                  aria-label="Cambiar estado del caso"
                  classNames={{
                    base: "[&_li[data-hover=true]]:!bg-default [&_li[data-hover=true]]:!text-white",
                  }}
                  onAction={(key) => handleUpdateEstado(key as string)}
                >
                  <DropdownItem
                    key="Abierto"
                    className={
                      caseData.estado === "Abierto" ? "opacity-50" : ""
                    }
                    textValue="Abierto"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getEstadoColor("Abierto")}`}
                      />
                      <span>Abierto</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="Validando"
                    className={
                      caseData.estado === "Validando" ? "opacity-50" : ""
                    }
                    textValue="Validando"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getEstadoColor("Validando")}`}
                      />
                      <span>Validando</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="Programado"
                    className={
                      caseData.estado === "Programado" ? "opacity-50" : ""
                    }
                    textValue="Programado"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getEstadoColor("Programado")}`}
                      />
                      <span>Programado</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="En proceso"
                    className={
                      caseData.estado === "En proceso" ? "opacity-50" : ""
                    }
                    textValue="En proceso"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getEstadoColor("En proceso")}`}
                      />
                      <span>En Proceso</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="Novedad"
                    className={
                      caseData.estado === "Novedad" ? "opacity-50" : ""
                    }
                    textValue="Novedad"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getEstadoColor("Novedad")}`}
                      />
                      <span>Novedad</span>
                    </div>
                  </DropdownItem>
                  <DropdownItem
                    key="Cerrado"
                    className={
                      caseData.estado === "Cerrado" ? "opacity-50" : ""
                    }
                    textValue="Cerrado"
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className={`w-2 h-2 rounded-full ${getEstadoColor("Cerrado")}`}
                      />
                      <span>Cerrado</span>
                    </div>
                  </DropdownItem>
                </DropdownMenu>
              </Dropdown>
            </div>
          )}
        </div>

        {/* Contenido */}
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <Spinner size="lg" />
          </div>
        ) : error ? (
          <div className="py-8">
            <div className="bg-danger-50 border border-danger-200 rounded-lg p-6">
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
          </div>
        ) : caseData ? (
          <div className="flex flex-col gap-6">
            <div className="bg-white rounded-lg p-6 border border-default-200">
              {/* Descripción */}
              <div className="flex flex-col items-start gap-1 border-b border-default-200 pb-6 mb-6">
                <span
                  className={title({
                    size: "sm",
                    fontWeight: "semibold",
                    color: "grayDark",
                  })}
                >
                  Descripción
                </span>
                <p className={title({ size: "md", fontWeight: "normal" })}>
                  {formatCell(caseData.texto_breve)}
                </p>
              </div>

              {/* Primera fila: Aviso, Agregado en, Cierre Aproximado, Vence en */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="flex flex-col items-start gap-1">
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "grayDark",
                    })}
                  >
                    Aviso
                  </span>
                  <p className={title({ size: "md", fontWeight: "normal" })}>
                    {formatCell(caseData.aviso)}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "grayDark",
                    })}
                  >
                    Agregado en
                  </span>
                  <p className={title({ size: "md", fontWeight: "normal" })}>
                    {formatDate(caseData.fecha_creacion)}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "grayDark",
                    })}
                  >
                    Cierre Aproximado
                  </span>
                  <p className={title({ size: "md", fontWeight: "normal" })}>
                    {formatDate(caseData.fin_averia_tiempo_respuesta)}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "grayDark",
                    })}
                  >
                    {caseData.dias_atraso && caseData.dias_atraso > 0
                      ? "Días de atraso"
                      : "Vence en"}
                  </span>
                  <p
                    className={(() => {
                      // Si hay días de atraso, mostrar en rojo usando title con color red
                      if (caseData.dias_atraso && caseData.dias_atraso > 0) {
                        return title({
                          size: "md",
                          fontWeight: "bold",
                          color: "red",
                        });
                      }
                      // Si no hay días de atraso, verificar si los días restantes son 0 o negativos
                      const diasRestantes = calcularDiasRestantes(
                        caseData.fin_averia_tiempo_respuesta,
                      );

                      if (diasRestantes !== null && diasRestantes <= 0) {
                        return title({
                          size: "md",
                          fontWeight: "bold",
                          color: "red",
                        });
                      }

                      return title({ size: "md", fontWeight: "bold" });
                    })()}
                  >
                    {(() => {
                      // Si hay días de atraso, mostrar los días de atraso
                      if (caseData.dias_atraso && caseData.dias_atraso > 0) {
                        return formatDiasAtraso(caseData.dias_atraso);
                      }
                      // Si no hay días de atraso, calcular y mostrar los días restantes
                      const diasRestantes = calcularDiasRestantes(
                        caseData.fin_averia_tiempo_respuesta,
                      );

                      return formatDiasRestantes(diasRestantes);
                    })()}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "grayDark",
                    })}
                  >
                    Estado / Prioridad
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {caseData.estado && (
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
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
                        {formatCell(caseData.estado)}
                      </div>
                    )}
                    {caseData.prioridad && (
                      <div
                        className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium capitalize ${
                          caseData.prioridad === "Urgente"
                            ? "bg-red text-white"
                            : caseData.prioridad === "Muy elevado"
                              ? "bg-red text-white"
                              : caseData.prioridad === "Alto"
                                ? "bg-orange text-white"
                                : caseData.prioridad === "Medio"
                                  ? "bg-gray-dark text-white"
                                  : caseData.prioridad === "Bajo"
                                    ? "bg-green text-white"
                                    : "bg-gray-blue text-white"
                        }`}
                      >
                        {formatCell(caseData.prioridad)}
                      </div>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "grayDark",
                    })}
                  >
                    Zona
                  </span>
                  <p className={title({ size: "md", fontWeight: "normal" })}>
                    {formatCell(caseData.zona)}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "grayDark",
                    })}
                  >
                    Ubicación
                  </span>
                  <p className={title({ size: "md", fontWeight: "normal" })}>
                    {formatCell(
                      caseData.denominacion_ubicacion_tecnica ||
                        caseData.ubicacion,
                    )}
                  </p>
                </div>
                <div className="flex flex-col items-start gap-1">
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "semibold",
                      color: "grayDark",
                    })}
                  >
                    Tipologia
                  </span>
                  <p className={title({ size: "md", fontWeight: "normal" })}>
                    {formatCell(caseData.tipologia)}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex w-full gap-6">
              <div className="bg-white rounded-lg p-6 border border-default-200 w-full">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={title({ size: "lg", fontWeight: "semibold" })}
                  >
                    Novedades
                  </span>
                  {isAdmin && (
                    <Button
                      color="default"
                      size="sm"
                      startContent={<AlerCircleWhiteIcon />}
                      variant="solid"
                      onPress={() => setIsAddNovedadModalOpen(true)}
                    >
                      <span
                        className={title({
                          size: "sm",
                          fontWeight: "semibold",
                          color: "white",
                        })}
                      >
                        Agregar Novedad
                      </span>
                    </Button>
                  )}
                </div>

                {isLoadingNovedades ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" />
                  </div>
                ) : novedades.length === 0 ? (
                  <div className="py-8 text-center">
                    <p
                      className={title({
                        size: "md",
                        fontWeight: "normal",
                        color: "grayDark",
                      })}
                    >
                      No hay novedades registradas
                    </p>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    {novedades.map((novedad) => (
                      <div key={novedad.id}>
                        <div className="flex items-center gap-2 mt-2">
                          <span
                            className={title({
                              size: "md",
                              fontWeight: "bold",
                              color: "default",
                            })}
                          >
                            {formatDate(novedad.fecha_creacion)}
                          </span>
                        </div>
                        <div className="flex items-start justify-between gap-4 mb-2">
                          <p
                            className={title({
                              size: "md",
                              fontWeight: "normal",
                            })}
                          >
                            {novedad.texto}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="bg-white rounded-lg p-6 border border-default-200 w-full">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <span
                    className={title({ size: "lg", fontWeight: "semibold" })}
                  >
                    Evidencias
                  </span>
                  {caseData.estado === "Cerrado" && isAdmin && (
                    <Button
                      color="default"
                      size="sm"
                      startContent={<UploadIcon />}
                      variant="solid"
                      onPress={() => setIsUploadEvidenciaModalOpen(true)}
                    >
                      <span
                        className={title({
                          size: "sm",
                          fontWeight: "semibold",
                          color: "white",
                        })}
                      >
                        Subir Evidencia
                      </span>
                    </Button>
                  )}
                </div>

                {isLoadingEvidencias ? (
                  <div className="flex items-center justify-center py-8">
                    <Spinner size="md" />
                  </div>
                ) : evidencias.length === 0 ? (
                  <div className="py-8 text-center">
                    <p
                      className={title({
                        size: "md",
                        fontWeight: "normal",
                        color: "grayDark",
                      })}
                    >
                      No hay evidencias registradas
                    </p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {evidencias.map((evidencia) => (
                      <div
                        key={evidencia.id}
                        className="border border-default-200 rounded-lg p-4 hover:bg-default-50 transition-colors"
                      >
                        {evidencia.tipo_archivo === "image" && evidencia.url ? (
                          <div className="flex flex-col gap-2">
                            <button
                              className="w-full text-left rounded-lg overflow-hidden focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                              type="button"
                              onClick={() => handleViewEvidencia(evidencia)}
                            >
                              <img
                                alt={evidencia.nombre_archivo}
                                className="w-full h-48 object-cover rounded-lg cursor-pointer hover:opacity-95 transition-opacity"
                                loading="lazy"
                                src={evidencia.url}
                                onError={(e) => {
                                  (e.target as HTMLImageElement).style.display =
                                    "none";
                                }}
                              />
                            </button>
                            <div className="flex items-center justify-between gap-1">
                              <button
                                className={`${title({ size: "sm", fontWeight: "normal" })} truncate min-w-0 flex-1 text-left hover:underline cursor-pointer`}
                                type="button"
                                onClick={() => handleViewEvidencia(evidencia)}
                              >
                                {evidencia.nombre_archivo}
                              </button>
                              {isAdmin && (
                                <button
                                  aria-label="Eliminar evidencia"
                                  className="text-danger hover:text-danger-600 transition-colors p-1 flex-shrink-0"
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRequestDelete(evidencia);
                                  }}
                                >
                                  <TrashIcon />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : evidencia.url ? (
                          <div className="flex flex-col gap-2">
                            <button
                              className="flex flex-col items-center justify-center w-full h-48 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                              type="button"
                              onClick={() => handleViewEvidencia(evidencia)}
                            >
                              <div className="w-16 h-16 cursor-pointer">
                                <FileDocumentIcon />
                              </div>
                            </button>
                            <div className="flex items-center justify-between gap-1">
                              <button
                                className={`${title({ size: "sm", fontWeight: "normal" })} truncate min-w-0 flex-1 text-left hover:underline cursor-pointer`}
                                type="button"
                                onClick={() => handleViewEvidencia(evidencia)}
                              >
                                {evidencia.nombre_archivo}
                              </button>
                              {isAdmin && (
                                <button
                                  aria-label="Eliminar evidencia"
                                  className="text-danger hover:text-danger-600 transition-colors p-1 flex-shrink-0"
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleRequestDelete(evidencia);
                                  }}
                                >
                                  <TrashIcon />
                                </button>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div className="flex flex-col gap-2">
                            <p
                              className={title({
                                size: "sm",
                                fontWeight: "normal",
                              })}
                            >
                              {evidencia.nombre_archivo}
                            </p>
                            <span
                              className={title({
                                size: "sm",
                                fontWeight: "normal",
                                color: "grayDark",
                              })}
                            >
                              {formatDate(evidencia.fecha_subida)}
                            </span>
                            {isAdmin && (
                              <button
                                aria-label="Eliminar evidencia"
                                className="text-danger hover:text-danger-600 transition-colors p-1 self-start"
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleRequestDelete(evidencia);
                                }}
                              >
                                <TrashIcon />
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Modal ver/descargar evidencia */}
            <Modal
              hideCloseButton
              classNames={{
                base: "max-h-[80vh]",
                body: "p-0 overflow-hidden flex flex-col min-h-0",
              }}
              isOpen={!!evidenciaToView}
              placement="center"
              scrollBehavior="inside"
              size="4xl"
              onOpenChange={(open) => !open && handleCloseViewEvidencia()}
            >
              <ModalContent>
                <ModalBody className="p-0 gap-0 rounded-xl">
                  {evidenciaToView && (
                    <>
                      <div className="flex items-center justify-center min-h-0 overflow-hidden flex p-4 rounded-2xl">
                        {evidenciaToView.tipo_archivo === "image" &&
                        evidenciaToView.url ? (
                          <img
                            alt={evidenciaToView.nombre_archivo}
                            className="max-h-[60vh] w-full h-auto object-cover rounded-xl"
                            src={evidenciaToView.url}
                          />
                        ) : evidenciaToView.url ? (
                          <div className="flex flex-col items-center justify-center gap-4 py-8">
                            <div className="w-20 h-20 flex items-center justify-center rounded-full bg-default-200">
                              <FileDocumentIcon />
                            </div>
                            <p
                              className={title({
                                size: "md",
                                fontWeight: "normal",
                                color: "grayDark",
                              })}
                            >
                              Vista previa no disponible. Usa el botón Descargar
                              para abrir el archivo.
                            </p>
                          </div>
                        ) : null}
                      </div>
                      <div className="flex items-center justify-between gap-4 px-4 pt-3 pb-4 bg-white shrink-0">
                        <Button
                          color="primary"
                          isDisabled={!evidenciaToView.url}
                          isLoading={
                            downloadingEvidenciaId === evidenciaToView.id
                          }
                          size="sm"
                          startContent={
                            downloadingEvidenciaId !== evidenciaToView.id ? (
                              <DownloadIcon />
                            ) : null
                          }
                          variant="solid"
                          onPress={() =>
                            handleDownloadEvidencia(evidenciaToView)
                          }
                        >
                          <span
                            className={title({
                              size: "sm",
                              fontWeight: "semibold",
                              color: "default",
                            })}
                          >
                            Descargar
                          </span>
                        </Button>
                        <p
                          className={`${title({ size: "sm", fontWeight: "normal", color: "grayDark" })} truncate flex-1 text-center px-2`}
                        >
                          {evidenciaToView.nombre_archivo}
                        </p>
                        <Button
                          color="default"
                          size="sm"
                          startContent={<CloseIcon />}
                          variant="solid"
                          onPress={handleCloseViewEvidencia}
                        >
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
                      </div>
                    </>
                  )}
                </ModalBody>
              </ModalContent>
            </Modal>

            {/* Modales */}
            {caseData && (
              <>
                <AddNovedadForm
                  casoId={caseData.id}
                  isOpen={isAddNovedadModalOpen}
                  onClose={() => setIsAddNovedadModalOpen(false)}
                  onSuccess={handleNovedadSuccess}
                />
                <UploadEvidenciaForm
                  casoId={caseData.id}
                  isOpen={isUploadEvidenciaModalOpen}
                  onClose={() => setIsUploadEvidenciaModalOpen(false)}
                  onSuccess={handleEvidenciaSuccess}
                />
                <CerrarCasoForm
                  casoId={caseData.id}
                  isOpen={isCerrarCasoModalOpen}
                  onClose={() => setIsCerrarCasoModalOpen(false)}
                  onSuccess={async () => {
                    // Recargar novedades (ya que se crea una novedad con la descripción)
                    if (id) {
                      await loadNovedades(id);
                    }
                    // Recargar evidencias
                    await handleEvidenciaSuccess();
                    // Recargar el caso para obtener los datos actualizados
                    const updatedCase = await getCaseById(caseData.id);

                    if (updatedCase) {
                      setCaseData(updatedCase);
                    }
                    await refreshCases();
                  }}
                />
                <Modal
                  isOpen={!!evidenciaToDelete}
                  placement="center"
                  size="md"
                  onOpenChange={(open) => !open && handleCancelDelete()}
                >
                  <ModalContent>
                    <ModalHeader>
                      <span
                        className={title({ size: "lg", fontWeight: "bold" })}
                      >
                        Eliminar evidencia
                      </span>
                    </ModalHeader>
                    <ModalBody>
                      <p
                        className={title({ size: "sm", fontWeight: "normal" })}
                      >
                        ¿Estás seguro de que deseas eliminar la evidencia{" "}
                        <span className="font-bold">
                          {evidenciaToDelete?.nombre_archivo}
                        </span>
                        ?
                      </p>
                    </ModalBody>
                    <ModalFooter>
                      <Button
                        color="default"
                        isDisabled={!!deletingEvidenciaId}
                        variant="solid"
                        onPress={handleCancelDelete}
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
                        color="danger"
                        isDisabled={!!deletingEvidenciaId}
                        isLoading={
                          deletingEvidenciaId === evidenciaToDelete?.id
                        }
                        variant="solid"
                        onPress={handleConfirmDelete}
                      >
                        <span
                          className={title({
                            size: "sm",
                            fontWeight: "semibold",
                            color: "white",
                          })}
                        >
                          Eliminar
                        </span>
                      </Button>
                    </ModalFooter>
                  </ModalContent>
                </Modal>
              </>
            )}
          </div>
        ) : null}
      </div>
    </DefaultLayout>
  );
}
