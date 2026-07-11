function nonEmptyId(value: unknown): string | undefined {
  if (value == null || value === "") return undefined;
  return String(value);
}

/** Resolve provider id from API / Redux shapes (camelCase or legacy lowercase). */
export function resolveProviderId(
  source: Record<string, unknown> | null | undefined
): string | undefined {
  if (!source) return undefined;
  return (
    nonEmptyId(source.serviceproviderid) ??
    nonEmptyId(source.serviceProviderId) ??
    nonEmptyId(source.serviceproviderId) ??
    nonEmptyId(source.id)
  );
}

export function resolveEffectiveServiceRole(
  searchRole: string | null | undefined,
  provider: {
    housekeepingRole?: string | null;
    housekeepingRoles?: string[] | null;
  }
): string {
  const search = String(searchRole || "").trim().toUpperCase();
  const offered = (
    provider.housekeepingRoles?.length
      ? provider.housekeepingRoles
      : provider.housekeepingRole
        ? [provider.housekeepingRole]
        : []
  )
    .map((role) => {
      let r = String(role).trim().toUpperCase();
      if (r === "CAREGIVER") r = "NANNY";
      return r;
    })
    .filter(Boolean);

  if (search && offered.includes(search)) return search;
  
  let fallback = String(provider.housekeepingRole || offered[0] || "").trim().toUpperCase();
  if (fallback === "CAREGIVER") fallback = "NANNY";
  
  return fallback;
}
