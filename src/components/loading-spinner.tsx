
interface LoadingSpinnerProps {
  isVisible: boolean;
}

export function LoadingSpinner({ isVisible }: LoadingSpinnerProps) {
  if (!isVisible) {
    // console.log("LoadingSpinner: Becoming hidden"); // Log before returning null
    return null;
  }

  // console.log("LoadingSpinner: Becoming visible"); // Log when it's about to be rendered
  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm"
      aria-live="assertive"
      role="alert"
    >
      <img
        src="/assets/animebell_logo_name_prototype.png"
        alt="Cargando..."
        className="h-32 w-auto animate-pulse"
        data-ai-hint="loading indicator"
      />
      <p className="mt-4 text-lg font-semibold text-foreground animate-pulse">
        Cargando...
      </p>
    </div>
  );
}

