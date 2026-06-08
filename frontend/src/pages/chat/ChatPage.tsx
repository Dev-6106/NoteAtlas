import LeftPanel from '@/components/chat/LeftPanel'
import MiddlePanel from '@/components/chat/MiddlePanel'
import RightPanel from '@/components/chat/RightPanel'
import { useEffect } from 'react'
import { SourceViewerModal } from '@/components/chat/SourceViewerModal'
import CreateNoteModal from '@/components/note/createNoteModal/CreateNoteModal'
import { Link, useParams } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import type { AppDispatch, RootState } from '@/store'
import { fetchDocOverviewAndQuestions, fetchSingleNote } from '@/store/chatSlice'
import { MoveLeft } from 'lucide-react'
import UserAvatar from '@/components/base/UserAvatar'
import DiscoveryModal from '@/components/note/DiscoveryModal'
import { EditNote } from '@/components/note/EditNote'
import { fetchNoteSourceResult, closeSourceViewer } from '@/store/rightPanelSlice'
import { fetchQuizHistoryAction } from '@/store/quizSlice'
import { CreditMenu } from '@/components/base/CreditMenu'
import { fetchChats, fetchConversations } from '@/store/chatHistorySlice'
import { fetchUserCreditAndPayment } from '@/store/creditMenuSlice'
import { getUserData } from '@/helper/getUserData'
import BuyCreditModal from '@/components/payment/BuyCreditModal'
import { ThemeToggle } from '@/components/ThemeToggle'
import { ChatSidebar } from '@/components/chat/ChatSidebar'
import { useIsMobile } from '@/hooks/useMediaQuery'
import { MobileNav } from '@/components/base/MobileNav'
import { useState } from 'react'

import { T } from "@/components/ThemeTokens";

function ChatPage() {
  const { id } = useParams<{ id: string }>()
  const dispatch = useDispatch<AppDispatch>()
  const { note, loading, aiResult } = useSelector((state: RootState) => state.chat)
  const { chatHistory, activeConversationId } = useSelector((state: RootState) => state.chatHistory)
  const { result } = useSelector((state: RootState) => state.creditMenu)
  const { leftPanelOpen, rightPanelOpen } = useSelector((state: RootState) => state.chat)
  const userData = getUserData()
  const activeSourceViewer = useSelector((state: RootState) => state.rightPanel.activeSourceViewer);

  const isMobile = useIsMobile()
  const [mobileTab, setMobileTab] = useState<"left" | "middle" | "right">("middle")

  useEffect(() => {
    if (id && userData?._id) {
      dispatch(fetchSingleNote(id))
      dispatch(fetchNoteSourceResult(id))
      dispatch(fetchQuizHistoryAction(id))
      dispatch(fetchConversations(id))
      dispatch(fetchDocOverviewAndQuestions(id))
      dispatch(fetchUserCreditAndPayment(userData._id))
    }
  }, [dispatch, id, userData?._id])

  useEffect(() => {
    if (id && userData?._id && activeConversationId) {
        dispatch(fetchChats({ userId: userData._id, noteId: id, conversationId: activeConversationId }))
    }
  }, [dispatch, id, userData?._id, activeConversationId])

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
        @keyframes spin{to{transform:rotate(360deg)}}
        
        /* ── Responsive overrides ── */
        @media (max-width: 1024px) {
          .chat-side-panel {
            position: fixed !important;
            top: 53px !important;
            bottom: 0 !important;
            z-index: 50 !important;
            background: var(--bg-surface) !important;
            box-shadow: var(--shadow-xl) !important;
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
        background: T.bgSurface,
        borderBottom: `1px solid ${T.border}`,
        zIndex: 60,
      }}>
        {/* Left */}
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
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
        padding: isMobile ? 0 : 10,
        paddingBottom: isMobile ? 60 : 10, // space for mobile nav
        overflow: "hidden",
        minHeight: 0,
        background: T.bg,
        position: "relative",
      }}>
        {/* Left Panel */}
        {(!isMobile || mobileTab === "left") && (
        <div
          className={`chat-side-panel left-panel ${!leftPanelOpen && !isMobile ? 'collapsed' : ''}`}
          style={{
            borderRadius: isMobile ? 0 : 16,
            border: `1px solid ${T.border}`,
            background: T.bgSurface,
            overflow: "hidden",
            flexShrink: 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            width: isMobile ? "100%" : (leftPanelOpen ? "22%" : 56),
            minWidth: isMobile ? "100%" : (leftPanelOpen ? 240 : 56),
            maxWidth: isMobile ? "100%" : (leftPanelOpen ? 340 : 56),
          }}
        >
          <LeftPanel loading={loading} note={note} />
        </div>
        )}

        {/* Chat Sidebar (New Multi-Chat panel) */}
        {userData && id && (!isMobile || mobileTab === "left") && (
          <div style={{
            borderRadius: isMobile ? 0 : 16,
            border: `1px solid ${T.border}`,
            background: T.bgSurface,
            overflow: "hidden",
            flexShrink: 0,
            display: "flex"
          }}>
            <ChatSidebar noteId={id} userId={userData._id} />
          </div>
        )}

        {/* Middle Panel */}
        {(!isMobile || mobileTab === "middle") && (
        <div style={{
          flex: 1,
          borderRadius: isMobile ? 0 : 16,
          border: isMobile ? "none" : `1px solid ${T.border}`,
          background: T.bgSurface,
          overflow: "hidden",
          minWidth: 0,
          boxShadow: T.shadowCard,
        }}>
          <MiddlePanel
            aiResult={aiResult}
            chatHistory={chatHistory}
            note={note}
            userId={userData?._id}
          />
        </div>
        )}

        {/* Right Panel */}
        {(!isMobile || mobileTab === "right") && (
        <div
          className={`chat-side-panel right-panel ${!rightPanelOpen && !isMobile ? 'collapsed' : ''}`}
          style={{
            borderRadius: isMobile ? 0 : 16,
            border: `1px solid ${T.border}`,
            background: T.bgSurface,
            overflow: "hidden",
            flexShrink: 0,
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            width: isMobile ? "100%" : (rightPanelOpen ? "22%" : 56),
            minWidth: isMobile ? "100%" : (rightPanelOpen ? 240 : 56),
            maxWidth: isMobile ? "100%" : (rightPanelOpen ? 340 : 56),
          }}
        >
          <RightPanel noteId={id} />
        </div>
        )}
      </div>

      {isMobile && <MobileNav activeTab={mobileTab} setActiveTab={setMobileTab} />}

      <CreateNoteModal noteId={id} />
      <DiscoveryModal noteId={id} />

      {activeSourceViewer && (
        <SourceViewerModal
          citations={activeSourceViewer.citations}
          initialDocId={activeSourceViewer.initialDocId}
          initialPage={activeSourceViewer.initialPage}
          initialLines={activeSourceViewer.initialLines}
          onClose={() => dispatch(closeSourceViewer())}
        />
      )}
    </div>
  )
}

export default ChatPage