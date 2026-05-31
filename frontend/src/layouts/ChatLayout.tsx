import React from "react";
import { Link, Outlet } from "react-router";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function ChatLayout() {
  return (
    <div style={{
      minHeight: "100vh",
      background: "#080b14",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      position: "relative",
      overflow: "hidden",
      padding: "12px",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f1120; }
        ::-webkit-scrollbar-thumb { background: #312e81; border-radius: 3px; }

        /* ── Toast overrides ── */
        .Toastify__toast-container { font-family: 'DM Sans', system-ui, sans-serif !important; }
        .Toastify__toast {
          background: rgba(10,13,26,0.97) !important;
          border: 1px solid rgba(99,102,241,0.25) !important;
          border-radius: 14px !important;
          box-shadow: 0 0 0 1px rgba(99,102,241,0.08), 0 16px 40px rgba(0,0,0,0.55), 0 0 30px rgba(99,102,241,0.08) !important;
          backdrop-filter: blur(20px) !important;
          color: #cbd5e1 !important;
          font-size: 13px !important;
          font-weight: 500 !important;
          padding: 14px 16px !important;
        }
        .Toastify__toast--success { border-color: rgba(34,197,94,0.3) !important; }
        .Toastify__toast--error   { border-color: rgba(239,68,68,0.3)  !important; }
        .Toastify__toast--warning { border-color: rgba(234,179,8,0.3)  !important; }
        .Toastify__toast-icon svg { width: 16px; height: 16px; }
        .Toastify__progress-bar  { height: 2px !important; border-radius: 0 0 14px 14px !important; }
        .Toastify__progress-bar--success { background: linear-gradient(90deg,#6366f1,#22c55e) !important; }
        .Toastify__progress-bar--error   { background: linear-gradient(90deg,#6366f1,#ef4444) !important; }
        .Toastify__progress-bar--default { background: linear-gradient(90deg,#6366f1,#8b5cf6) !important; }
        .Toastify__close-button { color: #475569 !important; opacity: 1 !important; align-self: center !important; }
        .Toastify__close-button:hover { color: #94a3b8 !important; }
      `}</style>

      {/* Ambient orbs */}
      <div style={{
        position: "fixed", top: "-15%", left: "-8%",
        width: 480, height: 480, borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, rgba(99,102,241,0.11) 0%, transparent 70%)",
        animation: "orbA 14s ease-in-out infinite",
      }} />
      <div style={{
        position: "fixed", bottom: "-10%", right: "-5%",
        width: 380, height: 380, borderRadius: "50%", pointerEvents: "none", zIndex: 0,
        background: "radial-gradient(circle, rgba(139,92,246,0.09) 0%, transparent 70%)",
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