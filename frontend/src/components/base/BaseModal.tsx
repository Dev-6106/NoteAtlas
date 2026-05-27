import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";

interface BaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children?: React.ReactNode;
  footer?: React.ReactNode;
  width?: number;
  height?: number;
  background?: string;
}

export function BaseModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width = 500,
  height,
  background,
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[95vw] sm:w-full overflow-hidden flex flex-col p-0 border-border/60"
        style={{
          maxWidth: `${width}px`,
          height: height ? `${height}px` : "auto",
          maxHeight: "90vh",
          background: background || "var(--background)",
        }}
      >
        {(title || description) && (
          <DialogHeader className="px-6 pt-6 pb-4 shrink-0">
            {title && (
              <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
                {title}
              </DialogTitle>
            )}
            {description && (
              <DialogDescription className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>
        )}

        <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-2">
          {children}
        </div>

        {footer && (
          <DialogFooter className="px-6 py-4 border-t border-border/40 bg-secondary/20 shrink-0">
            {footer}
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
