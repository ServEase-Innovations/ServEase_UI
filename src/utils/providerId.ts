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

/** Use the role the customer searched for when the provider offers it. */
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
    .map((role) => String(role).trim().toUpperCase())
    .filter(Boolean);

  if (search && offered.includes(search)) return search;
  return String(provider.housekeepingRole || offered[0] || "").trim().toUpperCase();
}
