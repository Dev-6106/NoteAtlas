import { useEffect, useState } from "react";
import { useParams, Link } from "react-router";
import { MoveLeft, Loader2, Menu } from "lucide-react";

import { useAppDispatch, useAppSelector } from "@/hooks/useTypedStore";
import { fetchSingleNote } from "@/store/chatSlice";
import { fetchNoteSourceResult } from "@/store/rightPanelSlice";
import { fetchChats } from "@/store/chatHistorySlice";
import { fetchUserCreditAndPayment } from "@/store/creditMenuSlice";
import { useAuth } from "@/hooks/useAuth";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import { toggleLeftPanel, toggleRightPanel } from "@/store/chatSlice";

import LeftPanel from "@/components/chat/LeftPanel";
import MiddlePanel from "@/components/chat/MiddlePanel";
import RightPanel from "@/components/chat/RightPanel";
import BuyCreditModal from "@/components/payment/BuyCreditModal";
import UserAvatar from "@/components/base/UserAvatar";
import { AddSourceModal } from "@/components/note/AddSourceModal";

export default function ChatPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { user } = useAuth();

  const { leftPanelOpen, rightPanelOpen, noteData, loading } = useAppSelector(
    (state) => state.chat
  );
  const { chatHistory: messages } = useAppSelector((state) => state.chatHistory);

  // Mobile state handling
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 768;
      setIsMobile(mobile);
      if (mobile && leftPanelOpen) dispatch(toggleLeftPanel());
      if (mobile && rightPanelOpen) dispatch(toggleRightPanel());
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Keyboard shortcuts for panel toggling
  useKeyboardShortcut("b", () => dispatch(toggleLeftPanel()), { ctrl: true });
  useKeyboardShortcut("/", () => dispatch(toggleRightPanel()), { ctrl: true });

  // Initial Data Fetch
  useEffect(() => {
    if (id && user?._id) {
      dispatch(fetchSingleNote(id));
      dispatch(fetchNoteSourceResult(id));
      dispatch(fetchChats({ userId: user._id, noteId: id }));
      dispatch(fetchUserCreditAndPayment(user._id));
    }
  }, [id, user?._id, dispatch]);

  if (loading || !noteData) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3 fade-in">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
          <p className="text-sm font-medium text-muted-foreground animate-pulse">
            Loading workspace...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden">
      <BuyCreditModal />
      <AddSourceModal noteId={id} />

      {/* Top Navigation Bar */}
      <header className="h-14 border-b border-border/40 bg-background/95 backdrop-blur flex items-center justify-between px-4 shrink-0 z-20 relative">
        <div className="flex items-center gap-3">
          {/* Mobile Menu Toggle */}
          {isMobile && (
            <button
              onClick={() => dispatch(toggleLeftPanel())}
              className="p-2 -ml-2 rounded-lg text-muted-foreground hover:bg-secondary transition-colors"
            >
              <Menu className="w-5 h-5" />
            </button>
          )}

          <Link
            to="/notes"
            className="flex items-center justify-center w-8 h-8 rounded-lg hover:bg-secondary text-muted-foreground hover:text-foreground transition-colors group"
            aria-label="Back to notebooks"
          >
            <MoveLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
          </Link>
          
          <div className="flex flex-col">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Notebook
            </span>
            <span className="text-sm font-medium text-foreground truncate max-w-[200px] sm:max-w-xs">
              {noteData?.note?.title || "Untitled"}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isMobile && (
            <button
              onClick={() => dispatch(toggleRightPanel())}
              className="px-3 py-1.5 text-xs font-medium bg-secondary text-foreground rounded-lg border border-border/60 hover:bg-muted transition-colors"
            >
              Studio
            </button>
          )}
          <UserAvatar user={user} />
        </div>
      </header>

      {/* Main Workspace Area */}
      <main className="flex-1 flex overflow-hidden relative">
        
        {/* Mobile Overlays */}
        {isMobile && leftPanelOpen && (
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 fade-in"
            onClick={() => dispatch(toggleLeftPanel())} 
          />
        )}
        {isMobile && rightPanelOpen && (
          <div 
            className="absolute inset-0 bg-background/80 backdrop-blur-sm z-30 fade-in"
            onClick={() => dispatch(toggleRightPanel())} 
          />
        )}

        {/* Left Panel - Sources */}
        <div className={`
          ${isMobile ? "absolute inset-y-0 left-0 z-40 transition-transform duration-300" : "shrink-0 transition-all duration-300"}
          ${!leftPanelOpen && isMobile ? "-translate-x-full" : "translate-x-0"}
          ${leftPanelOpen ? "w-72" : "w-12 hidden md:block"}
          h-full
        `}>
          <LeftPanel note={noteData?.note} loading={loading} />
        </div>

        {/* Middle Panel - Chat */}
        <div className="flex-1 min-w-0 h-full relative z-10">
          <MiddlePanel
            chatHistory={messages}
            userId={user?._id || ""}
            note={noteData?.note}
            aiResult={noteData}
          />
        </div>

        {/* Right Panel - Studio */}
        <div className={`
          ${isMobile ? "absolute inset-y-0 right-0 z-40 transition-transform duration-300 shadow-xl border-l border-border/40" : "shrink-0 transition-all duration-300"}
          ${!rightPanelOpen && isMobile ? "translate-x-full" : "translate-x-0"}
          ${rightPanelOpen ? "w-80" : "w-12 hidden md:block"}
          h-full
        `}>
          <RightPanel noteId={id} />
        </div>

      </main>
    </div>
  );
}
