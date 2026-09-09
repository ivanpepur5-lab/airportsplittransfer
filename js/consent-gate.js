/* ==========================================================================
   CONSENT GATE — decides whether this visitor sees the Klaro banner at all.
   Reads the "region" cookie set by the geo-consent Netlify Edge Function
   (never the visitor's actual location, just "eu" or "other"). Outside the
   EU/EEA/UK, Klaro is never downloaded at all — analytics is unblocked
   immediately and nothing extra loads, so non-EU visitors pay zero cost.
   Inside the EU/EEA/UK (or if the cookie hasn't been set yet), Klaro's
   CSS/config/library are fetched dynamically, off the critical rendering
   path, so this never blocks first paint either way.
   ========================================================================== */
(function () {
  function getCookie(name) {
    var m = document.cookie.match("(?:^|; )" + name + "=([^;]*)");
    return m ? decodeURIComponent(m[1]) : null;
  }

  function activateInertScripts(serviceName) {
    document
      .querySelectorAll('script[type="text/plain"][data-name="' + serviceName + '"]')
      .forEach(function (oldScript) {
        var newScript = document.createElement("script");
        for (var i = 0; i < oldScript.attributes.length; i++) {
          var attr = oldScript.attributes[i];
          if (attr.name === "type") continue;
          newScript.setAttribute(attr.name, attr.value);
        }
        newScript.text = oldScript.text;
        oldScript.parentNode.replaceChild(newScript, oldScript);
      });
  }

  var base = (document.currentScript && document.currentScript.getAttribute("data-base")) || "";
  var klaroLoading = null;

  function loadKlaro() {
    if (klaroLoading) return klaroLoading;
    klaroLoading = new Promise(function (resolve) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = base + "css/klaro-theme.css";
      document.head.appendChild(link);

      var configScript = document.createElement("script");
      configScript.src = base + "js/klaro-config.js";
      configScript.onload = function () {
        var klaroScript = document.createElement("script");
        klaroScript.src = base + "js/vendor/klaro.js";
        klaroScript.setAttribute("data-config", "klaroConfig");
        klaroScript.onload = function () { resolve(); };
        document.body.appendChild(klaroScript);
      };
      document.head.appendChild(configScript);
    });
    return klaroLoading;
  }

  // Exposed so the footer "Cookie Preferences" link works even for visitors
  // who never triggered Klaro to load in the first place (e.g. outside the
  // EU/EEA/UK, where it isn't loaded by default).
  window.openCookiePreferences = function () {
    loadKlaro().then(function () {
      window.klaro.show();
    });
  };

  var region = getCookie("region");

  if (region === "other") {
    // Outside the EU/EEA/UK — no banner, analytics runs immediately.
    if (window.gtag) gtag("consent", "update", { analytics_storage: "granted" });
    activateInertScripts("google-analytics");
    return;
  }

  // EU/EEA/UK, or the edge function hasn't tagged this visitor yet — default
  // to showing the banner, since that's the safer side of the GDPR line.
  loadKlaro();
})();
