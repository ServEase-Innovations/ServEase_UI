const SCRIPT_ID = "razorpay-checkout-js";
const CHECKOUT_V1 = "https://checkout.razorpay.com/v1/checkout.js";

let loadPromise: Promise<any> | null = null;

const win = window as any;

/**
 * Loads Razorpay's hosted checkout script once, then returns the Razorpay constructor.
 * Use `(window as any).Razorpay` to avoid `declare global` clashes with other typings.
 * Call this only when the user starts a payment so the app does not always request
 * `checkout.razorpay.com` / `checkout-static-next.razorpay.com` on every full page load.
 */
export function loadRazorpayCheckoutScript(): Promise<any> {
  if (typeof win.Razorpay === "function") {
    return Promise.resolve(win.Razorpay);
  }
  if (loadPromise) {
    return loadPromise;
  }
  loadPromise = new Promise((resolve, reject) => {
    const done = (err: Error | null) => {
      if (err) {
        loadPromise = null;
        reject(err);
        return;
      }
      if (win.Razorpay) {
        resolve(win.Razorpay);
        return;
      }
      loadPromise = null;
      reject(new Error("Razorpay not available on window after load"));
    };
    const existing = document.getElementById(SCRIPT_ID) as HTMLScriptElement | null;
    if (existing) {
      if (win.Razorpay) {
        done(null);
        return;
      }
      existing.addEventListener("load", () => done(null), { once: true });
      existing.addEventListener(
        "error",
        () => {
          const e = new Error("Existing Razorpay script failed to load");
          done(e);
        },
        { once: true }
      );
      return;
    }
    const s = document.createElement("script");
    s.id = SCRIPT_ID;
    s.src = CHECKOUT_V1;
    s.async = true;
    s.addEventListener("load", () => done(null), { once: true });
    s.addEventListener(
      "error",
      () => done(new Error("Failed to load Razorpay checkout script")),
      { once: true }
    );
    document.body.appendChild(s);
  });
  return loadPromise;
}
