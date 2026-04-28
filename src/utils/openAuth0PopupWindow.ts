const POPUP_WIDTH = 500;
const POPUP_HEIGHT = 700;

/**
 * Open a child window for Auth0 `loginWithPopup` (not an iframe; Auth0 blocks that).
 * Must be called synchronously from a user gesture, or the browser will block the popup.
 */
export function openAuth0PopupWindow(): Window | null {
  const left =
    window.screenX + Math.max(0, (window.outerWidth - POPUP_WIDTH) / 2);
  const top =
    window.screenY + Math.max(0, (window.outerHeight - POPUP_HEIGHT) / 2);
  return window.open(
    "about:blank",
    "auth0",
    `width=${POPUP_WIDTH},height=${POPUP_HEIGHT},left=${left},top=${top},scrollbars=yes,resizable=yes`
  );
}
