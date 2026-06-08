import * as React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogFooter,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"

interface BaseModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title?: string
  description?: string
  children?: React.ReactNode
  footer?: React.ReactNode
  width: number
  height: number
  background?: string
}

export function BaseModal({
  open,
  onOpenChange,
  title,
  description,
  children,
  footer,
  width,
  height,
  background,
}: BaseModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        aria-describedby={description ? undefined : undefined}
        style={{
          width: "calc(100vw - 32px)",
          maxWidth: width + "px",
          height: height ? height + "px" : "auto",
          maxHeight: "calc(100vh - 32px)",
          background: background ?? "var(--bg-elevated)",
          backdropFilter: "blur(24px)",
          border: "1px solid var(--primary-border)",
          borderRadius: "20px",
          boxShadow:
            "0 0 0 1px var(--primary-border), 0 24px 60px rgba(0,0,0,0.6), var(--shadow-primary)",
          fontFamily: "'DM Sans', system-ui, sans-serif",
          display: "flex",
          flexDirection: "column",
          padding: "0",
          overflow: "hidden",
        }}
      >
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700&display=swap');
          [role="dialog"]::backdrop,
          [data-radix-popper-content-wrapper] {
            background: rgba(0,0,0,0.7) !important;
            backdrop-filter: blur(6px) !important;
          }
        `}</style>

        {/* Top accent line */}
        <div style={{
          height: 2,
          flexShrink: 0,
          background: "linear-gradient(90deg, transparent, var(--primary-brand) 40%, var(--primary-brand) 60%, transparent)",
          opacity: 0.6,
        }} />

        {/* Header */}
        {(title || description) && (
          <div style={{
            padding: "22px 28px 0",
            flexShrink: 0,
          }}>
            <DialogHeader>
              {title && (
                <DialogTitle style={{
                  fontSize: "17px",
                  fontWeight: 700,
                  color: "var(--text-1)",
                  letterSpacing: "-0.3px",
                  margin: 0,
                }}>
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription style={{
                  fontSize: "13px",
                  color: "var(--text-3)",
                  marginTop: 5,
                  lineHeight: 1.6,
                }}>
                  {description}
                </DialogDescription>
              )}
            </DialogHeader>

            {/* Divider */}
            <div style={{
              height: 1,
              background: "var(--border-default)",
              marginTop: 18,
            }} />
          </div>
        )}

        {/* Body */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 28px",
          color: "var(--text-2)",
          fontSize: "14px",
          lineHeight: 1.7,
        }}
          className="modal-body-scroll"
        >
          <style>{`
            .modal-body-scroll::-webkit-scrollbar { width: 5px; }
            .modal-body-scroll::-webkit-scrollbar-track { background: transparent; }
            .modal-body-scroll::-webkit-scrollbar-thumb { background: #312e81; border-radius: 4px; }
          `}</style>
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div style={{
            flexShrink: 0,
            borderTop: "1px solid var(--border-default)",
            padding: "16px 28px",
            background: "var(--primary-surface)",
          }}>
            <DialogFooter>{footer}</DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}