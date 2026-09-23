# Google Business Profile post scheduler (manual-publish version)

Why this exists: Google's Business Profile API does not offer open, self-serve
access for creating Posts ("Local Posts") — that capability is restricted to
a small set of Google-approved partners, via a manual application process
with no guaranteed outcome. Without that approval, nothing can publish to
Google Business Profile automatically from here.

What this does instead: three Routines (scheduled triggers) fire into the
Claude Code session at the requested times. Each one generates a fresh,
non-repeated post, saves it to `history.md` in this folder, sends a push
notification, and replies with the ready-to-paste text. The business owner
copies it into the Google Business Profile app (Home → Add update → Add
post) — about 20 seconds of manual work, three times a week.

## Brand brief (apply to every post)

- Brand name: **Airport Split Transfer**
- Tone: premium, short, confident. No emojis, ever. No exclamation-mark
  spam — at most one, and only if it earns its place.
- Length: 2–4 sentences. Google Business Profile posts are read on a phone
  in a few seconds — do not write ad copy that needs scrolling.
- Always end with this exact CTA line, on its own line:
  `Book your transfer → airportsplittransfer.com`
- Never reuse a previous post's wording. Read `history.md` in this folder
  before writing, and don't repeat a phrase, opening line, or angle used in
  the last 4 posts of the same type.
- Never invent facts, prices, or customer quotes that aren't already true
  of this business (see the real data below). If unsure, keep the claim
  generic rather than fabricating a specific number.

## Post types & rotation angles

Each firing generates ONE post of the type below. Rotate through the
listed angles round-robin (check `history.md` for which angle was used
last, pick a different one) so consecutive posts don't read the same even
though the wording is always new.

### 1. Airport transfer post (Mondays 09:00)
Angles to rotate through:
- Fixed price, no meter, quoted upfront
- Flight monitoring — driver waits if the flight is late, free waiting time
- Door-to-door — met at arrivals, taken straight to the address
- The fleet — Škoda Superb sedan, Mercedes V-Class, Renault Trafic van,
  covering 1–8 passengers
- Popular routes — Split, Trogir, Šibenik, Makarska, and destinations
  across the Dalmatian coast
- Child seats free on request

### 2. Day trip post (Thursdays 18:00)
Alternate between the two real products — don't post the same trip twice
in a row:
- **Krka National Park** — €230 car / €270 van, 8–10 hour round trip,
  Skradinski Buk waterfalls, closer and more relaxed than Plitvice
- **Plitvice Lakes** — €390 car / €450 van, 10–12 hour round trip,
  Croatia's oldest national park, 16 terraced lakes, UNESCO World Heritage
Always private (not a shared shuttle), English-speaking driver, fixed
price for the whole day, driver waits at the park.

### 3. Customer review post (Saturdays 10:00)
Feature ONE real review from the pool below — rotate through all nine
before repeating any (track which was used last in `history.md`). Quote
it (or a genuine excerpt of it) rather than paraphrasing into something
the customer didn't say. Do not fabricate new reviews.

**Real review pool** (sources: index.html / split-airport-transfers.html,
plus screenshots the business owner supplied directly from the Google
Business Profile listing on 2026-09-23 — all verified 5-star Google
reviews):

1. **Fiona Maher** — "Ivan was so friendly and helpful. We were travelling
   with our little 9 month old and he really helped us and made sure all
   was ok. Gave us great recommendations too! Nicest journey we have had
   as it is tough with a baby, really made it easy for us getting back to
   airport and fitting all our luggage."
2. **Ben Huffman** — "Ivan is an excellent driver and I would highly
   recommend him for your driving needs. He is safe, intuitive, friendly,
   helpful. His car is clean, smoke free, and he was early for pick up
   time."
3. **Chaneze B.** — "I recommend, we were late for our plane and he helped
   us a lot! Nice drive and kind man. Thank you."
4. **Natasha Dumais** — "The best service, they saved our trip! Super easy
   communication, photos sent once bags were picked up, and when put on
   the ferry. [...] Ivan was great :)" (quote the service/communication
   part — the mid-review note about SMS roaming/bank authentication is
   about her own bank app, not the business, so leave it out of any
   excerpt used in a post)
5. **Nikola Stosic** — "Used Duje's Mercedes van from Split airport to
   Ferry port and return. First class service, reliable, friendly, quick
   and affordable. Professional and quick drive taking care about the
   traffic and about passengers. [...] Will cordially recommend to
   everybody and especially to the people with young children."
6. **Jack Waghorn** — "Very professional and friendly, will use again for
   sure!"
7. **Karen Holland** (Google Local Guide, 138 reviews) — "Great
   experience. Arrived ahead of time and charged a fair price to the
   airport. Plenty of space in the car for our luggage and got to the
   airport in time."
8. **Zacker Zap** — "Excellent transfer service from Split to Montenegro.
   The driver was professional, friendly and punctual, and the journey
   was smooth and comfortable. Communication was great throughout, and
   everything went exactly as planned. Highly recommend this company for
   a reliable and stress-free transfer!"
9. **Alec Miskulin** — "Ivan was a great driver! He took us from Split all
   the way to Dubrovnik Airport, and the entire experience was excellent
   from start to finish. He was very friendly, professional, and easy to
   talk to, which made the long drive much more enjoyable. [...] Thanks
   again, Ivan"

Note the range of trips these cover — airport transfers, the ferry port,
and longer runs to Dubrovnik and even Montenegro — useful for varying the
post's framing beyond "just" an airport pickup.

The business currently has a 5.0 rating from 30+ Google reviews — safe to
reference that stat generically ("5.0 stars, 30+ Google reviews") without
citing an exact number that will go stale.

**When all 9 reviews have been used recently and a 10th distinct angle is
needed**: don't invent a new quote. Post a general trust/rating-focused
post instead (e.g. leading with the 5.0/30+ stat) and note in `history.md`
that fresh reviews are needed — ask the business owner (Ivan) to supply
new ones from Google Business Profile to expand the pool.

## Workflow for each firing

1. Read `history.md` in this folder (create it if missing) to see recent
   posts of this type and which review/angle was last used.
2. Write one new post following the brand brief and the rotation rule
   above.
3. Append the new entry to `history.md` (date, type, angle/review used,
   full text).
4. Commit and push `history.md` on the `claude/taxi-mobile-hero-redesign-9o5rnz`
   branch (or whatever branch is currently checked out) so the log
   survives container resets.
5. Send a short PushNotification (under 200 chars) saying a new post is
   ready, naming the type.
6. Reply in the session with the finished post text, clearly set apart
   (e.g. in a code block) so it's a clean copy-paste into Google Business
   Profile's "Add update" / "Add post" screen, plus a one-line reminder of
   where to paste it.

## Known limitation: daylight saving time

The three schedules below were set in UTC based on Croatia's daylight
saving offset (CEST, UTC+2) as of September 2026. Croatia switches to
standard time (CET, UTC+1) on the last Sunday of October and back to CEST
on the last Sunday of March. Cron schedules do not auto-adjust for this —
after each switch, the actual local firing time will drift by one hour
until the three Routines' `cron_expression` values are updated by 1 hour
in the opposite direction. Whoever manages this should update them twice
a year, or ask Claude to do it.

Current schedule (set 2026-09-22, Europe/Zagreb = UTC+2):
- Monday 09:00 local → `0 7 * * 1` UTC — Airport transfer post
- Thursday 18:00 local → `0 16 * * 4` UTC — Day trip post
- Saturday 10:00 local → `0 8 * * 6` UTC — Customer review post
