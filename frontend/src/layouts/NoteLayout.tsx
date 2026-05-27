import { Link, Navigate, Outlet } from "react-router";
import UserAvatar from "@/components/base/UserAvatar";
import { useAuth } from "@/hooks/useAuth";

export default function NoteLayout() {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground selection:bg-primary/20 relative">
      {/* Subtle ambient background */}
      <div className="absolute top-0 left-0 w-full h-[400px] bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/5 via-background to-background pointer-events-none -z-10" />

      {/* Top Navbar */}
      <header className="sticky top-0 z-40 w-full bg-background/80 backdrop-blur-md border-b border-border/40 shadow-sm flex items-center justify-between px-6 py-3 transition-all duration-300">
        {/* Left: Logo + Title */}
        <Link 
          to="/notes" 
          className="flex items-center space-x-3 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-md p-1 pl-0"
        >
          <div className="w-8 h-8 rounded-lg bg-foreground flex items-center justify-center text-background font-bold shadow-sm group-hover:scale-105 transition-transform">
            N
          </div>
          <span className="font-bold text-base tracking-tight text-foreground transition-colors hidden sm:block">
            NotebookLM
          </span>
        </Link>

        {/* Right: Avatar & Menu */}
        <div className="flex items-center gap-4">
          <UserAvatar user={user} />
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1 w-full flex flex-col mx-auto p-4 sm:p-6 md:p-8 animate-in fade-in duration-500 z-10">
        <Outlet />
      </main>
    </div>
  );
}
