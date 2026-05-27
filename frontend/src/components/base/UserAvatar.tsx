import { useState, useRef } from "react";
import { LogOut, User as UserIcon, CreditCard, ChevronDown } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useClickOutside } from "@/hooks/useClickOutside";
import { useKeyboardShortcut } from "@/hooks/useKeyboardShortcut";
import CreditMenu from "./CreditMenu";

interface Props {
  user: {
    name?: string;
    email?: string;
    image?: string;
  } | null;
}

export default function UserAvatar({ user }: Props) {
  const [isOpen, setIsOpen] = useState(false);
  const { logout } = useAuth();
  const menuRef = useRef<HTMLDivElement>(null);

  useClickOutside(menuRef, () => setIsOpen(false), isOpen);
  useKeyboardShortcut("Escape", () => setIsOpen(false), { enabled: isOpen });

  if (!user) return null;

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded-full p-1 pl-1.5 transition-all hover:bg-secondary/50 group"
        aria-expanded={isOpen}
        aria-haspopup="menu"
        aria-label="User menu"
      >
        <span className="text-sm font-medium text-muted-foreground group-hover:text-foreground transition-colors hidden sm:block mx-1">
          {user.name?.split(" ")[0] || "User"}
        </span>
        <div className="w-8 h-8 rounded-full bg-secondary border border-border/60 overflow-hidden shrink-0 flex items-center justify-center shadow-sm group-hover:border-border transition-colors">
          {user.image ? (
            <img
              src={user.image}
              alt={user.name}
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
          ) : (
            <UserIcon className="w-4 h-4 text-muted-foreground" />
          )}
        </div>
        <ChevronDown className={`w-3.5 h-3.5 text-muted-foreground transition-transform ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div 
          className="absolute right-0 top-[calc(100%+8px)] w-64 surface shadow-xl rounded-xl z-50 scale-in origin-top-right overflow-hidden border border-border/60 backdrop-blur-xl"
          role="menu"
        >
          {/* User Info Header */}
          <div className="p-4 border-b border-border/40 bg-secondary/20">
            <p className="font-semibold text-sm text-foreground truncate">
              {user.name}
            </p>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {user.email}
            </p>
          </div>

          {/* Credit Info */}
          <div className="p-2 border-b border-border/40">
            <CreditMenu />
          </div>

          {/* Actions */}
          <div className="p-2">
            <button
              onClick={() => {
                setIsOpen(false);
                // Open Settings modal later
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-muted-foreground hover:text-foreground hover:bg-secondary/80 rounded-lg transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="menuitem"
            >
              <CreditCard className="w-4 h-4" />
              Billing & Plan
            </button>

            <button
              onClick={() => {
                setIsOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 hover:text-destructive rounded-lg transition-colors mt-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              role="menuitem"
            >
              <LogOut className="w-4 h-4" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}