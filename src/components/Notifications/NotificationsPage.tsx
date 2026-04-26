/* eslint-disable */
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { io, Socket } from "socket.io-client";
import {
  Bell,
  X,
  CheckCircle2,
  Inbox,
  PlayCircle,
  PartyPopper,
  Megaphone,
} from "lucide-react";
import PaymentInstance from "src/services/paymentInstance";
import { urls } from "src/config/urls";
import { useLanguage } from "src/context/LanguageContext";

export type InAppNotification = {
  id: string;
  type: string;
  title: string;
  body: string;
  engagementId: string | null;
  readAt: string | null;
  createdAt: string;
  metadata?: unknown;
};

const dialogSlotProps: {
  paper: { className: string };
  backdrop: { className: string };
} = {
  paper: {
    className:
      "relative w-[calc(100%-1.5rem)] max-w-lg overflow-hidden rounded-2xl shadow-2xl ring-1 ring-slate-900/10 m-0 sm:mx-4",
  },
  backdrop: { className: "bg-slate-900/40 backdrop-blur-[2px]" },
};

function timeAgo(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  const sec = (Date.now() - d.getTime()) / 1000;
  if (sec < 10) return "Just now";
  if (sec < 60) return "Moments ago";
  if (sec < 3600) return `${Math.floor(sec / 60)}m ago`;
  if (sec < 86400) return `${Math.floor(sec / 3600)}h ago`;
  if (sec < 604800) return `${Math.floor(sec / 86400)}d ago`;
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    year: d.getFullYear() !== new Date().getFullYear() ? "numeric" : undefined,
  });
}

function typeMeta(type: string): { label: string; Icon: React.ElementType; color: string } {
  const s = (type || "").toUpperCase();
  if (s === "BOOKING_ACCEPTED" || s.includes("ACCEPT")) {
    return { label: "Accepted", Icon: CheckCircle2, color: "#059669" };
  }
  if (s.includes("OPPORTUNITY") || s.includes("NEW_BOOKING") || s.includes("REQUEST")) {
    return { label: "New booking", Icon: Megaphone, color: "#0ea5e9" };
  }
  if (s === "SERVICE_DAY_STARTED" || s.includes("STARTED")) {
    return { label: "Service started", Icon: PlayCircle, color: "#d97706" };
  }
  if (s === "SERVICE_DAY_COMPLETED" || s.includes("COMPLETED")) {
    return { label: "Service done", Icon: PartyPopper, color: "#7c3aed" };
  }
  return { label: "Update", Icon: Bell, color: "#64748b" };
}

function recipientParams(
  appUser: any
): { recipientType: "customer" | "provider"; recipientId: string } | null {
  if (!appUser) return null;
  const role = String(appUser.role || "").toUpperCase();
  if (role === "SERVICE_PROVIDER" && appUser.serviceProviderId != null) {
    return { recipientType: "provider", recipientId: String(appUser.serviceProviderId) };
  }
  if (appUser.customerid != null) {
    return { recipientType: "customer", recipientId: String(appUser.customerid) };
  }
  return null;
}

type Props = {
  open: boolean;
  onClose: () => void;
  appUser: any;
  onUnreadCountChange?: (n: number) => void;
};

export default function NotificationsPage({ open, onClose, appUser, onUnreadCountChange }: Props) {
  const { t } = useLanguage();
  const [items, setItems] = useState<InAppNotification[]>([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [newIds, setNewIds] = useState<Set<string>>(new Set());

  const r = useMemo(
    () => recipientParams(appUser),
    [appUser?.role, appUser?.customerid, appUser?.serviceProviderId]
  );

  const fetchList = useCallback(async () => {
    if (!r) return;
    setLoading(true);
    setError(null);
    try {
      const { data } = await PaymentInstance.get("/api/in-app-notifications", {
        params: {
          recipientType: r.recipientType,
          recipientId: r.recipientId,
          limit: 50,
        },
      });
      const list = (data?.notifications || []) as InAppNotification[];
      setItems(list);
      setUnread(data?.unreadCount ?? 0);
      onUnreadCountChange?.(data?.unreadCount ?? 0);
    } catch (e: any) {
      setError(e?.message || "Could not load notifications");
    } finally {
      setLoading(false);
    }
  }, [r, onUnreadCountChange]);

  useEffect(() => {
    if (!open || !r) return;
    void fetchList();
  }, [open, r, fetchList]);

  useEffect(() => {
    if (!open || !r) return;

    const s: Socket = io(urls.payments, {
      transports: ["websocket"],
      withCredentials: true,
    });

    s.on("connect", () => {
      if (r.recipientType === "provider") {
        s.emit("join", { providerId: Number(r.recipientId) });
      } else {
        s.emit("join", { customerId: Number(r.recipientId) });
      }
    });

    s.on("in_app_notification", (n: InAppNotification) => {
      setItems((prev) => {
        const merged = [n, ...prev].filter(
          (x, i, a) => a.findIndex((y) => y.id === x.id) === i
        );
        return merged;
      });
      if (!n.readAt) {
        setNewIds((s0) => new Set(s0).add(String(n.id)));
        setUnread((u) => {
          const next = u + 1;
          onUnreadCountChange?.(next);
          return next;
        });
        window.setTimeout(() => {
          setNewIds((s0) => {
            const c = new Set(s0);
            c.delete(String(n.id));
            return c;
          });
        }, 1800);
      }
    });

    s.on("connect_error", (err) => {
      console.warn("in-app socket:", err?.message);
    });

    return () => {
      s.disconnect();
    };
  }, [open, r, onUnreadCountChange]);

  const markRead = async (n: InAppNotification) => {
    if (!r || n.readAt) return;
    try {
      await PaymentInstance.patch(`/api/in-app-notifications/${n.id}/read`, null, {
        params: { recipientType: r.recipientType, recipientId: r.recipientId },
      });
      setItems((prev) =>
        prev.map((x) => (x.id === n.id ? { ...x, readAt: new Date().toISOString() } : x))
      );
      setUnread((u) => {
        const next = Math.max(0, u - 1);
        onUnreadCountChange?.(next);
        return next;
      });
    } catch (e) {
      console.error(e);
    }
  };

  const markAll = async () => {
    if (!r) return;
    try {
      await PaymentInstance.post("/api/in-app-notifications/read-all", {
        recipientType: r.recipientType,
        recipientId: r.recipientId,
      });
      setItems((prev) =>
        prev.map((x) => ({ ...x, readAt: x.readAt || new Date().toISOString() }))
      );
      setUnread(0);
      onUnreadCountChange?.(0);
    } catch (e) {
      console.error(e);
    }
  };

  if (!r) {
    return (
      <Dialog
        open={open}
        onClose={onClose}
        fullWidth
        maxWidth="sm"
        scroll="body"
        slotProps={dialogSlotProps}
      >
        <div className="border-b border-white/10 bg-gradient-to-r from-sky-700 via-slate-800 to-slate-900 px-4 py-3.5 pr-12 text-white sm:px-5 sm:py-4">
          <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/90 sm:text-xs">
            Notifications
          </p>
          <DialogTitle
            className="!m-0 !p-0 !pt-0.5 !text-base !font-semibold !leading-tight !text-white sm:!text-lg"
            component="div"
            id="notifications-guest-title"
          >
            Stay updated
          </DialogTitle>
        </div>
        <IconButton
          aria-label="close"
          onClick={onClose}
          className="!absolute !right-2 !top-2 h-9 w-9 !rounded-lg !text-white hover:!bg-white/10 sm:!right-3 sm:!top-3"
        >
          <X className="h-5 w-5" />
        </IconButton>

        <DialogContent className="!p-0">
          <p className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-left text-xs leading-snug text-slate-600 sm:px-5 sm:text-sm">
            <Inbox
              className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5 text-sky-600 sm:h-4 sm:w-4"
              aria-hidden
            />
            Sign in as a customer or service provider to see updates here.
          </p>
          <div className="px-4 py-6 sm:px-5">
            <p className="text-center text-sm text-slate-600">
              Booking and service events will show in this list after you sign in.
            </p>
          </div>
        </DialogContent>

        <DialogActions className="!m-0 !flex !flex-col-reverse !gap-2 !border-t !border-slate-200 !bg-slate-50/60 !p-3 sm:!flex-row sm:!justify-end sm:!gap-3 sm:!p-4">
          <Button
            type="button"
            onClick={onClose}
            className="!w-full !justify-center !border-slate-300 !text-slate-700 hover:!bg-slate-100 sm:!w-auto"
          >
            {t("cancel")}
          </Button>
        </DialogActions>
      </Dialog>
    );
  }

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      scroll="body"
      aria-labelledby="notifications-title"
      slotProps={dialogSlotProps}
    >
      <div className="border-b border-white/10 bg-gradient-to-r from-sky-700 via-slate-800 to-slate-900 px-4 py-3.5 pr-12 text-white sm:px-5 sm:py-4">
        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-sky-200/90 sm:text-xs">
          Activity
        </p>
        <DialogTitle
          className="!m-0 !p-0 !pt-0.5 !text-base !font-semibold !leading-tight !text-white sm:!text-lg"
          component="div"
          id="notifications-title"
        >
          Notifications
        </DialogTitle>
      </div>
      <IconButton
        aria-label="close"
        onClick={onClose}
        className="!absolute !right-2 !top-2 h-9 w-9 !rounded-lg !text-white hover:!bg-white/10 sm:!right-3 sm:!top-3"
      >
        <X className="h-5 w-5" />
      </IconButton>

      <DialogContent className="!p-0">
        <p className="border-b border-slate-100 bg-slate-50/80 px-4 py-2 text-left text-xs leading-snug text-slate-600 sm:px-5 sm:text-sm">
          <Bell
            className="mr-1.5 -mt-0.5 inline h-3.5 w-3.5 text-sky-600 sm:h-4 sm:w-4"
            aria-hidden
          />
          {unread > 0
            ? `${unread} unread — open an item to mark it read, or use Mark all as read.`
            : "Stay on top of bookings, visits, and acceptances. New items appear in real time."}
        </p>

        <div
          className="max-h-[min(50vh,420px)] min-h-[12rem] overflow-y-auto"
          style={{ WebkitOverflowScrolling: "touch" as const }}
        >
          {loading && items.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 py-10">
              <CircularProgress size={36} thickness={4} />
              <p className="text-sm text-slate-600">Loading your activity…</p>
            </div>
          ) : null}

          {error ? (
            <div className="px-4 py-6 text-center sm:px-5">
              <p className="mb-3 text-sm text-red-600">{error}</p>
              <Button
                type="button"
                variant="outlined"
                size="small"
                onClick={() => void fetchList()}
                className="!border-sky-600 !text-sky-600 hover:!bg-sky-50"
              >
                Try again
              </Button>
            </div>
          ) : null}

          {!loading && !error && items.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-6 py-10 text-center">
              <span className="mb-1 inline-flex rounded-full bg-slate-100 p-3 text-slate-500">
                <Inbox className="h-8 w-8" strokeWidth={1.5} />
              </span>
              <p className="text-sm font-semibold text-slate-800">Nothing new yet</p>
              <p className="max-w-sm text-sm leading-relaxed text-slate-500">
                When a booking is accepted, a visit starts, or a service is completed, you will see
                it here.
              </p>
            </div>
          ) : null}

          <List component="ol" disablePadding sx={{ listStyle: "none" }} className="pb-2">
            {items.map((n) => {
              const unreadItem = !n.readAt;
              const meta = typeMeta(n.type);
              const TypeIcon = meta.Icon;
              const tNew = newIds.has(String(n.id));
              return (
                <ListItem
                  key={n.id}
                  component="li"
                  disableGutters
                  sx={{ display: "block" }}
                  className="px-2 pt-0 sm:px-3"
                >
                  <Paper
                    variant="outlined"
                    onClick={() => (unreadItem ? void markRead(n) : undefined)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && unreadItem) void markRead(n);
                    }}
                    role={unreadItem ? "button" : "article"}
                    tabIndex={unreadItem ? 0 : -1}
                    aria-label={unreadItem ? `${n.title}, unread. Press to mark as read` : n.title}
                    elevation={0}
                    sx={{
                      m: 0.75,
                      mb: 0.5,
                      p: 1.5,
                      borderColor: (th) => (unreadItem ? alpha(th.palette.primary.main, 0.35) : th.palette.divider),
                      borderWidth: 1.5,
                      borderLeftWidth: unreadItem ? 4 : 1,
                      borderLeftColor: unreadItem ? "primary.main" : "transparent",
                      bgcolor: unreadItem ? "rgba(37, 99, 235, 0.04)" : "background.paper",
                      boxShadow: tNew
                        ? `0 0 0 1px ${alpha("#2563eb", 0.2)}`
                        : "none",
                      transition: "all 0.2s ease",
                      cursor: unreadItem ? "pointer" : "default",
                      borderRadius: 2,
                      "&:hover": unreadItem
                        ? { bgcolor: (th) => alpha(th.palette.primary.main, 0.07) }
                        : { bgcolor: "action.hover" },
                      "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main" },
                    }}
                  >
                    <Stack direction="row" alignItems="flex-start" gap={1.5}>
                      <Box
                        sx={{
                          p: 1,
                          borderRadius: 1.5,
                          flexShrink: 0,
                          bgcolor: alpha(meta.color, 0.1),
                          color: meta.color,
                          display: "inline-flex",
                        }}
                      >
                        <TypeIcon size={20} strokeWidth={2} />
                      </Box>
                      <ListItemText
                        primaryTypographyProps={{ component: "div" }}
                        secondaryTypographyProps={{ component: "div" }}
                        primary={
                          <Stack
                            direction="row"
                            alignItems="center"
                            flexWrap="wrap"
                            gap={0.75}
                            mb={0.25}
                          >
                            <Typography
                              fontWeight={unreadItem ? 800 : 600}
                              variant="body1"
                              component="span"
                              lineHeight={1.35}
                              className="text-slate-900"
                            >
                              {n.title}
                            </Typography>
                            {unreadItem && (
                              <Chip
                                size="small"
                                label="New"
                                color="primary"
                                sx={{ height: 20, fontSize: 10, fontWeight: 800 }}
                              />
                            )}
                          </Stack>
                        }
                        secondary={
                          <Stack component="div" alignItems="flex-start" gap={0.5} pt={0.5}>
                            {n.body && (
                              <Typography variant="body2" color="text.secondary" lineHeight={1.45}>
                                {n.body}
                              </Typography>
                            )}
                            <Stack
                              direction="row"
                              flexWrap="wrap"
                              alignItems="center"
                              justifyContent="space-between"
                              width="100%"
                              gap={0.5}
                              sx={{ mt: 0.5 }}
                            >
                              <Stack direction="row" alignItems="center" gap={0.5}>
                                <Typography variant="caption" color="text.disabled" fontWeight={500}>
                                  {meta.label}
                                </Typography>
                                {n.engagementId && (
                                  <>
                                    <Typography variant="caption" color="text.disabled">·</Typography>
                                    <Typography
                                      component="code"
                                      variant="caption"
                                      color="text.secondary"
                                      fontFamily="ui-monospace, monospace"
                                      sx={{ bgcolor: "action.hover", px: 0.5, borderRadius: 0.5 }}
                                    >
                                      #{n.engagementId}
                                    </Typography>
                                  </>
                                )}
                              </Stack>
                              <Typography variant="caption" color="text.disabled" fontWeight={500}>
                                {timeAgo(n.createdAt)}
                              </Typography>
                            </Stack>
                          </Stack>
                        }
                      />
                    </Stack>
                  </Paper>
                </ListItem>
              );
            })}
          </List>
        </div>
      </DialogContent>

      <DialogActions className="!m-0 !flex !flex-col-reverse !gap-2 !border-t !border-slate-200 !bg-slate-50/60 !p-3 sm:!flex-row sm:!justify-end sm:!gap-3 sm:!p-4">
        <Button
          type="button"
          onClick={onClose}
          className="!w-full !justify-center !border-slate-300 !text-slate-700 hover:!bg-slate-100 sm:!w-auto"
        >
          {t("cancel")}
        </Button>
        {unread > 0 && (
          <Button
            type="button"
            onClick={markAll}
            className="!w-full !justify-center !border-sky-600 !bg-sky-600 !text-white hover:!bg-sky-700 sm:!w-auto"
          >
            Mark all as read
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
}
