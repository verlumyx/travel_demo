'use client';

import { useState } from 'react';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import { customerDemoLoginAction } from '@/app/(catalogo)/cuenta/actions';
import {
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';

interface CustomerLoginFormProps {
  demoCustomers?: Array<{ id: string; name: string; email: string }>;
}

export function CustomerLoginForm({ demoCustomers = [] }: CustomerLoginFormProps) {
  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleGoogleLogin = async () => {
    setIsPending(true);
    setErrorMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${origin}/auth/callback?next=/cuenta/reservas`,
        },
      });
      if (error) {
        setErrorMsg(error.message);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al iniciar sesión con Google.');
    } finally {
      setIsPending(false);
    }
  };

  const handleMagicLink = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    setIsPending(true);
    setErrorMsg(null);
    try {
      const supabase = createSupabaseBrowserClient();
      const origin = window.location.origin;
      const { error } = await supabase.auth.signInWithOtp({
        email: email.trim().toLowerCase(),
        options: {
          emailRedirectTo: `${origin}/auth/callback?next=/cuenta/reservas`,
        },
      });

      if (error) {
        setErrorMsg(error.message);
      } else {
        setMagicLinkSent(true);
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Error al enviar enlace de acceso.');
    } finally {
      setIsPending(false);
    }
  };

  const handleDemoLogin = async (demoEmail: string) => {
    setIsPending(true);
    try {
      await customerDemoLoginAction(demoEmail);
    } catch (err: any) {
      setErrorMsg(err.message || 'Error en acceso demo.');
      setIsPending(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-xs flex items-start gap-2.5">
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {magicLinkSent ? (
        <div className="p-6 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-3">
          <div className="w-12 h-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-6 w-6" />
          </div>
          <h3 className="text-base font-bold text-foreground">
            ¡Enlace de acceso enviado!
          </h3>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Hemos enviado un enlace mágico a <strong className="text-foreground">{email}</strong>.
            Haz clic en el enlace desde tu correo para entrar directamente sin contraseña.
          </p>
          <button
            type="button"
            onClick={() => setMagicLinkSent(false)}
            className="text-xs text-primary hover:underline font-medium pt-2 block mx-auto"
          >
            Usar otro correo electrónico
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-6 sm:p-8 shadow-sm space-y-6">
          <div className="text-center space-y-1">
            <h2 className="text-xl font-bold tracking-tight text-foreground">
              Portal del Pasajero
            </h2>
            <p className="text-xs text-muted-foreground">
              Accede a tus reservas, boletos digitales y abonos de viaje.
            </p>
          </div>

          {/* Google OAuth Button */}
          <button
            type="button"
            onClick={handleGoogleLogin}
            disabled={isPending}
            className="w-full py-2.5 px-4 rounded-xl border border-border bg-background hover:bg-muted active:scale-[0.98] text-foreground font-medium text-xs flex items-center justify-center gap-3 transition shadow-xs disabled:opacity-50 cursor-pointer"
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                fill="#EA4335"
              />
            </svg>
            Continuar con Google (1 clic)
          </button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border" />
            </div>
            <div className="relative flex justify-center text-[10px] uppercase">
              <span className="bg-card px-2 text-muted-foreground font-semibold">
                O con enlace a tu correo
              </span>
            </div>
          </div>

          {/* Magic Link Form */}
          <form onSubmit={handleMagicLink} className="space-y-4">
            <div className="space-y-1.5">
              <label htmlFor="email" className="text-xs font-medium text-foreground block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="h-4 w-4 text-muted-foreground absolute left-3 top-2.5" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-ring"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !email}
              className="w-full py-2.5 px-4 rounded-xl bg-primary text-primary-foreground font-semibold text-xs flex items-center justify-center gap-2 hover:bg-primary/90 active:scale-[0.98] transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando enlace...
                </>
              ) : (
                <>
                  <Sparkles className="h-3.5 w-3.5" />
                  Recibir Enlace Mágico
                </>
              )}
            </button>
          </form>

          {/* Fast Demo Access (when testing) */}
          {demoCustomers.length > 0 && (
            <div className="pt-4 border-t border-border space-y-2">
              <div className="flex items-center gap-1.5 text-[11px] font-semibold text-muted-foreground">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" />
                Acceso Rápido Demo (Clientes Registrados):
              </div>
              <div className="space-y-1.5">
                {demoCustomers.map((c) => (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => handleDemoLogin(c.email)}
                    disabled={isPending}
                    className="w-full text-left p-2.5 rounded-lg border border-border/80 bg-muted/30 hover:bg-muted text-xs flex items-center justify-between transition cursor-pointer"
                  >
                    <div>
                      <span className="font-semibold text-foreground block">{c.name}</span>
                      <span className="text-[11px] text-muted-foreground">{c.email}</span>
                    </div>
                    <ArrowRight className="h-3.5 w-3.5 text-muted-foreground" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
