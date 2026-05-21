export interface MaidPricingRow {
  _id?: string;
  Service?: string;
  Type?: string;
  Categories?: string;
  "Sub-Categories"?: string;
  "Numbers/Size"?: string;
  "Price /Day (INR)"?: number;
  "Price /Month (INR)"?: number;
  "Price /Visit (INR)"?: number;
  "Price /Week (INR)"?: number;
  "Job Description"?: string;
  BookingType?: string;
}

export type HouseSize = "1BHK" | "2BHK" | "3BHK" | "4BHK+";

export const HOUSE_SIZES: HouseSize[] = ["1BHK", "2BHK", "3BHK", "4BHK+"];

export function flattenMaidPricing(data: unknown): MaidPricingRow[] {
  if (!data) return [];
  if (Array.isArray(data)) return data as MaidPricingRow[];
  if (typeof data === "object") {
    const flat: MaidPricingRow[] = [];
    Object.values(data as Record<string, unknown>).forEach((v) => {
      if (Array.isArray(v)) flat.push(...(v as MaidPricingRow[]));
    });
    return flat;
  }
  return [];
}

export function matchesNumericBand(band: string, value: number): boolean {
  const s = band.trim();
  if (/^<=\s*\d+$/i.test(s)) return value <= parseInt(s.replace(/[^\d]/g, ""), 10);
  if (/^>=\s*\d+$/i.test(s)) return value >= parseInt(s.replace(/[^\d]/g, ""), 10);
  const range = s.match(/^(\d+)\s*-\s*(\d+)$/);
  if (range) {
    const min = parseInt(range[1], 10);
    const max = parseInt(range[2], 10);
    return value >= min && value <= max;
  }
  if (/^\d+$/.test(s)) return value === parseInt(s, 10);
  return false;
}

export function isOnDemandBooking(
  bookingPreference?: string,
  bookingTypeCode?: string
): boolean {
  if (bookingTypeCode === "ON_DEMAND") return true;
  return bookingPreference?.toLowerCase() === "date";
}

export function isShortTermBooking(
  bookingPreference?: string,
  bookingTypeCode?: string
): boolean {
  if (bookingTypeCode === "SHORT_TERM") return true;
  return bookingPreference?.toLowerCase() === "short term";
}

/** @deprecated use isOnDemandBooking */
export function isOnDemandCatalog(bookingPreference?: string): boolean {
  return isOnDemandBooking(bookingPreference);
}

/** Keep rows that match the active booking mode (On Demand vs Regular). */
export function filterMaidRowsForBooking(
  rows: MaidPricingRow[],
  bookingPreference?: string,
  bookingTypeCode?: string
): MaidPricingRow[] {
  if (!rows.length) return rows;

  const onDemand = isOnDemandBooking(bookingPreference, bookingTypeCode);
  const shortTerm = isShortTermBooking(bookingPreference, bookingTypeCode);

  const matchOnDemand = (r: MaidPricingRow) => {
    const bt = String(r.BookingType ?? "").toLowerCase();
    if (bt) return bt.includes("on demand") || bt === "on_demand";
    return String(r.Type ?? "").toLowerCase().includes("on demand");
  };

  const matchRegular = (r: MaidPricingRow) => {
    const bt = String(r.BookingType ?? "").toLowerCase();
    if (bt) return bt.includes("regular");
    return String(r.Type ?? "").toLowerCase().includes("regular");
  };

  if (onDemand) {
    const matched = rows.filter(matchOnDemand);
    return matched.length ? matched : rows;
  }

  if (shortTerm) {
    const matched = rows.filter((r) => matchOnDemand(r) || !matchRegular(r));
    return matched.length ? matched : rows;
  }

  const matched = rows.filter(matchRegular);
  return matched.length ? matched : rows;
}

export function findMaidPricingRow(
  rows: MaidPricingRow[],
  category: string,
  subCategory?: string,
  sizeLabelOrBand?: string,
  numericForBand?: number
): MaidPricingRow | undefined {
  if (!rows.length) return undefined;

  const candidates = rows.filter(
    (r) =>
      String(r.Service || "").toLowerCase() === "maid" &&
      String(r.Categories || "").toLowerCase() === category.toLowerCase()
  );
  if (!candidates.length) return undefined;

  const rowsSub = subCategory
    ? candidates.filter(
        (r) => String(r["Sub-Categories"] || "").toLowerCase() === subCategory.toLowerCase()
      )
    : candidates;
  if (!rowsSub.length) return undefined;

  if (sizeLabelOrBand) {
    const exact = rowsSub.find(
      (r) =>
        String(r["Numbers/Size"] || "").toLowerCase() === String(sizeLabelOrBand).toLowerCase()
    );
    if (exact) return exact;
  }

  if (numericForBand != null) {
    const bandHit = rowsSub.find(
      (r) => r["Numbers/Size"] && matchesNumericBand(String(r["Numbers/Size"]), numericForBand)
    );
    if (bandHit) return bandHit;
  }

  return rowsSub[0];
}

/**
 * On-demand catalog: admin/export uses **`Price /Day (INR)`** only (Pricing.tsx PriceCell `/day`).
 * Monthly: **`Price /Month (INR)`**, then day as fallback if month missing.
 */
export function getCatalogPrice(
  row: MaidPricingRow | undefined,
  bookingPreference?: string,
  bookingTypeCode?: string
): number {
  if (!row) return 0;

  if (isOnDemandBooking(bookingPreference, bookingTypeCode)) {
    const day = Number(row["Price /Day (INR)"]);
    if (Number.isFinite(day) && day > 0) return day;
    const visit = Number(row["Price /Visit (INR)"]);
    if (Number.isFinite(visit) && visit > 0) return visit;
    return 0;
  }

  if (isShortTermBooking(bookingPreference, bookingTypeCode)) {
    const day = Number(row["Price /Day (INR)"]);
    if (Number.isFinite(day) && day > 0) return day;
    const visit = Number(row["Price /Visit (INR)"]);
    if (Number.isFinite(visit) && visit > 0) return visit;
    return 0;
  }

  const month = Number(row["Price /Month (INR)"]);
  if (Number.isFinite(month) && month > 0) return month;
  const dayFall = Number(row["Price /Day (INR)"]);
  return Number.isFinite(dayFall) && dayFall > 0 ? dayFall : 0;
}

/** Admin on-demand lists prices as **`/ day`** → keep label consistent */
export function getPriceUnitSuffix(
  bookingPreference?: string,
  bookingTypeCode?: string,
  row?: MaidPricingRow
): string {
  void row;
  if (isOnDemandBooking(bookingPreference, bookingTypeCode)) return "/day";
  if (isShortTermBooking(bookingPreference, bookingTypeCode)) return "/day";
  return "/mo";
}

export function parseJobDescription(text?: string): string[] {
  if (!text) return [];
  return text
    .split("\n")
    .map((line) => line.replace(/^[•\-]\s*/, "").trim())
    .filter(Boolean);
}

export function formatInr(n: number): string {
  return `₹${Math.round(n).toLocaleString("en-IN")}`;
}

export function getBookingTypeFromPreference(bookingPreference?: string): string {
  if (!bookingPreference) return "MONTHLY";
  const pref = bookingPreference.toLowerCase().trim().replace(/_/g, " ");
  if (pref === "date" || pref === "on demand" || pref === "on-demand") return "ON_DEMAND";
  if (pref === "short term" || pref === "shortterm") return "SHORT_TERM";
  return "MONTHLY";
}

export function formatDateOnly(value?: string | null): string {
  if (!value) return "";
  const s = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

export function computeDurationDays(startDate?: string, endDate?: string): number {
  const start = formatDateOnly(startDate);
  if (!start) return 1;
  const end = formatDateOnly(endDate) || start;
  const s = new Date(`${start}T12:00:00`);
  const e = new Date(`${end}T12:00:00`);
  const diff = Math.round((e.getTime() - s.getTime()) / 86400000);
  return Math.max(1, diff + 1);
}

export type MaidOptionKind = "people" | "house" | "number" | "none";

export interface MaidCatalogTask {
  id: string;
  category: string;
  subCategory: string;
  optionKind: MaidOptionKind;
  rows: MaidPricingRow[];
  houseSizeOptions: string[];
}

export interface MaidTaskSelection {
  selected: boolean;
  persons: number;
  houseSize: string;
  bathrooms: number;
}

export function categoryToTaskId(category: string): string {
  return category
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "_")
    .replace(/^_|_$/g, "");
}

export function inferOptionKind(subCategory: string): MaidOptionKind {
  const s = subCategory.toLowerCase();
  if (s.includes("people")) return "people";
  if (s.includes("house")) return "house";
  if (s.includes("number")) return "number";
  return "none";
}

function resolveFromPool(
  pool: MaidPricingRow[],
  subCategory: string,
  sizeLabelOrBand?: string,
  numericForBand?: number
): MaidPricingRow | undefined {
  if (!pool.length) return undefined;

  const rowsSub = subCategory
    ? pool.filter(
        (r) => String(r["Sub-Categories"] || "").toLowerCase() === subCategory.toLowerCase()
      )
    : pool;
  if (!rowsSub.length) return undefined;

  if (sizeLabelOrBand) {
    const exact = rowsSub.find(
      (r) =>
        String(r["Numbers/Size"] || "").toLowerCase() === String(sizeLabelOrBand).toLowerCase()
    );
    if (exact) return exact;
  }

  if (numericForBand != null) {
    const bandHit = rowsSub.find(
      (r) => r["Numbers/Size"] && matchesNumericBand(String(r["Numbers/Size"]), numericForBand)
    );
    if (bandHit) return bandHit;
  }

  return rowsSub[0];
}

/** One UI row per `Categories` value in the maid catalog (booking-filtered). */
export function buildMaidCatalogTasks(rows: MaidPricingRow[]): MaidCatalogTask[] {
  const byCategory = new Map<string, MaidPricingRow[]>();

  for (const row of rows) {
    const cat = String(row.Categories ?? "").trim();
    if (!cat) continue;
    const list = byCategory.get(cat) ?? [];
    list.push(row);
    byCategory.set(cat, list);
  }

  const tasks: MaidCatalogTask[] = [];
  for (const [category, catRows] of Array.from(byCategory.entries())) {
    const subCategory = String(catRows[0]["Sub-Categories"] ?? "").trim();
    const optionKind = inferOptionKind(subCategory);
    const houseSizeOptions =
      optionKind === "house"
        ? Array.from(
            new Set(
              catRows
                .map((r) => String(r["Numbers/Size"] ?? "").trim())
                .filter(Boolean)
            )
          )
        : [];

    tasks.push({
      id: categoryToTaskId(category),
      category,
      subCategory,
      optionKind,
      rows: catRows,
      houseSizeOptions,
    });
  }

  return tasks.sort((a, b) => a.category.localeCompare(b.category));
}

export function resolveTaskRow(
  task: MaidCatalogTask,
  selection: Pick<MaidTaskSelection, "persons" | "houseSize" | "bathrooms">
): MaidPricingRow | undefined {
  const { optionKind, rows, subCategory } = task;
  if (optionKind === "people") {
    return resolveFromPool(rows, subCategory, undefined, selection.persons);
  }
  if (optionKind === "house") {
    return resolveFromPool(rows, subCategory, selection.houseSize);
  }
  if (optionKind === "number") {
    return resolveFromPool(rows, subCategory, undefined, selection.bathrooms);
  }
  return resolveFromPool(rows, subCategory);
}

export function getTaskCatalogPrice(
  task: MaidCatalogTask,
  selection: Pick<MaidTaskSelection, "persons" | "houseSize" | "bathrooms">,
  bookingPreference?: string,
  bookingTypeCode?: string
): number {
  const row = resolveTaskRow(task, selection);
  return getCatalogPrice(row, bookingPreference, bookingTypeCode);
}

export function defaultTaskSelection(task: MaidCatalogTask): MaidTaskSelection {
  return {
    selected: false,
    persons: 3,
    houseSize: task.houseSizeOptions[0] ?? HOUSE_SIZES[1] ?? "2BHK",
    bathrooms: 2,
  };
}

export function taskDetailsPayload(
  task: MaidCatalogTask,
  selection: MaidTaskSelection
): Record<string, unknown> {
  const base: Record<string, unknown> = { category: task.category };
  if (task.optionKind === "people") base.persons = selection.persons;
  if (task.optionKind === "house") base.houseSize = selection.houseSize;
  if (task.optionKind === "number") base.bathrooms = selection.bathrooms;
  return base;
}
