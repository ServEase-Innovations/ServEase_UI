/** Extract a user-facing message from a failed service-day OTP verify request. */
export function getOtpVerifyErrorMessage(
  err: unknown,
  fallback = "Invalid or expired OTP. Please check the code and try again."
): string {
  if (err && typeof err === "object" && "response" in err) {
    const data = (err as { response?: { data?: { error?: string; message?: string } } })
      .response?.data;
    if (data?.error) return data.error;
    if (data?.message) return data.message;
  }
  if (err instanceof Error && err.message && !err.message.startsWith("Request failed")) {
    return err.message;
  }
  return fallback;
}
