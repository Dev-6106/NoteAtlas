import { Navigate, Outlet } from "react-router";
import { useAuth } from "@/hooks/useAuth";

export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  // If already authenticated, redirect away from auth pages
  if (isAuthenticated) {
    return <Navigate to="/notes" replace />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col relative overflow-hidden">
      {/* Minimal dark background */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-muted/20 via-background to-background pointer-events-none -z-10" />
      
      <main className="flex-1 flex items-center justify-center p-6">
        <Outlet />
      </main>
    </div>
  );
}