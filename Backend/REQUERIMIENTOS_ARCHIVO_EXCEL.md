# 📋 Requerimientos del Archivo Excel para Importación de Casos

## ✅ Checklist Rápido

- [ ] Archivo en formato `.xlsx` o `.xls`
- [ ] Tamaño menor a 50 MB
- [ ] Primera fila contiene los encabezados de columnas
- [ ] Al menos una fila con datos
- [ ] Columna "Aviso" presente y con valores numéricos
- [ ] Columna "zona" presente y con valores válidos
- [ ] Zonas deben estar en la lista permitida

---

## 📊 Columnas Requeridas

### ⚠️ Obligatorias

| Nombre Exacto en Excel | Descripción | Ejemplo |
|------------------------|-------------|---------|
| **Aviso** | Número único del caso (solo números) | `10246483` |
| **zona** | Zona geográfica (ver zonas permitidas) | `Zona Santanderes` |

### 📝 Opcionales

| Nombre Exacto en Excel | Descripción | Ejemplo |
|------------------------|-------------|---------|
| **Texto Breve** | Descripción del caso | `TAPIZADO POLTRONA Y SOFA` |
| **Tipologia** | Tipo de caso | `MOBILIARIO` |
| **Prioridad** | Nivel de prioridad | `Alto`, `Bajo`, `Medio` |
| **ubicación** | Código de tienda (4 dígitos) | `5249` o `VT-1008-5249` |
| **Fecha Creado** | Fecha de creación | `2025-12-04` |
| **Fin Avería con tiempo de respuesta** | Fecha límite | `2025-12-04` |

---

## 🌍 Zonas Permitidas

Solo se importarán casos de estas zonas (acepta variaciones de mayúsculas/minúsculas):

1. ✅ **Zona Bogotá**
2. ✅ **Zona Ibagué Centro**
3. ✅ **Zona Oriental**
4. ✅ **Zona Santanderes**

❌ Cualquier otra zona será rechazada.

---

## 📅 Formato de Datos

### Fechas
- Formato aceptado: `YYYY-MM-DD` (ej: `2025-12-04`)
- También acepta formatos de Excel y otros formatos comunes
- Se convierte automáticamente al formato requerido

### Ubicación
- Formato completo: `VT-1008-5249` → Se extrae `5249`
- Formato corto: `5249` → Se usa directamente
- **Importante**: El código de 4 dígitos debe existir en la base de datos

### Aviso
- Solo números enteros
- No puede estar vacío
- Ejemplo válido: `10246483`

---

## 📝 Ejemplo de Estructura

```
| Aviso      | Texto Breve                    | Tipologia   | Prioridad | zona              | ubicación      | Fecha Creado | Fin Avería con tiempo de respuesta |
|------------|--------------------------------|-------------|-----------|-------------------|----------------|--------------|-----------------------------------|
| 10246483   | TAPIZADO POLTRONA Y SOFA      | MOBILIARIO  | Bajo      | Zona Santanderes  | VT-1008-5249   | 2025-12-04   | 2025-12-04                        |
| 10247294   | REVISION ANTENAS CHECK POINT  | SEGURIDAD   | Alto      | Zona Santanderes  | 5427           | 2025-12-15   | 2025-12-15                        |
```

---

## ⚠️ Errores Comunes y Soluciones

| Error | Solución |
|-------|----------|
| `No se encontró la columna "Aviso"` | Verificar que la primera fila tenga exactamente "Aviso" |
| `El aviso debe ser un número entero válido` | Usar solo números en la columna Aviso (ej: 10246483) |
| `Zona "XXX" no está en la lista de zonas permitidas` | Usar una de las 4 zonas permitidas |
| `El código de ubicación "XXXX" no existe` | Verificar que el código de 4 dígitos exista en la BD |

---

## 🔄 Comportamiento con Duplicados

- **Caso nuevo** → Se crea ✅
- **Caso duplicado con cambios** → Se actualiza ✅
- **Caso duplicado sin cambios** → Se omite ⏭️

---

## 📌 Notas Importantes

1. **Orden de columnas**: No importa el orden, se buscan por nombre
2. **Espacios y saltos de línea**: Se normalizan automáticamente
3. **Mayúsculas/minúsculas**: No importan en nombres de columnas
4. **Filas vacías**: Se ignoran automáticamente
5. **Estado**: Todos los casos se crean con estado "Abierto" por defecto

---

**Para más detalles, consulta**: `README_IMPORTACION.md`
