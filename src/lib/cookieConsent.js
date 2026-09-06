const KEY = "cookie_consent"; // "accepted" | "rejected"

export function getConsent() {
  return localStorage.getItem(KEY);
}

export function setConsent(value) {
  localStorage.setItem(KEY, value);
  window.dispatchEvent(new Event("cookie-consent-change"));
}
