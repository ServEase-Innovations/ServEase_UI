import React, { useState, useEffect } from "react";
import Draggable from "react-draggable";
import { MessageCircle, X } from "lucide-react";

interface ChatbotButtonProps {
  open: boolean;
  onToggle: () => void;
  /** Unread support messages (global socket) while the panel is closed. */
  unreadCount?: number;
  /** In-app support message line (no top-of-screen Snackbar). */
  supportPreview?: string | null;
  onDismissSupportPreview?: () => void;
  onOpenFromSupportPreview?: () => void;
}

const fixedWrap = "fixed bottom-5 right-5 z-[9999] flex flex-col items-end gap-2";
const baseBtn =
  "w-14 h-14 sm:w-16 sm:h-16 text-white rounded-full flex items-center justify-center " +
  "transition-shadow transition-transform duration-200 " +
  "active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 focus-visible:ring-offset-2";

const SupportPreviewPanel: React.FC<{
  line: string;
  onOpen: () => void;
  onDismiss: () => void;
}> = ({ line, onOpen, onDismiss }) => (
  <div
    className="support-preview-panel mb-0.5 w-[min(calc(100vw-2.5rem),20rem)] cursor-default rounded-lg border border-slate-200 bg-white p-2.5 shadow-lg ring-1 ring-slate-900/5"
    role="status"
  >
    <div className="mb-1 flex items-start justify-between gap-2">
      <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">New from support</span>
      <button
        type="button"
        onClick={onDismiss}
        className="rounded p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
        aria-label="Dismiss notification"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
    <p className="mb-2 line-clamp-2 text-left text-sm text-slate-800">{line}</p>
    <div className="flex justify-end gap-1.5">
      <button
        type="button"
        onClick={onDismiss}
        className="rounded-md px-2.5 py-1 text-sm text-slate-600 hover:bg-slate-100"
      >
        Dismiss
      </button>
      <button
        type="button"
        onClick={onOpen}
        className="rounded-md bg-sky-600 px-2.5 py-1 text-sm font-medium text-white hover:bg-sky-500"
      >
        Open chat
      </button>
    </div>
  </div>
);

const ChatbotButton: React.FC<ChatbotButtonProps> = ({
  open,
  onToggle,
  unreadCount = 0,
  supportPreview,
  onDismissSupportPreview,
  onOpenFromSupportPreview,
}) => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMobile, setIsMobile] = useState(false);
  const showPreview = Boolean(supportPreview) && !open;
  const dismiss = () => onDismissSupportPreview?.();
  const openFromPreview = () => onOpenFromSupportPreview?.();

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 640);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const openBtnClass = (extra: string) =>
    [
      "relative",
      baseBtn,
      open
        ? "bg-sky-600 shadow-lg shadow-sky-500/30 ring-2 ring-white/90"
        : "bg-sky-600 hover:bg-sky-500 shadow-lg shadow-slate-900/20",
      extra,
    ].join(" ");

  if (isMobile) {
    return (
      <div className={fixedWrap}>
        {showPreview && supportPreview && (
          <SupportPreviewPanel line={supportPreview} onOpen={openFromPreview} onDismiss={dismiss} />
        )}
        <button
          type="button"
          onClick={onToggle}
          className={openBtnClass("")}
          title={open ? "Close help" : "Help and support"}
          aria-label={open ? "Close help chat" : "Open help and support chat"}
          aria-pressed={open}
          style={{
            touchAction: "manipulation",
            WebkitTapHighlightColor: "transparent",
          }}
        >
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} aria-hidden />
          {unreadCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
              aria-label={`${unreadCount} unread from support`}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    );
  }

  return (
    <Draggable
      position={position}
      onDrag={(_, data) => setPosition({ x: data.x, y: data.y })}
      bounds="parent"
      handle=".chat-drag-surface"
      cancel=".support-preview-panel, .support-preview-panel *"
    >
      <div className={["chat-drag-surface", fixedWrap, "cursor-grab active:cursor-grabbing"].join(" ")}>
        {showPreview && supportPreview && (
          <SupportPreviewPanel line={supportPreview} onOpen={openFromPreview} onDismiss={dismiss} />
        )}
        <button
          type="button"
          onClick={onToggle}
          className={openBtnClass(
            open ? "shadow-sky-500/30 ring-white/80" : "shadow-lg"
          )}
          title={open ? "Close help" : "Help and support (drag to move)"}
          aria-label={open ? "Close help chat" : "Open help and support chat (draggable)"}
          aria-pressed={open}
        >
          <MessageCircle className="w-7 h-7 sm:w-8 sm:h-8" strokeWidth={2.2} aria-hidden />
          {unreadCount > 0 && (
            <span
              className="absolute -right-0.5 -top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-rose-500 px-1 text-[10px] font-bold leading-none text-white ring-2 ring-white"
              aria-label={`${unreadCount} unread from support`}
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </span>
          )}
        </button>
      </div>
    </Draggable>
  );
};

export default ChatbotButton;
