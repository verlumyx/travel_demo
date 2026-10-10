import { Compass, Loader2 } from 'lucide-react';

export default function CustomerLoginLoading() {
  return (
    <div className="min-h-screen bg-muted/20 flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="w-full max-w-md mx-auto bg-card border border-border rounded-2xl p-8 sm:p-10 shadow-xs text-center space-y-6 animate-in fade-in duration-300">
        <div className="relative mx-auto w-16 h-16 flex items-center justify-center">
          <div className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
            <Compass className="h-8 w-8 animate-spin [animation-duration:3s]" />
          </div>
        </div>

        <div className="space-y-1.5">
          <h2 className="text-base font-bold text-foreground">
            Verificando sesión...
          </h2>
          <p className="text-xs text-muted-foreground leading-relaxed">
            Estamos comprobando tus credenciales de viajero. Un momento por favor...
          </p>
        </div>

        <div className="flex items-center justify-center gap-2 text-xs text-primary font-semibold">
          <Loader2 className="h-4 w-4 animate-spin" />
          <span>Cargando portal...</span>
        </div>
      </div>
    </div>
  );
}
