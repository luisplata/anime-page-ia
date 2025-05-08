'use client';

import type React from 'react';
import { Button } from '@/components/ui/button';
import { Share2, Copy, Link as LinkIcon } from 'lucide-react'; // Added LinkIcon for better fallback visual
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';

interface ShareButtonProps {
  shareTitle: string;
  shareText?: string;
  shareUrl: string;
  buttonText?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "link" | "destructive" | null | undefined;
  size?: "default" | "sm" | "lg" | "icon" | null | undefined;
  className?: string;
}

export function ShareButton({
  shareTitle,
  shareText,
  shareUrl,
  buttonText = "Compartir",
  variant = "outline",
  size = "default",
  className,
}: ShareButtonProps) {
  const { toast } = useToast();
  const [isClient, setIsClient] = React.useState(false);
  const [canNativeShare, setCanNativeShare] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    if (typeof navigator !== 'undefined' && navigator.share) {
      setCanNativeShare(true);
    }
  }, []);

  const handleShare = async () => {
    if (!isClient) return; // Should not happen if button is clicked

    const textToShare = shareText || `¡Echa un vistazo!: ${shareTitle}`;
    
    if (canNativeShare && navigator.share) {
      try {
        await navigator.share({
          title: shareTitle,
          text: textToShare,
          url: shareUrl,
        });
        toast({ title: "Contenido compartido", description: "¡Gracias por compartir!" });
      } catch (error) {
        console.error("Error al usar Web Share API:", error);
        // Don't toast error if user cancels share dialog (AbortError)
        if ((error as DOMException).name !== 'AbortError') {
            toast({ title: "Error al compartir", description: "No se pudo compartir el contenido.", variant: "destructive" });
        }
      }
    } else {
      // Fallback: Copy to clipboard
      if (navigator.clipboard) {
        try {
          await navigator.clipboard.writeText(shareUrl);
          toast({ title: "Enlace copiado", description: "El enlace se ha copiado al portapapeles." });
        } catch (error) {
          console.error("Error al copiar al portapapeles:", error);
          toast({ title: "Error al copiar", description: "No se pudo copiar el enlace.", variant: "destructive" });
        }
      } else {
        toast({ title: "No soportado", description: "Tu navegador no soporta la copia al portapapeles de forma segura.", variant: "destructive" });
      }
    }
  };
  
  if (!isClient) {
    // Render a disabled button or placeholder during SSR/initial mount
    return (
      <Button variant={variant} size={size} className={cn(className)} disabled>
        <Share2 className={cn("h-5 w-5", size !== "icon" && "mr-2")} />
        {size !== "icon" && buttonText}
      </Button>
    );
  }

  const Icon = canNativeShare ? Share2 : Copy;
  const text = canNativeShare ? buttonText : "Copiar Enlace";

  return (
    <Button
      variant={variant}
      size={size}
      className={cn(className)}
      onClick={handleShare}
      aria-label={`${canNativeShare ? 'Compartir' : 'Copiar enlace de'} ${shareTitle}`}
      title={`${canNativeShare ? 'Compartir' : 'Copiar enlace de'} ${shareTitle}`}
    >
      <Icon className={cn("h-5 w-5", size !== "icon" && "mr-2")} />
      {size !== "icon" && text}
    </Button>
  );
}
