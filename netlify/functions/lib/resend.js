// Minimal Resend API client using the Node 18+ global fetch — no SDK
// dependency, so the function needs no build/install step to deploy.

const RESEND_API_URL = "https://api.resend.com/emails";

async function sendEmail({ from, to, subject, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY is not configured");
  }

  const body = {
    from,
    to: Array.isArray(to) ? to : [to],
    subject,
    html,
  };
  if (replyTo) body.reply_to = replyTo;

  const response = await fetch(RESEND_API_URL, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  let responseJson = {};
  try {
    responseJson = await response.json();
  } catch (err) {
    // Resend always returns JSON, even on error — an unparsable body means
    // something more unusual than a normal API error, so surface the raw
    // status instead of silently swallowing it.
  }

  if (!response.ok) {
    const message = responseJson && responseJson.message ? responseJson.message : JSON.stringify(responseJson);
    throw new Error(`Resend API error (${response.status}): ${message}`);
  }

  return responseJson;
}

module.exports = { sendEmail };
