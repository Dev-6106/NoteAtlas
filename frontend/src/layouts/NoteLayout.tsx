import UserAvatar from "@/components/base/UserAvatar";
import { getUserData } from "@/helper/getUserData";
import { Link, Outlet, Navigate } from "react-router";
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from '@/store';
import { fetchUserCreditAndPayment } from '@/store/creditMenuSlice';
import { CreditMenu } from '@/components/base/CreditMenu';
import BuyCreditModal from '@/components/payment/BuyCreditModal';
import { useEffect } from "react";
import { ThemeToggle } from "@/components/ThemeToggle";

import { T } from "@/components/ThemeTokens";

import { LogoSvg } from "@/components/base/LogoSvg";
import { DottedBg } from "@/components/base/DottedBg";

export default function NoteLayout() {
  const dispatch = useDispatch<AppDispatch>();
  const { result } = useSelector((state: RootState) => state.creditMenu);
  const userData = getUserData();

  useEffect(() => {
    if (userData?._id) dispatch(fetchUserCreditAndPayment(userData._id));
  }, [dispatch, userData?._id]);

  if (!userData) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      background: T.bg,
      color: T.text1,
      fontFamily: T.fontSans,
      position: 'relative'
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Instrument+Serif:ital@0;1&family=DM+Mono&display=swap');
        *{box-sizing:border-box}
        .nl-header { padding: 0 32px !important; }
        .nl-logo-text { display: inline !important; }
        .nl-right-section { gap: 14px !important; }
        .cm-hide-mobile { display: inline !important; }
        @media (max-width: 600px) {
          .nl-header { padding: 0 16px !important; }
          .nl-logo-text { display: none !important; }
          .nl-right-section { gap: 8px !important; }
          .cm-hide-mobile { display: none !important; }
        }
      `}</style>

      <DottedBg />

      {/* Navbar — glassmorphism, theme-aware */}
      <header className="nl-header" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: 60,
        background: "var(--glass-bg)",
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderBottom: `1px solid var(--border-default)`,
        position: 'sticky',
        top: 0,
        zIndex: 100,
        flexShrink: 0,
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 9, textDecoration: 'none' }}>
          <LogoSvg size={36} />
          <span className="nl-logo-text" style={{ fontSize: 15, fontWeight: 700, color: T.text1, letterSpacing: '-0.4px', fontFamily: T.fontSans }}>
            Note<span style={{ color: "#3b82f6" }}>Atlas</span>
          </span>
        </Link>

        {/* Right */}
        <div className="nl-right-section" style={{ display: 'flex', alignItems: 'center' }}>
          <ThemeToggle />
          <CreditMenu result={result} />
          <div style={{ width: 1, height: 20, background: T.border, marginLeft: 4, marginRight: 4 }} />
          <UserAvatar />
          <BuyCreditModal />
        </div>
      </header>

      {/* Content */}
      <main style={{ flex: 1, overflowY: 'auto', position: 'relative', zIndex: 1 }}>
        <Outlet />
      </main>
    </div>
  );
}