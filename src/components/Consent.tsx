import Script from "next/script";

// Consent banner (US visitors). Google Consent Mode v2: GTM loads on every page (layout.tsx);
// GA stays cookieless until "Accept". Ads storage is never granted. Global Privacy Control = decline.
export const GTM_ID = "GTM-PRL8TLQ9";

// Runs in <head> before GTM: sets the consent default from the saved choice.
export const consentDefault = `
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
(function(){
  var ok = false;
  try { ok = localStorage.getItem("consent") === "granted" && navigator.globalPrivacyControl !== true; } catch (e) {}
  gtag("consent", "default", { ad_storage: "denied", ad_user_data: "denied", ad_personalization: "denied", analytics_storage: ok ? "granted" : "denied" });
  if (!/(^|\\.)tahititelegraph\\.com$/.test(location.hostname)) return; // keep local and preview builds out of GA
  dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
  var s = document.createElement("script"); s.async = true; s.src = "https://www.googletagmanager.com/gtm.js?id=${GTM_ID}";
  document.head.appendChild(s);
})();`;

const banner = `
(function(){
  var box = document.getElementById("consent"), saved = null;
  try { saved = localStorage.getItem("consent"); } catch (e) {}
  if (!saved && navigator.globalPrivacyControl !== true) box.hidden = false;
  box.addEventListener("click", function (e) {
    var c = e.target && e.target.getAttribute("data-choice");
    if (!c) return;
    try { localStorage.setItem("consent", c); } catch (e2) {}
    box.hidden = true;
    if (c === "granted" && window.gtag) gtag("consent", "update", { analytics_storage: "granted" });
  });
})();`;

export default function Consent() {
  return (
    <>
      <div
        id="consent"
        role="dialog"
        aria-label="Analytics choice"
        hidden
        className="fixed inset-x-4 bottom-4 z-50 mx-auto max-w-xl rounded-[var(--radius-card)] border border-border bg-surface p-4 text-sm text-muted shadow-lg"
      >
        <p>
          May we use Google Analytics? If you accept, it sets cookies to count your visit. If you decline, no cookies
          are set.
        </p>
        <div className="mt-3 flex gap-2">
          <button
            type="button"
            data-choice="granted"
            className="rounded-md bg-primary px-4 py-2 font-medium text-primary-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            Accept
          </button>
          <button
            type="button"
            data-choice="denied"
            className="rounded-md border border-border px-4 py-2 text-fg focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fg"
          >
            Decline
          </button>
        </div>
      </div>
      <Script id="consent-banner" strategy="afterInteractive">
        {banner}
      </Script>
    </>
  );
}
