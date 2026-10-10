import { db } from '@/db/client';
import { app_roles } from '@/modules/role/models/role.model';
import { app_users } from '@/modules/user/models/user.model';
import { app_categories } from '@/modules/category/models/category.model';
import { app_payment_methods } from '@/modules/payment-method/models/payment-method.model';
import { uuidv7 } from '@/modules/shared/uuid';
import { auth } from '@/lib/auth';
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 Starting seed...');

  // 1. Seed Roles
  const adminRoleId = uuidv7();
  const operatorRoleId = uuidv7();
  const salesAgentRoleId = uuidv7();

  const rolesToInsert = [
    {
      id: adminRoleId,
      name: 'Admin',
      description: 'Administrador con acceso total al sistema',
      permissionType: 'all' as const,
      permissions: [],
      status: 'active' as const,
    },
    {
      id: operatorRoleId,
      name: 'Operador',
      description: 'Gestión de catálogo, flota, salidas, reservas y pagos',
      permissionType: 'custom' as const,
      permissions: [
        'categories.list', 'categories.create', 'categories.show', 'categories.update', 'categories.update-status',
        'destinations.list', 'destinations.create', 'destinations.show', 'destinations.update', 'destinations.update-status',
        'tours.list', 'tours.create', 'tours.show', 'tours.update', 'tours.update-status',
        'itinerary-stops.list', 'itinerary-stops.create', 'itinerary-stops.show', 'itinerary-stops.update', 'itinerary-stops.update-status',
        'departures.list', 'departures.create', 'departures.show', 'departures.update', 'departures.update-status',
        'transport-units.list', 'transport-units.create', 'transport-units.show', 'transport-units.update', 'transport-units.update-status',
        'departure-units.list', 'departure-units.create', 'departure-units.show', 'departure-units.update', 'departure-units.update-status',
        'customers.list', 'customers.create', 'customers.show', 'customers.update', 'customers.update-status',
        'bookings.list', 'bookings.create', 'bookings.show', 'bookings.update', 'bookings.update-status',
        'passengers.list', 'passengers.create', 'passengers.show', 'passengers.update', 'passengers.update-status',
        'payments.list', 'payments.create', 'payments.show', 'payments.update', 'payments.update-status',
      ],
      status: 'active' as const,
    },
    {
      id: salesAgentRoleId,
      name: 'Agente de Ventas',
      description: 'Ventas directas, registro de clientes, reservas y pagos',
      permissionType: 'custom' as const,
      permissions: [
        'categories.list', 'categories.show',
        'destinations.list', 'destinations.show',
        'tours.list', 'tours.show',
        'itinerary-stops.list', 'itinerary-stops.show',
        'departures.list', 'departures.show',
        'customers.list', 'customers.show', 'customers.create',
        'bookings.list', 'bookings.show', 'bookings.create',
        'passengers.list', 'passengers.show', 'passengers.create',
        'payments.list', 'payments.show', 'payments.create',
      ],
      status: 'active' as const,
    },
  ];

  for (const role of rolesToInsert) {
    const existing = await db.select().from(app_roles).where(eq(app_roles.name, role.name));
    if (existing.length === 0) {
      await db.insert(app_roles).values(role);
      console.log(`✓ Rol creado: ${role.name}`);
    } else {
      console.log(`ℹ Rol ya existente: ${role.name}`);
    }
  }

  // Get active Admin role
  const [adminRole] = await db.select().from(app_roles).where(eq(app_roles.name, 'Admin'));

  // 2. Seed Superadmin in better-auth and app_users
  const adminEmail = 'admin@traveldemo.com';
  const adminPassword = 'AdminPassword123*';

  try {
    const existingAuthUser = await auth.api.signInEmail({
      body: {
        email: adminEmail,
        password: adminPassword,
      },
    }).catch(() => null);

    if (!existingAuthUser) {
      await auth.api.signUpEmail({
        body: {
          name: 'Super Admin',
          email: adminEmail,
          password: adminPassword,
          role: 'admin',
        },
      });
      console.log(`✓ Usuario better-auth creado: ${adminEmail}`);
    } else {
      console.log(`ℹ Usuario better-auth ya existente: ${adminEmail}`);
    }
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err);
    console.log(`ℹ better-auth signUp notice: ${message}`);
  }

  // Ensure record in app_users
  const [existingAppUser] = await db.select().from(app_users).where(eq(app_users.email, adminEmail));
  if (!existingAppUser) {
    await db.insert(app_users).values({
      id: uuidv7(),
      name: 'Super Admin',
      email: adminEmail,
      roleId: adminRole.id,
      status: 'active',
    });
    console.log(`✓ Usuario app_users creado: ${adminEmail}`);
  } else {
    console.log(`ℹ Usuario app_users ya existente: ${adminEmail}`);
  }

  // 3. Seed Categories
  const categoriesToSeed = [
    { code: 'CAT000001', name: 'Playa', slug: 'playa', icon: 'waves', description: 'Destinos costeros, cayos y playas paradisíacas' },
    { code: 'CAT000002', name: 'Montaña', slug: 'montana', icon: 'mountain', description: 'Senderismo, páramos, tepuyes y aventuras de altura' },
    { code: 'CAT000003', name: 'Río', slug: 'rio', icon: 'droplets', description: 'Rafting, paseos en lancha y balnearios fluviales' },
    { code: 'CAT000004', name: 'Selva', slug: 'selva', icon: 'trees', description: 'Expediciones en la selva, flora y fauna silvestre' },
    { code: 'CAT000005', name: 'Ciudad', slug: 'ciudad', icon: 'building', description: 'Tours urbanos, historia, cultura y gastronomía' },
  ];

  for (const cat of categoriesToSeed) {
    const [existingCat] = await db.select().from(app_categories).where(eq(app_categories.code, cat.code));
    if (!existingCat) {
      await db.insert(app_categories).values({
        id: uuidv7(),
        code: cat.code,
        name: cat.name,
        slug: cat.slug,
        icon: cat.icon,
        description: cat.description,
        status: 'active',
      });
      console.log(`✓ Categoría creada: ${cat.name} (${cat.code})`);
    } else {
      console.log(`ℹ Categoría ya existente: ${cat.name}`);
    }
  }

  // 4. Seed Payment Methods
  const paymentMethodsToSeed = [
    {
      code: 'PMT000001',
      name: 'Pago Móvil Banesco',
      currency: 'VES',
      instructions: 'Banco: Banesco (0134)\nTeléfono: 0414-1234567\nRIF: J-50000000-0\nTitular: Travel Agency C.A.',
    },
    {
      code: 'PMT000002',
      name: 'Zelle Oficial',
      currency: 'USD',
      instructions: 'Email Zelle: pagos@traveldemo.com\nTitular: Travel Agency LLC\nConcepto/Memo: Indicar nombre del pasajero y tour',
    },
    {
      code: 'PMT000003',
      name: 'Binance Pay (USDT)',
      currency: 'USDT',
      instructions: 'Binance Pay ID: 84920194\nMoneda: USDT\nRed: TRC-20 o Pay Direct',
    },
    {
      code: 'PMT000004',
      name: 'Efectivo en Taquilla',
      currency: 'USD',
      instructions: 'Pago directo en taquilla o recepción de la agencia antes de la salida del viaje.',
    },
  ];

  for (const pm of paymentMethodsToSeed) {
    const [existingPm] = await db.select().from(app_payment_methods).where(eq(app_payment_methods.code, pm.code));
    if (!existingPm) {
      await db.insert(app_payment_methods).values({
        id: uuidv7(),
        code: pm.code,
        name: pm.name,
        currency: pm.currency,
        instructions: pm.instructions,
        status: 'active',
      });
      console.log(`✓ Método de pago creado: ${pm.name} (${pm.code})`);
    } else {
      console.log(`ℹ Método de pago ya existente: ${pm.name}`);
    }
  }

  console.log('✅ Seed completed successfully!');
  process.exit(0);
}

seed().catch((err) => {
  console.error('❌ Seed failed:', err);
  process.exit(1);
});
