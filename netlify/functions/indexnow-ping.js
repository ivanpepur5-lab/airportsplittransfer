// Netlify Function — pings IndexNow (Bing/Yandex) with every URL from the
// live sitemap.xml. Unlike a build plugin, this works with manual/drag-and-drop
// deploys too, because it's triggered by a dashboard "Deploy succeeded"
// outgoing webhook calling this function's own URL — not by the build process.
//
// Function URL once deployed: https://airportsplittransfer.com/.netlify/functions/indexnow-ping
//
// One-time setup (Netlify dashboard):
//   Site configuration → Build & deploy → Deploy notifications
//   → Add notification → Outgoing webhook → Event: "Deploy succeeded"
//   → URL: https://airportsplittransfer.com/.netlify/functions/indexnow-ping

const https = require("https");

const INDEXNOW_KEY = "840168ad3eb0472faa193afc60e9de24";
const HOST = "airportsplittransfer.com";

function getText(hostname, pathName) {
  return new Promise((resolve, reject) => {
    https
      .get({ hostname, path: pathName, timeout: 10000 }, (res) => {
        let data = "";
        res.on("data", (c) => (data += c));
        res.on("end", () => resolve({ statusCode: res.statusCode, body: data }));
      })
      .on("error", reject)
      .on("timeout", function () {
        this.destroy(new Error("Request to " + hostname + pathName + " timed out"));
      });
  });
}

function postJSON(hostname, pathName, body) {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify(body);
    const req = https.request(
      {
        hostname,
        path: pathName,
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          "Content-Length": Buffer.byteLength(data),
        },
        timeout: 10000,
      },
      (res) => {
        let chunks = "";
        res.on("data", (c) => (chunks += c));
        res.on("end", () => resolve({ statusCode: res.statusCode, body: chunks }));
      }
    );
    req.on("error", reject);
    req.on("timeout", () => req.destroy(new Error("IndexNow request timed out")));
    req.write(data);
    req.end();
  });
}

exports.handler = async () => {
  try {
    // Fetch the live sitemap rather than reading from disk — Netlify Functions
    // don't have access to the published site's static files by default, but
    // this also has the advantage of always pinging what's actually live.
    const sitemapRes = await getText(HOST, "/sitemap.xml");
    if (sitemapRes.statusCode !== 200) {
      return {
        statusCode: 200,
        body: `sitemap.xml returned ${sitemapRes.statusCode} — skipped ping.`,
      };
    }

    const urls = [...sitemapRes.body.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    if (urls.length === 0) {
      return { statusCode: 200, body: "No URLs found in sitemap.xml — skipped ping." };
    }

    const payload = {
      host: HOST,
      key: INDEXNOW_KEY,
      keyLocation: `https://${HOST}/${INDEXNOW_KEY}.txt`,
      urlList: urls,
    };

    const result = await postJSON("api.indexnow.org", "/indexnow", payload);
    const message = `Pinged IndexNow with ${urls.length} URLs — status ${result.statusCode}`;
    console.log("[indexnow-ping]", message);
    return { statusCode: 200, body: message };
  } catch (err) {
    console.log("[indexnow-ping] Failed:", err.message);
    // Always return 200 — this must never look like a failure to whatever
    // triggered it (the Netlify deploy-notification webhook).
    return { statusCode: 200, body: "Skipped due to an error: " + err.message };
  }
};
