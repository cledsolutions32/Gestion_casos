# Documentación: Importación de Casos desde Excel

## 📋 Tabla de Contenidos

1. [Requerimientos del Archivo Excel](#requerimientos-del-archivo-excel)
2. [Columnas Requeridas](#columnas-requeridas)
3. [Formato de Datos](#formato-de-datos)
4. [Zonas Permitidas](#zonas-permitidas)
5. [Proceso de Importación](#proceso-de-importación)
6. [Manejo de Duplicados](#manejo-de-duplicados)
7. [Errores Comunes](#errores-comunes)
8. [Ejemplo de Archivo](#ejemplo-de-archivo)

---

## 📄 Requerimientos del Archivo Excel

### Requisitos Generales

- **Formato de archivo**: `.xlsx` o `.xls`
- **Tamaño máximo**: 50 MB
- **Primera fila**: Debe contener los encabezados de las columnas
- **Al menos una fila de datos**: El archivo debe tener mínimo una fila con datos además del encabezado

### Estructura del Archivo

- **Hoja de trabajo**: Se procesa únicamente la primera hoja del archivo Excel
- **Encabezados**: La primera fila debe contener los nombres de las columnas
- **Datos**: Las filas siguientes contienen los datos de los casos
- **Filas vacías**: Se ignoran automáticamente

---

## 📊 Columnas Requeridas

El sistema busca las siguientes columnas **por nombre** (no por posición). Los nombres son case-insensitive y toleran espacios y saltos de línea.

### Columnas Obligatorias

| Nombre en Excel | Campo en Base de Datos | Descripción | Validaciones |
|----------------|------------------------|-------------|--------------|
| **Aviso** | `aviso` | Número único del caso | Debe ser un número entero válido (ej: 10246483) |
| **zona** | `zona` | Zona geográfica del caso | Debe estar en la lista de zonas permitidas |

### Columnas Opcionales

| Nombre en Excel | Campo en Base de Datos | Descripción | Formato |
|----------------|------------------------|-------------|---------|
| **Texto Breve** | `texto_breve` | Descripción breve del caso | Texto libre |
| **Tipologia** | `tipologia` | Tipo de caso | Texto libre |
| **Prioridad** | `prioridad` | Nivel de prioridad | Texto libre |
| **ubicación** | `ubicacion` | Código de ubicación/tienda | Código de 4 dígitos o formato "VT-XXXX-YYYY" |
| **Fecha Creado** | `fecha_creacion` | Fecha de creación del caso | Fecha (ver formato de fechas) |
| **Fin Avería con tiempo de respuesta** | `fin_averia_tiempo_respuesta` | Fecha límite de respuesta | Fecha (ver formato de fechas) |

### Notas sobre Nombres de Columnas

- El sistema normaliza los nombres eliminando:
  - Saltos de línea (`\r\n`, `\n`, `\r`)
  - Espacios múltiples
  - Diferencias entre mayúsculas y minúsculas
  
- Ejemplos de nombres válidos:
  - `"Fecha Creado"` ✅
  - `"Fecha \r\nCreado"` ✅ (se normaliza automáticamente)
  - `"Fecha   Creado"` ✅ (espacios múltiples se normalizan)
  - `"FECHA CREADO"` ✅ (case-insensitive)

---

## 📅 Formato de Datos

### Fechas

El sistema acepta fechas en múltiples formatos:

- **Formato Excel serial**: Número de días desde el 1 de enero de 1900
- **String de fecha**: `"2025-12-04"`, `"04/12/2025"`, etc.
- **Fecha con hora**: Se toma solo la parte de fecha

**Formato de salida**: Todas las fechas se convierten a `YYYY-MM-DD`

**Ejemplos válidos**:
- `2025-12-04`
- `04/12/2025`
- `45234` (número serial de Excel)
- `2025-12-04T10:30:00` (se toma solo la fecha)

### Ubicación

El sistema extrae automáticamente los últimos 4 dígitos del código de ubicación:

**Ejemplos**:
- `"VT-1008-5249"` → Se extrae `"5249"`
- `"5249"` → Se usa `"5249"`
- `"1008-5249"` → Se extrae `"5249"`

**Importante**: El código de 4 dígitos debe existir en la tabla `tiendas` de la base de datos.

### Aviso

- Debe ser un número entero positivo
- No puede estar vacío
- Ejemplos válidos: `10246483`, `12345`, `0`

---

## 🌍 Zonas Permitidas

Solo se importan casos de las siguientes zonas. El sistema acepta variaciones en mayúsculas/minúsculas y acentos:

### Zonas Válidas

1. **Zona Bogotá**
   - Variaciones aceptadas: `"Zona Bogotá"`, `"Zona Bogota"`, `"zona bogotá"`, etc.

2. **Zona Ibagué Centro**
   - Variaciones aceptadas: `"Zona Ibagué Centro"`, `"Zona Ibague centro"`, `"zona ibagué centro"`, etc.

3. **Zona Oriental**
   - Variaciones aceptadas: `"Zona Oriental"`, `"Zona oriental"`, `"zona oriental"`, etc.

4. **Zona Santanderes**
   - Variaciones aceptadas: `"Zona Santanderes"`, `"Zona Santander"`, `"zona santanderes"`, etc.

### Comportamiento

- ✅ Casos con zonas permitidas → Se procesan normalmente
- ❌ Casos con zonas no permitidas → Se omiten y se registra un error

---

## 🔄 Proceso de Importación

### Flujo Completo

```
1. Usuario selecciona archivo Excel
   ↓
2. Validación de archivo (extensión, tamaño)
   ↓
3. Lectura del archivo Excel
   ↓
4. Identificación de columnas por nombre
   ↓
5. Validación de columnas requeridas
   ↓
6. Procesamiento fila por fila:
   ├─ Validar Aviso (obligatorio, numérico)
   ├─ Validar Zona (obligatoria, permitida)
   ├─ Extraer y transformar datos
   └─ Filtrar por zonas permitidas
   ↓
7. Para cada caso válido:
   ├─ Intentar crear en base de datos
   ├─ Si duplicado → Comparar cambios
   ├─ Si hay cambios → Actualizar
   └─ Si no hay cambios → Omitir
   ↓
8. Retornar resultados con estadísticas
```

### Validaciones Realizadas

1. **Validación de archivo**:
   - Extensión válida (`.xlsx` o `.xls`)
   - Tamaño dentro del límite (50MB)
   - Archivo no corrupto

2. **Validación de estructura**:
   - Primera fila contiene encabezados
   - Al menos una fila de datos
   - Columnas requeridas presentes

3. **Validación de datos**:
   - Aviso: obligatorio, numérico, no vacío
   - Zona: obligatoria, en lista permitida
   - Ubicación: código válido en base de datos (si se proporciona)

---

## 🔁 Manejo de Duplicados

### Comportamiento

Cuando se encuentra un caso con un **aviso** que ya existe en la base de datos:

1. **Se obtiene el caso existente**
2. **Se comparan los siguientes campos**:
   - `texto_breve`
   - `tipologia`
   - `prioridad`
   - `zona`
   - `ubicacion`
   - `fecha_creacion`
   - `fin_averia_tiempo_respuesta`
   - `estado`

3. **Si hay cambios**:
   - ✅ Se actualiza el caso existente con los nuevos datos
   - Se registra como "caso actualizado"

4. **Si no hay cambios**:
   - ⏭️ Se omite el caso
   - Se registra como "caso omitido (sin cambios)"

### Ejemplo

**Caso existente en BD**:
```json
{
  "aviso": "10246483",
  "texto_breve": "TAPIZADO POLTRONA",
  "prioridad": "Bajo",
  "zona": "Zona Santanderes"
}
```

**Nuevo caso en Excel**:
```json
{
  "aviso": "10246483",
  "texto_breve": "TAPIZADO POLTRONA Y SOFA",
  "prioridad": "Alto",
  "zona": "Zona Santanderes"
}
```

**Resultado**: ✅ Caso actualizado (cambios en `texto_breve` y `prioridad`)

---

## ⚠️ Errores Comunes

### Errores de Archivo

| Error | Causa | Solución |
|-------|-------|----------|
| `Solo se permiten archivos Excel (.xlsx, .xls)` | Extensión incorrecta | Usar archivo `.xlsx` o `.xls` |
| `El archivo excede el tamaño máximo` | Archivo > 50MB | Reducir tamaño del archivo |
| `El archivo Excel debe tener al menos una fila de encabezados y una fila de datos` | Archivo vacío o sin datos | Agregar datos al archivo |

### Errores de Columnas

| Error | Causa | Solución |
|-------|-------|----------|
| `No se encontró la columna "Aviso"` | Columna faltante o nombre incorrecto | Verificar que la primera fila contenga exactamente "Aviso" |
| `No se encontró la columna "zona"` | Columna faltante o nombre incorrecto | Verificar que la primera fila contenga exactamente "zona" |

### Errores de Datos

| Error | Causa | Solución |
|-------|-------|----------|
| `Fila X: El aviso es obligatorio` | Celda de aviso vacía | Completar el campo Aviso |
| `Fila X: El aviso debe ser un número entero válido` | Aviso con formato incorrecto | Usar solo números (ej: 10246483) |
| `Fila X: La zona es obligatoria` | Celda de zona vacía | Completar el campo zona |
| `Fila X: Zona "XXX" no está en la lista de zonas permitidas` | Zona no permitida | Usar una de las zonas permitidas |
| `El código de ubicación "XXXX" no existe en la base de datos de tiendas` | Código de tienda inválido | Verificar que el código exista en la base de datos |

---

## 📝 Ejemplo de Archivo

### Estructura del Excel

| Aviso | Texto Breve | Tipologia | Prioridad | zona | ubicación | Fecha Creado | Fin Avería con tiempo de respuesta |
|-------|-------------|-----------|-----------|------|-----------|--------------|-------------------------------------|
| 10246483 | TAPIZADO POLTRONA Y SOFA | MOBILIARIO | Bajo | Zona Santanderes | VT-1008-5249 | 2025-12-04 | 2025-12-04 |
| 10247294 | REVISION ANTENAS CHECK POINT | SEGURIDAD | Alto | Zona Santanderes | 5427 | 2025-12-15 | 2025-12-15 |
| 10249458 | 5 SPOTS DE SALA DE VENTAS QUEMADA | ILUMINACIÓN | Alto | Zona Bogotá | VT-1008-5373 | 2026-01-15 | 2026-01-15 |

### Notas del Ejemplo

- ✅ Todas las columnas requeridas están presentes
- ✅ Los avisos son números válidos
- ✅ Las zonas están en la lista permitida
- ✅ Las ubicaciones pueden venir en formato completo o solo 4 dígitos
- ✅ Las fechas están en formato válido

---

## 📊 Resultados de Importación

### Respuesta Exitosa

```json
{
  "message": "Importación completada: 5 casos creados, 2 casos actualizados, 2 casos omitidos (sin cambios), 0 errores",
  "summary": {
    "totalRows": 9,
    "validCasesFound": 9,
    "created": 5,
    "updated": 2,
    "success": 7,
    "skipped": 2,
    "errors": 0
  },
  "success": [
    {
      "aviso": "10246483",
      "data": { ... },
      "updated": false
    },
    {
      "aviso": "10247294",
      "data": { ... },
      "updated": true,
      "changes": {
        "prioridad": { "old": "Bajo", "new": "Alto" }
      }
    }
  ],
  "errors": []
}
```

### Campos del Resumen

- **totalRows**: Total de filas procesadas (excluyendo encabezado)
- **validCasesFound**: Casos que pasaron todas las validaciones
- **created**: Casos nuevos creados
- **updated**: Casos duplicados que fueron actualizados
- **success**: Total de casos procesados exitosamente (created + updated)
- **skipped**: Casos duplicados sin cambios (omitidos)
- **errors**: Número de errores encontrados

---

## 🔧 Estado por Defecto

Todos los casos importados se crean con:
- **Estado**: `"Abierto"`

Este estado se puede modificar posteriormente desde la interfaz de la aplicación.

---

## 📞 Soporte

Si encuentras problemas con la importación:

1. Verifica que el archivo cumpla con todos los requerimientos
2. Revisa los mensajes de error en la respuesta de importación
3. Asegúrate de que las zonas y códigos de ubicación sean válidos
4. Verifica que los avisos sean únicos o que los duplicados tengan cambios

---

**Última actualización**: Febrero 2026
