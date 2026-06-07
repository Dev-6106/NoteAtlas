import UserAvatar from "@/components/base/UserAvatar";
import { getUserData } from "@/helper/getUserData";
import { Link, Outlet } from "react-router";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { fetchUserCreditAndPayment } from '@/store/creditMenuSlice';
import { CreditMenu } from '@/components/base/CreditMenu';
import BuyCreditModal from '@/components/payment/BuyCreditModal';
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

import { T } from "@/components/ThemeTokens";

const LogoMark = ({ size = 30 }: { size?: number }) => (
  <div style={{
    width: size, height: size, borderRadius: Math.round(size * 0.28),
    background: "linear-gradient(135deg,#6d5ff6,#a78bfa)",
    display: "flex", alignItems: "center", justifyContent: "center",
    boxShadow: "0 0 18px rgba(109,95,246,0.4)", flexShrink: 0,
  }}>
    <svg width={size * 0.52} height={size * 0.52} viewBox="0 0 18 18" fill="none">
      <path d="M9 2L11.5 7H16.5L12.5 10.5L14 16L9 12.5L4 16L5.5 10.5L1.5 7H6.5L9 2Z" fill="white" fillOpacity="0.9" />
    </svg>
  </div>
);

export default function NoteLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const { result } = useSelector((state: RootState) => state.creditMenu);
  const userData = getUserData();

  useEffect(() => {
    if (userData?._id) dispatch(fetchUserCreditAndPayment(userData._id));
  }, [dispatch, userData?._id]);

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: T.bg,
      color: T.text1,
      fontFamily: T.fontSans,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Instrument+Serif:ital@0;1&family=DM+Mono&display=swap');
        *{box-sizing:border-box}
      `}</style>

      {/* Navbar — glassmorphism, theme-aware */}
      <header style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
        height: 60,
        background: T.glassBg,
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid ${T.border}`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
        boxShadow: T.shadowCard,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <LogoMark size={28} />
          <span style={{ fontSize: 15, fontWeight: 700, color: T.text1, letterSpacing: '-0.4px', fontFamily: T.fontSans }}>
            Note<span style={{ color: "var(--primary-brand)" }}>Atlas</span>
          </span>
        </Link>

        {/* Right */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          <ThemeToggle />
          <CreditMenu result={result} />
          <div style={{ width: 1, height: 20, background: T.border }} />
          <UserAvatar />
          <BuyCreditModal />
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto' }}>
        <Outlet />
      </main>
    </div>
  );
}