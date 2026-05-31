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
        style={{
          width: "500vw",
          maxWidth: width + "px",
          height: height + "px",
          background: background ?? "rgba(10,13,26,0.95)",
          backdropFilter: "blur(24px)",
          border: "1px solid rgba(99,102,241,0.2)",
          borderRadius: "20px",
          boxShadow:
            "0 0 0 1px rgba(99,102,241,0.1), 0 24px 60px rgba(0,0,0,0.6), 0 0 80px rgba(99,102,241,0.08)",
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
          background: "linear-gradient(90deg, transparent, #6366f1 40%, #8b5cf6 60%, transparent)",
          opacity: 0.8,
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
                  color: "#f1f5f9",
                  letterSpacing: "-0.3px",
                  margin: 0,
                }}>
                  {title}
                </DialogTitle>
              )}
              {description && (
                <DialogDescription style={{
                  fontSize: "13px",
                  color: "#64748b",
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
              background: "rgba(255,255,255,0.06)",
              marginTop: 18,
            }} />
          </div>
        )}

        {/* Body */}
        <div style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 28px",
          color: "#cbd5e1",
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
            borderTop: "1px solid rgba(255,255,255,0.06)",
            padding: "16px 28px",
            background: "rgba(255,255,255,0.02)",
          }}>
            <DialogFooter>{footer}</DialogFooter>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}