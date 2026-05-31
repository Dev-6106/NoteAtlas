import LeftPanel from '@/components/chat/LeftPanel'
import MiddlePanel from '@/components/chat/MiddlePanel'
import RightPanel from '@/components/chat/RightPanel'
import { useEffect, useState } from 'react'
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

function ChatPage() {
  const [count, setCount] = useState(0)
  const { id } = useParams<{ id: string }>()

  const dispatch = useDispatch<AppDispatch>()
  const { note, loading, aiResult } = useSelector((state: RootState) => state.chat)
  const { chatHistory } = useSelector((state: RootState) => state.chatHistory)
  const { result } = useSelector((state: RootState) => state.creditMenu)
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
      background: "#080b14",
      fontFamily: "'DM Sans', system-ui, sans-serif",
      overflow: "hidden",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800&display=swap');
        * { box-sizing: border-box; }
        ::-webkit-scrollbar { width: 5px; height: 5px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: #312e81; border-radius: 4px; }
      `}</style>

      {/* ── Top Bar ── */}
      <header style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "0 16px",
        height: 52,
        flexShrink: 0,
        background: "rgba(8,11,20,0.9)",
        backdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        zIndex: 50,
      }}>
        {/* Left: back + note title */}
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Link
            to="/"
            style={{
              width: 32, height: 32, borderRadius: 8,
              display: "flex", alignItems: "center", justifyContent: "center",
              background: "rgba(255,255,255,0.05)",
              border: "1px solid rgba(255,255,255,0.08)",
              color: "#64748b", textDecoration: "none",
              transition: "all 0.2s", flexShrink: 0,
            }}
            onMouseEnter={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(99,102,241,0.12)"
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(99,102,241,0.35)"
              ;(e.currentTarget as HTMLAnchorElement).style.color = "#a5b4fc"
            }}
            onMouseLeave={e => {
              (e.currentTarget as HTMLAnchorElement).style.background = "rgba(255,255,255,0.05)"
              ;(e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(255,255,255,0.08)"
              ;(e.currentTarget as HTMLAnchorElement).style.color = "#64748b"
            }}
          >
            <MoveLeft size={15} />
          </Link>
          <EditNote note={note} />
        </div>

        {/* Right: actions */}
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <CreditMenu result={result} />

          {/* Divider */}
          <div style={{ width: 1, height: 20, background: "rgba(255,255,255,0.08)" }} />

          <UserAvatar />
          <BuyCreditModal />
        </div>
      </header>

      {/* ── Main 3-Panel Layout ── */}
      <div style={{
        display: "flex",
        flex: 1,
        gap: 6,
        padding: "6px",
        overflow: "hidden",
        minHeight: 0,
      }}>
        {/* Left Panel */}
        <div style={{
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          <LeftPanel loading={loading} note={note} />
        </div>

        {/* Middle Panel */}
        <div style={{
          flex: 1,
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          overflow: "hidden",
          minWidth: 0,
        }}>
          <MiddlePanel
            aiResult={aiResult}
            chatHistory={chatHistory}
            note={note}
            userId={userData?._id}
          />
        </div>

        {/* Right Panel */}
        <div style={{
          borderRadius: 14,
          border: "1px solid rgba(255,255,255,0.06)",
          background: "rgba(255,255,255,0.02)",
          overflow: "hidden",
          flexShrink: 0,
        }}>
          <RightPanel noteId={id} />
        </div>
      </div>

      {/* Modals */}
      <CreateNoteModal noteId={id} />
      <DiscoveryModal noteId={id} />
    </div>
  )
}

export default ChatPage