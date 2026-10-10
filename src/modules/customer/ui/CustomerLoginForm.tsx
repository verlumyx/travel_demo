'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createSupabaseBrowserClient } from '@/lib/supabase/client';
import {
  Mail,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  Compass,
} from 'lucide-react';

export function CustomerLoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [isCheckingSession, setIsCheckingSession] = useState(true);
  const [magicLinkSent, setMagicLinkSent] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    try {
      const supabase = createSupabaseBrowserClient();
      supabase.auth.getSession().then(({ data: { session } }) => {
        if (!active) return;
        if (session) {
          router.replace('/cuenta/reservas');
        } else {
          setIsCheckingSession(false);
        }
      }).catch(() => {
        if (active) setIsCheckingSession(false);
      });
    } catch {
      if (active) setIsCheckingSession(false);
    }

    return () => {
      active = false;
    };
  }, [router]);

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
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Error al enviar enlace de acceso.';
      setErrorMsg(msg);
    } finally {
      setIsPending(false);
    }
  };

  if (isCheckingSession) {
    return (
      <div className="w-full max-w-lg mx-auto bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-sm text-center space-y-5 animate-in fade-in duration-200">
        <div className="relative mx-auto w-14 h-14 flex items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-teal-500/10 text-teal-600 flex items-center justify-center shadow-xs">
            <Compass className="h-7 w-7 animate-spin [animation-duration:2.5s]" />
          </div>
        </div>
        <div className="space-y-1">
          <h3 className="text-base font-bold text-foreground">
            Comprobando sesión de viajero...
          </h3>
          <p className="text-sm text-muted-foreground">
            Verificando credenciales de acceso
          </p>
        </div>
        <div className="flex items-center justify-center gap-2 text-sm text-teal-600 font-medium">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Un momento...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-6">
      {errorMsg && (
        <div className="p-4 rounded-xl bg-destructive/10 text-destructive border border-destructive/20 text-sm flex items-start gap-3">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>{errorMsg}</div>
        </div>
      )}

      {magicLinkSent ? (
        <div className="p-8 sm:p-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center mx-auto">
            <CheckCircle2 className="h-7 w-7" />
          </div>
          <h3 className="text-xl font-bold text-foreground">
            ¡Enlace de acceso enviado!
          </h3>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Hemos enviado un enlace mágico a <strong className="text-foreground">{email}</strong>.
            Haz clic en el enlace desde tu correo para entrar directamente sin contraseña.
          </p>
          <button
            type="button"
            onClick={() => setMagicLinkSent(false)}
            className="text-sm text-teal-600 hover:underline font-medium pt-2 block mx-auto cursor-pointer"
          >
            Usar otro correo electrónico
          </button>
        </div>
      ) : (
        <div className="bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-md space-y-7">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center mx-auto mb-3 shadow-xs">
              <Compass className="h-6 w-6" />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-foreground">
              Portal del Pasajero
            </h2>
            <p className="text-sm text-muted-foreground max-w-sm mx-auto">
              Ingresa tu correo para acceder a tus reservas, boletos digitales y abonos de viaje.
            </p>
          </div>

          {/* Magic Link Form */}
          <form onSubmit={handleMagicLink} className="space-y-5">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-foreground block">
                Correo Electrónico
              </label>
              <div className="relative">
                <Mail className="h-5 w-5 text-muted-foreground absolute left-3.5 top-3.5 pointer-events-none" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu@correo.com"
                  required
                  className="w-full pl-11 pr-4 h-12 text-sm rounded-xl border border-input bg-background text-foreground focus:outline-hidden focus:ring-2 focus:ring-teal-600/30 focus:border-teal-600 transition"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isPending || !email}
              className="w-full h-12 px-5 rounded-xl bg-teal-600 text-white font-semibold text-sm flex items-center justify-center gap-2 hover:bg-teal-700 active:scale-[0.98] transition shadow-xs disabled:opacity-50 cursor-pointer"
            >
              {isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Enviando enlace...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Recibir Enlace Mágico
                </>
              )}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
