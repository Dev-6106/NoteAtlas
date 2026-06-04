import LeftPanel from '@/components/chat/LeftPanel'
import MiddlePanel from '@/components/chat/MiddlePanel'
import RightPanel from '@/components/chat/RightPanel'
import { useEffect } from 'react'
import CreateNoteModal from '@/components/note/createNoteModal/CreateNoteModal'
import { Link, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import { fetchDocOverviewAndQuestions, fetchSingleNote } from '@/store/chatSlice'
import { MoveLeft } from 'lucide-react'
import UserAvatar from '@/components/base/UserAvatar'
import DiscoveryModal from '@/components/note/DiscoveryModal'
import { EditNote } from '@/components/note/EditNote'
import { fetchNoteSourceResult } from '@/store/rightPanelSlice'
import { CreditMenu } from '@/components/base/CreditMenu'
import { fetchChats } from '@/store/chatHistorySlice'
import { getUserData } from '@/helper/getUserData'
import BuyCreditModal from '@/components/payment/BuyCreditModal'
import { fetchUserCreditAndPayment } from '@/store/creditMenuSlice'
import { ThemeToggle } from '@/components/ThemeToggle'

import { T } from "@/components/ThemeTokens";

function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const { note, loading, aiResult } = useSelector((state: RootState) => state.chat)
  const { chatHistory } = useSelector((state: RootState) => state.chatHistory)
  const { result } = useSelector((state: RootState) => state.creditMenu)
  const { leftPanelOpen, rightPanelOpen } = useSelector((state: RootState) => state.chat)
  const userData = getUserData()

  useEffect(() => {
    if (id) {
      dispatch(fetchSingleNote(id))
      dispatch(fetchNoteSourceResult(id))
      dispatch(fetchChats({ userId: userData?._id as string, noteId: id }))
      dispatch(fetchDocOverviewAndQuestions(id))
      dispatch(fetchUserCreditAndPayment(userData?._id))
    }
  }, [dispatch, id])

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      background: T.bg,
      fontFamily: T.fontSans,
      overflow: "hidden",
      color: T.text1,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:ital,opsz,wght@0,9..40,300;0,9..40,400;0,9..40,500;0,9..40,600;0,9..40,700;0,9..40,800;1,9..40,400&family=Instrument+Serif:ital@0;1&family=DM+Mono&display=swap');
        *{box-sizing:border-box}
        ::-webkit-scrollbar{width:5px;height:5px}
        ::-webkit-scrollbar-track{background:transparent}
        ::-webkit-scrollbar-thumb{background:var(--primary-brand);border-radius:4px;opacity:0.5}
        @keyframes spin{to{transform:rotate(360deg)}}
        
        /* ── Responsive overrides ── */
        @media (max-width: 1024px) {
          .chat-side-panel {
            position: fixed !important;
            top: 53px !important;
            bottom: 0 !important;
            z-index: 50 !important;
            background: var(--bg-surface) !important;
            box-shadow: 0 20px 60px rgba(0,0,0,0.25) !important;
            border-radius: 0 !important;
            border: none !important;
            width: auto !important;
          }
          .chat-side-panel.left-panel {
            left: 0;
            width: 280px !important;
          }
          .chat-side-panel.right-panel {
            right: 0;
            width: 280px !important;
          }
          .chat-side-panel.left-panel.collapsed,
          .chat-side-panel.right-panel.collapsed {
            width: 56px !important;
          }
        }
        @media (max-width: 640px) {
          .chat-side-panel.left-panel,
          .chat-side-panel.right-panel {
            width: 260px !important;
          }
        }
      `}</style>

      {/* ── Top Bar ── */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 18px",
        height: 52,
        flexShrink: 0,
        background: "var(--bg-surface)",
        borderBottom: `1px solid var(--border-default)`,
        zIndex: 60,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <Link
            to="/"
            style={{
              width: 32, height: 32, borderRadius: 9,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.04)",
              border: `1px solid ${T.border}`,
              color: T.text3, textDecoration: "none",
              transition: "all 0.2s", flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(109,95,246,0.12)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(109,95,246,0.4)";
              (e.currentTarget as HTMLAnchorElement).style.color = "#a78bfa";
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.04)";
              (e.currentTarget as HTMLAnchorElement).style.borderColor = T.border;
              (e.currentTarget as HTMLAnchorElement).style.color = T.text3;
            }}
          >
            <MoveLeft size={14} />
          </Link>
          <EditNote note={note} />
        </div>

        {/* Right */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <ThemeToggle />
          <CreditMenu result={result} />
          <div style={{ width: 1, height: 18, background: T.border }} />
          <UserAvatar />
          <BuyCreditModal />
        </div>
      </header>

      {/* ── 3-Panel Layout ── */}
      <div style={{
        display: "flex",
        flex: 1,
        gap: 10,
        padding: 10,
        overflow: "hidden",
        minHeight: 0,
        background: "var(--bg-base)",
        position: "relative",
      }}>
        {/* Left Panel */}
        <div
          className={`chat-side-panel left-panel ${!leftPanelOpen ? 'collapsed' : ''}`}
          style={{
            borderRadius: 16,
            border: "1px solid var(--border-default)",
            background: "var(--bg-surface)",
            overflow: "hidden",
            flexShrink: 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            width: leftPanelOpen ? "22%" : 56,
            minWidth: leftPanelOpen ? 240 : 56,
            maxWidth: leftPanelOpen ? 340 : 56,
          }}
        >
          <LeftPanel loading={loading} note={note} />
        </div>

        {/* Middle Panel */}
        <div style={{
          flex: 1,
          borderRadius: 16,
          border: "1px solid var(--border-default)",
          background: "var(--bg-surface)",
          overflow: "hidden",
          minWidth: 0,
          boxShadow: "0 4px 20px rgba(0,0,0,0.02)",
        }}>
          <MiddlePanel
            aiResult={aiResult}
            chatHistory={chatHistory}
            note={note}
            userId={userData?._id}
          />
        </div>

        {/* Right Panel */}
        <div
          className={`chat-side-panel right-panel ${!rightPanelOpen ? 'collapsed' : ''}`}
          style={{
            borderRadius: 16,
            border: "1px solid var(--border-default)",
            background: "var(--bg-surface)",
            overflow: "hidden",
            flexShrink: 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            width: rightPanelOpen ? "22%" : 56,
            minWidth: rightPanelOpen ? 240 : 56,
            maxWidth: rightPanelOpen ? 340 : 56,
          }}
        >
          <RightPanel noteId={id} />
        </div>
      </div>

      <CreateNoteModal noteId={id} />
      <DiscoveryModal noteId={id} />
    </div>
  )
}

export default ChatPage