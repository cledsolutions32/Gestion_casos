import type { Case } from "@/types";

import { Link as RouterLink, useLocation, useNavigate } from "react-router-dom";
import { Link } from "@heroui/link";
import { Button } from "@heroui/button";
import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
} from "@heroui/dropdown";
import { useMemo, useState, useEffect } from "react";

import { DataTable, type DataTableColumn } from "./DataTable";
import { ArrowUpRightIcon, DropdownIcon, ImportIcon } from "./icons";
import { title } from "./primitives";
import { NotificationModal } from "./NotificationModal";

import { useCases } from "@/lib/cases-context";
import { useAuth } from "@/lib/auth-context";
import { useUsers } from "@/lib/users-context";
import { ImportCasesForm } from "@/components/ImportCasesForm";
import { CerrarCasoForm } from "@/components/CerrarCasoForm";

/** Formato DD/MM/YYYY para la columna Fecha */
function formatDate(value: string | null | undefined): string {
  if (value == null || value === "" || value === undefined) return "—";

  // Si ya es un string con formato YYYY-MM-DD, usarlo directamente
  let dateStr = String(value).trim();

  // Si viene como ISO datetime completo, tomar solo la parte de fecha
  if (dateStr.includes("T")) {
    dateStr = dateStr.split("T")[0];
  }

  // Validar formato YYYY-MM-DD
  const dateMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (dateMatch) {
    const [, year, month, day] = dateMatch;

    return `${day}/${month}/${year}`;
  }

  // Si no coincide, intentar parsear como Date
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

function cell<T>(value: T): string {
  if (value == null || (typeof value === "string" && value.trim() === ""))
    return "—";

  return String(value);
}

export const ListCases = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { users, isLoading: usersLoading } = useUsers();
  const { cases, isLoading, error, refreshCases } = useCases();
  const isAdmin = useMemo(
    () =>
      user?.id ? users.find((u) => u.id === user.id)?.rol === "admin" : false,
    [user?.id, users],
  );
  const isUsuario = useMemo(
    () =>
      user?.id ? users.find((u) => u.id === user.id)?.rol === "usuario" : false,
    [user?.id, users],
  );
  const canCloseCase = useMemo(
    () => !usersLoading && !isUsuario,
    [usersLoading, isUsuario],
  );
  const [filterEstado, setFilterEstado] = useState<string>("");
  const [filterMes, setFilterMes] = useState<string>("");
  const [filterPrioridad, setFilterPrioridad] = useState<string>("");
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [notification, setNotification] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);
  const [casoToClose, setCasoToClose] = useState<Case | null>(null);

  // Verificar si hay un mensaje de notificación en el location state
  useEffect(() => {
    const state = location.state as {
      notification?: { type: "success" | "error"; message: string };
    } | null;

    if (state?.notification) {
      setNotification(state.notification);
      // Limpiar el state de la navegación para evitar que se muestre de nuevo al refrescar
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  // Extraer valores únicos para los filtros
  const estadosUnicos = useMemo(() => {
    const estados = new Set<string>();

    cases.forEach((c) => {
      if (c.estado) estados.add(c.estado);
    });

    return Array.from(estados).sort();
  }, [cases]);

  const prioridadesUnicas = useMemo(() => {
    const prioridades = new Set<string>();

    cases.forEach((c) => {
      if (c.prioridad) prioridades.add(c.prioridad);
    });

    return Array.from(prioridades).sort();
  }, [cases]);

  // Generar lista de meses disponibles
  const mesesDisponibles = useMemo(() => {
    const meses = new Set<string>();

    cases.forEach((c) => {
      if (c.fecha_creacion) {
        try {
          const dateStr = String(c.fecha_creacion).split("T")[0];
          const date = new Date(dateStr + "T12:00:00");

          if (!Number.isNaN(date.getTime())) {
            const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

            meses.add(mesAno);
          }
        } catch {
          // Ignorar fechas inválidas
        }
      }
    });

    return Array.from(meses).sort().reverse(); // Más recientes primero
  }, [cases]);

  // Obtener texto a mostrar en los filtros
  const estadoDisplayText = useMemo(() => {
    return filterEstado || "Todos";
  }, [filterEstado]);

  const mesDisplayText = useMemo(() => {
    if (!filterMes) return "Todas";
    const [year, month] = filterMes.split("-");
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
    const monthName = monthNames[parseInt(month) - 1];

    return `${monthName} ${year}`;
  }, [filterMes]);

  const prioridadDisplayText = useMemo(() => {
    return filterPrioridad || "Todas";
  }, [filterPrioridad]);

  // Aplicar filtros
  const casosFiltrados = useMemo(() => {
    return cases.filter((c) => {
      // Filtro por estado
      if (filterEstado && c.estado !== filterEstado) return false;

      // Filtro por prioridad
      if (filterPrioridad && c.prioridad !== filterPrioridad) return false;

      // Filtro por mes
      if (filterMes && c.fecha_creacion) {
        try {
          const dateStr = String(c.fecha_creacion).split("T")[0];
          const date = new Date(dateStr + "T12:00:00");

          if (!Number.isNaN(date.getTime())) {
            const mesAno = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

            if (mesAno !== filterMes) return false;
          } else {
            return false;
          }
        } catch {
          return false;
        }
      }

      return true;
    });
  }, [cases, filterEstado, filterMes, filterPrioridad]);

  const columns: DataTableColumn<Case>[] = [
    {
      key: "estado",
      label: "Estado",
      allowsSorting: true,
      renderCell: (item) => (
        <div
          className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium capitalize ${
            item.estado === "Abierto"
              ? "bg-green-dark text-white"
              : item.estado === "Validando"
                ? "bg-primary text-default"
                : item.estado === "Programado"
                  ? "bg-blue text-white"
                  : item.estado === "En proceso"
                    ? "bg-purple text-white"
                    : item.estado === "Novedad"
                      ? "bg-orange text-white"
                      : item.estado === "Cerrado"
                        ? "bg-gray-blue text-white"
                        : item.estado === "Vencido"
                          ? "bg-red text-white"
                          : "bg-red-dark text-white"
          }`}
        >
          <span
            className={title({
              size: "sm",
              fontWeight: "medium",
              color:
                item.estado === "Abierto"
                  ? "white"
                  : item.estado === "Validando"
                    ? "white"
                    : item.estado === "Programado"
                      ? "white"
                      : item.estado === "En proceso"
                        ? "white"
                        : item.estado === "Novedad"
                          ? "white"
                          : item.estado === "Cerrado"
                            ? "white"
                            : item.estado === "Vencido"
                              ? "white"
                              : "white",
            })}
          >
            {item.estado}
          </span>
        </div>
      ),
    },
    {
      key: "aviso",
      label: "Aviso",
      allowsSorting: true,
    },
    {
      key: "dias_atraso",
      label: "Días atraso",
      allowsSorting: true,
      sortValue: (item) => item.dias_atraso ?? 0,
      renderCell: (item) => {
        if (item.dias_atraso == null || item.dias_atraso === 0) return "—";

        return (
          <span
            className={item.dias_atraso > 0 ? "text-red font-semibold" : ""}
          >
            {item.dias_atraso} días
          </span>
        );
      },
    },
    {
      key: "texto_breve",
      label: "Descripción",
      allowsSorting: true,
      renderCell: (item) => {
        const t = item.texto_breve ?? "";

        if (!t) return "—";

        return <div className="line-clamp-1 break-words max-w-xs">{t}</div>;
      },
    },
    {
      key: "tipologia",
      label: "Tipología",
      allowsSorting: true,
      renderCell: (item) => {
        const tipologia = item.tipologia ?? "";

        if (!tipologia) return "—";

        return (
          <div className="line-clamp-1 break-words max-w-xs">{tipologia}</div>
        );
      },
    },
    {
      key: "prioridad",
      label: "Prioridad",
      allowsSorting: true,
      renderCell: (item) => (
        <div
          className={`inline-flex items-center px-4 py-1 rounded-full text-sm font-medium capitalize whitespace-nowrap ${
            item.prioridad === "Urgente"
              ? "bg-red text-white"
              : item.prioridad === "Muy elevado"
                ? "bg-red text-white"
                : item.prioridad === "Alto"
                  ? "bg-orange text-white"
                  : item.prioridad === "Medio"
                    ? "bg-gray-dark text-"
                    : item.prioridad === "Bajo"
                      ? "bg-green text-white"
                      : "bg-gray-blue text-white"
          }`}
        >
          <span
            className={title({
              size: "sm",
              fontWeight: "medium",
              color:
                item.prioridad === "Urgente"
                  ? "white"
                  : item.prioridad === "Muy elevado"
                    ? "white"
                    : item.prioridad === "Alto"
                      ? "white"
                      : item.prioridad === "Medio"
                        ? "white"
                        : item.prioridad === "Bajo"
                          ? "white"
                          : "white",
            })}
          >
            {item.prioridad}
          </span>
        </div>
      ),
    },
    {
      key: "zona",
      label: "Zona",
      allowsSorting: true,
      renderCell: (item) => cell(item.zona),
    },
    {
      key: "ubicacion",
      label: "Ubicación",
      allowsSorting: true,
      renderCell: (item) => cell(item.ubicacion),
    },
    {
      key: "denominacion_ubicacion_tecnica",
      label: "Nombre de la tienda",
      allowsSorting: true,
      renderCell: (item) => cell(item.denominacion_ubicacion_tecnica),
    },
    {
      key: "fecha_creacion",
      label: "Creado en",
      allowsSorting: true,
      sortValue: (item) => {
        if (!item.fecha_creacion) return 0;
        const dateStr = String(item.fecha_creacion).split("T")[0]; // Solo la parte de fecha
        const d = new Date(dateStr + "T12:00:00");

        return Number.isNaN(d.getTime()) ? 0 : d.getTime();
      },
      renderCell: (item) => formatDate(item.fecha_creacion),
    },
    {
      key: "acciones",
      label: "Acciones",
      align: "start",
      allowsSorting: false,
      renderCell: (item) => (
        <div className="flex items-center justify-start gap-4">
          <Link
            as={RouterLink}
            className="cursor-pointer"
            to={`/cases/${item.id}`}
          >
            <span
              className={title({
                size: "sm",
                fontWeight: "bold",
                color: "blue",
                uppercase: true,
              })}
            >
              Detalles
            </span>
          </Link>
          {canCloseCase && item.estado !== "Cerrado" && (
            <Link className="cursor-pointer" onPress={() => setCasoToClose(item)}>
              <span
                className={title({
                  size: "sm",
                  fontWeight: "bold",
                  color: "red",
                  uppercase: true,
                })}
              >
                Cerrar
              </span>
            </Link>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="w-full">
      <div className="flex justify-between items-center mb-6">
        <div className="flex items-center gap-2">
          <div className="bg-primary rounded-full px-2">
            <span
              className={title({
                size: "sm",
                fontWeight: "bold",
                color: "default",
              })}
            >
              {casosFiltrados.length}
            </span>
          </div>
          <span className={title({ size: "xl", fontWeight: "bold" })}>
            Casos
          </span>
        </div>
        {isAdmin && (
          <div className="flex items-center gap-2">
            <Button
              color="default"
              size="sm"
              startContent={<ImportIcon />}
              variant="solid"
              onPress={() => setIsImportModalOpen(true)}
            >
              <span
                className={title({
                  size: "sm",
                  fontWeight: "bold",
                  color: "white",
                })}
              >
                Importar casos
              </span>
            </Button>
            <Button
              as={RouterLink}
              color="primary"
              endContent={<ArrowUpRightIcon />}
              size="sm"
              to="/cases/new"
              variant="solid"
            >
              <span
                className={title({
                  size: "sm",
                  fontWeight: "bold",
                  color: "default",
                })}
              >
                Crear caso
              </span>
            </Button>
          </div>
        )}
      </div>
      {error && (
        <div
          className="mb-4 rounded-md bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700"
          role="alert"
        >
          {error}
        </div>
      )}
      <DataTable<Case>
        columns={columns}
        emptyContent="No hay casos registrados."
        filterContent={
          <div className="flex items-center gap-3">
            <span
              className={title({
                size: "md",
                fontWeight: "bold",
                color: "default",
              })}
            >
              Filtros Rápidos:
            </span>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className={`${filterEstado ? "bg-primary" : "bg-gray"} rounded-full px-4 py-2 h-auto min-w-fit border-0 shadow-none ${filterEstado ? "hover:bg-primary" : "hover:bg-gray-light"}`}
                  radius="full"
                  variant="flat"
                >
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "medium",
                      color: filterEstado ? "brown" : "brown",
                    })}
                  >
                    Estado: {estadoDisplayText}
                  </span>
                  <DropdownIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtro de estado"
                classNames={{
                  base: "[&_li[data-hover=true]]:!bg-default [&_li[data-hover=true]]:!text-white [&_li:not([data-hover=true])]:!bg-transparent [&_li:not([data-hover=true])]:!text-inherit",
                }}
                selectedKeys={filterEstado ? [filterEstado] : []}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;

                  setFilterEstado(selected || "");
                }}
              >
                <DropdownItem
                  key=""
                  className="hover:!bg-default hover:!text-white data-[selected=true]:!bg-transparent data-[selected=true]:!text-inherit data-[focus=true]:!bg-transparent data-[focus=true]:!text-inherit"
                  textValue="Todos"
                >
                  Todos
                </DropdownItem>
                {
                  estadosUnicos.map((estado) => (
                    <DropdownItem
                      key={estado}
                      className="hover:!bg-default hover:!text-white data-[selected=true]:!bg-transparent data-[selected=true]:!text-inherit data-[focus=true]:!bg-transparent data-[focus=true]:!text-inherit"
                      textValue={estado}
                    >
                      {estado}
                    </DropdownItem>
                  )) as any
                }
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className={`${filterMes ? "bg-primary" : "bg-gray"} rounded-full px-4 py-2 h-auto min-w-fit border-0 shadow-none ${filterMes ? "hover:bg-primary" : "hover:bg-gray-light"}`}
                  radius="full"
                  variant="flat"
                >
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "medium",
                      color: "brown",
                    })}
                  >
                    Fecha: {mesDisplayText}
                  </span>
                  <DropdownIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtro de fecha"
                classNames={{
                  base: "[&_li[data-hover=true]]:!bg-default [&_li[data-hover=true]]:!text-white [&_li:not([data-hover=true])]:!bg-transparent [&_li:not([data-hover=true])]:!text-inherit",
                }}
                selectedKeys={filterMes ? [filterMes] : []}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;

                  setFilterMes(selected || "");
                }}
              >
                <DropdownItem
                  key=""
                  className="hover:!bg-default hover:!text-white data-[selected=true]:!bg-transparent data-[selected=true]:!text-inherit data-[focus=true]:!bg-transparent data-[focus=true]:!text-inherit"
                  textValue="Todas"
                >
                  Todas
                </DropdownItem>
                {
                  mesesDisponibles.map((mesAno) => {
                    const [year, month] = mesAno.split("-");
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
                    const monthName = monthNames[parseInt(month) - 1];

                    return (
                      <DropdownItem
                        key={mesAno}
                        className="hover:!bg-default hover:!text-white data-[selected=true]:!bg-transparent data-[selected=true]:!text-inherit data-[focus=true]:!bg-transparent data-[focus=true]:!text-inherit"
                        textValue={`${monthName} ${year}`}
                      >
                        {monthName} {year}
                      </DropdownItem>
                    );
                  }) as any
                }
              </DropdownMenu>
            </Dropdown>
            <Dropdown>
              <DropdownTrigger>
                <Button
                  className={`${filterPrioridad ? "bg-primary" : "bg-gray"} rounded-full px-4 py-2 h-auto min-w-fit border-0 shadow-none ${filterPrioridad ? "hover:bg-primary" : "hover:bg-gray-light"}`}
                  radius="full"
                  variant="flat"
                >
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "medium",
                      color: "brown",
                    })}
                  >
                    Prioridad: {prioridadDisplayText}
                  </span>
                  <DropdownIcon />
                </Button>
              </DropdownTrigger>
              <DropdownMenu
                aria-label="Filtro de prioridad"
                classNames={{
                  base: "[&_li[data-hover=true]]:!bg-default [&_li[data-hover=true]]:!text-white [&_li:not([data-hover=true])]:!bg-transparent [&_li:not([data-hover=true])]:!text-inherit",
                }}
                selectedKeys={filterPrioridad ? [filterPrioridad] : []}
                selectionMode="single"
                onSelectionChange={(keys) => {
                  const selected = Array.from(keys)[0] as string;

                  setFilterPrioridad(selected || "");
                }}
              >
                <DropdownItem
                  key=""
                  className="hover:!bg-default hover:!text-white data-[selected=true]:!bg-transparent data-[selected=true]:!text-inherit data-[focus=true]:!bg-transparent data-[focus=true]:!text-inherit"
                  textValue="Todas"
                >
                  Todas
                </DropdownItem>
                {
                  prioridadesUnicas.map((prioridad) => (
                    <DropdownItem
                      key={prioridad}
                      className="hover:!bg-default hover:!text-white data-[selected=true]:!bg-transparent data-[selected=true]:!text-inherit data-[focus=true]:!bg-transparent data-[focus=true]:!text-inherit"
                      textValue={prioridad}
                    >
                      {prioridad}
                    </DropdownItem>
                  )) as any
                }
              </DropdownMenu>
            </Dropdown>
          </div>
        }
        isLoading={isLoading}
        items={casosFiltrados}
        keyExtractor={(item) => item.id}
        pageSize={10}
        radius="sm"
        searchKeys={[
          "aviso",
          "tipologia",
          "zona",
          "texto_breve",
          "ubicacion",
          "prioridad",
        ]}
        searchPlaceholder="Buscar"
        shadow="none"
        showFilters={true}
        showPagination={true}
        showSearch={true}
      />
      <ImportCasesForm
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        onSuccess={() => {
          setIsImportModalOpen(false);
          refreshCases();
        }}
      />
      {notification && (
        <NotificationModal
          isOpen={true}
          message={notification.message}
          type={notification.type}
          onClose={() => setNotification(null)}
        />
      )}
      {casoToClose && (
        <CerrarCasoForm
          casoId={casoToClose.id}
          isOpen={!!casoToClose}
          onClose={() => setCasoToClose(null)}
          onSuccess={() => {
            setCasoToClose(null);
            refreshCases();
          }}
        />
      )}
    </div>
  );
};
