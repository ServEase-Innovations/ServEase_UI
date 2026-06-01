import { useMemo } from "react";
import { cn } from "../utils";
import type { TicketComment, SupportTicket } from "src/services/ticketsService";

type Props = {
  comments: TicketComment[] | undefined;
  /** Include resolution_notes in thread when missing from comments (older tickets). */
  ticket?: Pick<SupportTicket, "resolution_notes" | "resolved_at" | "updated_at">;
  emptyLabel?: string;
  className?: string;
};

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
    <div className={cn("space-y-2", className)}>
      {list.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyLabel}</p>
      ) : (
        list.map((c) => {
          const isAdmin = String(c.author_type).toUpperCase() === "ADMIN";
          const isInternal = Boolean(c.is_internal);
          return (
            <div
              key={c.comment_id}
              className={cn(
                "rounded-lg border p-2.5 text-sm",
                isInternal && "bg-amber-50 border-amber-200",
                !isInternal && isAdmin && "bg-violet-50 border-violet-200",
                !isInternal && !isAdmin && "bg-slate-50 border-slate-200"
              )}
            >
              <p className="text-xs font-medium text-slate-600 mb-1">
                {isAdmin ? (isInternal ? "Support (internal)" : "Support team") : "Customer"}
                {c.author_name ? ` · ${c.author_name}` : ""}
                {" · "}
                {new Date(c.created_at).toLocaleString()}
              </p>
              <p className="text-slate-900 whitespace-pre-wrap leading-relaxed">{c.body}</p>
            </div>
          );
        })
      )}
    </div>
  );
}
