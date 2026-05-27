/** Map customer API payload (camelCase or legacy lowercase) to profile form fields. */
export type CustomerProfileFields = {
  firstName: string;
  lastName: string;
  contactNumber: string;
  altContactNumber: string;
};

function digitsOnly(value: unknown): string {
  if (value == null || value === "") return "";
  return String(value).replace(/\D/g, "");
}

export function mapCustomerApiToProfile(
  data: Record<string, unknown> | null | undefined
): CustomerProfileFields {
  if (!data) {
    return { firstName: "", lastName: "", contactNumber: "", altContactNumber: "" };
  }

  const mobileStr = digitsOnly(
    data.mobileNo ?? data.mobileno ?? data.mobile_no
  );
  const altStr = digitsOnly(
    data.alternateNo ?? data.alternateno ?? data.alternate_no
  );

  return {
    firstName: String(data.firstName ?? data.firstname ?? ""),
    lastName: String(data.lastName ?? data.lastname ?? ""),
    contactNumber: mobileStr,
    altContactNumber: altStr && altStr !== "0" ? altStr : "",
  };
}

export function customerHasMobile(
  data: Record<string, unknown> | null | undefined
): boolean {
  return mapCustomerApiToProfile(data).contactNumber.length >= 10;
}
