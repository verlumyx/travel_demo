# Plan de Implementación por Fases — Plataforma Digital para Agencias de Viajes

Este documento desglosa la arquitectura especificada en [docs/mvp-architecture.md](file:///home/verlumyx/Documentos/dev/traveldemo/docs/mvp-architecture.md) en **fases de desarrollo incrementales y lógicas**. Cada fase produce valor verificable de forma independiente y respeta la arquitectura modular de Next.js App Router, Drizzle ORM y la política de no eliminación física.

---

## Resumen Ejecutivo de Fases

```
┌────────────────────────────────────────────────────────────────────────┐
│ Fase 0: Cimientos, Base de Datos y Autenticación Dual                   │
│ (Migraciones Drizzle, better-auth, Supabase Auth setup, Middleware)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Fase 1: Catálogo Base y Flota de Transporte (Admin)                    │
│ (Categories, Destinations, Transport Units, Tours, Itinerary Stops)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Fase 2: Operaciones y Programación de Salidas (Admin)                  │
│ (Departures, Departure Units, Asignación de Flota, Cálculo de Aforo)   │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Fase 3: Operación Comercial Interna, CRM y Conciliación (Admin)        │
│ (Customers CRM, Bookings, Passengers, Payments, Manifiesto de Abordaje)│
│  ★ HITO: Backoffice 100% Funcional para Operación Diaria              │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Fase 4: Catálogo Público y Checkout Autoservicio (Cliente)             │
│ (Landing, Filtros Categoría, Directorio /tours, Ficha, Reserva)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Fase 5: Portal Privado del Pasajero (Cliente)                          │
│ (Login Supabase, /cuenta/reservas, Vouchers QR, Pagos Fraccionados)    │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
┌───────────────────────────────────▼────────────────────────────────────┐
│ Fase 6: Seguridad Granular, Métricas y Hardening                       │
│ (Matriz de Permisos por Rol, Dashboard KPIs, Pruebas E2E, Go-Live)     │
└────────────────────────────────────────────────────────────────────────┘
```

---

## Fase 0: Cimientos, Base de Datos y Autenticación Dual

**Objetivo:** Establecer la infraestructura compartida, asegurar el aislamiento estricto de sesiones entre el catálogo público y el panel administrativo, y dejar la base de datos lista con todas sus tablas y datos iniciales.

### Módulos e Infraestructura
* Base de Datos: PostgreSQL (Supabase) + Drizzle ORM
* Infraestructura: `src/db/schema.ts`, `src/middleware.ts`, `src/modules/shared/`
* Autenticación Admin: `better-auth` en `(admin)`
* Autenticación Cliente: `Supabase Auth` en `(catalogo)`
* Módulos base: [user](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/user) y [role](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/role)

### Tareas Principales
1. **Migraciones y Esquema Drizzle:**
   - Consolidar en `src/db/schema.ts` las 13 tablas con prefijo `app_`:
     - `app_users`, `app_roles`, `app_categories`, `app_destinations`, `app_tours`, `app_itinerary_stops`, `app_transport_units`, `app_departures`, `app_departure_units`, `app_customers`, `app_bookings`, `app_passengers`, `app_payments`.
   - Generar y ejecutar migraciones vía `drizzle-kit migrate`.
   - Script de Seed inicial: Roles predeterminados (`Admin`, `Operador`, `Agente de Ventas`) y usuario Superadmin inicial.
2. **Configuración de Autenticación Dual:**
   - Configuración de `better-auth` para el panel administrativo (login email + contraseña, cookies seguras HTTP-only).
   - Configuración del cliente Supabase Auth para el portal público.
   - Implementación de `src/middleware.ts` con discriminación de rutas por Route Groups (`(admin)` vs `(catalogo)`).
3. **Shell de Interfaz y UI Base:**
   - Layout de `(admin)` con `Sidebar`, encabezado de usuario, toasters de notificaciones (`FlashToaster`) y navegación básica.
   - Layout de `(catalogo)` con navegación pública (Navbar, Footer, contenedor de contenido).

### Criterios de Aceptación (DoD)
- [ ] Tablas creadas en PostgreSQL con UUID v7 como clave primaria.
- [ ] Login administrativo `/admin/login` autentica usuarios y crea sesiones válidas.
- [ ] Intento de entrar a `/admin/*` sin sesión redirige a `/admin/login`.
- [ ] Intento de entrar a rutas públicas no exige sesión administrativa.

---

## Fase 1: Catálogo Base y Flota de Transporte (Admin)

**Objetivo:** Permitir al equipo de la agencia dar de alta su catálogo de experiencias turísticas y registrar los recursos físicos de transporte.

### Módulos Involucrados
* [category](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/category): Categorías de destinos (playa, montaña, río, selva, etc.)
* [destination](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/destination): Destinos turísticos
* [transport-unit](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/transport-unit): Unidades de transporte (buses, vans, lanchas)
* [tour](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/tour): Tours y paquetes
* [itinerary-stop](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/itinerary-stop): Paradas del itinerario

### Tareas Principales
1. **Módulo Categorías (`categories`):**
   - Vistas en `src/app/(admin)/admin/categories/` (`page.tsx`, `create`, `[id]`, `[id]/edit`).
   - Server Actions con código secuencial `CAT000001`, slug único e icono/imagen.
   - Administración libre de categorías (crear, editar, activar/inactivar).
2. **Módulo Destinos (`destinations`):**
   - Vistas en `src/app/(admin)/admin/destinations/` (`page.tsx`, `create`, `[id]`, `[id]/edit`).
   - Server Actions con generación de código secuencial `DES000001` y slug único.
   - Selector / combobox de categoría (`category_id`) asociada al destino.
   - Subida de imagen y campos descriptivos (estado, ciudad, país).
3. **Módulo Unidades de Transporte (`transport-units`):**
   - Vistas en `src/app/(admin)/admin/transport-units/`.
   - Server Actions con código secuencial `UNI000001`.
   - Registro de tipo (bus, minibus, van, boat), capacidad total de pasajeros, chofer y teléfono.
4. **Módulo Tours e Itinerario (`tours` e `itinerary-stops`):**
   - Vistas en `src/app/(admin)/admin/tours/`.
   - Server Actions con código secuencial `TUR000001`.
   - Formulario de tour: precio base, duración en días, inclusiones, exclusiones, estatus (`draft`/`active`).
   - Gestor visual de paradas de itinerario: asociación a destinos, día del itinerario, orden correlativo y marca de pernocta.

### Criterios de Aceptación (DoD)
- [ ] CRUD completo funcional para Categorías, Destinos, Unidades de Transporte y Tours.
- [ ] Cada destino puede clasificarse bajo una categoría turística activa (1 a N).
- [ ] Un Tour puede tener múltiples paradas ordenadas cronológicamente con sus respectivos destinos.
- [ ] Generación automática y sin colisiones de códigos `CAT...`, `DES...`, `UNI...`, `TUR...`.
- [ ] Política de no eliminación respetada (cambio de status a `inactive`).

---

## Fase 2: Operaciones y Programación de Salidas (Admin)

**Objetivo:** Conectar los paquetes turísticos con fechas de ejecución del calendario y asignar flota de transporte con cálculo reactivo de capacidad.

### Módulos Involucrados
* [departure](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/departure): Salidas programadas
* [departure-unit](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/departure-unit): Asignación unidad ↔ salida

### Tareas Principales
1. **Programación de Salidas (`departures`):**
   - Vistas en `src/app/(admin)/admin/departures/`.
   - Server Actions con código secuencial `SAL000001`.
   - Configuración de fecha/hora de salida, fecha de retorno, punto de encuentro, hora de cita y `priceOverride` opcional.
   - Estados de la salida: `scheduled`, `confirmed`, `in_progress`, `completed`, `cancelled`.
2. **Asignación de Flota y Cálculo de Capacidad (`departure-units`):**
   - Modal/interfaz para asociar una o múltiples unidades de transporte a una salida.
   - Asignación de capacidad específica por unidad (`assignedCapacity`).
   - **Regla de negocio:** `departures.total_capacity` se calcula automáticamente como la suma de `assigned_capacity` de todas sus unidades dentro de una transacción.
   - Posibilidad de sobrescribir chofer y teléfono de contacto para el día del viaje.
   - Validación: No permitir desvincular o reducir capacidad por debajo de los cupos ya reservados (`booked_slots`).

### Criterios de Aceptación (DoD)
- [ ] Creación y listado de salidas programadas por tour.
- [ ] Asignación de múltiples vehículos a una misma salida sumando correctamente el aforo total.
- [ ] Estados de salida actualizables con transiciones válidas.

---

## Fase 3: Operación Comercial Interna, CRM y Conciliación (Admin)

**Objetivo:** Habilitar el flujo comercial y operativo completo dentro del backoffice: los agentes de venta y operadores pueden registrar clientes, emitir reservas manuales, registrar pasajeros, conciliar pagos multimoneda y generar el manifiesto de abordaje.

> **HITO CLAVE:** Al finalizar esta fase, la agencia ya puede prescindir de Excel y operar su negocio de punta a punta de forma digital y asistida.

### Módulos Involucrados
* [customer](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/customer): CRM de pasajeros
* [booking](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/booking): Reservas
* [passenger](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/passenger): Pasajeros de la reserva
* [payment](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/payment): Pagos y conciliación

### Tareas Principales
1. **Directorio CRM de Clientes (`customers`):**
   - Vistas en `src/app/(admin)/admin/customers/`.
   - Código secuencial `CLI000001`, datos de contacto, documento de identidad, fecha de nacimiento y contacto de emergencia.
   - Búsqueda rápida por nombre, cédula/pasaporte, teléfono o email.
2. **Creación de Reservas y Bloqueo de Cupos (`bookings` y `passengers`):**
   - Vistas en `src/app/(admin)/admin/bookings/`.
   - Código secuencial `RES000001`.
   - **Regla de negocio:** Verificación atómica en transacción de cupos disponibles (`booked_slots + slots_reserved <= total_capacity`). Incremento automático de `booked_slots`.
   - Formulario dinámico para registrar a los $N$ pasajeros individuales vinculados a la reserva (`app_passengers`), designando el contacto principal.
   - Cálculo automático del monto total (`total_amount`).
3. **Gestión y Conciliación de Pagos Multimoneda (`payments`):**
   - Vistas en `src/app/(admin)/admin/payments/`.
   - Código secuencial `PAG000001`.
   - Soporte para métodos: Pago Móvil, Zelle, Binance, Zinli, Transferencia bancaria, Efectivo USD y Efectivo VES.
   - Adjunto de comprobante visual (captura) y número de referencia.
   - Flujo de verificación: Operador/Admin revisa y aprueba (`verified`) o rechaza (`rejected`).
   - **Regla de negocio:** Al verificar un pago, suma a `paid_amount` de la reserva y actualiza su estado automáticamente:
     - `paid_amount = 0` → `pending`
     - `0 < paid_amount < total_amount` → `partial_payment`
     - `paid_amount >= total_amount` → `paid`
4. **Manifiesto de Abordaje:**
   - Vista operativa por salida con lista consolidada de todos los pasajeros confirmados/pagados.
   - Exportación / vista imprimible con nombres, documentos, números de teléfono y contactos de emergencia para guías y choferes.

### Criterios de Aceptación (DoD)
- [ ] Reserva creada descuenta cupos en tiempo real en la salida correspondiente.
- [ ] El registro de pasajeros coincide exactamente con la cantidad de cupos reservados.
- [ ] Los pagos verificados recalculan el saldo pendiente y mueven el estado de la reserva.
- [ ] Cancelación de reserva devuelve los cupos a la salida (`booked_slots` decrementa).
- [ ] Manifiesto de abordaje imprimible generado correctamente.

---

## Fase 4: Catálogo Público y Checkout Autoservicio (Portal Cliente)

**Objetivo:** Publicar la vitrina web pública para que los clientes finales puedan explorar la oferta turística, revisar itinerarios y generar reservas de forma autónoma.

### Módulos y Rutas Involucradas
* Route Group: `src/app/(catalogo)/`
* Rutas: Landing `/`, Catálogo `/tours`, Detalle `/tours/[slug]`, Checkout `/reservar/[id]`
* Backend: Reutilización de servicios de lectura (`category`, `tour`, `destination`, `departure`) y creación de `booking`, `passenger` y `payment`.

### Tareas Principales
1. **Landing Page y Buscador (`(catalogo)/page.tsx`):**
   - Hero visual con llamado a la acción.
   - Píldoras/chips interactivos de categorías turísticas (ej: "Playa", "Montaña", "Río", "Selva") para filtro rápido.
   - Buscador rápido por categoría, destino y fecha estimada.
   - Carrusel o grilla de tours destacados y testimonios/ventajas.
2. **Directorio y Ficha de Tour (`(catalogo)/tours/` y `[slug]/`):**
   - Catálogo de salidas activas con tarjetas resumen (precio, duración, destino, badge de categoría).
   - Filtros laterales por categoría de destino, rango de precios y duración.
   - Ficha detallada con:
     - Galería fotográfica.
     - Itinerario interactivo día por día con paradas y categoría del destino visitado.
     - Sección clara de qué incluye y qué no incluye.
     - Selector de próximas salidas disponibles con indicador de cupos restantes.
3. **Flujo de Checkout y Reporte de Pago (`(catalogo)/reservar/[id]`):**
   - Paso 1: Selección de número de cupos (validando disponibilidad en vivo).
   - Paso 2: Datos del contratante y pasajeros acompañantes.
   - Paso 3: Resumen de cobro y datos bancarios para transferencia / Pago Móvil / Zelle / Binance.
   - Paso 4: Carga del comprobante y referencia.
   - Creación de cliente con `source = 'portal'`, reserva en estado `pending` y pago en estado `pending`.
   - Pantalla de éxito con código de reserva (`RES...`) e instrucciones de confirmación.

### Criterios de Aceptación (DoD)
- [ ] Catálogo optimizado para SEO y dispositivos móviles con filtrado funcional por categorías.
- [ ] El cliente no puede reservar más cupos de los disponibles en la salida.
- [ ] La reserva web entra inmediatamente al panel administrativo para revisión del operador.

---

## Fase 5: Portal Privado del Pasajero (Área de Cuenta)

**Objetivo:** Permitir a los pasajeros autenticarse de forma sencilla (Google 1-clic / Magic Link), consultar sus reservas pasadas y futuras, descargar comprobantes/vouchers y reportar abonos adicionales.

### Módulos y Rutas Involucradas
* Route Group: `src/app/(catalogo)/cuenta/`
* Autenticación: Supabase Auth (OAuth Google, Magic Link)
* Rutas: `/cuenta/login`, `/cuenta/reservas`
* Módulos: [customer](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/customer), [booking](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/booking), [payment](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/payment)

### Tareas Principales
1. **Autenticación del Pasajero (`/cuenta/login`):**
   - Botón de login con Google (OAuth Supabase) y campo de correo para Magic Link.
   - Callback y sincronización:
     - **Regla de negocio:** Al autenticarse, si ya existe un registro en `app_customers` con el mismo email, vincular su `supabase_user_id`. Si no existe, crear un nuevo `app_customer`.
2. **Panel de Reservas del Pasajero (`/cuenta/reservas`):**
   - Listado de viajes activos y pasados del usuario (filtrado estricto por su `customer_id`).
   - Visualización del estado de confirmación y montos (`total_amount`, `paid_amount`, saldo restante).
   - Botón para "Reportar nuevo pago/abono" si la reserva está en `partial_payment` o `pending`.
3. **Voucher Digital de Viaje:**
   - Vista de voucher/boleto digital con detalles clave: código de reserva, punto de encuentro, fecha/hora, lista de pasajeros y código QR de validación.
   - Opción para imprimir o guardar en PDF.

### Criterios de Aceptación (DoD)
- [ ] El pasajero inicia sesión con Google o Magic Link sin contraseña.
- [ ] El pasajero solo puede ver sus propias reservas y nunca las de terceros.
- [ ] Puede reportar comprobantes adicionales para completar el pago de su viaje.
- [ ] Voucher digital legible y apto para presentación al momento del abordaje.

---

## Fase 6: Roles Granulares, Seguridad, Métricas y Hardening

**Objetivo:** Blindar la plataforma con control de acceso estricto según la matriz de roles, incorporar métricas de negocio para la directiva y asegurar la estabilidad general antes del despliegue productivo.

### Módulos Involucrados
* [role](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/role), [user](file:///home/verlumyx/Documentos/dev/traveldemo/src/modules/user)
* Dashboard en `src/app/(admin)/admin/page.tsx`
* Pruebas automatizadas (Vitest + Playwright)

### Tareas Principales
1. **Control de Acceso Basado en Permisos (RBAC):**
   - Aplicar `requirePermission()` en todas las Server Actions y vistas según la matriz:
     - **Admin:** Acceso absoluto a todos los módulos y gestión de usuarios/roles.
     - **Operador:** Gestión de flota, tours, salidas, reservas, pagos y clientes. Sin acceso a usuarios ni roles.
     - **Agente de Ventas:** Solo lectura de tours/salidas y creación de reservas, clientes y pagos.
   - Adaptación reactiva del menú lateral y botones de acción (ocultar botones no permitidos).
2. **Dashboard de Métricas Operativas (`(admin)/admin/page.tsx`):**
   - Tarjetas de KPIs: Total ventas del mes, ingresos conciliados vs pendientes por verificar, próximas salidas y porcentaje de ocupación global.
   - Lista de atención prioritaria: Pagos pendientes de verificación y reservas próximas por vencer.
3. **Auditoría y Pruebas Automatizadas:**
   - Tests unitarios y de integración con Vitest para servicios con lógica transaccional:
     - Sobreventa de cupos evitada concurrentemente.
     - Cambio de status de reserva al sumar pagos verificados.
     - Cálculo de `total_capacity` al agregar/remover unidades.
   - Tests E2E con Playwright para flujos críticos:
     - Flujo completo: Crear salida → Reservar como cliente → Verificar pago como admin → Generar manifiesto.
4. **Hardening y Preparación de Producción:**
   - Sanitización de inputs y rate limiting en endpoints de autenticación y carga de comprobantes.
   - Configuración de almacenamiento seguro en Supabase Storage (políticas RLS para comprobantes e imágenes).

### Criterios de Aceptación (DoD)
- [ ] Usuarios con rol "Agente de Ventas" no pueden modificar tours ni aprobar pagos.
- [ ] Dashboard administrativo muestra cifras consistentes con la base de datos.
- [ ] Pruebas automatizadas pasando con éxito (`pnpm test` y `pnpm test:e2e`).
- [ ] Cero eliminación física de registros comprobada en base de datos.

---

## Matriz de Trazabilidad: Módulos vs Fases

| Módulo Drizzle / Dominio | Fase Principal | Fase Complementaria | Rol Responsable |
|--------------------------|----------------|---------------------|-----------------|
| **User** (`app_users`) | Fase 0 | Fase 6 | Admin |
| **Role** (`app_roles`) | Fase 0 | Fase 6 | Admin |
| **Category** (`app_categories`) | Fase 1 | Fase 4 | Admin / Operador |
| **Destination** (`app_destinations`) | Fase 1 | Fase 4 | Admin / Operador |
| **Transport Unit** (`app_transport_units`) | Fase 1 | Fase 2 | Admin / Operador |
| **Tour** (`app_tours`) | Fase 1 | Fase 4 | Admin / Operador |
| **Itinerary Stop** (`app_itinerary_stops`) | Fase 1 | Fase 4 | Admin / Operador |
| **Departure** (`app_departures`) | Fase 2 | Fase 4 | Operador |
| **Departure Unit** (`app_departure_units`) | Fase 2 | Fase 3 | Operador |
| **Customer** (`app_customers`) | Fase 3 | Fase 4, 5 | Ventas / Operador / Pasajero |
| **Booking** (`app_bookings`) | Fase 3 | Fase 4, 5 | Ventas / Operador / Pasajero |
| **Passenger** (`app_passengers`) | Fase 3 | Fase 4, 5 | Ventas / Operador / Pasajero |
| **Payment** (`app_payments`) | Fase 3 | Fase 4, 5 | Operador / Pasajero |
