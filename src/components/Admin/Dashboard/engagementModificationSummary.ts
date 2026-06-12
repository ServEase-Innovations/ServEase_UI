export type ModChangeLine = {
  field: string;
  previous?: string;
  next?: string;
  detail?: string;
};

export type ModSummary = {
  headline: string;
  lines: ModChangeLine[];
};

const CURRENCY_KEY =
  /^(refund|refund_amount|penalty|modification_fee|base_amount|customer_credit|customer_debit|provider_credit|provider_debit|payout_adjustment|refund_delta|refund_reversed|amount)$/i;

const SKIP_KEYS = new Set(["modification_type", "source", "razorpay_order_id"]);

function humanizeKey(key: string): string {
  return key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/([A-Z]+)([A-Z][a-z])/g, "$1 $2")
    .replace(/_/g, " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

function formatInr(amount: number): string {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(amount);
}

const DAY_COUNT_KEY = /^(leave_days|total_days|days_added|days_removed)$/i;

function formatScalar(key: string, value: unknown): string {
  if (value == null || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "number") {
    if (CURRENCY_KEY.test(key)) return formatInr(value);
    if (DAY_COUNT_KEY.test(key)) {
      const n = Math.round(value);
      return `${n} day${n === 1 ? "" : "s"}`;
    }
    return Number.isInteger(value) ? String(value) : value.toFixed(2);
  }
  if (Array.isArray(value)) {
    if (value.length === 0) return "None";
    const allDates = value.every((v) => typeof v === "string" && /^\d{4}-\d{2}-\d{2}/.test(v));
    if (allDates) {
      return value.length <= 4 ? value.join(", ") : `${value.slice(0, 3).join(", ")} +${value.length - 3} more`;
    }
    return `${value.length} item(s)`;
  }
  if (typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>).filter(
      ([, v]) => v != null && v !== ""
    );
    if (entries.length === 0) return "—";
    if (entries.length <= 3) {
      return entries.map(([k, v]) => `${humanizeKey(k)}: ${formatScalar(k, v)}`).join("; ");
    }
    return `${entries.length} nested field(s)`;
  }
  return String(value);
}

function headlineFromType(modType: string | undefined): string {
  const t = String(modType || "").toUpperCase();
  const map: Record<string, string> = {
    VACATION_ADDED: "Vacation added",
    VACATION_MODIFIED: "Vacation updated",
    VACATION_CANCELLED: "Vacation cancelled",
    SCHEDULE_MODIFIED: "Schedule updated",
    SCHEDULE_MODIFICATION_PENDING: "Schedule change pending payment",
  };
  if (map[t]) return map[t];
  if (t) return humanizeKey(t.toLowerCase());
  return "Engagement updated";
}

function pairObjects(
  previous: Record<string, unknown> | null | undefined,
  updated: Record<string, unknown> | null | undefined
): ModChangeLine[] {
  const lines: ModChangeLine[] = [];
  const keys = Array.from(
    new Set([...Object.keys(previous || {}), ...Object.keys(updated || {})])
  );

  for (const key of keys) {
    if (SKIP_KEYS.has(key)) continue;
    const prev = previous?.[key];
    const next = updated?.[key];
    if (prev === undefined && next === undefined) continue;

    const label = humanizeKey(key);
    if (prev !== undefined && next !== undefined && String(prev) !== String(next)) {
      lines.push({
        field: label,
        previous: formatScalar(key, prev),
        next: formatScalar(key, next),
      });
    } else if (next !== undefined) {
      lines.push({ field: label, detail: formatScalar(key, next) });
    } else if (prev !== undefined) {
      lines.push({ field: label, previous: formatScalar(key, prev), next: "Removed" });
    }
  }
  return lines;
}

function flattenUpdatedFields(body: Record<string, unknown>): ModChangeLine[] {
  return Object.entries(body)
    .filter(([key, val]) => !SKIP_KEYS.has(key) && val != null && val !== "")
    .map(([key, val]) => ({
      field: humanizeKey(key),
      detail: formatScalar(key, val),
    }));
}

function sectionLines(title: string, obj: Record<string, unknown> | null | undefined): ModChangeLine[] {
  if (!obj || typeof obj !== "object") return [];
  return Object.entries(obj)
    .filter(([key, val]) => !SKIP_KEYS.has(key) && val != null && val !== "")
    .map(([key, val]) => ({
      field: `${title}: ${humanizeKey(key)}`,
      detail: formatScalar(key, val),
    }));
}

export function parseModifiedFields(raw: unknown): Record<string, unknown> | null {
  if (raw == null) return null;
  if (typeof raw === "string") {
    try {
      const parsed = JSON.parse(raw) as unknown;
      return parsed && typeof parsed === "object" && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : null;
    } catch {
      return null;
    }
  }
  if (typeof raw === "object" && !Array.isArray(raw)) {
    return raw as Record<string, unknown>;
  }
  return null;
}

export function buildModificationSummary(
  modifiedFields: unknown,
  ctx?: {
    modificationType?: string | null;
    oldStartDate?: string | null;
    newStartDate?: string | null;
  }
): ModSummary {
  const fields = parseModifiedFields(modifiedFields);
  const modType =
    (fields?.modification_type as string | undefined) || ctx?.modificationType || undefined;
  const headline = headlineFromType(modType);
  const lines: ModChangeLine[] = [];

  if (fields) {
    if (fields.previous || fields.updated) {
      lines.push(
        ...pairObjects(
          fields.previous as Record<string, unknown> | undefined,
          fields.updated as Record<string, unknown> | undefined
        )
      );
    }

    if (fields.updated_fields && typeof fields.updated_fields === "object") {
      lines.push(...flattenUpdatedFields(fields.updated_fields as Record<string, unknown>));
    }

    if (fields.difference && typeof fields.difference === "object") {
      lines.push(...sectionLines("Change", fields.difference as Record<string, unknown>));
    }

    if (fields.wallet_effect && typeof fields.wallet_effect === "object") {
      lines.push(...sectionLines("Wallet", fields.wallet_effect as Record<string, unknown>));
    }

    if (fields.availability_changes && typeof fields.availability_changes === "object") {
      lines.push(
        ...sectionLines("Availability", fields.availability_changes as Record<string, unknown>)
      );
    }

    // Shorthand payloads: { updated: { refund, leave_days } } without previous
    if (
      lines.length === 0 &&
      fields.updated &&
      typeof fields.updated === "object" &&
      !fields.previous
    ) {
      lines.push(...flattenUpdatedFields(fields.updated as Record<string, unknown>));
    }

    if (lines.length === 0) {
      lines.push(...flattenUpdatedFields(fields));
    }
  }

  if (ctx?.oldStartDate || ctx?.newStartDate) {
    const hasStart = lines.some((l) => l.field.toLowerCase().includes("start date"));
    if (!hasStart && ctx.oldStartDate !== ctx.newStartDate) {
      lines.unshift({
        field: "Start date",
        previous: ctx.oldStartDate || "—",
        next: ctx.newStartDate || "—",
      });
    }
  }

  return { headline, lines };
}

export function formatModificationSummaryShort(
  modifiedFields: unknown,
  ctx?: {
    modificationType?: string | null;
    oldStartDate?: string | null;
    newStartDate?: string | null;
  }
): string {
  const { headline, lines } = buildModificationSummary(modifiedFields, ctx);
  if (lines.length === 0) return headline;

  const body = lines.slice(0, 4).map((line) => {
    if (line.previous != null && line.next != null) {
      return `• ${line.field}: ${line.previous} → ${line.next}`;
    }
    if (line.detail) return `• ${line.field}: ${line.detail}`;
    return `• ${line.field}`;
  });

  if (lines.length > 4) {
    body.push(`• +${lines.length - 4} more change(s)`);
  }

  return [headline, ...body].join("\n");
}
