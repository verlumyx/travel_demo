# Propuesta Técnica y Funcional: Plataforma Digital para Agencias de Viajes

Sistema integral de catálogo público, reservas en línea y panel administrativo diseñado para digitalizar la operación comercial, el control de cupos y la conciliación de pagos en agencias de turismo.

---

## 1. Resumen Ejecutivo

### El Problema
La mayoría de las agencias de viajes turísticos operan mediante canales informales (Instagram DMs, chats de WhatsApp y hojas de cálculo). Esto genera:
* Pérdida de reservas por demora en la atención.
* Sobrevendimiento o descontrol de cupos en unidades de transporte.
* Dificultad para conciliar pagos fragmentados (abonos del 50%, múltiples cuentas de Pago Móvil, divisas en efectivo, Zelle, Zinli o Binance).
* Elaboración manual de manifiestos y listas de pasajeros para guías y choferes.

### La Solución
Una solución digital centralizada que ofrece dos entornos claramente diferenciados:
1. **Catálogo Público de Experiencias:** Interfaz rápida, moderna y optimizada para conversión donde los clientes exploran itinerarios, seleccionan cupos y gestionan sus reservas.
2. **Panel Administrativo Operativo:** Entorno privado para que el equipo de la agencia gestione salidas, valide pagos, controle aforos por unidad y emita listas de abordaje.

---

## 2. Alcance del MVP (Next.js Unificado)

Para la fase inicial de validación comercial y demostración a clientes, el sistema se estructura bajo una sola base de código en **Next.js (App Router)** utilizando segmentación por grupos de rutas (*Route Groups*), compartiendo base de datos pero aislando estrictamente la lógica visual y las sesiones.

```text
src/
├── app/
│   ├── (catalogo)/           # Portal del cliente (público / semi-privado)
│   │   ├── page.tsx          # Landing page y buscador de tours
│   │   ├── tours/
│   │   │   ├── page.tsx      # Directorio general de salidas
│   │   │   └── [slug]/page.tsx # Ficha detallada del destino
│   │   ├── reservar/[id]/page.tsx # Checkout y reporte de pago
│   │   └── cuenta/           # Área privada del pasajero
│   │       ├── login/page.tsx
│   │       └── reservas/page.tsx # Vouchers y estatus de abonos
│   │
│   ├── (admin)/              # Panel operativo interno
│   │   ├── admin/
│   │   │   ├── login/page.tsx
│   │   │   ├── page.tsx      # Dashboard general
│   │   │   ├── tours/page.tsx # Creación y control de salidas
│   │   │   ├── reservas/page.tsx # Auditoría de reservas y manifiestos
│   │   │   ├── pagos/page.tsx # Conciliación de comprobantes
│   │   │   └── clientes/page.tsx # Directorio y CRM
│   │
│   └── api/                  # Endpoints unificados
│       ├── auth/
│       ├── tours/
│       ├── bookings/
│       └── payments/
├── middleware.ts             # Control de accesos y separación de sesiones