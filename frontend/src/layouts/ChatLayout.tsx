import React from "react";
import { Link, Outlet } from "react-router";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ChatLayout() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "var(--bg-base)",
      fontFamily: "var(--font-sans, 'DM Sans', system-ui, sans-serif)",
      position: "relative",
      overflow: "hidden",
      padding: "12px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }

        /* ── Toast overrides — theme-aware ── */
        .Toastify__toast-container { font-family: var(--font-sans, 'DM Sans', system-ui, sans-serif) !important; }
        .Toastify__toast {
          background: var(--glass-bg) !important;
          border: 1px solid var(--border-accent) !important;
          border-radius: 14px !important;
          box-shadow: var(--shadow-lg) !important;
          backdrop-filter: blur(20px) !important;
          -webkit-backdrop-filter: blur(20px) !important;
          color: var(--text-2) !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          padding: 14px 16px !important;
        }
        .Toastify__toast--success { border-color: var(--color-success-border) !important; }
        .Toastify__toast--error   { border-color: var(--color-error-border)  !important; }
        .Toastify__toast--warning { border-color: var(--color-warning-border)  !important; }
        .Toastify__toast-icon svg { width: 16px; height: 16px; }
        .Toastify__progress-bar  { height: 2px !important; border-radius: 0 0 14px 14px !important; }
        .Toastify__progress-bar--success { background: linear-gradient(90deg, var(--primary-brand), var(--color-success)) !important; }
        .Toastify__progress-bar--error   { background: linear-gradient(90deg, var(--primary-brand), var(--color-error)) !important; }
        .Toastify__progress-bar--default { background: linear-gradient(90deg, var(--primary-brand), var(--primary-light)) !important; }
        .Toastify__close-button { color: var(--text-3) !important; opacity: 1 !important; align-self: center !important; }
        .Toastify__close-button:hover { color: var(--text-2) !important; }
      `}</style>

      {/* Ambient orbs — subtle, theme-aware */}
      <div style={{
        position: "fixed", top: "-15%", left: "-8%",
        width: 480, height: 480, borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, var(--primary-glow) 0%, transparent 70%)",
        animation: "orbA 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "fixed", bottom: "-10%", right: "-5%",
        width: 380, height: 380, borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, var(--primary-mid) 0%, transparent 70%)",
        animation: "orbB 18s ease-in-out infinite",
      }} />

      <style>{`
        @keyframes orbA { 0%,100%{transform:translate(0,0)} 50%{transform:translate(28px,-36px)} }
        @keyframes orbB { 0%,100%{transform:translate(0,0)} 50%{transform:translate(-24px,28px)} }
      `}</style>

      {/* Content */}
      <div style={{ position: "relative", zIndex: 1, height: "100%" }}>
        <Outlet />
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={3500}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />
    </div>
  );
}