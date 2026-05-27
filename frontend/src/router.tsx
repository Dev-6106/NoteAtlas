import { lazy } from "react";
import { createBrowserRouter, Navigate } from "react-router";
import AuthLayout from "@/layouts/AuthLayout";
import NoteLayout from "@/layouts/NoteLayout";
import ChatLayout from "@/layouts/ChatLayout";

// Lazy-loaded pages for better performance
const HomePage = lazy(() => import("@/pages/HomePage"));
const LoginPage = lazy(() => import("@/pages/auth/LoginPage"));
const AuthCallbackPage = lazy(() => import("@/pages/auth/AuthCallbackPage"));
const NotePage = lazy(() => import("@/pages/note/NotePage"));
const ChatPage = lazy(() => import("@/pages/chat/ChatPage"));

export const router = createBrowserRouter([
  // Landing/Marketing
  {
    path: "/",
    element: <HomePage />,
  },
  // Auth
  {
    path: "/auth",
    element: <AuthLayout />,
    children: [
      {
        path: "login",
        element: <LoginPage />,
      },
      {
        path: "callback",
        element: <AuthCallbackPage />,
      },
    ],
  },
  // App — Dashboard
  {
    path: "/",
    element: <NoteLayout />,
    children: [
      {
        path: "notes",
        element: <NotePage />,
      },
    ],
  },
  // App — Workspace (Chat)
  {
    path: "/notes",
    element: <ChatLayout />,
    children: [
      {
        path: ":noteId",
        element: <ChatPage />,
      },
    ],
  },
  // Fallback
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
