import { Loader2 } from "lucide-react";

interface LoadingSpinnerProps {
  /** Size of the spinner */
  size?: "sm" | "md" | "lg";
  /** Optional label below the spinner */
  label?: string;
  /** Whether to render as a full-page overlay */
  fullPage?: boolean;
}

const sizes = {
  sm: "h-4 w-4",
  md: "h-6 w-6",
  lg: "h-10 w-10",
};

export function LoadingSpinner({
  size = "md",
  label,
  fullPage = false,
}: LoadingSpinnerProps) {
  const content = (
    <div className="flex flex-col items-center gap-3">
      <Loader2 className={`${sizes[size]} animate-spin text-primary`} />
      {label && (
        <p className="text-sm text-muted-foreground animate-pulse">{label}</p>
      )}
    </div>
  );

  if (fullPage) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        {content}
      </div>
    );
  }

  return content;
}

/** Skeleton loading placeholder */
export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`shimmer rounded-lg ${className}`} />;
}

/** Card-shaped skeleton for note grids */
export function NoteCardSkeleton() {
  return (
    <div className="surface p-5 h-52">
      <Skeleton className="h-16 w-16 rounded-xl mb-4" />
      <Skeleton className="h-4 w-3/4 mb-2" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}
