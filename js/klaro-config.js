/* ==========================================================================
   KLARO CONSENT CONFIG — Transfer Split Airport
   Only Google Analytics is a managed "service" here — everything else on
   the site (fonts, maps, WhatsApp links) is either essential or loaded
   without setting identifying cookies. Language is picked up from each
   page's own <html lang> attribute so EN pages show English text and DE
   pages show German text automatically.
   ========================================================================== */

var klaroConfig = {
  version: 1,
  elementID: "klaro",
  storageMethod: "cookie",
  cookieName: "klaro-consent",
  cookieExpiresAfterDays: 365,
  lang: (document.documentElement.lang || "en").slice(0, 2) === "de" ? "de" : "en",

  default: false,
  mustConsent: false,
  acceptAll: true,
  hideDeclineAll: false,
  hideLearnMore: false,
  noticeAsModal: false,

  services: [
    {
      name: "google-analytics",
      title: "Google Analytics",
      purposes: ["analytics"],
      cookies: [/^_ga/, "_gid", /^_ga_.*/],
      default: false,
      required: false,
      onAccept: function () {
        if (window.gtag) {
          gtag("consent", "update", { analytics_storage: "granted" });
        }
      },
      onDecline: function () {
        if (window.gtag) {
          gtag("consent", "update", { analytics_storage: "denied" });
        }
      }
    }
  ],

  translations: {
    en: {
      privacyPolicyUrl: "/privacy",
      consentModal: {
        title: "Cookie & Privacy Preferences",
        description:
          "We use essential cookies to run this site properly. With your permission, we'd also like to use analytics cookies to understand how visitors use the site so we can improve it. You can change your choice at any time."
      },
      consentNotice: {
        title: "We value your privacy",
        description:
          "We use essential cookies to keep this site running, and — only with your consent — analytics cookies to understand how it's used.",
        learnMore: "Manage Preferences"
      },
      purposes: {
        analytics: "Analytics"
      },
      purposeItem: {
        service: "service",
        services: "services"
      },
      acceptAll: "Accept All",
      acceptSelected: "Save Preferences",
      decline: "Reject Non-Essential",
      ok: "Accept All",
      close: "Close",
      save: "Save",
      service: {
        disableAll: {
          title: "Enable or disable all services",
          description: "Use this switch to enable or disable all services at once."
        }
      },
      "google-analytics": {
        title: "Google Analytics",
        description:
          "Helps us understand how visitors use the site (pages viewed, traffic sources) so we can improve it. No data is used for advertising."
      },
      poweredBy: "Cookie preferences"
    },
    de: {
      privacyPolicyUrl: "/de/privacy",
      consentModal: {
        title: "Cookie- und Datenschutzeinstellungen",
        description:
          "Wir verwenden essenzielle Cookies, damit diese Website ordnungsgemäß funktioniert. Mit Ihrer Zustimmung möchten wir außerdem Analyse-Cookies verwenden, um zu verstehen, wie die Website genutzt wird. Sie können Ihre Wahl jederzeit ändern."
      },
      consentNotice: {
        title: "Wir schätzen Ihre Privatsphäre",
        description:
          "Wir verwenden essenzielle Cookies, damit diese Website funktioniert, und — nur mit Ihrer Zustimmung — Analyse-Cookies, um die Nutzung zu verstehen.",
        learnMore: "Einstellungen verwalten"
      },
      purposes: {
        analytics: "Analyse"
      },
      purposeItem: {
        service: "Dienst",
        services: "Dienste"
      },
      acceptAll: "Alle akzeptieren",
      acceptSelected: "Auswahl speichern",
      decline: "Nicht erforderliche ablehnen",
      ok: "Alle akzeptieren",
      close: "Schließen",
      save: "Speichern",
      service: {
        disableAll: {
          title: "Alle Dienste aktivieren oder deaktivieren",
          description: "Mit diesem Schalter aktivieren oder deaktivieren Sie alle Dienste gleichzeitig."
        }
      },
      "google-analytics": {
        title: "Google Analytics",
        description:
          "Hilft uns zu verstehen, wie Besucher die Website nutzen (aufgerufene Seiten, Traffic-Quellen), damit wir sie verbessern können. Es werden keine Daten für Werbung verwendet."
      },
      poweredBy: "Cookie-Einstellungen"
    }
  }
};
