import 'server-only';
import { cache } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createCustomerContainer } from '@/modules/customer/container';
import type { CustomerRow } from '@/modules/customer/models/customer.model';

export type CustomerSession = {
  customer: CustomerRow;
  supabaseUser: {
    id: string;
    email?: string;
    user_metadata?: Record<string, unknown>;
  };
};

export const getAuthenticatedCustomer = cache(async (): Promise<CustomerSession | null> => {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    const cookieStore = await cookies();
    const demoEmail = cookieStore.get('demo_customer_email')?.value;
    if (demoEmail) {
      const customerContainer = createCustomerContainer();
      const demoCust = await customerContainer.repository.findByEmail(demoEmail);
      if (demoCust) {
        return {
          customer: demoCust,
          supabaseUser: {
            id: demoCust.supabaseUserId || demoCust.id,
            email: demoCust.email || undefined,
          },
        };
      }
    }
    return null;
  }

  const customerContainer = createCustomerContainer();
  let customer = await customerContainer.repository.findBySupabaseUserId(user.id);

  // If customer doesn't exist by supabaseUserId, attempt sync by email or create
  if (!customer && user.email) {
    const fullName = (user.user_metadata?.full_name as string) || '';
    const [firstName, ...rest] = fullName.split(' ');
    const lastName = rest.join(' ');

    customer = await customerContainer.repository.syncFromSupabaseUser({
      supabaseUserId: user.id,
      email: user.email,
      firstName: firstName || 'Pasajero',
      lastName: lastName || 'Web',
      phone: (user.user_metadata?.phone as string) || null,
    });
  }

  if (!customer) return null;

  return {
    customer,
    supabaseUser: {
      id: user.id,
      email: user.email,
      user_metadata: user.user_metadata,
    },
  };
});

export async function requireCustomerSession(): Promise<CustomerSession> {
  const session = await getAuthenticatedCustomer();
  if (!session) {
    redirect('/cuenta/login');
  }
  return session;
}
