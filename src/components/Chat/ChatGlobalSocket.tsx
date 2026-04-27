import { useCallback, useEffect, useRef } from "react";
import { io, Socket } from "socket.io-client";
import axios from "axios";
import { useAppUser } from "../../context/AppUserContext";
import { urls } from "src/config/urls";
import { defaultChatSocketOptions, CHAT_INCOMING_MESSAGE_EVENT } from "src/config/chatSocketOptions";

const CHAT_ENDPOINT = urls.chat;
const ADMIN_MONGO = process.env.REACT_APP_CHAT_ADMIN_ID || "698ace8b8ea84c91bdc93678";

type ChatGlobalSocketProps = {
  chatbotOpen: boolean;
  onUnreadDelta: (delta: number) => void;
  onResetUnread: () => void;
  /** Short line of text to show in the help-button popover (no full-screen alert). */
  onSupportMessagePreview: (line: string | null) => void;
};

type MongoUser = { _id: string; name?: string; email?: string };

const MAX_DEDUPE = 200;

type MsgRow = { _id?: string; content?: string; sender?: { _id?: string; name?: string } };
type ChatRow = { _id: string; users?: Array<{ _id: string; name?: string; email?: string }> };

function emitSupportMessageToApp(
  msg: { _id?: string; _emitChatId?: string; content?: string; sender?: { _id?: string; name?: string } } & Record<string, unknown>
) {
  if (typeof window === "undefined") {
    return;
  }
  window.dispatchEvent(new CustomEvent(CHAT_INCOMING_MESSAGE_EVENT, { detail: { message: msg } }));
}

/**
 * Socket + HTTP polling: real-time is best-effort; polling catches support replies
 * if the connection drops, Strict Mode re-mounts, or the host only delivers events intermittently.
 */
const ChatGlobalSocket: React.FC<ChatGlobalSocketProps> = ({
  chatbotOpen,
  onUnreadDelta,
  onResetUnread,
  onSupportMessagePreview,
}) => {
  const { appUser } = useAppUser();
  const appUserRef = useRef(appUser);
  appUserRef.current = appUser;

  const socketRef = useRef<Socket | null>(null);
  const mongoIdRef = useRef<string | null>(null);
  const onUnreadDeltaRef = useRef(onUnreadDelta);
  onUnreadDeltaRef.current = onUnreadDelta;
  const onPreviewRef = useRef(onSupportMessagePreview);
  onPreviewRef.current = onSupportMessagePreview;
  const wasOpenRef = useRef(false);
  const supportLiveRef = useRef(false);
  const seenMessageIds = useRef<Set<string>>(new Set());
  const pollTimerRef = useRef<number | null>(null);
  const lastPolledMessageIdRef = useRef<string | null>(null);
  const pollBaselineSetRef = useRef(false);
  const pollRunningRef = useRef(false);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const w = (e: Event) => {
      const d = (e as CustomEvent<{ isLive?: boolean }>).detail;
      supportLiveRef.current = d?.isLive === true;
    };
    window.addEventListener("se:support-live", w);
    return () => window.removeEventListener("se:support-live", w);
  }, []);

  const rememberAndShow = useCallback(
    (msgId: string | undefined, text: string, fromLabel: string) => {
      if (supportLiveRef.current) {
        return;
      }
      const k = String(msgId || text).slice(0, 200);
      if (seenMessageIds.current.has(k)) {
        return;
      }
      seenMessageIds.current.add(k);
      if (seenMessageIds.current.size > MAX_DEDUPE) {
        const arr = Array.from(seenMessageIds.current);
        seenMessageIds.current = new Set(arr.slice(-80));
      }
      onUnreadDeltaRef.current(1);
      const line = `${fromLabel}: ${text.length > 120 ? `${text.slice(0, 120)}…` : text}`;
      onPreviewRef.current(line);
      if (typeof window !== "undefined" && "Notification" in window && Notification.permission === "granted") {
        try {
          new Notification("ServEase support", { body: text.slice(0, 200), tag: "chat" });
        } catch {
          /* ignore */
        }
      }
    },
    []
  );

  const clearPoll = useCallback(() => {
    if (pollTimerRef.current != null) {
      clearInterval(pollTimerRef.current);
      pollTimerRef.current = null;
    }
  }, []);

  const pollForNewMessages = useCallback(
    async (userId: string) => {
      if (pollRunningRef.current) {
        return;
      }
      pollRunningRef.current = true;
      try {
        const { data: chats } = await axios.get<ChatRow[]>(`${CHAT_ENDPOINT}/api/chat`, {
          params: { currentUserId: String(userId) },
        });
        if (!chats || !chats.length) {
          return;
        }
        const withAdmin = chats.find((c) =>
          (c.users || []).some((u) => String((u as { _id: string })._id) === String(ADMIN_MONGO))
        );
        const chatId = withAdmin?._id;
        if (!chatId) {
          return;
        }
        const { data: messages } = await axios.get<MsgRow[]>(`${CHAT_ENDPOINT}/api/message/${String(chatId)}`);
        if (!Array.isArray(messages) || !messages.length) {
          if (!pollBaselineSetRef.current) {
            pollBaselineSetRef.current = true;
            lastPolledMessageIdRef.current = null;
          }
          return;
        }
        const last = messages[messages.length - 1];
        const lastId = last?._id != null ? String(last._id) : null;
        if (!lastId) {
          return;
        }
        const fromSupport = String(last?.sender?._id) === String(ADMIN_MONGO);
        if (!fromSupport) {
          lastPolledMessageIdRef.current = lastId;
          if (!pollBaselineSetRef.current) {
            pollBaselineSetRef.current = true;
          }
          return;
        }
        if (!pollBaselineSetRef.current) {
          lastPolledMessageIdRef.current = lastId;
          pollBaselineSetRef.current = true;
          return;
        }
        if (lastId === lastPolledMessageIdRef.current) {
          return;
        }
        lastPolledMessageIdRef.current = lastId;
        const fromName = (last?.sender as { name?: string })?.name || "Support";
        const body = (last?.content && String(last.content)) || "New message";
        if (supportLiveRef.current) {
          emitSupportMessageToApp({
            _id: lastId,
            content: body,
            sender: { _id: ADMIN_MONGO, name: fromName },
            _emitChatId: String(chatId),
          });
        } else {
          rememberAndShow(lastId, body, fromName);
        }
      } catch {
        /* non-fatal */
      } finally {
        pollRunningRef.current = false;
      }
    },
    [rememberAndShow]
  );

  const startPolling = useCallback(
    (userId: string) => {
      clearPoll();
      pollBaselineSetRef.current = false;
      lastPolledMessageIdRef.current = null;
      void pollForNewMessages(userId);
      const t = window.setInterval(() => void pollForNewMessages(userId), 8_000);
      pollTimerRef.current = t;
    },
    [clearPoll, pollForNewMessages]
  );

  const connect = useCallback(
    (mongo: MongoUser) => {
      mongoIdRef.current = mongo._id;
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();

      const socket: Socket = io(CHAT_ENDPOINT, { ...defaultChatSocketOptions });
      socketRef.current = socket;

      const joinAllChats = async () => {
        try {
          const { data } = await axios.get<Array<{ _id: string }>>(`${CHAT_ENDPOINT}/api/chat`, {
            params: { currentUserId: String(mongo._id) },
          });
          if (Array.isArray(data)) {
            for (const c of data) {
              if (c?._id) {
                socket.emit("join chat", String(c._id));
              }
            }
          }
        } catch {
          /* ignore */
        }
      };

      const wire = () => {
        socket.emit("setup", { userId: String(mongo._id), role: "user" });
        void joinAllChats();
      };

      socket.on("connect", wire);
      socket.on("reconnect", wire);
      if (socket.connected) {
        wire();
      }

      const onChatNotif = (payload: {
        fromName?: string;
        preview?: string;
        message?: { _id?: string; sender?: { _id?: string } };
      }) => {
        const sid = payload?.message?.sender && payload.message.sender._id;
        if (sid != null && mongoIdRef.current && String(sid) === String(mongoIdRef.current)) {
          return;
        }
        const mid = payload?.message?._id != null ? String(payload.message._id) : undefined;
        const p = (payload?.preview && String(payload.preview)) || "New message";
        const who = (payload?.fromName && String(payload.fromName)) || "Support";
        if (mid) {
          lastPolledMessageIdRef.current = mid;
        }
        if (supportLiveRef.current && payload?.message) {
          const pmsg = payload.message;
          const ps = pmsg.sender?._id != null ? String(pmsg.sender._id) : undefined;
          if (ps === String(ADMIN_MONGO)) {
            emitSupportMessageToApp(
              pmsg as { _id?: string; _emitChatId?: string; content?: string; sender?: { _id?: string; name?: string } } & Record<string, unknown>
            );
          }
        }
        rememberAndShow(mid, p, who);
      };

      const onMessageReceived = (msg: {
        _id?: string;
        _emitChatId?: string;
        content?: string;
        chat?: { _id?: string } | string;
        sender?: { _id?: string; name?: string };
      }) => {
        const sid = msg?.sender?._id != null ? String(msg.sender._id) : undefined;
        if (sid && mongoIdRef.current && String(sid) === String(mongoIdRef.current)) {
          return;
        }
        if (String(sid) !== String(ADMIN_MONGO)) {
          return;
        }
        emitSupportMessageToApp(msg);
        const fromName = (msg?.sender && msg.sender.name) || "Support";
        const body = (msg?.content && String(msg.content)) || "New message";
        const mid = msg?._id != null ? String(msg._id) : msg?._emitChatId;
        if (mid) {
          lastPolledMessageIdRef.current = mid;
        }
        rememberAndShow(mid, body, fromName);
      };

      socket.on("chat notification", onChatNotif);
      socket.on("message recieved", onMessageReceived);

      socket.on("connect_error", (err) => {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn("[ChatGlobalSocket] connect_error", err?.message);
        }
      });
    },
    [rememberAndShow]
  );

  useEffect(() => {
    if (typeof window === "undefined") return;
    const onVis = () => {
      if (document.visibilityState !== "visible") return;
      const s = socketRef.current;
      if (s && !s.connected) {
        s.connect();
      }
      const uid = mongoIdRef.current;
      if (s?.connected && uid) {
        s.emit("setup", { userId: String(uid), role: "user" });
        void (async () => {
          try {
            const { data } = await axios.get<Array<{ _id: string }>>(`${CHAT_ENDPOINT}/api/chat`, {
              params: { currentUserId: String(uid) },
            });
            if (Array.isArray(data)) {
              for (const c of data) {
                if (c?._id) s.emit("join chat", String(c._id));
              }
            }
          } catch {
            /* ignore */
          }
        })();
        void pollForNewMessages(String(uid));
      }
    };
    document.addEventListener("visibilitychange", onVis);
    return () => document.removeEventListener("visibilitychange", onVis);
  }, [pollForNewMessages]);

  useEffect(() => {
    if (!appUser?.email) {
      clearPoll();
      pollBaselineSetRef.current = false;
      lastPolledMessageIdRef.current = null;
      mongoIdRef.current = null;
      seenMessageIds.current.clear();
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
      return;
    }

    let cancelled = false;

    (async () => {
      const u = appUserRef.current;
      if (!u?.email) {
        return;
      }
      const displayName = (u.name && String(u.name).trim()) || String(u.email).split("@")[0] || "User";
      try {
        const { data } = await axios.post<MongoUser>(`${CHAT_ENDPOINT}/api/user/find-or-create`, {
          name: displayName,
          email: u.email,
        });
        if (cancelled || !data?._id) {
          return;
        }
        startPolling(String(data._id));
        connect(data);
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn("[ChatGlobalSocket] find-or-create failed", e);
        }
      }
    })();

    return () => {
      cancelled = true;
      clearPoll();
      seenMessageIds.current.clear();
      pollBaselineSetRef.current = false;
      lastPolledMessageIdRef.current = null;
      socketRef.current?.removeAllListeners();
      socketRef.current?.disconnect();
      socketRef.current = null;
    };
  }, [appUser?.email, connect, startPolling, clearPoll]);

  useEffect(() => {
    if (chatbotOpen && !wasOpenRef.current) {
      onResetUnread();
      onPreviewRef.current(null);
    }
    wasOpenRef.current = chatbotOpen;
  }, [chatbotOpen, onResetUnread]);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }
    const w = () => {
      const s = socketRef.current;
      const uid = mongoIdRef.current;
      if (!s?.connected || !uid) {
        return;
      }
      void (async () => {
        try {
          const { data } = await axios.get<Array<{ _id: string }>>(`${CHAT_ENDPOINT}/api/chat`, {
            params: { currentUserId: String(uid) },
          });
          if (Array.isArray(data)) {
            for (const c of data) {
              if (c?._id) s.emit("join chat", String(c._id));
            }
          }
        } catch {
          /* ignore */
        }
      })();
    };
    window.addEventListener("se:chat-rooms-refresh", w);
    return () => window.removeEventListener("se:chat-rooms-refresh", w);
  }, []);

  return null;
};

export default ChatGlobalSocket;

export async function tryRequestChatNotificationPermission() {
  if (typeof window === "undefined" || !("Notification" in window)) {
    return;
  }
  if (Notification.permission === "default") {
    try {
      await Notification.requestPermission();
    } catch {
      /* ignore */
    }
  }
}
