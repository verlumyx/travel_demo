<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Reglas de Arquitectura y Guía de Agentes

Este proyecto sigue una **Arquitectura Modular Estricta** basada en Next.js App Router (React 19), Server Actions, Drizzle ORM (PostgreSQL), better-auth (RBAC) y Zod.

Todos los agentes y desarrolladores **DEBEN** respetar estas reglas sin excepción en cada cambio o adición al código.

---

## 🚨 Reglas Fundamentales (Inviolables)

### 1. Prohibido ejecutar consultas SQL directas en Páginas (`page.tsx`) o Componentes UI
* **NUNCA** importar `db` de `@/db/client` ni operadores de `drizzle-orm` (`eq`, `select`, etc.) dentro de archivos `page.tsx`, `layout.tsx` o componentes de interfaz.
* Las páginas solo deben obtener datos consumiendo los **Servicios** a través del contenedor del módulo (`create{Module}Container()`).
* La serialización de datos hacia componentes cliente debe realizarse siempre a través de **Serializadores DTO** (`to{Module}Dto`).

### 2. Prohibido ejecutar consultas o mutaciones SQL directas en Server Actions (`actions.ts`)
* Las Server Actions son capas delgadas de transporte HTTP/RPC: **no contienen lógica de negocio ni sentencias SQL**.
* **NUNCA** ejecutar `tx.select()`, `tx.insert()`, `tx.update()` ni `tx.delete()` dentro de `actions.ts`.
* Flujo obligatorio en toda Server Action:
  1. `await requirePermission('{module}.{action}')`
  2. Validación de entrada con Zod (`schema.safeParse(...)`)
  3. Construcción del Command (`Create{Module}Command.fromInput(...)`)
  4. Delimitación transaccional: Si la mutación afecta varias tablas, se envuelve en `await db.transaction(async (tx) => { const container = create{Module}Container(tx); await container.service.execute(command); })`. Si es una actualización atómica simple (ej. `updateStatus`), se pasa `db` directo al contenedor.
  5. `revalidatePath(...)` y retorno de `ActionState` serializable (o `redirect()` fuera del `try/catch`).

### 3. Exclusividad de la Capa de Repositorios para la Base de Datos
* **ÚNICAMENTE** los archivos bajo `src/modules/{module}/repositories/drizzle-{module}.repository.ts` tienen permitido realizar operaciones con Drizzle ORM (`select`, `insert`, `update`, transacciones atómicas internas).
* Todo acceso a base de datos debe estar tipado y modelado mediante la interfaz del repositorio (`{module}.repository.ts`).

### 4. Política de Cero Borrado Físico (`no-delete-policy`)
* **NUNCA** se ejecuta `DELETE` o `db.delete()` en ninguna tabla de negocio.
* Los registros se desactivan mediante columnas de estado (`status = 'inactive'`, `status = 'cancelled'`) o marcas temporales de soft delete.

### 5. Identificadores Primarios UUID v7
* Todas las tablas de dominio deben usar **UUID v7** generado como clave primaria (`uuidv7()` / `crypto.randomUUID()`).

### 6. Control de Acceso Basado en Roles (RBAC)
* Cada página protegida debe incluir `await guardPage('{module}.{action}')`.
* Cada Server Action debe incluir `await requirePermission('{module}.{action}')` como primera línea de su bloque `try`.

---

## 📚 Catálogo y Guía de Skills del Proyecto (`.agents/skills/`)

El proyecto cuenta con un conjunto de habilidades especializadas que norman la implementación de cada capa. Consulta y sigue la skill correspondiente según la tarea a ejecutar:

### 1. `nextjs-modular-architecture`
* **Cuándo usar:** Al crear un módulo nuevo, planificar una funcionalidad completa o consultar la organización general de carpetas y dependencias.
* **Propósito:** Define el estándar arquitectónico global: separación entre `src/app/` (capa HTTP) y `src/modules/{module-name}/` (dominio, aplicación e infraestructura).

### 2. `nextjs-module-pages`
* **Cuándo usar:** Al crear o modificar vistas GET (`page.tsx`, `create/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx`).
* **Propósito:** Reglas para Server Components: resolución de `params` y `searchParams` asíncronos (Next.js 15+), protección con `guardPage()`, instanciación de contenedores, llamadas a servicios y mapeo con `to{Module}Dto()`.

### 3. `nextjs-module-actions`
* **Cuándo usar:** Al crear o editar `src/app/{module}s/actions.ts` o mutaciones del servidor con `'use server'`.
* **Propósito:** Estándar de Server Actions: validación Zod, verificación de permisos con `requirePermission()`, manejo de transacciones con `tx`, uso de `toActionError()`, revalidaciones de caché y redirecciones fuera del `try/catch`.

### 4. `nextjs-module-repositories`
* **Cuándo usar:** Al definir o modificar interfaces de repositorio, mapas de filtros o la implementación con Drizzle (`drizzle-{module}.repository.ts`).
* **Propósito:** Abstracción del acceso a datos, soporte de `DbExecutor` (conexión estándar o transacción `tx`), filtros dinámicos y aislamiento del ORM.

### 5. `nextjs-module-services`
* **Cuándo usar:** Al implementar la lógica de negocio y casos de uso en `src/modules/{module}/services/` (`create`, `update`, `update-status`, `find`, `search`).
* **Propósito:** Clases de servicio enfocadas con un único método `execute()`, inyección del repositorio y orquestación de reglas de dominio.

### 6. `nextjs-module-commands`
* **Cuándo usar:** Al crear o modificar objetos de transferencia de comandos en `src/modules/{module}/commands/`.
* **Propósito:** Clases DTO inmutables con método estático `fromInput()` para desacoplar los datos validados de la interfaz de usuario de la ejecución del servicio.

### 7. `nextjs-module-validation`
* **Cuándo usar:** Al escribir esquemas Zod en `src/modules/{module}/validation/` (`create`, `update`, `update-status`, `search`).
* **Propósito:** Validación estricta de formularios y parámetros de búsqueda (`searchParams`), mensajes de error amigables y tipado inferido.

### 8. `nextjs-module-serializers`
* **Cuándo usar:** Al definir funciones de serialización DTO en `src/modules/{module}/serializers/`.
* **Propósito:** Transformar filas crudas de la base de datos (`Row`) en DTOs planos (`to{Module}Dto`) antes de ser enviados a Client Components o respuestas de acciones, evitando fugas de datos o serialización de tipos complejos (como `Date` o `Decimal`).

### 9. `nextjs-module-models`
* **Cuándo usar:** Al definir esquemas de tablas Drizzle en `src/modules/{module}/models/`.
* **Propósito:** Convenciones para `pgTable`: nombres de tablas (`snake_case`), claves primarias UUID v7, columnas de auditoría (`createdAt`, `updatedAt`), relaciones e inferencia de tipos `Row` e `InsertRow`.

### 10. `nextjs-module-sequential-code`
* **Cuándo usar:** Al implementar códigos identificadores correlativos de negocio (ej. `CLI000001`, `DEP000001`, `RES000001`).
* **Propósito:** Generación atómica y segura de códigos secuenciales dentro del repositorio usando `for('update')` en transacciones para evitar colisiones de concurrencia.

### 11. `nextjs-module-exceptions`
* **Cuándo usar:** Al crear errores de dominio en `src/modules/{module}/exceptions/`.
* **Propósito:** Jerarquía de excepciones que heredan de `DomainError` (`NotFoundError`, `ConflictError`, `ValidationError`), facilitando su captura y mapeo automático a mensajes de usuario con `toActionError()`.

### 12. `nextjs-modular-frontend`
* **Cuándo usar:** Al desarrollar componentes, formularios, modales y tablas bajo `src/modules/{module}/ui/` o en las páginas de la aplicación.
* **Propósito:** Integración con React 19, componentes de shadcn/ui, hooks de formularios (`useActionState`, `useFormStatus`, `startTransition`), badges de estado y consistencia visual.

### 13. `no-delete-policy`
* **Cuándo usar:** En cualquier caso de uso donde se solicite borrar, dar de baja o archivar registros.
* **Propósito:** Políticas y patrones para soft-delete y cambios de estado a nivel de esquema, repositorio y servicio.
