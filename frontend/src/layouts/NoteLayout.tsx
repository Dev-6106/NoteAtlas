import { logoutUser } from "@/api/auth";
import UserAvatar from "@/components/base/UserAvatar";
import { getUserData } from "@/helper/getUserData";
import React, { useState, useRef, useEffect } from "react";
import { Link, Outlet } from "react-router";
import { Sparkles } from "lucide-react";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { fetchUserCreditAndPayment } from '@/store/creditMenuSlice';
import { CreditMenu } from '@/components/base/CreditMenu';
import BuyCreditModal from '@/components/payment/BuyCreditModal';

export default function NoteLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const { result } = useSelector((state: RootState) => state.creditMenu);
  const userData = getUserData();

  useEffect(() => {
    if (userData?._id) {
      dispatch(fetchUserCreditAndPayment(userData._id));
    }
  }, [dispatch, userData?._id]);
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: '#080b14',
      color: '#e2e8f0',
      fontFamily: "'DM Sans', 'Outfit', system-ui, sans-serif",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 6px; }
        ::-webkit-scrollbar-track { background: #0f1120; }
        ::-webkit-scrollbar-thumb { background: #312e81; border-radius: 3px; }
      `}</style>

      {/* ── TOP NAVBAR ── */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 28px',
        height: 60,
        background: 'rgba(8,11,20,0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,0.06)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <Link to="/" style={{
          display: 'flex', alignItems: 'center', gap: 10,
          textDecoration: 'none',
        }}>
          <div style={{
            width: 32, height: 32, borderRadius: 9,
            background: 'linear-gradient(135deg,#6366f1,#8b5cf6)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            boxShadow: '0 0 16px rgba(99,102,241,0.45)',
            flexShrink: 0,
          }}>
            <Sparkles size={15} color="#fff" />
          </div>
          <span style={{
            fontSize: 16, fontWeight: 800,
            color: '#f1f5f9', letterSpacing: '-0.4px',
          }}>
            NotebookLM
          </span>
        </Link>

        {/* Right side: Credit Menu & Avatar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <CreditMenu result={result} />
          <UserAvatar />
          <BuyCreditModal />
        </div>
      </header>

      {/* ── PAGE CONTENT ── */}
      <main style={{
        flex: 1,
        padding: '28px 28px',
        maxWidth: '100%',
        overflowY: 'auto',
      }}>
        <Outlet />
      </main>
    </div>
  );
}