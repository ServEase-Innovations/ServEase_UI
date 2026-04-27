import { useCallback, useEffect, useMemo, useState, useRef } from "react";
import axios from "axios";
import { io, Socket } from "socket.io-client";
import { Button } from "../../Common/button";
import { Input } from "../../Common/input";
import { cn } from "../../utils";
import {
  ArrowLeft,
  ChevronRight,
  Info,
  Loader2,
  MessageSquare,
  PanelRightClose,
  PanelRightOpen,
  RefreshCw,
  Search,
  Send,
  User,
  UserPlus,
  Wifi,
  WifiOff,
} from "lucide-react";
import { Snackbar, Alert } from "@mui/material";
import { defaultChatSocketOptions } from "src/config/chatSocketOptions";

type UserType = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
};

type Message = {
  _id?: string;
  sender: {
    _id: string;
    name: string;
  };
  content: string;
  chat: {
    _id: string;
  };
  createdAt?: string;
};

type ChatType = {
  _id: string;
  users: UserType[];
  /** Chat doc; updated when new messages arrive (used for order). */
  updatedAt?: string;
  latestMessage?: { _id?: string; createdAt?: string; content?: string };
};

/** Newest first — matches server inbox sort. */
function chatRecencyMs(c: ChatType): number {
  const lm = c.latestMessage;
  if (lm?.createdAt) {
    const t = new Date(lm.createdAt).getTime();
    if (!Number.isNaN(t)) {
      return t;
    }
  }
  if (c.updatedAt) {
    const t = new Date(c.updatedAt).getTime();
    if (!Number.isNaN(t)) {
      return t;
    }
  }
  return 0;
}

type ChatBuildEnv = {
  VITE_CHAT_API_URL?: string;
  VITE_CHAT_ADMIN_USER_ID?: string;
};

/**
 * CRA injects `REACT_APP_*` at build time. Vite uses `VITE_*` on `import.meta.env` (if defined).
 * Never assume `import.meta.env` exists — in Create React App it is undefined and crashes.
 */
function chatEnv() {
  const p = process.env as {
    REACT_APP_CHAT_API_URL?: string;
    REACT_APP_CHAT_ADMIN_USER_ID?: string;
  };
  const vite =
    typeof import.meta !== "undefined" && (import.meta as { env?: ChatBuildEnv }).env
      ? (import.meta as { env?: ChatBuildEnv }).env
      : undefined;

  const url =
    p.REACT_APP_CHAT_API_URL || vite?.VITE_CHAT_API_URL || "https://chat-b3wl.onrender.com";
  const admin =
    p.REACT_APP_CHAT_ADMIN_USER_ID || vite?.VITE_CHAT_ADMIN_USER_ID || "698ace8b8ea84c91bdc93678";

  return {
    endpoint: String(url).replace(/\/$/, ""),
    adminId: String(admin),
  };
}

function initials(name: string) {
  const p = name.trim().split(/\s+/).filter(Boolean);
  if (p.length === 0) return "?";
  if (p.length === 1) return p[0].slice(0, 2).toUpperCase();
  return `${p[0][0] ?? ""}${p[1][0] ?? ""}`.toUpperCase() || "?";
}

function formatMsgTime(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" });
}

function otherUser(chat: ChatType, adminId: string) {
  return chat.users.find((u) => u._id !== adminId) || null;
}

/** Socket payloads may use populated chat, raw ObjectId, or the BE-added `_emitChatId`. */
function messageChatId(
  m: (Message & { _emitChatId?: string; chat?: string | { _id?: string; $oid?: string } | null } | null) | undefined
): string | null {
  if (m?._emitChatId) return String(m._emitChatId);
  const c = m?.chat;
  if (c == null) return null;
  if (typeof c === "string") return c;
  if (typeof c === "object" && c !== null) {
    const id = (c as { _id?: unknown; $oid?: string })._id;
    if (id != null) {
      if (typeof id === "string") {
        return id;
      }
      if (typeof (id as { toString?: () => string }).toString === "function") {
        return String(id);
      }
    }
    const o = (c as { $oid?: string }).$oid;
    if (o) {
      return String(o);
    }
  }
  return null;
}

const Chats = () => {
  const { endpoint, adminId } = chatEnv();

  const [messages, setMessages] = useState<Message[]>([]);
  const [chats, setChats] = useState<ChatType[]>([]);
  const [selectedChat, setSelectedChat] = useState<ChatType | null>(null);
  const [selectedUser, setSelectedUser] = useState<UserType | null>(null);
  const [showDetails, setShowDetails] = useState(false);
  const [input, setInput] = useState("");
  const [search, setSearch] = useState("");

  const [chatsLoading, setChatsLoading] = useState(true);
  const [chatsError, setChatsError] = useState<string | null>(null);
  const [threadError, setThreadError] = useState<string | null>(null);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [socketConnected, setSocketConnected] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);
  const [onlineSet, setOnlineSet] = useState<Set<string>>(() => new Set());
  const [userQuery, setUserQuery] = useState("");
  const [userSearchResults, setUserSearchResults] = useState<(UserType & { isOnline?: boolean })[]>([]);
  const [userSearchLoading, setUserSearchLoading] = useState(false);
  const [adminNotify, setAdminNotify] = useState<string | null>(null);

  /** On narrow screens, switch between list and open thread. */
  const [mobile, setMobile] = useState<"list" | "thread">("list");

  const socketRef = useRef<Socket | null>(null);
  const chatsRef = useRef<ChatType[]>([]);
  const selectedChatRef = useRef<ChatType | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const fetchChatsRef = useRef<(opts?: { silent?: boolean }) => Promise<void>>(async () => {});

  useEffect(() => {
    chatsRef.current = chats;
  }, [chats]);

  /** Server should return newest first; re-sort in case of stale order or after silent refresh. */
  const chatsByRecency = useMemo(
    () => [...chats].sort((a, b) => chatRecencyMs(b) - chatRecencyMs(a)),
    [chats]
  );

  const filteredChats = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) {
      return chatsByRecency;
    }
    return chatsByRecency.filter((c) => {
      const u = otherUser(c, adminId);
      const blob = [u?.name, u?.email, u?.phone, u?._id].map((v) => (v ? String(v).toLowerCase() : "")).join(" ");
      return blob.includes(q);
    });
  }, [chatsByRecency, search, adminId]);

  /**
   * Who is online: match socket presence ids to directory rows we know (existing chats)
   * plus any extra Mongo ids the server reports without a local conversation.
   */
  const onlineNow = useMemo(() => {
    const byId = new Map<string, { u: UserType; chat: ChatType }>();
    for (const chat of chatsByRecency) {
      const u = otherUser(chat, adminId);
      if (u?._id && onlineSet.has(String(u._id))) {
        if (!byId.has(String(u._id))) {
          byId.set(String(u._id), { u, chat });
        }
      }
    }
    const withChat = Array.from(byId.values()).sort((a, b) =>
      a.u.name.localeCompare(b.u.name, undefined, { sensitivity: "base" })
    );
    const known = new Set(byId.keys());
    const otherOnlyIds: string[] = [];
    for (const id of Array.from(onlineSet)) {
      const s = String(id);
      if (!known.has(s)) {
        otherOnlyIds.push(s);
      }
    }
    otherOnlyIds.sort();
    return { withChat, otherOnlyIds, total: onlineSet.size };
  }, [chatsByRecency, onlineSet, adminId]);

  const fetchChats = useCallback(
    async (opts?: { silent?: boolean }) => {
      if (!opts?.silent) {
        setChatsLoading(true);
        setChatsError(null);
      }
      try {
        const { data } = await axios.get<ChatType[]>(`${endpoint}/api/chat?currentUserId=${adminId}`);
        setChats(Array.isArray(data) ? data : []);
        if (!opts?.silent) setChatsError(null);
      } catch (e) {
        const err = e as { message?: string };
        if (!opts?.silent) {
          setChatsError(
            err?.message || "Could not load conversations. Check the chat service URL and network."
          );
        }
        if (!opts?.silent) setChats([]);
      } finally {
        if (!opts?.silent) setChatsLoading(false);
      }
    },
    [endpoint, adminId]
  );

  useEffect(() => {
    fetchChatsRef.current = fetchChats;
  }, [fetchChats]);

  const loadOnlineIds = useCallback(async () => {
    try {
      const { data } = await axios.get<{ online: string[] }>(`${endpoint}/api/presence/online-ids?adminId=${encodeURIComponent(adminId)}`);
      setOnlineSet(
        new Set(
          (data.online || [])
            .map(String)
            .filter((id) => id && id !== String(adminId))
        )
      );
    } catch (e) {
      if (process.env.NODE_ENV === "development") {
        // eslint-disable-next-line no-console
        console.warn("[Chats] online-ids failed (check ADMIN id matches chat service)", e);
      }
    }
  }, [endpoint, adminId]);

  const loadOnlineIdsRef = useRef(loadOnlineIds);
  useEffect(() => {
    loadOnlineIdsRef.current = loadOnlineIds;
  }, [loadOnlineIds]);

  useEffect(() => {
    void loadOnlineIds();
    const t = window.setInterval(() => void loadOnlineIds(), 30000);
    return () => clearInterval(t);
  }, [loadOnlineIds]);

  /** Re-fetch when returning to the tab, and on an interval, so the list order stays “latest” without a full app reload. */
  useEffect(() => {
    const onVis = () => {
      if (document.visibilityState === "visible") {
        void fetchChatsRef.current({ silent: true });
      }
    };
    document.addEventListener("visibilitychange", onVis);
    const poll = window.setInterval(() => {
      if (document.visibilityState === "visible") {
        void fetchChatsRef.current({ silent: true });
      }
    }, 45_000);
    return () => {
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(poll);
    };
  }, []);

  useEffect(() => {
    const q = userQuery.trim();
    if (q.length < 2) {
      setUserSearchResults([]);
      return;
    }
    const t = window.setTimeout(() => {
      (async () => {
        setUserSearchLoading(true);
        try {
          const { data } = await axios.get<(UserType & { isOnline?: boolean })[]>(
            `${endpoint}/api/user/admin-search?${new URLSearchParams({ adminId, search: q })}`
          );
          setUserSearchResults(Array.isArray(data) ? data : []);
        } catch {
          setUserSearchResults([]);
        } finally {
          setUserSearchLoading(false);
        }
      })();
    }, 400);
    return () => clearTimeout(t);
  }, [userQuery, endpoint, adminId]);

  useEffect(() => {
    void fetchChats();
  }, [fetchChats]);

  useEffect(() => {
    const socket = io(endpoint, { ...defaultChatSocketOptions });
    socketRef.current = socket;

    const rejoinAllChatRooms = (s: Socket) => {
      for (const c of chatsRef.current) {
        if (c?._id) {
          s.emit("join chat", String(c._id));
        }
      }
    };

    const onConnect = () => {
      setSocketConnected(true);
      socket.emit("setup", { userId: String(adminId), role: "admin" });
      rejoinAllChatRooms(socket);
      void loadOnlineIdsRef.current();
    };

    const onReconnect = () => {
      socket.emit("setup", { userId: String(adminId), role: "admin" });
      rejoinAllChatRooms(socket);
      void loadOnlineIdsRef.current();
    };

    const onDisconnect = () => setSocketConnected(false);

    const onMessage = (newMessage: Message & { _emitChatId?: string }) => {
      const activeChat = selectedChatRef.current;
      const cid = messageChatId(newMessage);
      if (cid == null) {
        if (process.env.NODE_ENV === "development") {
          // eslint-disable-next-line no-console
          console.warn("[Chats] message recieved: could not resolve chat id", newMessage);
        }
        return;
      }
      if (!activeChat) {
        void fetchChatsRef.current({ silent: true });
        return;
      }
      if (String(cid) !== String(activeChat._id)) {
        void fetchChatsRef.current({ silent: true });
        return;
      }
      setMessages((prev) => {
        if (newMessage._id && prev.some((m) => m._id === newMessage._id)) return prev;
        return [...prev, newMessage];
      });
    };

    const onPresence = (p: { online?: string[] }) => {
      const a = String(adminId);
      setOnlineSet(
        new Set(
          (p?.online || [])
            .map(String)
            .filter((id) => id && id !== a)
        )
      );
    };

    const refetchOpenThread = (chatId: string) => {
      if (!selectedChatRef.current?._id || String(selectedChatRef.current._id) !== String(chatId)) {
        return;
      }
      void (async () => {
        try {
          const { data } = await axios.get<Message[]>(`${endpoint}/api/message/${String(chatId)}`);
          if (Array.isArray(data)) {
            setMessages(data);
          }
        } catch {
          /* non-fatal */
        }
      })();
    };

    const onAdminActivity = (a: {
      chatId?: string;
      preview?: string;
      fromName?: string;
      fromCustomer?: boolean;
    }) => {
      if (!a?.chatId) {
        void fetchChatsRef.current({ silent: true });
        return;
      }
      void fetchChatsRef.current({ silent: true });
      refetchOpenThread(String(a.chatId));
      if (a.fromCustomer) {
        const id = String(a.chatId);
        const cur = selectedChatRef.current?._id;
        if (!cur || id !== String(cur)) {
          setAdminNotify(
            `${a.fromName || "Customer"}: ${(a.preview || "New message").slice(0, 120)}${
              (a.preview || "").length > 120 ? "…" : ""
            }`
          );
        }
      }
    };

    socket.on("connect", onConnect);
    socket.on("reconnect", onReconnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message recieved", onMessage);
    socket.on("presence:update", onPresence);
    socket.on("admin chat activity", onAdminActivity);

    return () => {
      socket.off("connect", onConnect);
      socket.off("reconnect", onReconnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message recieved", onMessage);
      socket.off("presence:update", onPresence);
      socket.off("admin chat activity", onAdminActivity);
      socket.disconnect();
    };
  }, [endpoint, adminId]);

  /** Join all conversation rooms so the admin gets `message recieved` for every thread, not just the one open. */
  useEffect(() => {
    const s = socketRef.current;
    if (!s?.connected || !socketConnected) return;
    for (const c of chats) {
      if (c?._id) s.emit("join chat", String(c._id));
    }
  }, [chats, socketConnected]);

  const openThread = useCallback(
    async (chat: ChatType) => {
      setSendError(null);
      setThreadError(null);
      setShowDetails(false);
      setMessagesLoading(true);
      setSelectedChat(chat);
      selectedChatRef.current = chat;

      const customer = otherUser(chat, adminId);
      setSelectedUser(customer);

      try {
        const { data } = await axios.get<Message[]>(`${endpoint}/api/message/${chat._id}`);
        setMessages(Array.isArray(data) ? data : []);
        socketRef.current?.emit("join chat", chat._id);
        setMobile("thread");
        requestAnimationFrame(() => inputRef.current?.focus());
      } catch (e) {
        const err = e as { message?: string };
        setThreadError(err?.message || "Failed to load messages for this chat.");
        setMessages([]);
      } finally {
        setMessagesLoading(false);
      }
    },
    [endpoint, adminId]
  );

  const startChatWithUser = useCallback(
    async (u: UserType & { isOnline?: boolean }) => {
      setUserQuery("");
      setUserSearchResults([]);
      setChatsError(null);
      try {
        const { data } = await axios.post<ChatType>(`${endpoint}/api/chat`, { userId: u._id, currentUserId: adminId });
        if (data?._id) {
          await fetchChats();
          await openThread(data);
        }
      } catch (e) {
        const err = e as { response?: { data?: { message?: string } }; message?: string };
        setChatsError(
          err?.response?.data?.message || err?.message || "Could not start a chat with that user."
        );
      }
    },
    [endpoint, adminId, fetchChats, openThread]
  );

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedChat) return;
    setSendLoading(true);
    setSendError(null);
    try {
      const { data } = await axios.post<Message>(`${endpoint}/api/message`, {
        content: input.trim(),
        chatId: selectedChat._id,
        senderId: adminId,
      });
      setMessages((prev) => {
        if (data._id && prev.some((m) => m._id === data._id)) return prev;
        return [...prev, data];
      });
      setInput("");
      requestAnimationFrame(() => inputRef.current?.focus());
    } catch (e) {
      const err = e as { message?: string };
      setSendError(err?.message || "Message could not be sent.");
    } finally {
      setSendLoading(false);
    }
  }, [input, selectedChat, endpoint, adminId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const isAdmin = (m: Message) => m.sender._id === adminId;

  return (
    <div className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-wider text-slate-500">Inbox</p>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">Chats</h1>
        <p className="mt-1 max-w-2xl text-sm text-slate-600">
          Customer threads from the chat service. The &quot;Online now&quot; section lists customers with a live app session, with names when you
          already have a thread. Replies are sent as the configured admin user; your socket status appears in the thread header.
        </p>
      </div>

      {chatsError && !selectedChat && (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-800" role="alert">
          <span className="font-semibold">Error. </span>
          {chatsError}
        </div>
      )}

      <div
        className={cn(
          "flex min-h-0 w-full flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-sm",
          "h-[min(70vh,720px)] min-h-[420px] max-h-[calc(100dvh-10rem)] md:max-h-[calc(100dvh-11rem)]"
        )}
      >
        <div className="flex flex-1 min-h-0 flex-col md:flex-row">
          {/* Conversation list */}
          <aside
            className={cn(
              "flex min-h-0 w-full flex-col border-slate-200/80 bg-slate-50/80 md:w-[min(100%,20rem)] md:shrink-0 md:border-r",
              mobile === "thread" && "hidden md:flex"
            )}
          >
            <div className="flex items-center justify-between gap-2 border-b border-slate-200/80 p-3">
              <p className="text-sm font-semibold text-slate-800">Conversations</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-slate-200/80 px-2 py-0.5 text-xs text-slate-600">
                {chats.length}
              </span>
            </div>
            <div className="p-2">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter this list (name, email)…"
                  className="h-9 border-slate-200 pl-9 text-sm"
                  aria-label="Filter conversations"
                />
              </div>
            </div>
            <div className="space-y-1.5 border-b border-slate-200/80 p-2">
              <p className="flex items-center gap-1.5 text-xs font-semibold text-slate-600">
                <UserPlus className="h-3.5 w-3.5" />
                Find a customer
              </p>
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <Input
                  value={userQuery}
                  onChange={(e) => setUserQuery(e.target.value)}
                  placeholder="Name or email (min. 2 characters)…"
                  className="h-9 border-slate-200 pl-9 text-sm"
                  aria-label="Search all customers in chat directory"
                />
              </div>
              {userSearchLoading && (
                <p className="text-xs text-slate-500">Searching…</p>
              )}
              {!userSearchLoading && userQuery.trim().length >= 2 && userSearchResults.length === 0 && (
                <p className="text-xs text-slate-500">No users match. They may need to open the app and start support once to appear.</p>
              )}
              {userSearchResults.length > 0 && (
                <ul className="max-h-36 space-y-1 overflow-y-auto rounded-lg border border-slate-200/80 bg-white p-1" role="list">
                  {userSearchResults.map((u) => (
                    <li key={u._id}>
                      <button
                        type="button"
                        className="flex w-full items-center justify-between gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                        onClick={() => void startChatWithUser(u)}
                      >
                        <span className="min-w-0">
                          <span className="block truncate font-medium text-slate-900">{u.name}</span>
                          <span className="block truncate text-xs text-slate-500">{u.email || u._id}</span>
                        </span>
                        <span className="flex shrink-0 items-center gap-1.5 text-xs text-slate-500">
                          {(u.isOnline ?? onlineSet.has(String(u._id))) && (
                            <span className="inline-flex items-center gap-0.5 font-medium text-emerald-600">
                              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" title="Online" />
                              online
                            </span>
                          )}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="space-y-1.5 border-b border-slate-200/80 p-2">
              <p className="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600">
                <span className="flex items-center gap-1.5" title="Users with the main app (or support chat) open and a live socket to the chat service">
                  <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                  Online now
                </span>
                <span
                  className="inline-flex min-w-[1.5rem] items-center justify-center rounded-full bg-slate-200/90 px-1.5 py-0.5 text-[10px] font-mono text-slate-600 tabular-nums"
                  aria-label={`${onlineNow.total} online`}
                >
                  {onlineNow.total}
                </span>
              </p>
              {onlineNow.total === 0 ? (
                <p className="text-xs leading-snug text-slate-500">
                  No customers have a live session. When they open the app, they can appear here (green dot in the list, too).
                </p>
              ) : (
                <ul
                  className="max-h-[min(8.5rem,32vh)] space-y-0.5 overflow-y-auto pr-0.5"
                  role="list"
                  aria-label="Customers currently online"
                >
                  {onlineNow.withChat.map(({ u, chat }) => (
                    <li key={u._id}>
                      <button
                        type="button"
                        className="flex w-full min-w-0 items-center gap-2 rounded-md px-1.5 py-1 text-left text-sm text-slate-800 transition-colors hover:bg-white"
                        onClick={() => void openThread(chat)}
                      >
                        <span
                          className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                          title="Online"
                          aria-hidden
                        />
                        <span className="min-w-0 flex-1 truncate">
                          <span className="font-medium">{u.name}</span>
                          {u.email ? <span className="block truncate text-[11px] text-slate-500">{u.email}</span> : null}
                        </span>
                      </button>
                    </li>
                  ))}
                  {onlineNow.otherOnlyIds.map((id) => (
                    <li
                      key={id}
                      className="flex items-center gap-2 rounded-md px-1.5 py-1 text-xs text-slate-500"
                      title="Socket online for this user id, but not in this conversation list yet. Use Find a customer to open a thread if they are in the directory."
                    >
                      <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden />
                      <span className="min-w-0 break-all font-mono text-[11px] leading-snug text-slate-600">
                        {id.length > 10 ? `…${id.slice(-8)}` : id}
                      </span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto p-2 pt-0">
              {chatsLoading ? (
                <div className="flex flex-col items-center justify-center gap-2 py-12 text-slate-500">
                  <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
                  <p className="text-sm">Loading conversations…</p>
                </div>
              ) : filteredChats.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 px-4 py-12 text-center text-slate-500">
                  <MessageSquare className="h-10 w-10 text-slate-300" />
                  <p className="text-sm font-medium text-slate-600">{chats.length === 0 ? "No chats yet" : "No matches"}</p>
                  <p className="text-xs text-slate-500">
                    {chats.length === 0 ? "When customers message support, they appear here." : "Try a different search."}
                  </p>
                </div>
              ) : (
                <ul className="space-y-1" role="listbox" aria-label="Conversations">
                  {filteredChats.map((chat) => {
                    const u = otherUser(chat, adminId);
                    const active = selectedChat?._id === chat._id;
                    return (
                      <li key={chat._id}>
                        <button
                          type="button"
                          role="option"
                          aria-selected={active}
                          onClick={() => void openThread(chat)}
                          className={cn(
                            "flex w-full items-center gap-3 rounded-xl px-2 py-2.5 text-left text-sm transition-colors",
                            active
                              ? "bg-sky-100/90 text-slate-900 ring-1 ring-sky-300/50"
                              : "text-slate-800 hover:bg-white hover:ring-1 hover:ring-slate-200/80"
                          )}
                        >
                          <span
                            className={cn(
                              "flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                              active ? "bg-sky-600 text-white" : "bg-slate-200/90 text-slate-700"
                            )}
                          >
                            {u?.name ? initials(u.name) : "?"}
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex items-center gap-1.5 truncate">
                              <span className="truncate font-medium">{u?.name || "Unknown user"}</span>
                              {u?._id && onlineSet.has(String(u._id)) && (
                                <span
                                  className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500"
                                  title="Customer online in app"
                                  aria-label="Online"
                                />
                              )}
                            </span>
                            {u?.email && <span className="block truncate text-xs text-slate-500">{u.email}</span>}
                          </span>
                          <ChevronRight
                            className={cn("h-4 w-4 shrink-0 text-slate-400 md:hidden", active && "text-sky-600")}
                            aria-hidden
                          />
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
            <div className="shrink-0 border-t border-slate-200/80 p-2">
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="h-8 w-full border-slate-200"
                onClick={() => void fetchChats()}
                disabled={chatsLoading}
              >
                {chatsLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
                <span>Refresh</span>
              </Button>
            </div>
          </aside>

          {/* Thread + composer */}
          <section
            className={cn(
              "flex min-h-0 min-w-0 flex-1 flex-col bg-white",
              mobile === "list" && selectedChat && "hidden md:flex",
              !selectedChat && "hidden md:flex"
            )}
          >
            {selectedChat ? (
              <>
                <header className="flex shrink-0 items-center gap-2 border-b border-slate-200/80 px-3 py-2.5 sm:px-4">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-9 w-9 shrink-0 text-slate-600 md:hidden"
                    onClick={() => setMobile("list")}
                    aria-label="Back to list"
                  >
                    <ArrowLeft className="h-5 w-5" />
                  </Button>
                  <span
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-700"
                    aria-hidden
                  >
                    {selectedUser?.name ? initials(selectedUser.name) : "?"}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2 text-sm font-semibold text-slate-900">
                      <span className="truncate">{selectedUser?.name || "Conversation"}</span>
                      {selectedUser?._id && onlineSet.has(String(selectedUser._id)) && (
                        <span className="inline-flex shrink-0 items-center gap-0.5 rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wide text-emerald-800">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          online
                        </span>
                      )}
                    </p>
                    {selectedUser?.email && <p className="truncate text-xs text-slate-500">{selectedUser.email}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1.5">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium",
                        socketConnected ? "bg-emerald-500/10 text-emerald-800" : "bg-amber-500/10 text-amber-800"
                      )}
                      title={socketConnected ? "Socket connected" : "Reconnecting or offline"}
                    >
                      {socketConnected ? <Wifi className="h-3 w-3" /> : <WifiOff className="h-3 w-3" />}
                      {socketConnected ? "Live" : "Offline"}
                    </span>
                    {selectedUser && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-8 gap-1 border-slate-200"
                        onClick={() => setShowDetails((s) => !s)}
                        aria-pressed={showDetails}
                      >
                        {showDetails ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
                        <span className="hidden sm:inline">{showDetails ? "Hide" : "Details"}</span>
                      </Button>
                    )}
                  </div>
                </header>

                {threadError && (
                  <div
                    className="mx-3 mt-2 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-900"
                    role="status"
                  >
                    {threadError}
                  </div>
                )}

                <div className="flex min-h-0 min-w-0 flex-1">
                  <div
                    className="min-h-0 min-w-0 flex-1 overflow-y-auto scroll-smooth bg-slate-50/40 p-3 sm:p-4"
                    role="log"
                    aria-live="polite"
                    aria-relevant="additions"
                  >
                    {messagesLoading ? (
                      <div className="flex h-full min-h-[200px] flex-col items-center justify-center gap-2 text-slate-500">
                        <Loader2 className="h-7 w-7 animate-spin" />
                        <p className="text-sm">Loading messages…</p>
                      </div>
                    ) : (
                      <>
                        {messages.map((m, i) => {
                          const mine = isAdmin(m);
                          const t = formatMsgTime(m.createdAt);
                          return (
                            <div
                              key={m._id || `m-${i}-${m.createdAt || ""}`}
                              className={cn("mb-3 flex w-full", mine ? "justify-end" : "justify-start")}
                            >
                              <div
                                className={cn("max-w-[min(100%,24rem)] rounded-2xl px-3.5 py-2 shadow-sm", {
                                  "bg-sky-600 text-white": mine,
                                  "border border-slate-200/90 bg-white text-slate-900": !mine,
                                })}
                              >
                                {!mine && (
                                  <p className="mb-0.5 text-xs font-medium text-sky-700/90">{m.sender.name}</p>
                                )}
                                <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">{m.content}</p>
                                {t && (
                                  <p
                                    className={cn("mt-1.5 text-[10px] tabular-nums", mine ? "text-sky-100/90" : "text-slate-500")}
                                  >
                                    {t}
                                  </p>
                                )}
                              </div>
                            </div>
                          );
                        })}
                        <div ref={messagesEndRef} />
                        {messages.length === 0 && !messagesLoading && (
                          <div className="flex h-full min-h-[160px] flex-col items-center justify-center text-center text-slate-500">
                            <p className="text-sm">No messages in this thread yet.</p>
                            <p className="mt-1 text-xs">Say hello below when you’re ready.</p>
                          </div>
                        )}
                      </>
                    )}
                  </div>

                  {showDetails && selectedUser && (
                    <aside
                      className="hidden w-[min(100%,16rem)] shrink-0 border-l border-slate-200/80 bg-slate-50/90 p-4 sm:block"
                      aria-label="Customer details"
                    >
                      <h2 className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                        <Info className="h-3.5 w-3.5" />
                        Customer
                      </h2>
                      <dl className="space-y-3 text-sm text-slate-800">
                        <div>
                          <dt className="text-xs text-slate-500">Name</dt>
                          <dd className="mt-0.5 font-medium">{selectedUser.name}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Email</dt>
                          <dd className="mt-0.5 break-all">{selectedUser.email || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">Phone</dt>
                          <dd className="mt-0.5">{selectedUser.phone || "—"}</dd>
                        </div>
                        <div>
                          <dt className="text-xs text-slate-500">User ID</dt>
                          <dd className="mt-0.5 break-all font-mono text-xs">{selectedUser._id}</dd>
                        </div>
                      </dl>
                    </aside>
                  )}
                </div>

                {showDetails && selectedUser && (
                  <div className="shrink-0 border-t border-slate-200/80 bg-slate-50/90 p-4 sm:hidden" aria-label="Customer details">
                    <h2 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">Customer</h2>
                    <p className="text-sm text-slate-800">
                      <User className="mb-0.5 inline h-3.5 w-3.5" /> {selectedUser.name}
                    </p>
                    <p className="text-xs text-slate-600">{selectedUser.email || "—"}</p>
                  </div>
                )}

                <div className="shrink-0 border-t border-slate-200/80 bg-white p-2 sm:p-3">
                  {sendError && (
                    <p className="mb-2 rounded-md bg-rose-50 px-2 py-1.5 text-xs text-rose-800" role="alert">
                      {sendError}
                    </p>
                  )}
                  <div className="flex min-w-0 items-end gap-2">
                    <Input
                      ref={inputRef}
                      value={input}
                      onChange={(e) => setInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !e.nativeEvent.isComposing) {
                          e.preventDefault();
                          void sendMessage();
                        }
                      }}
                      placeholder="Type a message…"
                      className="min-w-0 flex-1 border-slate-200"
                      disabled={sendLoading}
                      maxLength={8000}
                    />
                    <Button
                      type="button"
                      onClick={() => void sendMessage()}
                      disabled={sendLoading || !input.trim() || !selectedChat}
                      className="h-10 shrink-0 bg-sky-600 px-3 hover:bg-sky-700 sm:px-4"
                      title="Send message"
                    >
                      {sendLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                      <span className="ml-1 hidden min-[400px]:inline">Send</span>
                    </Button>
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-500">
                    {socketConnected ? "Enter to send." : "Socket offline—messages may not deliver in real time; refresh if needed."}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center text-slate-500">
                <div
                  className="flex h-16 w-16 items-center justify-center rounded-2xl bg-slate-100 ring-1 ring-slate-200/80"
                  aria-hidden
                >
                  <MessageSquare className="h-8 w-8 text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-700">Select a conversation</p>
                  <p className="mt-1 text-xs text-slate-500">Choose someone from the list to read and reply. On mobile, tap a row to open the thread.</p>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      <Snackbar
        open={!!adminNotify}
        onClose={() => setAdminNotify(null)}
        autoHideDuration={10_000}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={() => setAdminNotify(null)} severity="info" variant="filled" sx={{ maxWidth: 520 }}>
          {adminNotify}
        </Alert>
      </Snackbar>
    </div>
  );
};

export default Chats;
