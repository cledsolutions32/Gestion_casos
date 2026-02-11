import type { DateValue } from "@internationalized/date";

import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Input } from "@heroui/input";
import { Button } from "@heroui/button";
import { Textarea } from "@heroui/input";
import { DatePicker } from "@heroui/date-picker";
import { parseDate } from "@internationalized/date";
import { Select, SelectSection, SelectItem } from "@heroui/select";

import { title } from "@/components/primitives";

function dateValueToFechaString(value: DateValue | null): string {
  if (!value) return "";

  return `${value.year}-${String(value.month).padStart(2, "0")}-${String(value.day).padStart(2, "0")}`;
}

function parseDateString(dateString: string): DateValue | null {
  if (!dateString.trim()) return null;
  try {
    return parseDate(dateString);
  } catch {
    return null;
  }
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

type CreateCaseFormProps = {
  onSuccess?: () => void;
  onCancel?: () => void;
};

const emptyForm = {
  aviso: "",
  tipologia: "",
  texto_breve: "",
  zona: "",
  ubicacion: "",
  fin_averia_tiempo_respuesta: "",
  prioridad: "",
  estado: "Abierto",
};

export function CreateCaseForm({ onSuccess, onCancel }: CreateCaseFormProps) {
  const navigate = useNavigate();
  const [form, setForm] = useState(emptyForm);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const update = (key: keyof typeof form, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const buildPayload = () => {
    const payload: Record<string, unknown> = {
      aviso: form.aviso.trim(),
    };

    if (form.tipologia.trim()) payload.tipologia = form.tipologia.trim();
    if (form.texto_breve.trim()) payload.texto_breve = form.texto_breve.trim();
    if (form.zona.trim()) payload.zona = form.zona.trim();
    if (form.ubicacion.trim()) payload.ubicacion = form.ubicacion.trim();
    if (form.fin_averia_tiempo_respuesta.trim())
      payload.fin_averia_tiempo_respuesta =
        form.fin_averia_tiempo_respuesta.trim();
    if (form.prioridad.trim()) payload.prioridad = form.prioridad.trim();
    payload.estado = form.estado.trim() || "Abierto";

    return payload;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    const avisoTrim = form.aviso.trim();

    if (!avisoTrim) {
      setError("El aviso es obligatorio.");

      return;
    }
    const avisoNum = Number(avisoTrim);

    if (!Number.isInteger(avisoNum) || avisoNum < 0) {
      setError("El aviso debe ser un número entero mayor o igual a 0.");

      return;
    }
    setIsLoading(true);
    try {
      const response = await fetch(`${API_URL}/cases`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildPayload()),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) {
        setError((data?.message as string) || "Error al crear el caso.");
        setIsLoading(false);

        return;
      }
      // Redirigir a la tabla de casos con mensaje de éxito
      if (onSuccess) {
        await onSuccess();
      }
      navigate("/cases", {
        state: {
          notification: {
            type: "success",
            message: "Caso creado exitosamente",
          },
        },
        replace: true,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error al crear el caso.");
      setIsLoading(false);
    }
  };

  const avisoValid =
    form.aviso.trim() !== "" &&
    Number.isInteger(Number(form.aviso.trim())) &&
    Number(form.aviso.trim()) >= 0;
  const isDisabled = !avisoValid || isLoading;

  const finAveriaTiempoRespuestaValue = useMemo(
    () => parseDateString(form.fin_averia_tiempo_respuesta),
    [form.fin_averia_tiempo_respuesta],
  );

  return (
    <div className="container mx-auto max-w-7xl bg-white px-32 py-12 rounded-lg border border-default-200">
      <div className="flex flex-row justify-between items-center mb-12">
        <h1 className={title({ size: "xl", fontWeight: "bold" })}>
          Crear caso
        </h1>
        <div className="flex flex-wrap gap-3">
          {onCancel && (
            <Button
              className="text-white"
              color="default"
              isDisabled={isLoading}
              type="button"
              variant="solid"
              onPress={onCancel}
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
          )}
          <Button
            className="text-default font-bold"
            color="primary"
            form="create-case-form"
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
              Guardar caso
            </span>
          </Button>
        </div>
      </div>
      <form
        className="mt-6 flex flex-col gap-6"
        id="create-case-form"
        onSubmit={handleSubmit}
      >
        {error && (
          <div
            className="rounded-md bg-danger-50 border border-danger-200 px-4 py-3 text-sm text-danger-700"
            role="alert"
          >
            {error}
          </div>
        )}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Input
            isRequired
            isDisabled={isLoading}
            label="Aviso"
            labelPlacement="outside-top"
            placeholder="Ej: 12345"
            radius="sm"
            type="text"
            value={form.aviso}
            variant="bordered"
            onValueChange={(v) => {
              // Solo permitir números enteros
              const numericValue = v.replace(/[^0-9]/g, "");

              update("aviso", numericValue);
            }}
          />
          <DatePicker
            isRequired
            granularity="day"
            isDisabled={isLoading}
            label="Fin avería con tiempo de respuesta"
            labelPlacement="outside-top"
            radius="sm"
            value={finAveriaTiempoRespuestaValue}
            variant="bordered"
            onChange={(value) =>
              update(
                "fin_averia_tiempo_respuesta",
                dateValueToFechaString(value),
              )
            }
          />
          <Select
            isDisabled={isLoading}
            label="Prioridad"
            labelPlacement="outside-top"
            listboxProps={{
              className:
                "[&_li[data-key]]:!bg-transparent [&_li[data-key]]:!text-[#2C2C2C] [&_li[data-key]:hover]:!bg-default [&_li[data-key]:hover]:!text-white [&_li[data-key]]:transition-colors [&_li[data-key]]:cursor-pointer",
            }}
            placeholder="Selecciona una prioridad"
            radius="sm"
            selectedKeys={[form.prioridad]}
            variant="bordered"
            onSelectionChange={(keys) =>
              update("prioridad", Array.from(keys)[0] as string)
            }
          >
            <SelectSection title="Prioridad">
              <SelectItem key="Urgente">Urgente</SelectItem>
              <SelectItem key="Muy elevado">Muy elevado</SelectItem>
              <SelectItem key="Alto">Alto</SelectItem>
              <SelectItem key="Medio">Medio</SelectItem>
              <SelectItem key="Bajo">Bajo</SelectItem>
            </SelectSection>
          </Select>
          <Textarea
            className="sm:col-span-3"
            isDisabled={isLoading}
            label="Descripción"
            labelPlacement="outside-top"
            minRows={3}
            placeholder="Descripción breve del caso"
            radius="sm"
            value={form.texto_breve}
            variant="bordered"
            onValueChange={(v) => update("texto_breve", v)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            isDisabled={isLoading}
            label="Zona"
            labelPlacement="outside-top"
            listboxProps={{
              className:
                "[&_li[data-key]]:!bg-transparent [&_li[data-key]]:!text-[#2C2C2C] [&_li[data-key]:hover]:!bg-default [&_li[data-key]:hover]:!text-white [&_li[data-key]]:transition-colors [&_li[data-key]]:cursor-pointer",
            }}
            placeholder="Selecciona una zona"
            radius="sm"
            selectedKeys={[form.zona]}
            variant="bordered"
            onSelectionChange={(keys) =>
              update("zona", Array.from(keys)[0] as string)
            }
          >
            <SelectSection title="Zona">
              <SelectItem key="Zona Bogotá">Zona Bogotá</SelectItem>
              <SelectItem key="Zona Oriental">Zona Oriental</SelectItem>
              <SelectItem key="Zona Ibagué Centro">
                Zona Ibagué Centro
              </SelectItem>
              <SelectItem key="Zona Santanderes">Zona Santanderes</SelectItem>
            </SelectSection>
          </Select>
          <Input
            description="Ingresa los últimos 4 dígitos del código de la tienda (ej: 5241 de VT-1008-5241)"
            isDisabled={isLoading}
            label="Ubicación"
            labelPlacement="outside-top"
            maxLength={4}
            placeholder="Últimos 4 dígitos del código (ej: 5241)"
            radius="sm"
            type="text"
            value={form.ubicacion}
            variant="bordered"
            onValueChange={(v) => {
              // Solo permitir números y máximo 4 dígitos
              const numericValue = v.replace(/[^0-9]/g, "").slice(0, 4);

              update("ubicacion", numericValue);
            }}
          />
          <Select
            isDisabled={isLoading}
            label="Estado"
            labelPlacement="outside-top"
            listboxProps={{
              className:
                "[&_li[data-key]]:!bg-transparent [&_li[data-key]]:!text-[#2C2C2C] [&_li[data-key]:hover]:!bg-default [&_li[data-key]:hover]:!text-white [&_li[data-key]]:transition-colors [&_li[data-key]]:cursor-pointer",
            }}
            placeholder="Selecciona un estado"
            radius="sm"
            selectedKeys={form.estado ? [form.estado] : []}
            variant="bordered"
            onSelectionChange={(keys) =>
              update("estado", (Array.from(keys)[0] as string) || "")
            }
          >
            <SelectSection title="Estado">
              <SelectItem key="Abierto">Abierto</SelectItem>
              <SelectItem key="Validando">Validando</SelectItem>
              <SelectItem key="Programado">Programado</SelectItem>
              <SelectItem key="En proceso">En proceso</SelectItem>
              <SelectItem key="Novedad">Novedad</SelectItem>
              <SelectItem key="Cerrado">Cerrado</SelectItem>
              <SelectItem key="Vencido">Vencido</SelectItem>
            </SelectSection>
          </Select>
          <Select
            isDisabled={isLoading}
            label="Tipología"
            labelPlacement="outside-top"
            listboxProps={{
              className:
                "[&_li[data-key]]:!bg-transparent [&_li[data-key]]:!text-[#2C2C2C] [&_li[data-key]:hover]:!bg-default [&_li[data-key]:hover]:!text-white [&_li[data-key]]:transition-colors [&_li[data-key]]:cursor-pointer",
            }}
            placeholder="Selecciona una tipología"
            radius="sm"
            selectedKeys={[form.tipologia]}
            variant="bordered"
            onSelectionChange={(keys) =>
              update("tipologia", Array.from(keys)[0] as string)
            }
          >
            <SelectSection title="Tipología">
              <SelectItem key="AIRE ACONDICIONADO">
                AIRE ACONDICIONADO
              </SelectItem>
              <SelectItem key="AUDIO VISUAL">AUDIO VISUAL</SelectItem>
              <SelectItem key="CIVIL">CIVIL</SelectItem>
              <SelectItem key="DISPENSADOR">DISPENSADOR</SelectItem>
              <SelectItem key="DOTACIÓN">DOTACIÓN</SelectItem>
              <SelectItem key="ELECTRICO">ELECTRICO</SelectItem>
              <SelectItem key="HIDRÁULICO">HIDRÁULICO</SelectItem>
              <SelectItem key="ILUMINACIÓN">ILUMINACIÓN</SelectItem>
              <SelectItem key="LIMPIEZA CORTINAS">LIMPIEZA CORTINAS</SelectItem>
              <SelectItem key="METALMECANICO">METALMECANICO</SelectItem>
              <SelectItem key="MOBILIARIO">MOBILIARIO</SelectItem>
              <SelectItem key="SEGURIDAD">SEGURIDAD</SelectItem>
              <SelectItem key="OTRO">OTRO</SelectItem>
            </SelectSection>
          </Select>
        </div>
      </form>
    </div>
  );
}
