'use client';

import { useState, useActionState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { clientCheckoutAction, checkCustomerByEmailAction } from '@/app/(catalogo)/reservar/actions';
import {
  Users,
  Calendar,
  Clock,
  MapPin,
  CreditCard,
  Building,
  Smartphone,
  Coins,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowRight,
  ArrowLeft,
  DollarSign,
  ShieldCheck,
  FileCheck,
  Mail,
  Search,
  UserCheck,
  UserPlus,
  UploadCloud,
  X,
  FileText,
  Image as ImageIcon,
} from 'lucide-react';
import { Select2 } from '@/components/ui/select2';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import type { PaymentMethodDto } from '@/modules/payment-method/serializers/payment-method.serializer';
import type { CustomerDto } from '@/modules/customer/serializers/customer.serializer';

interface ClientCheckoutFormProps {
  departure: {
    id: string;
    code: string;
    departureDate: string;
    returnDate?: string | null;
    meetingPoint?: string | null;
    meetingTime?: string | null;
    availableSlots: number;
    effectivePrice: number;
    priceOverride?: string | null;
  };
  tour: {
    id: string;
    name: string;
    code: string;
    durationDays: number;
    currency: string;
    imageUrl?: string | null;
  };
  paymentMethods?: PaymentMethodDto[];
  initialCustomer?: CustomerDto;
}

interface CompanionPassenger {
  firstName: string;
  lastName: string;
  documentType: string;
  documentNumber: string;
  phone: string;
}

/**
 * Comprime imágenes en el navegador antes de enviarlas al servidor.
 * Convierte fotos pesadas de teléfonos (5-15 MB) a JPEGs optimizados de ~150-300 KB.
 */
async function compressImageFile(file: File, maxDimension = 1600, quality = 0.82): Promise<File> {
  if (typeof window === 'undefined' || !file.type.startsWith('image/') || file.type === 'image/svg+xml') {
    return file;
  }

  // Si ya es liviana (menor a 600 KB), no es necesario recomprimir
  if (file.size <= 600 * 1024) {
    return file;
  }

  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.onload = () => {
        let { width, height } = img;
        if (width > maxDimension || height > maxDimension) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          return resolve(file);
        }

        ctx.drawImage(img, 0, 0, width, height);

        canvas.toBlob(
          (blob) => {
            if (!blob || blob.size >= file.size) {
              return resolve(file);
            }
            const cleanName = file.name.replace(/\.[^.]+$/, '.jpg');
            const compressedFile = new File([blob], cleanName, {
              type: 'image/jpeg',
              lastModified: Date.now(),
            });
            resolve(compressedFile);
          },
          'image/jpeg',
          quality,
        );
      };
      img.onerror = () => resolve(file);
      img.src = e.target?.result as string;
    };
    reader.onerror = () => resolve(file);
    reader.readAsDataURL(file);
  });
}

export function ClientCheckoutForm({
  departure,
  tour,
  paymentMethods,
  initialCustomer,
}: ClientCheckoutFormProps) {
  const [state, formAction, isPending] = useActionState(clientCheckoutAction, {
    status: 'idle',
  });

  // Steps: 1 = Cupos y Tarifa, 2 = Correo / Verificación, 3 = Datos de Pasajeros, 4 = Pago y Comprobante
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [slotsCount, setSlotsCount] = useState<number>(1);

  // Paso 2: Verificación de cliente por correo
  const [holderEmail, setHolderEmail] = useState<string>(initialCustomer?.email || '');
  const [isCheckingEmail, setIsCheckingEmail] = useState<boolean>(false);
  const [emailChecked, setEmailChecked] = useState<boolean>(Boolean(initialCustomer?.email));
  const [lastCheckedEmail, setLastCheckedEmail] = useState<string>(initialCustomer?.email || '');
  const [existingCustomer, setExistingCustomer] = useState<CustomerDto | null>(initialCustomer || null);
  const [emailCheckMessage, setEmailCheckMessage] = useState<{
    type: 'success' | 'info' | 'error';
    title: string;
    text: string;
    details?: string;
  } | null>(
    initialCustomer
      ? {
          type: 'success',
          title: '¡Sesión Activa Detectada!',
          text: `Hola, ${initialCustomer.firstName} ${initialCustomer.lastName}. Tus registros han sido reconocidos.`,
          details: 'Tus datos de contacto han sido precargados automáticamente para tu comodidad.',
        }
      : null,
  );
  const [step2Error, setStep2Error] = useState<string | null>(null);

  // Paso 3: Datos de pasajeros
  const [holderFirstName, setHolderFirstName] = useState<string>(initialCustomer?.firstName || '');
  const [holderLastName, setHolderLastName] = useState<string>(initialCustomer?.lastName || '');
  const [holderPhone, setHolderPhone] = useState<string>(initialCustomer?.phone || '');
  const [holderDocumentType, setHolderDocumentType] = useState<string>(initialCustomer?.documentType || 'cedula');
  const [holderDocumentNumber, setHolderDocumentNumber] = useState<string>(initialCustomer?.documentNumber || '');
  const [emergencyContact, setEmergencyContact] = useState<string>(initialCustomer?.emergencyContact || '');
  const [emergencyPhone, setEmergencyPhone] = useState<string>(initialCustomer?.emergencyPhone || '');
  const [step3Errors, setStep3Errors] = useState<Record<string, string>>({});

  // Acompañantes (si slotsCount > 1)
  const [companions, setCompanions] = useState<CompanionPassenger[]>([]);

  // Paso 4: Pago
  const hasDynamicMethods = Boolean(paymentMethods && paymentMethods.length > 0);
  const [selectedMethodId, setSelectedMethodId] = useState<string>(
    hasDynamicMethods ? paymentMethods![0].id : 'pago_movil',
  );
  const [paymentMethod, setPaymentMethod] = useState<string>(
    hasDynamicMethods ? paymentMethods![0].name : 'pago_movil',
  );
  const [paymentReference, setPaymentReference] = useState<string>('');
  const [paymentDate, setPaymentDate] = useState<string>(() => new Date().toISOString().split('T')[0]);
  const [selectedProofFile, setSelectedProofFile] = useState<File | null>(null);
  const [proofPreviewUrl, setProofPreviewUrl] = useState<string | null>(null);
  const [isOptimizingImage, setIsOptimizingImage] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [step4Errors, setStep4Errors] = useState<Record<string, string>>({});
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Redirigir paso automáticamente si el servidor responde con errores específicos
  useEffect(() => {
    if (state.status === 'error') {
      if (state.fieldErrors) {
        if (
          state.fieldErrors.holderFirstName ||
          state.fieldErrors.holderLastName ||
          state.fieldErrors.holderDocumentNumber ||
          state.fieldErrors.holderPhone
        ) {
          setStep(3);
        } else if (state.fieldErrors.holderEmail) {
          setStep(2);
        } else if (
          state.fieldErrors.paymentReference ||
          state.fieldErrors.paymentDate ||
          state.fieldErrors.proofFile
        ) {
          setStep(4);
        }
      }
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }, [state]);


  const handleSlotsChange = (newCount: number) => {
    setSlotsCount(newCount);
    const needed = Math.max(0, newCount - 1);
    setCompanions((prev) => {
      const next = [...prev];
      while (next.length < needed) {
        next.push({
          firstName: '',
          lastName: '',
          documentType: 'cedula',
          documentNumber: '',
          phone: '',
        });
      }
      return next.slice(0, needed);
    });
  };

  const updateCompanion = (index: number, field: keyof CompanionPassenger, val: string) => {
    setCompanions((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: val };
      return next;
    });
    // Limpiar error del campo modificado si existe
    if (step3Errors[`companion_${index}_${field}`]) {
      setStep3Errors((prevErrors) => {
        const updated = { ...prevErrors };
        delete updated[`companion_${index}_${field}`];
        return updated;
      });
    }
  };

  // Manejo de verificación de correo en Paso 2
  const handleCheckEmail = async (overrideEmail?: string): Promise<boolean> => {
    const emailToTest = (overrideEmail !== undefined ? overrideEmail : holderEmail).trim().toLowerCase();
    setStep2Error(null);

    if (!emailToTest) {
      setStep2Error('Por favor ingresa un correo electrónico.');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToTest)) {
      setStep2Error('Por favor ingresa un formato de correo electrónico válido (ej: usuario@correo.com).');
      return false;
    }

    setIsCheckingEmail(true);

    try {
      const result = await checkCustomerByEmailAction(emailToTest);
      setLastCheckedEmail(emailToTest);
      setEmailChecked(true);

      if (result.found && result.customer) {
        setExistingCustomer(result.customer);
        // Precargar automáticamente los datos del cliente encontrado
        setHolderFirstName(result.customer.firstName || '');
        setHolderLastName(result.customer.lastName || '');
        setHolderEmail(result.customer.email || emailToTest);
        setHolderPhone(result.customer.phone || '');
        setHolderDocumentType(result.customer.documentType || 'cedula');
        setHolderDocumentNumber(result.customer.documentNumber || '');
        setEmergencyContact(result.customer.emergencyContact || '');
        setEmergencyPhone(result.customer.emergencyPhone || '');

        setEmailCheckMessage({
          type: 'success',
          title: '¡Cliente Encontrado!',
          text: `Bienvenido(a) de nuevo, ${result.customer.firstName} ${result.customer.lastName}.`,
          details: 'Tus registros personales han sido precargados para el siguiente paso. Podrás revisarlos o modificarlos si hubo algún cambio.',
        });
        return true;
      } else {
        setExistingCustomer(null);
        setHolderEmail(emailToTest);
        setEmailCheckMessage({
          type: 'info',
          title: 'Cliente Nuevo',
          text: `No encontramos registros previos asociados a "${emailToTest}".`,
          details: '¡Serás registrado como nuevo cliente! En el siguiente paso podrás ingresar tus datos para generar tu reserva.',
        });
        return true;
      }
    } catch {
      setStep2Error('Ocurrió un error al verificar el correo. Puedes continuar e ingresar tus datos manualmente.');
      return false;
    } finally {
      setIsCheckingEmail(false);
    }
  };

  const handleContinueFromStep2 = async () => {
    const emailToTest = holderEmail.trim().toLowerCase();
    if (!emailToTest) {
      setStep2Error('El correo electrónico es obligatorio para continuar.');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(emailToTest)) {
      setStep2Error('Por favor ingresa un formato de correo válido.');
      return;
    }

    // Si no ha sido verificado o cambió respecto a la última consulta, verificar primero
    if (!emailChecked || emailToTest !== lastCheckedEmail) {
      const ok = await handleCheckEmail(emailToTest);
      if (!ok) return;
    }

    setStep(3);
  };

  // Validación estricta para Paso 3 (Datos de pasajeros)
  const validateStep3 = (): boolean => {
    const errors: Record<string, string> = {};

    if (!holderFirstName.trim()) {
      errors.holderFirstName = 'El nombre del pasajero titular es obligatorio.';
    }
    if (!holderLastName.trim()) {
      errors.holderLastName = 'El apellido del pasajero titular es obligatorio.';
    }
    if (!holderEmail.trim()) {
      errors.holderEmail = 'El correo electrónico es obligatorio.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(holderEmail.trim())) {
      errors.holderEmail = 'El formato del correo electrónico no es válido.';
    }
    if (!holderPhone.trim()) {
      errors.holderPhone = 'El teléfono o WhatsApp es obligatorio.';
    } else if (holderPhone.trim().length < 6) {
      errors.holderPhone = 'El teléfono debe tener al menos 6 dígitos.';
    }
    if (!holderDocumentType) {
      errors.holderDocumentType = 'Seleccione el tipo de documento.';
    }
    if (!holderDocumentNumber.trim()) {
      errors.holderDocumentNumber = 'El número de documento o cédula es obligatorio.';
    }

    // Validar acompañantes requeridos
    companions.forEach((comp, idx) => {
      if (!comp.firstName.trim()) {
        errors[`companion_${idx}_firstName`] = `El nombre del acompañante #${idx + 2} es obligatorio.`;
      }
      if (!comp.lastName.trim()) {
        errors[`companion_${idx}_lastName`] = `El apellido del acompañante #${idx + 2} es obligatorio.`;
      }
    });

    setStep3Errors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleContinueFromStep3 = () => {
    if (!validateStep3()) {
      // Scroll to step top smoothly
      window.scrollTo({ top: 300, behavior: 'smooth' });
      return;
    }
    setStep(4);
  };

  // Manejo de archivo de comprobante en Paso 4
  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];

      // Validar tipo de archivo
      const fileExt = file.name.split('.').pop()?.toLowerCase();
      const isPdf = file.type === 'application/pdf' || fileExt === 'pdf';
      const isImg = file.type.startsWith('image/') || ['png', 'jpg', 'jpeg', 'webp'].includes(fileExt || '');

      if (!isPdf && !isImg) {
        setFileError('Formato no admitido. Por favor selecciona una imagen (PNG, JPG, WEBP) o un documento PDF.');
        handleRemoveFile();
        return;
      }

      // Validar PDF (máx 4.5 MB)
      if (isPdf) {
        if (file.size > 4.5 * 1024 * 1024) {
          setFileError('El archivo PDF excede el tamaño máximo permitido (4.5 MB).');
          handleRemoveFile();
          return;
        }
        setSelectedProofFile(file);
        if (proofPreviewUrl) {
          URL.revokeObjectURL(proofPreviewUrl);
          setProofPreviewUrl(null);
        }
        return;
      }

      // Comprimir imágenes automáticamente para envío rápido móvil
      setIsOptimizingImage(true);
      try {
        const optimizedFile = await compressImageFile(file);
        setSelectedProofFile(optimizedFile);
        if (proofPreviewUrl) {
          URL.revokeObjectURL(proofPreviewUrl);
        }
        setProofPreviewUrl(URL.createObjectURL(optimizedFile));

        // Actualizar el FileList del input nativo para que el FormData del formulario envíe el archivo comprimido
        if (fileInputRef.current) {
          try {
            const dt = new DataTransfer();
            dt.items.add(optimizedFile);
            fileInputRef.current.files = dt.files;
          } catch {
            // Ignorar en entornos donde DataTransfer no permita asignar input.files
          }
        }
      } catch (err) {
        console.error('Error optimizando imagen de comprobante:', err);
        setSelectedProofFile(file);
        setProofPreviewUrl(URL.createObjectURL(file));
      } finally {
        setIsOptimizingImage(false);
      }
    }
  };

  const handleRemoveFile = () => {
    setSelectedProofFile(null);
    setFileError(null);
    if (proofPreviewUrl) {
      URL.revokeObjectURL(proofPreviewUrl);
      setProofPreviewUrl(null);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const totalPrice = (slotsCount * departure.effectivePrice).toFixed(2);
  const currentDynamicMethod = hasDynamicMethods
    ? paymentMethods!.find((m) => m.id === selectedMethodId)
    : null;

  const isCash = currentDynamicMethod
    ? currentDynamicMethod.name.toLowerCase().includes('efectivo') ||
      currentDynamicMethod.name.toLowerCase().includes('cash') ||
      currentDynamicMethod.name.toLowerCase().includes('taquilla')
    : paymentMethod === 'cash_usd' || paymentMethod === 'cash_ves';

  // Navegación en el Wizard Bar con validación de avance
  const handleWizardClick = (targetStep: 1 | 2 | 3 | 4) => {
    if (targetStep === step) return;
    if (targetStep < step) {
      // Siempre se puede retroceder
      setStep(targetStep);
      return;
    }
    if (targetStep === 2) {
      setStep(2);
      return;
    }
    if (targetStep === 3) {
      handleContinueFromStep2();
      return;
    }
    if (targetStep === 4) {
      if (!emailChecked) {
        setStep(2);
        return;
      }
      if (!validateStep3()) {
        setStep(3);
        return;
      }
      setStep(4);
    }
  };

  return (
    <form action={formAction} className="space-y-8">
      {/* Campos ocultos de soporte HTTP */}
      <input type="hidden" name="departureId" value={departure.id} />
      <input type="hidden" name="slotsCount" value={slotsCount} />
      <input type="hidden" name="passengersJson" value={JSON.stringify(companions)} />
      <input type="hidden" name="isCash" value={isCash ? 'true' : 'false'} />

      {/* Alerta de estado global de la Server Action */}
      {state.message && (
        <div
          className={`p-4 rounded-2xl text-xs font-medium flex items-start gap-2.5 ${
            state.status === 'error'
              ? 'bg-destructive/10 text-destructive border border-destructive/20'
              : 'bg-emerald-500/10 text-emerald-600 border border-emerald-500/20'
          }`}
        >
          {state.status === 'error' ? (
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 mt-0.5" />
          )}
          <span>{state.message}</span>
        </div>
      )}

      {/* Wizard Progress Bar con 4 Pasos */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-border pb-4 text-xs font-semibold">
        <button
          type="button"
          onClick={() => handleWizardClick(1)}
          className={`flex items-center gap-2 pb-1 border-b-2 transition text-left cursor-pointer ${
            step === 1 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            step === 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>1</span>
          <span className="truncate">Cupos y Tarifa</span>
        </button>

        <button
          type="button"
          onClick={() => handleWizardClick(2)}
          className={`flex items-center gap-2 pb-1 border-b-2 transition text-left cursor-pointer ${
            step === 2 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            step === 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>2</span>
          <span className="truncate">Identificación</span>
        </button>

        <button
          type="button"
          onClick={() => handleWizardClick(3)}
          className={`flex items-center gap-2 pb-1 border-b-2 transition text-left cursor-pointer ${
            step === 3 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            step === 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>3</span>
          <span className="truncate">Datos Pasajeros</span>
        </button>

        <button
          type="button"
          onClick={() => handleWizardClick(4)}
          className={`flex items-center gap-2 pb-1 border-b-2 transition text-left cursor-pointer ${
            step === 4 ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold shrink-0 ${
            step === 4 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
          }`}>4</span>
          <span className="truncate">Pago y Comprobante</span>
        </button>
      </div>

      {/* ========================================================================= */}
      {/* PASO 1: CUPOS Y TARIFA                                                    */}
      {/* ========================================================================= */}
      <div className={step === 1 ? 'bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 block' : 'hidden'}>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            ¿Cuántos cupos deseas reservar?
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Cupos disponibles en esta salida: <strong className="text-emerald-600 dark:text-emerald-400 font-mono">{departure.availableSlots} cupos</strong>.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <label htmlFor="slotsSelect" className="text-xs font-medium text-foreground whitespace-nowrap">
            Número de Viajeros:
          </label>
          <div className="w-44">
            <Select2
              id="slotsSelect"
              value={String(slotsCount)}
              onValueChange={(val) => handleSlotsChange(parseInt(val, 10))}
              options={Array.from({ length: Math.min(departure.availableSlots, 10) }, (_, i) => i + 1).map((n) => ({
                value: String(n),
                label: `${n} ${n === 1 ? 'viajero' : 'viajeros'}`,
              }))}
              size="sm"
            />
          </div>
        </div>

        {/* Pricing Breakdown Box */}
        <div className="p-5 rounded-2xl bg-muted/40 border border-border space-y-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Tarifa por persona:</span>
            <span className="font-semibold text-foreground font-mono">
              ${departure.effectivePrice.toFixed(2)} USD
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cantidad de personas:</span>
            <span className="font-semibold text-foreground font-mono">x {slotsCount}</span>
          </div>
          <div className="pt-2 border-t border-border flex justify-between items-baseline">
            <span className="text-sm font-bold text-foreground">Total a Pagar:</span>
            <div className="text-right">
              <span className="text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">
                ${totalPrice}
              </span>
              <span className="text-[11px] text-muted-foreground ml-1">USD</span>
            </div>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs cursor-pointer"
          >
            Continuar a Verificación de Correo
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PASO 2: SETEAR CORREO Y VERIFICAR CLIENTE EN EL SISTEMA                   */}
      {/* ========================================================================= */}
      <div className={step === 2 ? 'bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 block' : 'hidden'}>
        <div className="space-y-1">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-[11px] font-bold uppercase tracking-wider">
            <Mail className="h-3.5 w-3.5" />
            Paso 2: Comprobación de Usuario
          </div>
          <h2 className="text-lg font-bold text-foreground pt-1">
            Correo Electrónico del Pasajero Titular
          </h2>
          <p className="text-xs text-muted-foreground">
            Ingresa tu correo para verificar si ya cuentas con un registro en nuestro sistema y precargar automáticamente tus datos.
          </p>
        </div>

        {/* Input con botón integrado de Comprobar */}
        <div className="space-y-2 max-w-xl">
          <label htmlFor="checkEmailInput" className="text-xs font-medium text-foreground block">
            Correo Electrónico del Titular *
          </label>
          <div className="flex flex-col sm:flex-row gap-2.5">
            <div className="relative flex-1">
              <Mail className="absolute left-3.5 top-3 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                id="checkEmailInput"
                type="email"
                value={holderEmail}
                onChange={(e) => {
                  setHolderEmail(e.target.value);
                  setStep2Error(null);
                  setEmailChecked(false);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleCheckEmail();
                  }
                }}
                placeholder="ejemplo@correo.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-xs bg-background text-foreground focus:ring-2 focus:ring-ring transition ${
                  step2Error ? 'border-destructive focus:ring-destructive' : 'border-input'
                }`}
              />
            </div>
            <button
              type="button"
              disabled={isCheckingEmail}
              onClick={() => handleCheckEmail()}
              className="inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 dark:bg-slate-100 dark:hover:bg-white text-white dark:text-slate-900 text-xs font-semibold transition disabled:opacity-50 cursor-pointer shrink-0"
            >
              {isCheckingEmail ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Verificando...
                </>
              ) : (
                <>
                  <Search className="h-4 w-4" />
                  Comprobar Correo
                </>
              )}
            </button>
          </div>
          {step2Error && (
            <p className="text-destructive text-[11px] font-medium">{step2Error}</p>
          )}
        </div>

        {/* Tarjeta de resultado de la verificación */}
        {emailCheckMessage && (
          <div
            className={`p-5 rounded-2xl border text-xs space-y-2 transition animate-in fade-in ${
              emailCheckMessage.type === 'success'
                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                : emailCheckMessage.type === 'info'
                ? 'bg-sky-500/10 border-sky-500/20 text-sky-800 dark:text-sky-300'
                : 'bg-destructive/10 border-destructive/20 text-destructive'
            }`}
          >
            <div className="flex items-center gap-2 font-bold text-sm">
              {emailCheckMessage.type === 'success' ? (
                <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
              ) : emailCheckMessage.type === 'info' ? (
                <UserPlus className="h-4 w-4 text-sky-600 dark:text-sky-400" />
              ) : (
                <AlertCircle className="h-4 w-4" />
              )}
              <span>{emailCheckMessage.title}</span>
            </div>
            <p className="text-xs leading-relaxed font-medium">
              {emailCheckMessage.text}
            </p>
            {emailCheckMessage.details && (
              <p className="text-[11px] opacity-90 leading-relaxed pt-1">
                {emailCheckMessage.details}
              </p>
            )}

            {existingCustomer && (
              <div className="pt-2 flex flex-wrap gap-2 text-[11px]">
                <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 font-semibold">
                  Nombre: {existingCustomer.firstName} {existingCustomer.lastName}
                </span>
                {existingCustomer.documentNumber && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20 font-mono">
                    Doc: {existingCustomer.documentNumber}
                  </span>
                )}
                {existingCustomer.phone && (
                  <span className="px-2.5 py-1 rounded-lg bg-emerald-500/20">
                    Tel: {existingCustomer.phone}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setStep(1)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Cupos
          </button>

          <button
            type="button"
            disabled={isCheckingEmail}
            onClick={handleContinueFromStep2}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs cursor-pointer disabled:opacity-50"
          >
            {isCheckingEmail ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Verificando...
              </>
            ) : (
              <>
                Continuar a Datos de Pasajeros
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PASO 3: INGRESAR DATOS DE PASAJEROS (PRECARGADO O MANUAL + VALIDACIÓN)    */}
      {/* ========================================================================= */}
      <div className={step === 3 ? 'bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-8 block' : 'hidden'}>
        <div className="space-y-1">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-bold text-foreground">
                Datos del Pasajero Titular (Contratante)
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Esta persona recibirá la confirmación, el voucher digital y el comprobante del viaje.
              </p>
            </div>
            {existingCustomer ? (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-[11px] font-semibold border border-emerald-500/20">
                <CheckCircle2 className="h-3.5 w-3.5" />
                Datos precargados del sistema
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 text-[11px] font-semibold border border-slate-200 dark:border-slate-700">
                <UserPlus className="h-3.5 w-3.5" />
                Nuevo Registro
              </span>
            )}
          </div>
        </div>

        {/* Banner de error si hay campos obligatorios faltantes */}
        {Object.keys(step3Errors).length > 0 && (
          <div className="p-4 rounded-2xl bg-destructive/10 border border-destructive/20 text-destructive text-xs font-medium flex items-center gap-2.5">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Por favor completa todos los campos requeridos marcados con asterisco (*) antes de continuar al pago.</span>
          </div>
        )}

        {/* Inputs del Titular */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="space-y-1.5">
            <label htmlFor="holderFirstName" className="font-medium text-foreground">
              Nombres *
            </label>
            <input
              id="holderFirstName"
              name="holderFirstName"
              type="text"
              value={holderFirstName}
              onChange={(e) => {
                setHolderFirstName(e.target.value);
                if (step3Errors.holderFirstName) {
                  setStep3Errors((prev) => {
                    const u = { ...prev };
                    delete u.holderFirstName;
                    return u;
                  });
                }
              }}
              placeholder="Ej: María Alejandra"
              required
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-ring ${
                step3Errors.holderFirstName ? 'border-destructive focus:ring-destructive' : 'border-input'
              }`}
            />
            {step3Errors.holderFirstName && (
              <p className="text-destructive text-[11px] font-medium">{step3Errors.holderFirstName}</p>
            )}
            {state.fieldErrors?.holderFirstName && (
              <p className="text-destructive text-[11px] font-medium">{state.fieldErrors.holderFirstName[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="holderLastName" className="font-medium text-foreground">
              Apellidos *
            </label>
            <input
              id="holderLastName"
              name="holderLastName"
              type="text"
              value={holderLastName}
              onChange={(e) => {
                setHolderLastName(e.target.value);
                if (step3Errors.holderLastName) {
                  setStep3Errors((prev) => {
                    const u = { ...prev };
                    delete u.holderLastName;
                    return u;
                  });
                }
              }}
              placeholder="Ej: Pérez Rodríguez"
              required
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-ring ${
                step3Errors.holderLastName ? 'border-destructive focus:ring-destructive' : 'border-input'
              }`}
            />
            {step3Errors.holderLastName && (
              <p className="text-destructive text-[11px] font-medium">{step3Errors.holderLastName}</p>
            )}
            {state.fieldErrors?.holderLastName && (
              <p className="text-destructive text-[11px] font-medium">{state.fieldErrors.holderLastName[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="holderEmail" className="font-medium text-foreground">
              Correo Electrónico *
            </label>
            <input
              id="holderEmail"
              name="holderEmail"
              type="email"
              value={holderEmail}
              onChange={(e) => {
                setHolderEmail(e.target.value);
                if (step3Errors.holderEmail) {
                  setStep3Errors((prev) => {
                    const u = { ...prev };
                    delete u.holderEmail;
                    return u;
                  });
                }
              }}
              placeholder="tu@correo.com"
              required
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-ring ${
                step3Errors.holderEmail ? 'border-destructive focus:ring-destructive' : 'border-input'
              }`}
            />
            {step3Errors.holderEmail && (
              <p className="text-destructive text-[11px] font-medium">{step3Errors.holderEmail}</p>
            )}
            {state.fieldErrors?.holderEmail && (
              <p className="text-destructive text-[11px] font-medium">{state.fieldErrors.holderEmail[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="holderPhone" className="font-medium text-foreground">
              Teléfono / WhatsApp *
            </label>
            <input
              id="holderPhone"
              name="holderPhone"
              type="tel"
              value={holderPhone}
              onChange={(e) => {
                setHolderPhone(e.target.value);
                if (step3Errors.holderPhone) {
                  setStep3Errors((prev) => {
                    const u = { ...prev };
                    delete u.holderPhone;
                    return u;
                  });
                }
              }}
              placeholder="Ej: +58 412 1234567"
              required
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground focus:ring-2 focus:ring-ring ${
                step3Errors.holderPhone ? 'border-destructive focus:ring-destructive' : 'border-input'
              }`}
            />
            {step3Errors.holderPhone && (
              <p className="text-destructive text-[11px] font-medium">{step3Errors.holderPhone}</p>
            )}
            {state.fieldErrors?.holderPhone && (
              <p className="text-destructive text-[11px] font-medium">{state.fieldErrors.holderPhone[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="holderDocumentType" className="font-medium text-foreground">
              Tipo de Documento *
            </label>
            <Select2
              id="holderDocumentType"
              name="holderDocumentType"
              value={holderDocumentType}
              onValueChange={(val) => setHolderDocumentType(val)}
              options={[
                { value: 'cedula', label: 'Cédula de Identidad (V / E)' },
                { value: 'passport', label: 'Pasaporte' },
                { value: 'other', label: 'Otro' },
              ]}
              size="sm"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="holderDocumentNumber" className="font-medium text-foreground">
              Número de Documento *
            </label>
            <input
              id="holderDocumentNumber"
              name="holderDocumentNumber"
              type="text"
              value={holderDocumentNumber}
              onChange={(e) => {
                setHolderDocumentNumber(e.target.value);
                if (step3Errors.holderDocumentNumber) {
                  setStep3Errors((prev) => {
                    const u = { ...prev };
                    delete u.holderDocumentNumber;
                    return u;
                  });
                }
              }}
              placeholder="Ej: 18492019"
              required
              className={`w-full px-3.5 py-2.5 rounded-xl border bg-background text-foreground font-mono focus:ring-2 focus:ring-ring ${
                step3Errors.holderDocumentNumber ? 'border-destructive focus:ring-destructive' : 'border-input'
              }`}
            />
            {step3Errors.holderDocumentNumber && (
              <p className="text-destructive text-[11px] font-medium">{step3Errors.holderDocumentNumber}</p>
            )}
            {state.fieldErrors?.holderDocumentNumber && (
              <p className="text-destructive text-[11px] font-medium">{state.fieldErrors.holderDocumentNumber[0]}</p>
            )}
          </div>

          <div className="space-y-1.5">
            <label htmlFor="emergencyContact" className="font-medium text-foreground">
              Contacto de Emergencia (Nombre)
            </label>
            <input
              id="emergencyContact"
              name="emergencyContact"
              type="text"
              value={emergencyContact}
              onChange={(e) => setEmergencyContact(e.target.value)}
              placeholder="Ej: Carlos Pérez (Hermano)"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="space-y-1.5">
            <label htmlFor="emergencyPhone" className="font-medium text-foreground">
              Teléfono de Emergencia
            </label>
            <input
              id="emergencyPhone"
              name="emergencyPhone"
              type="tel"
              value={emergencyPhone}
              onChange={(e) => setEmergencyPhone(e.target.value)}
              placeholder="Ej: 0414 9876543"
              className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-ring"
            />
          </div>
        </div>

        {/* Acompañantes adicionales si slotsCount > 1 */}
        {companions.length > 0 && (
          <div className="space-y-6 pt-6 border-t border-border">
            <div>
              <h3 className="text-base font-bold text-foreground flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Acompañantes Adicionales ({companions.length})
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                Ingrese los datos para el manifiesto oficial de abordaje de cada pasajero adicional.
              </p>
            </div>

            <div className="space-y-4">
              {companions.map((comp, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-muted/30 border border-border space-y-4 text-xs"
                >
                  <div className="font-bold text-foreground flex items-center justify-between">
                    <span>Pasajero #{idx + 2} (Acompañante)</span>
                    <span className="text-[10px] text-muted-foreground uppercase font-mono">Cupo #{idx + 2}</span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">Nombres *</label>
                      <input
                        type="text"
                        value={comp.firstName}
                        onChange={(e) => updateCompanion(idx, 'firstName', e.target.value)}
                        placeholder="Nombres del acompañante"
                        required
                        className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs ${
                          step3Errors[`companion_${idx}_firstName`] ? 'border-destructive focus:ring-destructive' : 'border-input'
                        }`}
                      />
                      {step3Errors[`companion_${idx}_firstName`] && (
                        <p className="text-destructive text-[10px] font-medium">{step3Errors[`companion_${idx}_firstName`]}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">Apellidos *</label>
                      <input
                        type="text"
                        value={comp.lastName}
                        onChange={(e) => updateCompanion(idx, 'lastName', e.target.value)}
                        placeholder="Apellidos del acompañante"
                        required
                        className={`w-full px-3 py-2 rounded-lg border bg-background text-foreground text-xs ${
                          step3Errors[`companion_${idx}_lastName`] ? 'border-destructive focus:ring-destructive' : 'border-input'
                        }`}
                      />
                      {step3Errors[`companion_${idx}_lastName`] && (
                        <p className="text-destructive text-[10px] font-medium">{step3Errors[`companion_${idx}_lastName`]}</p>
                      )}
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">Cédula / Pasaporte (Opcional)</label>
                      <input
                        type="text"
                        value={comp.documentNumber}
                        onChange={(e) => updateCompanion(idx, 'documentNumber', e.target.value)}
                        placeholder="V-00000000"
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-[11px] font-medium text-muted-foreground">Teléfono (Opcional)</label>
                      <input
                        type="tel"
                        value={comp.phone}
                        onChange={(e) => updateCompanion(idx, 'phone', e.target.value)}
                        placeholder="Teléfono móvil"
                        className="w-full px-3 py-2 rounded-lg border border-input bg-background text-foreground text-xs"
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">
          <button
            type="button"
            onClick={() => setStep(2)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Verificación
          </button>

          <button
            type="button"
            onClick={handleContinueFromStep3}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90 transition shadow-xs cursor-pointer"
          >
            Continuar a Información de Pago
            <ArrowRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* PASO 4: CARGAR INFORMACIÓN DE PAGO                                        */}
      {/* ========================================================================= */}
      <div className={step === 4 ? 'bg-card border border-border rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 block' : 'hidden'}>
        <div>
          <h2 className="text-lg font-bold text-foreground">
            Datos de Pago y Coordenadas Bancarias
          </h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Monto a transferir: <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-sm">${totalPrice} USD</strong> (o su equivalente según tasa oficial del día).
          </p>
        </div>

        {state.message && state.status === 'error' && (
          <div className="p-3.5 rounded-xl text-xs font-medium bg-destructive/10 text-destructive border border-destructive/20 flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.message}</span>
          </div>
        )}

        {/* Selector de Método de Pago */}
        <div className="space-y-2">
          <label htmlFor="paymentMethodSelect" className="text-xs font-medium text-foreground">
            Selecciona tu Método de Pago *
          </label>
          {hasDynamicMethods ? (
            <>
              <input
                type="hidden"
                name="paymentMethod"
                value={currentDynamicMethod?.name || paymentMethod}
              />
              <Select2
                id="paymentMethodSelect"
                value={selectedMethodId}
                onValueChange={(val) => {
                  setSelectedMethodId(val);
                  const found = paymentMethods!.find((m) => m.id === val);
                  if (found) setPaymentMethod(found.name);
                }}
                options={paymentMethods!.map((m) => ({
                  value: m.id,
                  label: `${m.name} (${m.currency})`,
                }))}
                size="sm"
              />
            </>
          ) : (
            <Select2
              id="paymentMethod"
              name="paymentMethod"
              value={paymentMethod}
              onValueChange={(val) => setPaymentMethod(val)}
              options={[
                { value: 'pago_movil', label: 'Pago Móvil (Bolívares - VES)' },
                { value: 'zelle', label: 'Zelle (USD)' },
                { value: 'binance', label: 'Binance Pay (USDT)' },
                { value: 'zinli', label: 'Zinli (USD)' },
                { value: 'bank_transfer', label: 'Transferencia Bancaria Nacional (VES)' },
                { value: 'cash_usd', label: 'Efectivo USD (Entrega directa previa)' },
              ]}
              size="sm"
            />
          )}
        </div>

        {/* Tarjeta de Coordenadas e Instrucciones */}
        {hasDynamicMethods && currentDynamicMethod ? (
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs space-y-2.5 shadow-2xs">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              Coordenadas e Instrucciones para {currentDynamicMethod.name}:
            </span>
            <div className="space-y-1 text-slate-800 dark:text-slate-200 font-mono text-[11px] pt-1 whitespace-pre-wrap leading-relaxed">
              {currentDynamicMethod.instructions}
            </div>
          </div>
        ) : (
          <div className="p-5 rounded-2xl bg-slate-100 dark:bg-slate-800/90 border border-slate-300 dark:border-slate-700 text-xs space-y-2.5 shadow-2xs">
            <span className="font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Building className="h-4 w-4 text-teal-600 dark:text-teal-400 shrink-0" />
              Coordenadas e Instrucciones para {paymentMethod.replace('_', ' ').toUpperCase()}:
            </span>

            {paymentMethod === 'pago_movil' && (
              <div className="space-y-1 text-slate-800 dark:text-slate-200 font-mono text-[11px] pt-1">
                <div>Banco: <strong className="text-slate-900 dark:text-white font-bold">Banesco (0134)</strong></div>
                <div>Teléfono: <strong className="text-slate-900 dark:text-white font-bold">0414-1234567</strong></div>
                <div>RIF / C.I.: <strong className="text-slate-900 dark:text-white font-bold">J-50000000-0</strong> (TravelDemo C.A.)</div>
              </div>
            )}

            {paymentMethod === 'zelle' && (
              <div className="space-y-1 text-slate-800 dark:text-slate-200 font-mono text-[11px] pt-1">
                <div>Email Zelle: <strong className="text-slate-900 dark:text-white font-bold">pagos@traveldemo.com</strong></div>
                <div>Titular: <strong className="text-slate-900 dark:text-white font-bold">Travel Agency LLC</strong></div>
                <div>Memo: <span className="text-slate-700 dark:text-slate-300 font-sans">Tu nombre y código de tour</span></div>
              </div>
            )}

            {paymentMethod === 'binance' && (
              <div className="space-y-1 text-slate-800 dark:text-slate-200 font-mono text-[11px] pt-1">
                <div>Binance Pay ID: <strong className="text-slate-900 dark:text-white font-bold">84920194</strong></div>
                <div>Moneda: <strong className="text-slate-900 dark:text-white font-bold">USDT</strong></div>
                <div>Red sugerida: <span className="text-slate-700 dark:text-slate-300 font-sans">Binance Pay Direct o TRC-20</span></div>
              </div>
            )}

            {paymentMethod === 'zinli' && (
              <div className="space-y-1 text-slate-800 dark:text-slate-200 font-mono text-[11px] pt-1">
                <div>Correo Zinli: <strong className="text-slate-900 dark:text-white font-bold">info@traveldemo.com</strong></div>
                <div>Nombre: <strong className="text-slate-900 dark:text-white font-bold">TravelDemo Oficial</strong></div>
              </div>
            )}

            {paymentMethod === 'bank_transfer' && (
              <div className="space-y-1 text-slate-800 dark:text-slate-200 font-mono text-[11px] pt-1">
                <div>Banco: <strong className="text-slate-900 dark:text-white font-bold">Banesco Banco Universal</strong></div>
                <div>Cuenta Corriente: <strong className="text-slate-900 dark:text-white font-bold">0134-0000-00-0000000000</strong></div>
                <div>Titular: <strong className="text-slate-900 dark:text-white font-bold">TravelDemo C.A.</strong> / RIF: <strong className="text-slate-900 dark:text-white font-bold">J-50000000-0</strong></div>
              </div>
            )}

            {paymentMethod === 'cash_usd' && (
              <div className="space-y-1.5 text-slate-800 dark:text-slate-200 text-xs pt-1 leading-relaxed">
                <div>
                  <strong className="text-slate-900 dark:text-white">Pago en taquilla u oficina de la agencia antes de la salida.</strong>
                </div>
                <div className="text-slate-600 dark:text-slate-300">
                  El pago se coordinará y entregará directamente en taquilla o con el asesor del tour. No se requiere número de transferencia ni captura bancaria para reservar.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Inputs de Referencia, Fecha y Comprobante */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          {!isCash && (
            <>
              <div className="space-y-1.5">
                <label htmlFor="paymentReference" className="font-medium text-foreground">
                  Número de Referencia / ID de Transacción *
                </label>
                <input
                  id="paymentReference"
                  name="paymentReference"
                  type="text"
                  value={paymentReference}
                  onChange={(e) => setPaymentReference(e.target.value)}
                  placeholder="Ej: 048291, Ref #9821374"
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground font-mono focus:ring-2 focus:ring-ring"
                />
                {state.fieldErrors?.paymentReference && (
                  <p className="text-destructive text-[11px]">{state.fieldErrors.paymentReference[0]}</p>
                )}
              </div>

              <div className="space-y-1.5">
                <label htmlFor="paymentDate" className="font-medium text-foreground">
                  Fecha de Realización del Pago *
                </label>
                <input
                  id="paymentDate"
                  name="paymentDate"
                  type="date"
                  value={paymentDate}
                  onChange={(e) => setPaymentDate(e.target.value)}
                  required
                  className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground focus:ring-2 focus:ring-ring"
                />
                {state.fieldErrors?.paymentDate && (
                  <p className="text-destructive text-[11px]">{state.fieldErrors.paymentDate[0]}</p>
                )}
              </div>

              {/* Subida de Comprobante a Supabase Storage */}
              <div className="space-y-2 sm:col-span-2">
                <label htmlFor="proofFile" className="font-medium text-foreground flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <UploadCloud className="h-4 w-4 text-primary" />
                    Subir Comprobante / Captura del Pago (Supabase Storage)
                  </span>
                  <span className="text-[11px] text-muted-foreground font-normal">PNG, JPG, WEBP o PDF (Máx. 5 MB)</span>
                </label>

                <div className="flex flex-col gap-3">
                  <input
                    ref={fileInputRef}
                    id="proofFile"
                    name="proofFile"
                    type="file"
                    accept="image/png,image/jpeg,image/webp,application/pdf"
                    onChange={handleFileChange}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-input bg-background text-foreground text-xs file:mr-3 file:py-1 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 cursor-pointer"
                  />

                  {/* Vista previa del archivo seleccionado */}
                  {selectedProofFile && (
                    <div className="flex items-center justify-between p-3 rounded-xl bg-muted/50 border border-border text-xs">
                      <div className="flex items-center gap-3 overflow-hidden">
                        {proofPreviewUrl ? (
                          <div className="relative h-10 w-10 rounded-lg overflow-hidden border border-border shrink-0 bg-background">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={proofPreviewUrl}
                              alt="Comprobante"
                              className="h-full w-full object-cover"
                            />
                          </div>
                        ) : (
                          <div className="h-10 w-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <FileText className="h-5 w-5" />
                          </div>
                        )}
                        <div className="truncate">
                          <p className="font-medium text-foreground truncate">{selectedProofFile.name}</p>
                          <p className="text-[10px] text-muted-foreground font-mono">
                            {(selectedProofFile.size / 1024).toFixed(0)} KB • Listo para almacenar en Supabase
                          </p>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={handleRemoveFile}
                        className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition cursor-pointer shrink-0"
                        title="Quitar archivo"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {/* Indicador de optimización en curso */}
                  {isOptimizingImage && (
                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-primary/10 text-primary text-xs font-medium">
                      <Loader2 className="h-4 w-4 animate-spin shrink-0" />
                      <span>Optimizando comprobante para envío rápido móvil...</span>
                    </div>
                  )}

                  {/* Error de validación local del archivo */}
                  {fileError && (
                    <p className="text-destructive text-[11px] font-medium">{fileError}</p>
                  )}
                </div>

                {state.fieldErrors?.proofFile && (
                  <p className="text-destructive text-[11px] font-medium">{state.fieldErrors.proofFile[0]}</p>
                )}

                {/* Nota de soporte y flexibilidad */}
                <div className="p-3 rounded-xl bg-muted/40 border border-border/60 text-[11px] text-muted-foreground flex items-start gap-2">
                  <span className="text-sm shrink-0">💡</span>
                  <span>
                    <strong>Nota:</strong> Si tienes algún problema subiendo el archivo de comprobante desde tu dispositivo móvil, puedes continuar sin adjuntarlo e ingresar el número de referencia; luego podrás enviar la captura a nuestro equipo por WhatsApp.
                  </span>
                </div>
              </div>
            </>
          )}

          <div className="space-y-1.5 sm:col-span-2">
            <label htmlFor="notes" className="font-medium text-foreground">
              Notas y Requerimientos Especiales (Opcional)
            </label>
            <RichTextEditor
              id="notes"
              name="notes"
              placeholder="Ej: Asiento en pasillo, requerimiento dietético, etc."
              minHeight="min-h-[110px]"
            />
          </div>
        </div>

        {/* Alerta de error en Paso 4 para visualización directa en móviles */}
        {state.status === 'error' && state.message && (
          <div className="p-4 rounded-2xl text-xs font-semibold bg-destructive/10 text-destructive border border-destructive/20 flex items-start gap-2.5 animate-in fade-in-50">
            <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <span className="font-bold block">No se pudo procesar la reserva</span>
              <span>{state.message}</span>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between pt-4 border-t border-border">

          <button
            type="button"
            onClick={() => setStep(3)}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl border border-border text-xs text-muted-foreground hover:bg-muted transition cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver a Pasajeros
          </button>

          <button
            type="submit"
            disabled={isPending || isOptimizingImage}
            className="inline-flex items-center gap-2 px-8 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition shadow-md shadow-emerald-600/20 disabled:opacity-50 cursor-pointer"
          >
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Procesando Reserva y Guardando Comprobante...
              </>
            ) : isOptimizingImage ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Optimizando Comprobante...
              </>
            ) : (
              <>
                <CheckCircle2 className="h-4 w-4" />
                Confirmar y Enviar Reserva (${totalPrice} USD)
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
}
