/* ==========================================================================
   KLARO CONSENT CONFIG — Airport Split Transfer
   Only Google Analytics is a managed "service" here — everything else on
   the site (fonts, maps, WhatsApp links) is either essential or loaded
   without setting identifying cookies. Language is picked up from each
   page's own <html lang> attribute so EN, DE, SV and NO pages each show their
   own translated text automatically.
   ========================================================================== */

var klaroConfig = {
  version: 1,
  elementID: "klaro",
  storageMethod: "cookie",
  cookieName: "klaro-consent",
  cookieExpiresAfterDays: 365,
  lang: (function () {
    var pageLang = (document.documentElement.lang || "en").slice(0, 2);
    return pageLang === "de" || pageLang === "sv" || pageLang === "no" ? pageLang : "en";
  })(),

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
    },
    {
      name: "microsoft-clarity",
      title: "Microsoft Clarity",
      purposes: ["analytics"],
      cookies: [/^_clck/, /^_clsk/, "CLID", "ANONCHK", "MR", "MUID", "SM"],
      default: false,
      required: false
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
          "We use essential cookies to run this site and, only with your consent, analytics cookies to improve it.",
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
      decline: "Only essential",
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
      "microsoft-clarity": {
        title: "Microsoft Clarity",
        description:
          "Helps us see how visitors use the booking form (clicks, scrolling, anonymized session recordings) so we can improve it. No data is used for advertising."
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
          "Wir nutzen notwendige Cookies für den Betrieb der Website und, nur mit Ihrer Zustimmung, Analyse-Cookies zur Verbesserung.",
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
      decline: "Nur notwendige",
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
      "microsoft-clarity": {
        title: "Microsoft Clarity",
        description:
          "Hilft uns zu verstehen, wie Besucher das Buchungsformular nutzen (Klicks, Scrollverhalten, anonymisierte Sitzungsaufzeichnungen), damit wir es verbessern können. Es werden keine Daten für Werbung verwendet."
      },
      poweredBy: "Cookie-Einstellungen"
    },
    sv: {
      privacyPolicyUrl: "/sv/privacy",
      privacyPolicy: {
        name: "integritetspolicy",
        text: "Läs mer i vår {privacyPolicy}."
      },
      consentModal: {
        title: "Cookie- och integritetsinställningar",
        description:
          "Vi använder nödvändiga cookies för att den här webbplatsen ska fungera korrekt. Med ditt samtycke vill vi även använda analyscookies för att förstå hur webbplatsen används. Du kan när som helst ändra ditt val."
      },
      consentNotice: {
        title: "Vi värnar om din integritet",
        description:
          "Vi använder nödvändiga cookies för att driva webbplatsen och, endast med ditt samtycke, analyscookies för att förbättra den.",
        learnMore: "Hantera inställningar"
      },
      purposes: {
        analytics: "Analys"
      },
      purposeItem: {
        service: "tjänst",
        services: "tjänster"
      },
      acceptAll: "Acceptera alla",
      acceptSelected: "Spara inställningar",
      decline: "Endast nödvändiga",
      ok: "Acceptera alla",
      close: "Stäng",
      save: "Spara",
      service: {
        disableAll: {
          title: "Aktivera eller inaktivera alla tjänster",
          description: "Använd den här reglaget för att aktivera eller inaktivera alla tjänster samtidigt."
        }
      },
      "google-analytics": {
        title: "Google Analytics",
        description:
          "Hjälper oss förstå hur besökare använder webbplatsen (visade sidor, trafikkällor) så att vi kan förbättra den. Ingen data används för annonsering."
      },
      "microsoft-clarity": {
        title: "Microsoft Clarity",
        description:
          "Hjälper oss förstå hur besökare använder bokningsformuläret (klick, skrollning, anonymiserade sessionsinspelningar) så att vi kan förbättra det. Ingen data används för annonsering."
      },
      poweredBy: "Cookie-inställningar"
    },
    no: {
      privacyPolicyUrl: "/no/privacy",
      privacyPolicy: {
        name: "personvernerklæringen",
        text: "Les mer i {privacyPolicy}."
      },
      consentModal: {
        title: "Innstillinger for informasjonskapsler og personvern",
        description:
          "Vi bruker nødvendige informasjonskapsler for at nettstedet skal fungere som det skal. Med ditt samtykke vil vi også bruke analysekapsler for å forstå hvordan nettstedet brukes. Du kan endre valget ditt når som helst."
      },
      consentNotice: {
        title: "Vi tar vare på personvernet ditt",
        description:
          "Vi bruker nødvendige informasjonskapsler for å drive nettstedet og, bare med ditt samtykke, analysekapsler for å gjøre det bedre.",
        learnMore: "Administrer innstillinger"
      },
      purposes: {
        analytics: "Analyse"
      },
      purposeItem: {
        service: "tjeneste",
        services: "tjenester"
      },
      acceptAll: "Godta alle",
      acceptSelected: "Lagre innstillinger",
      decline: "Bare nødvendige",
      ok: "Godta alle",
      close: "Lukk",
      save: "Lagre",
      service: {
        disableAll: {
          title: "Slå alle tjenester av eller på",
          description: "Bruk denne bryteren for å slå alle tjenester av eller på samtidig."
        }
      },
      "google-analytics": {
        title: "Google Analytics",
        description:
          "Hjelper oss å forstå hvordan besøkende bruker nettstedet (sidevisninger, trafikkilder) slik at vi kan forbedre det. Ingen data brukes til annonsering."
      },
      "microsoft-clarity": {
        title: "Microsoft Clarity",
        description:
          "Hjelper oss å se hvordan besøkende bruker bestillingsskjemaet (klikk, rulling, anonymiserte øktopptak) slik at vi kan forbedre det. Ingen data brukes til annonsering."
      },
      poweredBy: "Informasjonskapsler"
    }
  }
};
