import { NextResponse } from 'next/server';
import { type EmailOtpType } from '@supabase/supabase-js';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { createCustomerContainer } from '@/modules/customer/container';

export async function GET(request: Request) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get('code');
  const token_hash = requestUrl.searchParams.get('token_hash');
  const type = requestUrl.searchParams.get('type') as EmailOtpType | null;
  const next = requestUrl.searchParams.get('next') || '/cuenta/reservas';

  if (code || (token_hash && type)) {
    try {
      const supabase = await createSupabaseServerClient();
      let session = null;
      let error = null;

      if (code) {
        const res = await supabase.auth.exchangeCodeForSession(code);
        session = res.data.session;
        error = res.error;
      } else if (token_hash && type) {
        const res = await supabase.auth.verifyOtp({
          type,
          token_hash,
        });
        session = res.data.session;
        error = res.error;
      }

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
      console.error('Error exchanging code or verifying OTP in /auth/callback:', err);
    }
  }

  // Redirect to the destination page or passenger portal
  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
