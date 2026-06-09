/** Format geo / saved-location payloads for checkout display. */

export type SavedLocationEntry = {
  name: string;
  location: Record<string, unknown>;
};

export function extractSavedLocations(preferenceData: unknown): SavedLocationEntry[] {
  if (Array.isArray(preferenceData) && preferenceData[0]?.savedLocations) {
    return preferenceData[0].savedLocations as SavedLocationEntry[];
  }
  if (
    preferenceData &&
    typeof preferenceData === "object" &&
    Array.isArray((preferenceData as { savedLocations?: SavedLocationEntry[] }).savedLocations)
  ) {
    return (preferenceData as { savedLocations: SavedLocationEntry[] }).savedLocations;
  }
  return [];
}

export function formatServiceAddressFromGeoLocation(location: unknown): string {
  if (!location || typeof location !== "object") return "";
  const loc = location as Record<string, unknown>;

  if (typeof loc.formatted_address === "string" && loc.formatted_address.trim()) {
    return loc.formatted_address.trim();
  }

  const addressList = loc.address;
  if (Array.isArray(addressList) && addressList[0]?.formatted_address) {
    return String(addressList[0].formatted_address).trim();
  }

  const lat = resolveLocationLat(location);
  const lng = resolveLocationLng(location);
  if (lat != null && lng != null) {
    return `Map location (${lat.toFixed(5)}, ${lng.toFixed(5)})`;
  }

  return "";
}

export function resolveLocationLat(location: unknown): number | null {
  if (!location || typeof location !== "object") return null;
  const loc = location as Record<string, unknown>;
  const geom = loc.geometry as { location?: { lat?: number } } | undefined;
  if (typeof geom?.location?.lat === "number") return geom.location.lat;
  if (typeof loc.lat === "number") return loc.lat;
  return null;
}

export function resolveLocationLng(location: unknown): number | null {
  if (!location || typeof location !== "object") return null;
  const loc = location as Record<string, unknown>;
  const geom = loc.geometry as { location?: { lng?: number } } | undefined;
  if (typeof geom?.location?.lng === "number") return geom.location.lng;
  if (typeof loc.lng === "number") return loc.lng;
  return null;
}

export function hasValidBookingLocation(location: unknown): boolean {
  const address = formatServiceAddressFromGeoLocation(location);
  if (address) return true;
  return resolveLocationLat(location) != null && resolveLocationLng(location) != null;
}

export function formatCustomerDisplayName(appUser: unknown): string {
  if (!appUser || typeof appUser !== "object") return "";
  const u = appUser as Record<string, unknown>;
  if (typeof u.name === "string" && u.name.trim()) return u.name.trim();
  const first = String(u.given_name || u.firstname || u.firstName || "").trim();
  const last = String(u.family_name || u.lastname || u.lastName || "").trim();
  return `${first} ${last}`.trim();
}

export function formatCustomerPhone(appUser: unknown): string {
  if (!appUser || typeof appUser !== "object") return "";
  const u = appUser as Record<string, unknown>;
  const phone = u.mobileno ?? u.mobileNo ?? u.mobile ?? u.phone;
  return phone != null ? String(phone).trim() : "";
}

export function formatSavedLocationAddress(saved: SavedLocationEntry): string {
  const loc = saved?.location;
  const named = formatServiceAddressFromGeoLocation(loc);
  if (named) return named;
  return saved?.name ? `${saved.name} location` : "";
}

const KNOWN_SAVED_LABELS: Record<string, string> = {
  home: "home",
  office: "office",
  others: "others",
};

/** Human-readable label for saved address names (Home, Office, custom). */
export function formatSavedLocationLabel(
  name: string,
  translate?: (key: string) => string
): string {
  const raw = String(name || "").trim();
  if (!raw) return "Address";

  const knownKey = KNOWN_SAVED_LABELS[raw.toLowerCase()];
  if (knownKey && translate) {
    const translated = translate(knownKey);
    if (translated && translated !== knownKey) return translated;
  }

  if (knownKey === "home") return "Home";
  if (knownKey === "office") return "Office";
  if (knownKey === "others") return "Other";

  return raw
    .split(/\s+/)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function locationsMatch(a: unknown, b: unknown): boolean {
  const latA = resolveLocationLat(a);
  const lngA = resolveLocationLng(a);
  const latB = resolveLocationLat(b);
  const lngB = resolveLocationLng(b);

  if (latA != null && lngA != null && latB != null && lngB != null) {
    return Math.abs(latA - latB) < 0.0001 && Math.abs(lngA - lngB) < 0.0001;
  }

  const addrA = formatServiceAddressFromGeoLocation(a);
  const addrB = formatServiceAddressFromGeoLocation(b);
  return addrA.length > 0 && addrA === addrB;
}
