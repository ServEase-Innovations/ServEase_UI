import { useCallback, useState } from "react";
import utilsInstance from "src/services/utilsInstance";
import providerInstance from "src/services/providerInstance";

type FieldKey = "email" | "mobile" | "alternate";

type FieldState = {
  loading: boolean;
  isValidated: boolean;
  isAvailable: boolean | null;
  error: string;
};

const initialField: FieldState = {
  loading: false,
  isValidated: false,
  isAvailable: null,
  error: "",
};

type Options = { t?: (key: string) => string };

const defaultT = (key: string) => key;

export function useFieldValidation(options: Options = {}) {
  const t = options.t ?? defaultT;
  const [validationResults, setValidationResults] = useState<
    Record<FieldKey, FieldState>
  >({
    email: { ...initialField },
    mobile: { ...initialField },
    alternate: { ...initialField },
  });

  const validateField = useCallback(
    async (field: FieldKey, value: string) => {
      const trimmed = value?.trim();
      if (!trimmed) {
        setValidationResults((prev) => ({
          ...prev,
          [field]: { ...initialField },
        }));
        return;
      }

      setValidationResults((prev) => ({
        ...prev,
        [field]: { ...prev[field], loading: true, error: "" },
      }));

      try {
        if (field === "email") {
          const { data } = await utilsInstance.get(
            `/customer/check-email?email=${encodeURIComponent(trimmed.toLowerCase())}`
          );
          const taken = Boolean(data?.exists);
          setValidationResults((prev) => ({
            ...prev,
            email: {
              loading: false,
              isValidated: true,
              isAvailable: !taken,
              error: taken ? t("emailAlreadyRegistered") : "",
            },
          }));
          return;
        }

        const { data } = await providerInstance.post("/api/service-providers/check-mobile", {
          mobile: trimmed.replace(/\D/g, ""),
        });
        const taken = Boolean(data?.exists ?? data?.data?.exists);
        setValidationResults((prev) => ({
          ...prev,
          [field]: {
            loading: false,
            isValidated: true,
            isAvailable: !taken,
            error: taken ? t("mobileAlreadyRegistered") : "",
          },
        }));
      } catch {
        setValidationResults((prev) => ({
          ...prev,
          [field]: {
            loading: false,
            isValidated: false,
            isAvailable: null,
            error: t("validationFailed") || "Could not verify. Try again.",
          },
        }));
      }
    },
    [t]
  );

  const resetValidation: (field?: FieldKey) => void = useCallback((field?: FieldKey) => {
    if (field) {
      setValidationResults((prev) => ({
        ...prev,
        [field]: { ...initialField },
      }));
      return;
    }
    setValidationResults({
      email: { ...initialField },
      mobile: { ...initialField },
      alternate: { ...initialField },
    });
  }, []);

  const isStep0ValidationsComplete =
    validationResults.email.isValidated &&
    validationResults.email.isAvailable === true &&
    validationResults.mobile.isValidated &&
    validationResults.mobile.isAvailable === true;

  return {
    validationResults,
    validateField,
    resetValidation,
    isStep0ValidationsComplete,
  };
}
