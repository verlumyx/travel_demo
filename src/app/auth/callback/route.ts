import { NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createCustomerContainer } from '@/modules/customer/container';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const next = requestUrl.searchParams.get('next') || '/cuenta/reservas';

  if (code) {
    try {
      const supabase = await createSupabaseServerClient();
      const {
        data: { session },
        error,
      } = await supabase.auth.exchangeCodeForSession(code);

      if (!error && session?.user) {
        const user = session.user;
        const customerContainer = createCustomerContainer();

        const fullName = (user.user_metadata?.full_name as string) || '';
        const [firstName, ...rest] = fullName.split(' ');
        const lastName = rest.join(' ');

        if (user.email) {
          await customerContainer.repository.syncFromSupabaseUser({
            supabaseUserId: user.id,
            email: user.email,
            firstName: firstName || 'Pasajero',
            lastName: lastName || 'Web',
            phone: (user.user_metadata?.phone as string) || null,
          });
        }
      }
    } catch (err) {
      console.error('Error exchanging code for session in /auth/callback:', err);
    }
  }

  // Redirect to the destination page or passenger portal
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
