import type { SortDescriptor } from "@react-types/shared";

import {
  Table,
  TableHeader,
  TableColumn,
  TableBody,
  TableRow,
  TableCell,
} from "@heroui/table";
import { Input } from "@heroui/input";
import { Pagination } from "@heroui/pagination";
import { Spinner } from "@heroui/spinner";
import {
  useCallback,
  useMemo,
  useState,
  type Key,
  type ReactNode,
} from "react";

import { SearchIcon } from "./icons";
import { title } from "./primitives";

export type DataTableColumn<T> = {
  /** Clave única de la columna (usada para ordenar y como key) */
  key: string;
  /** Etiqueta del encabezado */
  label: string;
  /** Si la columna es ordenable */
  allowsSorting?: boolean;
  /** Alineación del contenido */
  align?: "start" | "center" | "end";
  /** Renderizado personalizado de la celda. Si no se define, se usa item[key] */
  renderCell?: (item: T) => ReactNode;
  /** Valor para ordenar (por defecto item[key]). Útil si renderCell es personalizado */
  sortValue?: (item: T) => string | number;
};

export type DataTableProps<T> = {
  /** Definición de columnas (encabezados y cómo mostrar cada una) */
  columns: DataTableColumn<T>[];
  /** Datos a mostrar */
  items: T[];
  /** Función para obtener la key única de cada fila */
  keyExtractor: (item: T) => Key;

  // Búsqueda (opcional)
  /** Mostrar barra de búsqueda */
  showSearch?: boolean;
  /** Placeholder del input de búsqueda */
  searchPlaceholder?: string;
  /** Keys del objeto en las que buscar (por defecto todas las columnas). Valores convertidos a string. */
  searchKeys?: (keyof T)[];

  // Filtros (opcional)
  /** Mostrar zona de filtros encima de la tabla */
  showFilters?: boolean;
  /** Contenido personalizado para filtros (dropdowns, chips, etc.) */
  filterContent?: ReactNode;

  // Paginación (opcional)
  /** Mostrar paginación */
  showPagination?: boolean;
  /** Tamaño de página cuando showPagination es true */
  pageSize?: number;

  // Estados
  /** Mensaje o componente cuando no hay datos */
  emptyContent?: ReactNode;
  /** Indica carga (muestra loadingContent en el body) */
  isLoading?: boolean;
  /** Contenido durante la carga (por defecto Spinner) */
  loadingContent?: ReactNode;

  // Apariencia
  /** Filas con franjas alternadas */
  isStriped?: boolean;
  /** Encabezado fijo al hacer scroll */
  isHeaderSticky?: boolean;
  /** Sombra del contenedor de la tabla (HeroUI: none | sm | md | lg) */
  shadow?: "none" | "sm" | "md" | "lg";
  /** Borde de la tabla */
  radius?: "none" | "sm" | "md" | "lg";
};

function getCellValue<T>(item: T, key: string): string {
  const value = (item as Record<string, unknown>)[key];

  if (value == null) return "";

  return String(value);
}

export function DataTable<T extends Record<string, unknown>>(
  props: DataTableProps<T>,
) {
  const {
    columns,
    items,
    keyExtractor,
    showSearch = false,
    searchPlaceholder = "Buscar…",
    searchKeys,
    showFilters = false,
    filterContent,
    showPagination = false,
    pageSize = 10,
    emptyContent = "No hay datos.",
    isLoading = false,
    loadingContent,
    isStriped = false,
    isHeaderSticky = false,
    shadow,
    radius,
  } = props;

  const [searchQuery, setSearchQuery] = useState("");
  const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor>({
    column: undefined,
    direction: "ascending",
  } as unknown as SortDescriptor);
  const [currentPage, setCurrentPage] = useState(1);

  const keysToSearch = useMemo(() => {
    if (searchKeys && searchKeys.length > 0) return searchKeys;

    return columns.map((c) => c.key as keyof T);
  }, [searchKeys, columns]);

  const filteredItems = useMemo(() => {
    if (!searchQuery.trim()) return items;
    const q = searchQuery.toLowerCase().trim();

    return items.filter((item) =>
      keysToSearch.some((key) => {
        const val = (item as Record<string, unknown>)[key as string];

        return String(val ?? "")
          .toLowerCase()
          .includes(q);
      }),
    );
  }, [items, searchQuery, keysToSearch]);

  const sortedItems = useMemo(() => {
    if (!sortDescriptor.column) return filteredItems;
    const col = columns.find((c) => c.key === sortDescriptor.column);
    const getValue =
      col?.sortValue ?? ((item: T) => getCellValue(item, col?.key ?? ""));
    const dir = sortDescriptor.direction === "ascending" ? 1 : -1;

    return [...filteredItems].sort((a, b) => {
      const va = getValue(a);
      const vb = getValue(b);
      const cmp = va < vb ? -1 : va > vb ? 1 : 0;

      return cmp * dir;
    });
  }, [filteredItems, sortDescriptor, columns]);

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / pageSize));
  const paginatedItems = useMemo(() => {
    if (!showPagination) return sortedItems;
    const start = (currentPage - 1) * pageSize;

    return sortedItems.slice(start, start + pageSize);
  }, [sortedItems, showPagination, currentPage, pageSize]);

  const onSortChange = useCallback((descriptor: SortDescriptor) => {
    setSortDescriptor(descriptor);
    setCurrentPage(1);
  }, []);

  const onPageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const topContent = useMemo(() => {
    const hasSearch = showSearch;
    const hasFilters = showFilters && filterContent;

    if (!hasSearch && !hasFilters) return null;

    return (
      <div className="flex flex-col gap-3">
        {(hasSearch || hasFilters) && (
          <div className="flex flex-wrap items-center justify-between gap-3">
            {showFilters && filterContent && (
              <div className="flex items-center gap-3">{filterContent}</div>
            )}
            {showSearch && (
              <Input
                isClearable
                aria-label="Buscar"
                className="max-w-[200px]"
                placeholder={searchPlaceholder}
                startContent={<SearchIcon />}
                value={searchQuery}
                onClear={() => setSearchQuery("")}
                onValueChange={setSearchQuery}
              />
            )}
          </div>
        )}
      </div>
    );
  }, [showSearch, showFilters, filterContent, searchPlaceholder, searchQuery]);

  const bottomContent = useMemo(() => {
    if (!showPagination || totalPages <= 1) return null;

    return (
      <div className="flex justify-center py-2">
        <Pagination
          showControls
          color="primary"
          page={currentPage}
          total={totalPages}
          onChange={onPageChange}
        />
      </div>
    );
  }, [showPagination, totalPages, currentPage, onPageChange]);

  return (
    <Table
      aria-label="Tabla de datos"
      bottomContent={bottomContent}
      bottomContentPlacement="outside"
      isHeaderSticky={isHeaderSticky}
      isStriped={isStriped}
      radius={radius}
      shadow={shadow}
      sortDescriptor={sortDescriptor}
      topContent={topContent}
      topContentPlacement="inside"
      onSortChange={onSortChange}
    >
      <TableHeader columns={columns}>
        {(column) => (
          <TableColumn
            key={column.key}
            align={column.align ?? "start"}
            allowsSorting={column.allowsSorting}
          >
            <span
              className={title({
                size: "sm",
                fontWeight: "semibold",
                color: "default",
                align: "center",
              })}
            >
              {column.label}
            </span>
          </TableColumn>
        )}
      </TableHeader>
      <TableBody
        emptyContent={emptyContent}
        isLoading={isLoading}
        items={paginatedItems}
        loadingContent={loadingContent ?? <Spinner />}
      >
        {(item) => (
          <TableRow key={keyExtractor(item)}>
            {(columnKey) => {
              const column = columns.find((c) => c.key === columnKey);

              if (!column)
                return (
                  <TableCell>{getCellValue(item, String(columnKey))}</TableCell>
                );
              const content = column.renderCell
                ? column.renderCell(item)
                : getCellValue(item, column.key);
              const cellAlign =
                column.align === "end"
                  ? "right"
                  : column.align === "center"
                    ? "center"
                    : "center";

              return (
                <TableCell align={cellAlign}>
                  <span
                    className={title({
                      size: "sm",
                      fontWeight: "normal",
                      color: "default",
                    })}
                  >
                    {content}
                  </span>
                </TableCell>
              );
            }}
          </TableRow>
        )}
      </TableBody>
    </Table>
  );
}
