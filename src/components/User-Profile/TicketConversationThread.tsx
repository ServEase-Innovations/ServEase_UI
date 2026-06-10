import { useMemo } from "react";
import { cn } from "../utils";
import type { TicketComment, SupportTicket } from "src/services/ticketsService";

type Props = {
  comments: TicketComment[] | undefined;
  /** Include resolution_notes in thread when missing from comments (older tickets). */
  ticket?: Pick<SupportTicket, "resolution_notes" | "resolved_at" | "updated_at"> | null;
  emptyLabel?: string;
  className?: string;
};

function formatWhen(iso: string) {
  try {
    return new Date(iso).toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return iso;
  }
}

export function TicketConversationThread({
  comments,
  ticket,
  emptyLabel = "No messages yet.",
  className,
}: Props) {
  const list = useMemo(() => {
    const base = [...(comments ?? [])];
    const notes = ticket?.resolution_notes?.trim();
    if (notes) {
      const already = base.some(
        (c) =>
          String(c.author_type).toUpperCase() === "ADMIN" &&
          c.body.trim() === notes
      );
      if (!already) {
        base.push({
          comment_id: -1,
          author_type: "ADMIN",
          author_id: null,
          author_name: "Support team",
          body: notes,
          is_internal: false,
          created_at: ticket?.resolved_at || ticket?.updated_at || new Date().toISOString(),
        });
      }
    }
    return base.sort(
      (a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
    );
  }, [comments, ticket?.resolution_notes, ticket?.resolved_at, ticket?.updated_at]);

  return (
    <div className={cn("space-y-3", className)}>
      {list.length === 0 ? (
        <p className="py-6 text-center text-sm text-slate-500">{emptyLabel}</p>
      ) : (
        list.map((c) => {
          const isAdmin = String(c.author_type).toUpperCase() === "ADMIN";
          const isInternal = Boolean(c.is_internal);
          const isSystem = String(c.author_type).toUpperCase() === "SYSTEM";

          return (
            <div
              key={c.comment_id}
              className={cn("flex", isAdmin || isSystem ? "justify-start" : "justify-end")}
            >
              <div
                className={cn(
                  "max-w-[92%] rounded-2xl px-3 py-2.5 text-sm shadow-sm sm:max-w-[85%]",
                  isInternal && "rounded-lg border border-amber-200 bg-amber-50",
                  !isInternal && isAdmin && "rounded-bl-md border border-violet-100 bg-violet-50",
                  !isInternal && !isAdmin && "rounded-br-md border border-sky-100 bg-sky-50"
                )}
              >
                <p
                  className={cn(
                    "mb-1 text-[11px] font-medium",
                    isAdmin ? "text-violet-700" : "text-sky-700"
                  )}
                >
                  {isAdmin
                    ? isInternal
                      ? "Support (internal)"
                      : "Support team"
                    : "You"}
                  {c.author_name && !isAdmin ? "" : c.author_name ? ` · ${c.author_name}` : ""}
                  <span className="font-normal text-slate-400"> · {formatWhen(c.created_at)}</span>
                </p>
                <p className="leading-relaxed text-slate-900 whitespace-pre-wrap">{c.body}</p>
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
