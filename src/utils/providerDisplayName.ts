export type ProviderNameFields = {
  firstName?: string | null;
  firstname?: string | null;
  middleName?: string | null;
  middlename?: string | null;
  lastName?: string | null;
  lastname?: string | null;
};

export function trimNamePart(value: string | null | undefined): string {
  return String(value ?? "").trim();
}

export function formatProviderDisplayName(
  provider: ProviderNameFields | null | undefined
): string {
  if (!provider) return "";
  const first = trimNamePart(provider.firstName ?? provider.firstname);
  const middle = trimNamePart(provider.middleName ?? provider.middlename);
  const last = trimNamePart(provider.lastName ?? provider.lastname);
  return [first, middle, last].filter(Boolean).join(" ");
}

export function providerInitials(
  provider: ProviderNameFields | null | undefined
): string {
  const first = trimNamePart(provider?.firstName ?? provider?.firstname);
  const last = trimNamePart(provider?.lastName ?? provider?.lastname);
  const initials = `${first.charAt(0)}${last.charAt(0)}`.toUpperCase();
  return initials || "?";
}
