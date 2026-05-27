import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export default function ChatLayout() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/auth/login" replace />;
  }

  return (
    <div className="h-screen w-full overflow-hidden bg-background text-foreground flex flex-col relative selection:bg-primary/20">
      <main className="flex-1 w-full h-full p-0 sm:p-2 overflow-hidden bg-muted/20">
        <div className="h-full w-full sm:rounded-2xl border-x sm:border border-border/40 bg-background shadow-lg overflow-hidden flex relative ring-1 ring-border/10">
          <Outlet />
        </div>
      </main>
    </div>
  );
}