# Especificación Técnica: Módulo Métodos de Pago (`payment-methods`)

Documento técnico y funcional para la implementación del módulo **Métodos de Pago**, diseñado bajo la **Arquitectura Modular Estricta** de Next.js App Router (React 19), Server Actions, Drizzle ORM (PostgreSQL), better-auth (RBAC) y Zod.

---

## 1. Resumen Ejecutivo y Propósito

El módulo de **Métodos de Pago** (`payment-methods`) permite a los administradores de la agencia de viajes configurar, activar, desactivar y gestionar las diferentes vías y cuentas receptoras de fondos (p. ej. Pago Móvil, Zelle, Transferencias Bancarias, Binance Pay / Cripto, Efectivo en Taquilla, etc.).

### Problema que resuelve
Actualmente, las coordenadas bancarias en el flujo de reserva y checkout están codificadas de forma estática en componentes cliente (`ClientCheckoutForm.tsx`). Este módulo desacopla la información financiera y operativa, permitiendo que:
1. La agencia configure sus métodos de pago con su moneda correspondiente (`USD`, `VES`, `EUR`, etc.).
2. Se proporcione un campo de texto amplio (**Textarea**) donde la agencia coloca libremente las coordenadas bancarias, titulares, números de cuenta, correos, IDs de billeteras e instrucciones específicas de pago.
3. El portal de reservas del cliente (`/reservar/[id]`) y los formularios administrativos consulten dinámicamente los métodos de pago activos (`status = 'active'`) y presenten las instrucciones formateadas en tiempo real al viajero.

### Ubicación en el Sistema
* **Panel Administrativo:** Ubicado en la sección de **Configuración** (`section: 'config'`) del menú lateral (Sidebar), junto a Usuarios y Roles.
* **Ruta Base HTTP:** `/admin/payment-methods`
* **Slug del Módulo:** `payment-methods`
* **Nombre de Carpeta Backend:** `src/modules/payment-method/`

---

## 2. Modelo de Datos (Drizzle ORM)

Cumple con las reglas inviolables del proyecto:
* Prefijo obligatorio `app_` en el nombre de la tabla (`app_payment_methods`).
* Clave primaria UUID v7 (`id`).
* Código correlativo secuencial único (`code`, ej. `PMT000001`) con prefijo `PMT` y ancho de 6 dígitos.
* Columna de estado tipada (`status: 'active' | 'inactive'`) respetando la política de **cero borrado físico** (`no-delete-policy`).
* Campo `instructions` tipo `text` para almacenar las coordenadas bancarias y notas ingresadas en el textarea.
* Marcas de tiempo con zona horaria (`timestamptz`).

### 2.1 Definición de la Tabla
`src/modules/payment-method/models/payment-method.model.ts`

```ts
import { type InferInsertModel, type InferSelectModel } from 'drizzle-orm';
import { index, pgTable, text, timestamp, uniqueIndex, uuid, varchar } from 'drizzle-orm/pg-core';

export const paymentMethods = pgTable(
  'app_payment_methods',
  {
    id: uuid('id').primaryKey(),
    code: varchar('code', { length: 20 }).notNull().unique(),
    name: varchar('name', { length: 150 }).notNull(),
    currency: varchar('currency', { length: 10 }).notNull().default('USD'),
    instructions: text('instructions').notNull(),
    status: varchar('status', { length: 50 })
      .notNull()
      .default('active')
      .$type<'active' | 'inactive'>(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true })
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    uniqueIndex('idx_payment_methods_code').on(t.code),
    index('idx_payment_methods_status').on(t.status),
    index('idx_payment_methods_currency').on(t.currency),
  ],
);

export const PAYMENT_METHOD_CODE_PREFIX = 'PMT';
export const PAYMENT_METHOD_CODE_WIDTH = 6;

export type PaymentMethodRow = InferSelectModel<typeof paymentMethods>;
export type NewPaymentMethodRow = InferInsertModel<typeof paymentMethods>;
```

### 2.2 Diccionario de Campos

| Campo | Tipo SQL | Nullable | Default | Descripción |
|---|---|---|---|---|
| `id` | `uuid` PK | No | — | Identificador primario UUID v7 generado en cliente/dominio. |
| `code` | `varchar(20)` UNIQUE | No | — | Folio correlativo auto-generado (`PMT000001`). Bloqueo pesimista en repo. |
| `name` | `varchar(150)` | No | — | Nombre descriptivo (ej: *"Pago Móvil Banesco"*, *"Zelle Oficial"*, *"Binance USDT"*). |
| `currency` | `varchar(10)` | No | `'USD'` | Moneda en la que se recibe el abono (`USD`, `VES`, `EUR`, `USDT`, etc.). |
| `instructions` | `text` | No | — | **Campo Textarea:** Coordenadas bancarias, RIF, teléfono, email, número de cuenta o notas para el pago. |
| `status` | `varchar(50)` | No | `'active'` | Estado operativo (`active` o `inactive`). Cero borrado físico. |
| `created_at` | `timestamptz` | No | `now()` | Fecha de registro en el sistema. |
| `updated_at` | `timestamptz` | Sí | `now()` | Fecha de última modificación de los datos o instrucciones. |

---

## 3. Matriz de Permisos y Menú (Sidebar)

### 3.1 Permisos Granulares
`src/modules/payment-method/permissions.ts`

```ts
export const PAYMENT_METHOD_MODULE = {
  id: 'payment-methods',
  label: 'Métodos de Pago',
  permissions: [
    { id: 'payment-methods.list', label: 'Listar métodos de pago' },
    { id: 'payment-methods.show', label: 'Ver detalle de método de pago' },
    { id: 'payment-methods.create', label: 'Crear nuevos métodos de pago' },
    { id: 'payment-methods.update', label: 'Editar método de pago e instrucciones' },
    { id: 'payment-methods.update-status', label: 'Activar o inactivar métodos de pago' },
  ],
} as const;
```

### 3.2 Registro en el Menú Lateral (Sidebar)
`src/modules/shared/menu/menu-registry.ts`

Se ubica en la sección `'config'` con orden posterior a Roles:

```ts
// === Config Section ===
{ id: 'users', label: 'Usuarios', url: '/admin/users', permission: 'users.list', icon: 'UserCog', order: 100, section: 'config' },
{ id: 'roles', label: 'Roles', url: '/admin/roles', permission: 'roles.list', icon: 'Shield', order: 110, section: 'config' },
{ id: 'payment-methods', label: 'Métodos de Pago', url: '/admin/payment-methods', permission: 'payment-methods.list', icon: 'WalletCards', order: 120, section: 'config' },
```

---

## 4. Estructura de Archivos del Módulo

El módulo se distribuye entre la capa HTTP (`src/app/(admin)/admin/payment-methods/`) y la capa de dominio/aplicación (`src/modules/payment-method/`):

```text
src/
├── app/
│   └── (admin)/
│       └── admin/
│           └── payment-methods/
│               ├── page.tsx                       # Listado con filtros y paginación
│               ├── create/
│               │   └── page.tsx                   # Página con formulario de creación
│               ├── [id]/
│               │   ├── page.tsx                   # Ficha de detalle del método de pago
│               │   └── edit/
│               │       └── page.tsx               # Página con formulario de edición
│               └── actions.ts                     # Server Actions ('use server')
└── modules/
    └── payment-method/
        ├── models/
        │   └── payment-method.model.ts            # Esquema Drizzle y tipos Row
        ├── validation/
        │   ├── create-payment-method.schema.ts    # Zod: id, name, currency, instructions
        │   ├── update-payment-method.schema.ts    # Zod: name, currency, instructions
        │   ├── update-status-payment-method.schema.ts # Zod: status ('active' | 'inactive')
        │   └── search-payment-method.schema.ts    # Zod: search, status, currency, limit, offset
        ├── commands/
        │   ├── create-payment-method.command.ts
        │   ├── update-payment-method.command.ts
        │   ├── update-status-payment-method.command.ts
        │   └── search-payment-method.command.ts
        ├── serializers/
        │   └── payment-method.serializer.ts       # toPaymentMethodDto(row) -> JSON plano
        ├── repositories/
        │   ├── payment-method.repository.ts       # Interfaz abstracta del repositorio
        │   ├── payment-method.filters.ts          # FilterMap Drizzle
        │   └── drizzle-payment-method.repository.ts # Implementación con Drizzle + generateNextCode()
        ├── services/
        │   ├── payment-method-create.service.ts
        │   ├── payment-method-update.service.ts
        │   ├── payment-method-update-status.service.ts
        │   ├── payment-method-find.service.ts
        │   └── payment-method-search.service.ts
        ├── exceptions/
        │   └── payment-method-not-found.exception.ts # Hereda de DomainError
        ├── container.ts                           # Inyección de dependencias createPaymentMethodContainer(db)
        ├── permissions.ts                         # Declaración de permisos del módulo
        ├── routes.ts                              # Enrutamiento tipado (paymentMethodRoutes)
        └── ui/
            ├── PaymentMethodForm.tsx              # Formulario con campo Textarea para datos bancarios
            ├── PaymentMethodStatusBadge.tsx       # Badge visual de estado
            ├── PaymentMethodStatusToggle.tsx      # Botón de alternancia de estado activo/inactivo
            ├── PaymentMethodCard.tsx              # Tarjeta de detalle con instrucciones
            └── PaymentMethodList.tsx              # Tabla administrativa de listado
```

---

## 5. Especificación de Capas (Código e Implementación)

### 5.1 Capa de Validación (Zod)
Valida los datos recibidos desde los formularios y parámetros URL con mensajes descriptivos en español:

```ts
// src/modules/payment-method/validation/create-payment-method.schema.ts
import { z } from 'zod';

export const createPaymentMethodSchema = z.object({
  id: z.string().uuid({ message: 'El identificador debe ser un UUID válido.' }),
  name: z.string().trim().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }).max(150),
  currency: z.string().trim().min(2, { message: 'Indique una moneda válida.' }).max(10).default('USD'),
  instructions: z.string().trim().min(10, { message: 'Las instrucciones y coordenadas bancarias deben tener al menos 10 caracteres.' }),
});

export type CreatePaymentMethodInput = z.infer<typeof createPaymentMethodSchema>;
```

```ts
// src/modules/payment-method/validation/update-payment-method.schema.ts
import { z } from 'zod';

export const updatePaymentMethodSchema = z.object({
  name: z.string().trim().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }).max(150),
  currency: z.string().trim().min(2, { message: 'Indique una moneda válida.' }).max(10).default('USD'),
  instructions: z.string().trim().min(10, { message: 'Las instrucciones y coordenadas bancarias deben tener al menos 10 caracteres.' }),
});

export type UpdatePaymentMethodInput = z.infer<typeof updatePaymentMethodSchema>;
```

```ts
// src/modules/payment-method/validation/update-status-payment-method.schema.ts
import { z } from 'zod';

export const updateStatusPaymentMethodSchema = z.object({
  status: z.enum(['active', 'inactive'], { message: 'Estado inválido.' }),
});

export type UpdateStatusPaymentMethodInput = z.infer<typeof updateStatusPaymentMethodSchema>;
```

### 5.2 Capa de Comandos (Commands)
Objetos inmutables que desacoplan la entrada de usuario de la ejecución del servicio:

```ts
// src/modules/payment-method/commands/create-payment-method.command.ts
import type { CreatePaymentMethodInput } from '../validation/create-payment-method.schema';

export class CreatePaymentMethodCommand {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly currency: string,
    public readonly instructions: string,
  ) {}

  static fromInput(input: CreatePaymentMethodInput): CreatePaymentMethodCommand {
    return new CreatePaymentMethodCommand(
      input.id,
      input.name,
      input.currency,
      input.instructions,
    );
  }
}
```

### 5.3 Serializador DTO
Transforma filas crudas del ORM en DTOs JSON-safe para componentes cliente:

```ts
// src/modules/payment-method/serializers/payment-method.serializer.ts
import type { PaymentMethodRow } from '../models/payment-method.model';

export type PaymentMethodDto = {
  id: string;
  code: string;
  name: string;
  currency: string;
  instructions: string;
  status: 'active' | 'inactive';
  createdAt: string;
  updatedAt: string | null;
};

export function toPaymentMethodDto(row: PaymentMethodRow): PaymentMethodDto {
  return {
    id: row.id,
    code: row.code,
    name: row.name,
    currency: row.currency,
    instructions: row.instructions,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt ? row.updatedAt.toISOString() : null,
  };
}
```

### 5.4 Repositorio y Generación de Código Secuencial
Genera de manera atómica el código `PMT000001` mediante bloqueo pesimista `.for('update')` dentro de la transacción:

```ts
// src/modules/payment-method/repositories/payment-method.repository.ts
import type { PaymentMethodRow } from '../models/payment-method.model';
import type { CreatePaymentMethodCommand } from '../commands/create-payment-method.command';
import type { UpdatePaymentMethodCommand } from '../commands/update-payment-method.command';
import type { UpdateStatusPaymentMethodCommand } from '../commands/update-status-payment-method.command';
import type { SearchPaymentMethodCommand } from '../commands/search-payment-method.command';

export interface PaymentMethodRepository {
  create(command: CreatePaymentMethodCommand): Promise<void>;
  findById(id: string): Promise<PaymentMethodRow | null>;
  findOrFail(id: string): Promise<PaymentMethodRow>;
  update(row: PaymentMethodRow, command: UpdatePaymentMethodCommand): Promise<void>;
  updateStatus(row: PaymentMethodRow, command: UpdateStatusPaymentMethodCommand): Promise<void>;
  search(command: SearchPaymentMethodCommand): Promise<{ data: PaymentMethodRow[]; total: number }>;
  findActiveMethods(): Promise<PaymentMethodRow[]>;
}
```

```ts
// src/modules/payment-method/repositories/drizzle-payment-method.repository.ts
import { and, count, desc, eq, like } from 'drizzle-orm';
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { applyFilters } from '@/modules/shared/infrastructure/drizzle-query-filters';
import {
  paymentMethods,
  PAYMENT_METHOD_CODE_PREFIX,
  PAYMENT_METHOD_CODE_WIDTH,
  type PaymentMethodRow,
} from '../models/payment-method.model';
import { paymentMethodFilters } from './payment-method.filters';
import { PaymentMethodNotFoundException } from '../exceptions/payment-method-not-found.exception';
import type { PaymentMethodRepository } from './payment-method.repository';
import type { CreatePaymentMethodCommand } from '../commands/create-payment-method.command';
import type { UpdatePaymentMethodCommand } from '../commands/update-payment-method.command';
import type { UpdateStatusPaymentMethodCommand } from '../commands/update-status-payment-method.command';
import type { SearchPaymentMethodCommand } from '../commands/search-payment-method.command';

export class DrizzlePaymentMethodRepository implements PaymentMethodRepository {
  constructor(private readonly db: DbExecutor) {}

  async create(command: CreatePaymentMethodCommand): Promise<void> {
    const code = await this.generateNextCode();
    await this.db.insert(paymentMethods).values({
      id: command.id,
      code,
      name: command.name,
      currency: command.currency,
      instructions: command.instructions,
      status: 'active',
    });
  }

  async findById(id: string): Promise<PaymentMethodRow | null> {
    const [row] = await this.db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.id, id))
      .limit(1);
    return row ?? null;
  }

  async findOrFail(id: string): Promise<PaymentMethodRow> {
    const row = await this.findById(id);
    if (!row) throw new PaymentMethodNotFoundException(id);
    return row;
  }

  async update(row: PaymentMethodRow, command: UpdatePaymentMethodCommand): Promise<void> {
    await this.db
      .update(paymentMethods)
      .set({
        name: command.name,
        currency: command.currency,
        instructions: command.instructions,
      })
      .where(eq(paymentMethods.id, row.id));
  }

  async updateStatus(row: PaymentMethodRow, command: UpdateStatusPaymentMethodCommand): Promise<void> {
    await this.db
      .update(paymentMethods)
      .set({ status: command.status })
      .where(eq(paymentMethods.id, row.id));
  }

  async search(command: SearchPaymentMethodCommand): Promise<{ data: PaymentMethodRow[]; total: number }> {
    const whereConditions = applyFilters(paymentMethodFilters, command.filters);
    const where = whereConditions.length > 0 ? and(...whereConditions) : undefined;

    const [{ total }] = await this.db.select({ total: count() }).from(paymentMethods).where(where);

    const data = await this.db
      .select()
      .from(paymentMethods)
      .where(where)
      .orderBy(desc(paymentMethods.createdAt))
      .limit(command.limit)
      .offset(command.offset);

    return { data, total };
  }

  async findActiveMethods(): Promise<PaymentMethodRow[]> {
    return this.db
      .select()
      .from(paymentMethods)
      .where(eq(paymentMethods.status, 'active'))
      .orderBy(paymentMethods.name);
  }

  private async generateNextCode(): Promise<string> {
    const scope = like(paymentMethods.code, `${PAYMENT_METHOD_CODE_PREFIX}%`);

    // Bloqueo pesimista sobre el último registro correlativo
    await this.db
      .select({ id: paymentMethods.id })
      .from(paymentMethods)
      .where(scope)
      .orderBy(desc(paymentMethods.code))
      .limit(1)
      .for('update');

    const [last] = await this.db
      .select({ code: paymentMethods.code })
      .from(paymentMethods)
      .where(scope)
      .orderBy(desc(paymentMethods.code))
      .limit(1);

    const next = last ? Number(last.code.slice(PAYMENT_METHOD_CODE_PREFIX.length)) + 1 : 1;
    return `${PAYMENT_METHOD_CODE_PREFIX}${String(next).padStart(PAYMENT_METHOD_CODE_WIDTH, '0')}`;
  }
}
```

### 5.5 Contenedor de Inyección de Dependencias
`src/modules/payment-method/container.ts`

```ts
import type { DbExecutor } from '@/modules/shared/infrastructure/db-executor';
import { DrizzlePaymentMethodRepository } from './repositories/drizzle-payment-method.repository';
import { PaymentMethodCreateService } from './services/payment-method-create.service';
import { PaymentMethodUpdateService } from './services/payment-method-update.service';
import { PaymentMethodUpdateStatusService } from './services/payment-method-update-status.service';
import { PaymentMethodFindService } from './services/payment-method-find.service';
import { PaymentMethodSearchService } from './services/payment-method-search.service';

export function createPaymentMethodContainer(db: DbExecutor) {
  const repository = new DrizzlePaymentMethodRepository(db);

  return {
    repository,
    createService: new PaymentMethodCreateService(repository),
    updateService: new PaymentMethodUpdateService(repository),
    updateStatusService: new PaymentMethodUpdateStatusService(repository),
    findService: new PaymentMethodFindService(repository),
    searchService: new PaymentMethodSearchService(repository),
  };
}
```

### 5.6 Server Actions (Mutaciones Seguras)
`src/app/(admin)/admin/payment-methods/actions.ts`

```ts
'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { db } from '@/db/client';
import { requirePermission } from '@/modules/shared/auth/require-permission';
import { toActionError, type ActionState } from '@/modules/shared/actions/action-state';
import { setFlash } from '@/modules/shared/flash/flash';
import { createPaymentMethodSchema } from '@/modules/payment-method/validation/create-payment-method.schema';
import { updatePaymentMethodSchema } from '@/modules/payment-method/validation/update-payment-method.schema';
import { updateStatusPaymentMethodSchema } from '@/modules/payment-method/validation/update-status-payment-method.schema';
import { CreatePaymentMethodCommand } from '@/modules/payment-method/commands/create-payment-method.command';
import { UpdatePaymentMethodCommand } from '@/modules/payment-method/commands/update-payment-method.command';
import { UpdateStatusPaymentMethodCommand } from '@/modules/payment-method/commands/update-status-payment-method.command';
import { createPaymentMethodContainer } from '@/modules/payment-method/container';
import { paymentMethodRoutes } from '@/modules/payment-method/routes';

export async function createPaymentMethodAction(
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('payment-methods.create');

    const parsed = createPaymentMethodSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { status: 'error', fieldErrors: parsed.error.flatten().fieldErrors };
    }

    await db.transaction(async (tx) => {
      await createPaymentMethodContainer(tx).createService.execute(
        CreatePaymentMethodCommand.fromInput(parsed.data),
      );
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(paymentMethodRoutes.index());
  await setFlash('success', 'Método de pago creado exitosamente.');
  redirect(paymentMethodRoutes.index());
}

export async function updatePaymentMethodAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('payment-methods.update');

    const parsed = updatePaymentMethodSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { status: 'error', fieldErrors: parsed.error.flatten().fieldErrors };
    }

    await db.transaction(async (tx) => {
      await createPaymentMethodContainer(tx).updateService.execute(
        id,
        UpdatePaymentMethodCommand.fromInput(parsed.data),
      );
    });
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(paymentMethodRoutes.index());
  revalidatePath(paymentMethodRoutes.show(id));
  await setFlash('success', 'Método de pago actualizado correctamente.');
  redirect(paymentMethodRoutes.index());
}

export async function updatePaymentMethodStatusAction(
  id: string,
  _prev: ActionState,
  formData: FormData,
): Promise<ActionState> {
  try {
    await requirePermission('payment-methods.update-status');

    const parsed = updateStatusPaymentMethodSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) {
      return { status: 'error', fieldErrors: parsed.error.flatten().fieldErrors };
    }

    await createPaymentMethodContainer(db).updateStatusService.execute(
      id,
      UpdateStatusPaymentMethodCommand.fromInput(parsed.data),
    );
  } catch (error) {
    return toActionError(error);
  }

  revalidatePath(paymentMethodRoutes.index());
  await setFlash('success', 'Estado del método de pago actualizado.');
  return { status: 'idle' };
}
```

---

## 6. Integración con el Checkout y Formulario de Reservas

### 6.1 Problema Original vs. Solución Dinámica

```
[ ANTES (Hardcodeado) ]
ClientCheckoutForm.tsx
   └── Condicionales estáticas if (method === 'pago_movil') -> Banesco 0134...
                                if (method === 'zelle') -> pagos@...

[ AHORA (Dinámico y Centralizado) ]
1. Base de Datos: app_payment_methods (nombre, moneda, instructions)
2. Admin: Configura cuentas, bancos, titulares en el textarea de instructions.
3. Portal /reservar/[id]:
   - Consulta métodos activos: createPaymentMethodContainer(db).findActiveMethods()
   - Serializa a PaymentMethodDto[]
   - Pasa la lista a <ClientCheckoutForm paymentMethods={activeMethods} />
4. Checkout UI:
   - El viajero elige el método en un selector dinámico (Select2 / Tabs / Cards).
   - El cuadro de coordenadas bancarias renderiza:
     {selectedMethod.instructions} (conservando formato y saltos de línea con whitespace-pre-wrap).
```

### 6.2 Renderizado en el Checkout (`ClientCheckoutForm.tsx`)
En el Paso 3 del wizard de checkout:

```tsx
{/* Selector Dinámico de Métodos de Pago */}
<div className="space-y-2">
  <label htmlFor="paymentMethodId" className="text-xs font-medium text-foreground">
    Selecciona tu Método de Pago *
  </label>
  <Select2
    id="paymentMethodId"
    name="paymentMethodId"
    value={selectedPaymentMethodId}
    onValueChange={(val) => setSelectedPaymentMethodId(val)}
    options={paymentMethods.map((m) => ({
      value: m.id,
      label: `${m.name} (${m.currency})`,
    }))}
    size="sm"
  />
</div>

{/* Tarjeta de Instrucciones Bancarias Dinámicas */}
{currentMethod && (
  <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs space-y-2.5 shadow-2xs">
    <div className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
      <Building className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
      <span>Coordenadas e Instrucciones para {currentMethod.name}:</span>
      <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-700 font-mono font-semibold">
        {currentMethod.currency}
      </span>
    </div>

    {/* Campo Textarea renderizado con saltos de línea preservados */}
    <div className="text-slate-800 dark:text-slate-200 font-mono text-[11px] pt-1 whitespace-pre-wrap leading-relaxed">
      {currentMethod.instructions}
    </div>
  </div>
)}
```

---

## 7. Interfaz Administrativa (`src/modules/payment-method/ui/PaymentMethodForm.tsx`)

El formulario de creación y edición incorpora:
* Generación de UUID v7 en cliente para nuevos registros (`uuidv7()`).
* Selector de moneda (`USD`, `VES`, `EUR`, `USDT`).
* **Campo Text Area amplio** para ingresar los datos bancarios y notas:

```tsx
'use client';

import { useActionState, useId } from 'react';
import { uuidv7 } from '@/modules/shared/uuid';
import { SubmitButton } from '@/components/ui/submit-button';
import { Select2 } from '@/components/ui/select2';
import type { PaymentMethodDto } from '../serializers/payment-method.serializer';
import {
  createPaymentMethodAction,
  updatePaymentMethodAction,
} from '@/app/(admin)/admin/payment-methods/actions';

interface PaymentMethodFormProps {
  initialData?: PaymentMethodDto | null;
}

export function PaymentMethodForm({ initialData }: PaymentMethodFormProps) {
  const generatedId = useId();
  const id = initialData?.id ?? uuidv7();
  const isEditing = Boolean(initialData);

  const action = isEditing
    ? updatePaymentMethodAction.bind(null, initialData!.id)
    : createPaymentMethodAction;

  const [state, formAction] = useActionState(action, { status: 'idle' });

  return (
    <form action={formAction} className="space-y-6 max-w-2xl bg-card p-6 rounded-2xl border border-border shadow-xs">
      {!isEditing && <input type="hidden" name="id" value={id} />}

      {state.message && (
        <div className="p-3.5 rounded-xl text-xs bg-destructive/10 text-destructive border border-destructive/20 font-medium">
          {state.message}
        </div>
      )}

      {/* Nombre */}
      <div className="space-y-1.5 text-xs">
        <label htmlFor="name" className="font-medium text-foreground">
          Nombre del Método de Pago *
        </label>
        <input
          id="name"
          name="name"
          type="text"
          defaultValue={initialData?.name ?? ''}
          placeholder="Ej: Pago Móvil Banesco, Zelle Principal, Efectivo Taquilla"
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-ring"
        />
        {state.fieldErrors?.name && (
          <p className="text-destructive text-[11px]">{state.fieldErrors.name[0]}</p>
        )}
      </div>

      {/* Moneda */}
      <div className="space-y-1.5 text-xs">
        <label htmlFor="currency" className="font-medium text-foreground">
          Moneda Receptora *
        </label>
        <Select2
          id="currency"
          name="currency"
          defaultValue={initialData?.currency ?? 'USD'}
          options={[
            { value: 'USD', label: 'USD - Dólares Americanos' },
            { value: 'VES', label: 'VES - Bolívares' },
            { value: 'EUR', label: 'EUR - Euros' },
            { value: 'USDT', label: 'USDT - Tether (Cripto)' },
          ]}
          size="sm"
        />
        {state.fieldErrors?.currency && (
          <p className="text-destructive text-[11px]">{state.fieldErrors.currency[0]}</p>
        )}
      </div>

      {/* Textarea: Datos e Instrucciones Bancarias */}
      <div className="space-y-1.5 text-xs">
        <label htmlFor="instructions" className="font-medium text-foreground">
          Datos de Pago y Coordenadas Bancarias (Textarea) *
        </label>
        <textarea
          id="instructions"
          name="instructions"
          rows={6}
          defaultValue={initialData?.instructions ?? ''}
          placeholder="Coloca aquí los datos que verá el cliente al reservar:&#10;Banco: Banesco&#10;Teléfono: 0414-1234567&#10;RIF: J-50000000-0&#10;Titular: Travel Agency C.A."
          required
          className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground font-mono text-xs focus:ring-2 focus:ring-ring resize-y leading-relaxed"
        />
        <p className="text-muted-foreground text-[11px]">
          Este texto se mostrará tal como lo escribas en la pantalla de confirmación de reserva del cliente.
        </p>
        {state.fieldErrors?.instructions && (
          <p className="text-destructive text-[11px]">{state.fieldErrors.instructions[0]}</p>
        )}
      </div>

      <div className="flex justify-end pt-2">
        <SubmitButton>
          {isEditing ? 'Guardar Cambios' : 'Crear Método de Pago'}
        </SubmitButton>
      </div>
    </form>
  );
}
```

---

## 8. Pasos para la Puesta en Marcha (Checklist de Implementación)

1. [ ] **Crear archivo del modelo:** `src/modules/payment-method/models/payment-method.model.ts`
2. [ ] **Exportar en el barrel:** Agregar `export * from '@/modules/payment-method/models/payment-method.model';` en `src/db/schema.ts`
3. [ ] **Generar y aplicar migración:**
   ```bash
   pnpm db:generate
   pnpm db:migrate
   ```
4. [ ] **Implementar capa de validación y comandos:** Crear schemas Zod y clases Command en `src/modules/payment-method/`
5. [ ] **Implementar capa de repositorio:** Crear interfaz, filter map y `DrizzlePaymentMethodRepository` con `generateNextCode()`
6. [ ] **Implementar capa de servicios y contenedor:** Crear servicios Create, Update, UpdateStatus, Find, Search y `container.ts`
7. [ ] **Registrar permisos:** Crear `src/modules/payment-method/permissions.ts` y vincular en `src/modules/shared/permissions/registry.ts`
8. [ ] **Registrar en el menú lateral:** Agregar entrada en `src/modules/shared/menu/menu-registry.ts` bajo `section: 'config'`
9. [ ] **Crear páginas y acciones administrativas:** Implementar `page.tsx`, `create/page.tsx`, `[id]/page.tsx`, `[id]/edit/page.tsx` y `actions.ts` en `src/app/(admin)/admin/payment-methods/`
10. [ ] **Conectar con el formulario de reservas:** Proveer los métodos activos al `ClientCheckoutForm` en `src/app/(catalogo)/reservar/[id]/page.tsx`
11. [ ] **Cargar semillas iniciales:** Añadir métodos de pago por defecto en `src/db/seed.ts` (Pago Móvil, Zelle, Transferencia, Efectivo)
