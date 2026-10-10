import { Compass, Loader2 } from 'lucide-react';

export default function CustomerAccountLoading() {
  return (
    <div className="min-h-[60vh] flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center max-w-sm mx-auto">
        <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shadow-xs">
          <Compass className="h-7 w-7 animate-spin [animation-duration:3s]" />
        </div>
        <div className="space-y-1">
          <h3 className="text-sm font-bold text-foreground">
            Cargando información...
          </h3>
          <p className="text-xs text-muted-foreground">
            Sincronizando tus datos y reservas de viajero
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-primary font-medium pt-1">
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          <span>Por favor espera...</span>
        </div>
      </div>
    </div>
  );
}
