import { resolveProviderIdNumber } from "src/utils/spSession";

const DRAFT_KEY = "servease:sp-registration-draft";
const OPEN_FLAG_KEY = "servease:sp-registration-in-progress";
const DRAFT_VERSION = 1;

export type SpRegistrationDraftPayload = {
  version: typeof DRAFT_VERSION;
  savedAt: number;
  activeStep: number;
  formData: Record<string, unknown>;
  selectedLanguages: string[];
  isCookSelected: boolean;
  isNannySelected: boolean;
  currentLocation: { latitude: number; longitude: number; address: string } | null;
  isSameAddress: boolean;
  morningSlots: number[][];
  eveningSlots: number[][];
  isFullTime: boolean;
  selectedTimeSlots: string;
};

const FILE_FIELD_KEYS = ["panImage", "documentImage", "profileImage"] as const;

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  return window.sessionStorage;
}

export function sanitizeFormDataForDraft(
  formData: Record<string, unknown>
): Record<string, unknown> {
  const copy = { ...formData };
  for (const key of FILE_FIELD_KEYS) {
    copy[key] = null;
  }
  return copy;
}

export function hasMeaningfulDraft(
  draft: SpRegistrationDraftPayload | null | undefined
): boolean {
  if (!draft) return false;
  if (draft.activeStep > 0) return true;

  const fd = draft.formData ?? {};
  const textFields = [
    "firstName",
    "lastName",
    "emailId",
    "mobileNo",
    "buildingName",
    "locality",
    "kycNumber",
    "description",
    "experience",
  ];
  if (textFields.some((key) => String(fd[key] ?? "").trim() !== "")) {
    return true;
  }

  const roles = fd.housekeepingRole;
  if (Array.isArray(roles) && roles.length > 0) return true;

  const permanent = fd.permanentAddress as Record<string, unknown> | undefined;
  if (permanent && Object.values(permanent).some((v) => String(v ?? "").trim() !== "")) {
    return true;
  }

  return Boolean(fd.profilePic);
}

export function saveSpRegistrationDraft(
  draft: Omit<SpRegistrationDraftPayload, "version" | "savedAt">
): void {
  const storage = getStorage();
  if (!storage) return;

  const payload: SpRegistrationDraftPayload = {
    version: DRAFT_VERSION,
    savedAt: Date.now(),
    ...draft,
  };
  storage.setItem(DRAFT_KEY, JSON.stringify(payload));
  storage.setItem(OPEN_FLAG_KEY, "true");
}

export function loadSpRegistrationDraft(): SpRegistrationDraftPayload | null {
  const storage = getStorage();
  if (!storage) return null;

  try {
    const raw = storage.getItem(DRAFT_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as SpRegistrationDraftPayload;
    if (!parsed || parsed.version !== DRAFT_VERSION) return null;
    return parsed;
  } catch {
    return null;
  }
}

export function hasSpRegistrationInProgress(): boolean {
  const storage = getStorage();
  if (!storage) return false;

  try {
    if (storage.getItem(OPEN_FLAG_KEY) === "true") return true;
    return hasMeaningfulDraft(loadSpRegistrationDraft());
  } catch {
    return false;
  }
}

function isRegisteredServiceProvider(
  appUser: Record<string, unknown> | null | undefined
): boolean {
  if (!appUser) return false;
  const role = String(appUser.role ?? appUser.user_role ?? "").toUpperCase();
  if (role === "SERVICE_PROVIDER") return true;
  return resolveProviderIdNumber(appUser) != null;
}

/** Resume SP registration wizard only for users who are not already registered providers. */
export function shouldResumeSpRegistration(
  appUser: Record<string, unknown> | null | undefined
): boolean {
  if (isRegisteredServiceProvider(appUser)) {
    clearSpRegistrationDraft();
    return false;
  }
  return hasSpRegistrationInProgress();
}

export function clearSpRegistrationDraft(): void {
  const storage = getStorage();
  if (!storage) return;
  storage.removeItem(DRAFT_KEY);
  storage.removeItem(OPEN_FLAG_KEY);
}
