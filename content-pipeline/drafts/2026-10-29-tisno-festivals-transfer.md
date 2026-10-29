# DRAFT 2026-10-29: Split Airport to Tisno, festival transfer guide (blog article)

Status: draft for Ivan's approval. Nothing here is published. Type: **blog article**
(`blog/split-airport-to-tisno-festivals.html`), requested by Ivan on 29 Oct ("Istrazi festivale u Tisnom i napravi blog").
It is a blog and not a route page: the useful content is the festival calendar and the arrival/departure planning,
and a Tisno route page would be a thin village page. The booking form takes any address, so the guide sends readers to
the form with "Tisno" typed in as the drop-off.

## Why this topic (pre-publish checklist done)

- `/destinations/` (38 pages): no Tisno page, and the word "Tisno" appears nowhere on the site (grep over all destinations and blog pages).
  The nearest page is `destinations/murter.html` (Split Airport to Murter, 1 h 20 min). `/blog/` (24 articles): no festival or event guide.
  `history.md` read in full; no earlier Tisno topic.
- Real demand: eight large electronic-music festivals share one venue, The Garden Resort in Tisno, from July to the end of August,
  with more than 40,000 visitors expected in 2026 (INSITE). Most come by air; Split is one of the two nearest airports.
- The pending drafts (Klis and Salona, Split to Mostar, Split before your flight, Split Airport to Korčula) are not repeated.
- Why a blog and not a route: Tisno is a small place; the festival calendar is the real content. One page, no template, no near-duplicate.

## Proposed SEO title (47 chars, brand suffix dropped because it would exceed 60)

Split Airport to Tisno: Festival Transfer Guide

## Proposed meta description (157 chars)

Heading to a festival in Tisno? The summer calendar at The Garden Resort, how long it takes from Split Airport and how to plan arrival and departure days.

## H1

Split Airport to Tisno: A Transfer Guide for the Festival Season

## Body

Every summer the small town of Tisno, on the channel that separates the island of Murter from the mainland, turns into one of the busiest
festival destinations in Croatia. Most of the events take place at one venue, The Garden Resort at Petrica Glava, and most of the guests
arrive by air. This guide covers when the festivals run, how far Tisno is from Split Airport and how to plan the days at either end of your stay.

### The festival calendar

The Garden Resort hosts a run of electronic-music festivals from the start of July to the beginning of September. In 2026 the programme was:

- Hospitality on the Beach, 1 to 6 July (drum and bass)
- Love International, 8 to 14 July (house and disco)
- Terminal V Croatia, 16 to 20 July (techno)
- Outlook Origins, 23 to 27 July (bass and soundsystem culture)
- Defected Croatia, 29 July to 3 August (house)
- Balance Croatia, 6 to 10 August (melodic and progressive house)
- Dekmantel Selectors, 20 to 24 August
- Dimensions Festival, 27 to 31 August (house, techno, electro and bass)

Listings for 2027 follow the same pattern, a few days earlier on the calendar because the weekdays shift. Ticketing sites currently show Hospitality on the Beach from 30 June,
Love International 7 to 13 July, Terminal V Croatia 15 to 19 July, Outlook Origins 22 to 26 July, Balance Croatia 5 to 9 August and
Dimensions 26 to 31 August. Treat these as provisional until the festival confirms its own dates, and check each festival's website before you book flights.

### How far is Tisno from Split Airport?

Split Airport and Tisno are roughly 90 to 95 kilometres apart. Our Murter page, for the town right next to Tisno, gives one hour and twenty minutes from the airport,
and Tisno is about the same. In July and August expect more, because the whole coast road is busy and a summer Friday can be slow.

Zadar Airport is the other airport used for the festivals. If your flight options are cheaper into Zadar, compare both airports and see our Zadar airport guide for the road.

### Arrival and departure days

Festivals usually begin on a Wednesday or Thursday and finish on Monday or Tuesday, so most flights land in a few concentrated waves. That has three practical effects.

- **Late arrivals.** A flight that lands at night still has a drive of more than an hour ahead of it. A private transfer waits in the arrivals hall,
  and we follow your flight number, so a delayed landing does not cost you the pickup.
- **Early departures.** The last night often runs until morning, and morning flights from Split leave early. Work back from your check-in time, add the drive,
  and leave a buffer. On busy summer days allow up to half an hour extra.
- **Groups and gear.** Friends travelling together can share one vehicle: a Mercedes V-Class takes up to 7 passengers and a Renault Trafic up to 8, with space for festival luggage.

### Why a private transfer works here

Public transport to Tisno is limited. Buses run mainly from the cities, so from the airport you would first go to Split or Zadar and then change.
A private transfer goes from the arrivals hall to your accommodation or to the gate of the venue, at a fixed price shown before you book.
Enter Tisno or the name of your accommodation as the drop-off in the booking form and the form calculates the price from the road distance.

### Staying outside the venue

Many guests stay in Tisno, Murter, Betina or Vodice rather than in the resort. Our Murter page and Vodice page cover the nearby towns.
If your accommodation is a house or an apartment, send us the address and we pick you up there for the return.

### Before you go

- Check the festival's own website for entry times and any official shuttle.
- Keep your flight number and arrival time ready when you book.
- Book early for the first and last weekends of the season, when flights and rooms fill up first.

## FAQ (5)

**How far is Tisno from Split Airport?**
Roughly 90 to 95 kilometres, about an hour and twenty minutes without traffic. In July and August it is often longer.

**Which festivals take place in Tisno?**
Several festivals at The Garden Resort between July and early September, among them Love International, Terminal V Croatia, Balance Croatia and Dimensions. Check each festival's site for the current dates.

**Can I book a transfer for a group?**
Yes. A Mercedes V-Class takes up to 7 passengers and a Renault Trafic up to 8. Enter the number of passengers in the booking form.

**Do you track my flight?**
Yes. We follow your flight number, so if the plane is late the driver adjusts the pickup.

**Is there public transport from Split Airport to Tisno?**
Buses go mostly from Split and Zadar, so from the airport you would change in the city first. A private transfer is a direct ride.

## Planned internal links

- `destinations/murter` and `destinations/vodice` (nearby), `destinations/sibenik` (on the way)
- `services/split-group-transfers`, `blog/vclass-vs-trafic`
- `blog/flight-delay-guide`, `blog/early-morning-transfer-to-split-airport`
- `blog/zadar-airport-to-split-transfer` (the other airport option)
- CTA "Book your private transfer" to `../index.html#booking`. Optional: add `tisno: "Tisno, Croatia"` to `DESTINATION_NAMES` in `js/pricing.js` so a link can prefill the drop-off.

## Rules checked

No € price, no em dashes, no emojis, no claim that the owner drives every ride, no invented figures. Ticket prices of the festivals are not stated.

## Facts to check

| Claim | Source |
|---|---|
| Eight festivals in 2026 at The Garden Resort with the dates above; more than 40,000 expected; organiser The Garden Productions | INSITE Croatia article "TISNO 2026: Croatian Festival Central Point Announces the Schedule" |
| Dimensions 2026 ran 27 to 31 August (some listings add a closing day on 1 September) | Wonderful Wanderings, RA listings |
| 2027 dates: Hospitality 30 June to 5 July, Love International 7 to 13 July, Terminal V 15 to 19 July, Outlook Origins 22 to 26 July, Balance Croatia 5 to 9 August, Dimensions 26 to 31 August | Aggregators (TechnoAirlines, Electronic Groove, Setline); not official. Dekmantel is listed as 19 to 23 and 20 to 24 August, so the draft does not state it for 2027. Defected Croatia has no 2027 listing |
| Genres of each festival | INSITE article |
| Venue: The Garden Resort, Petrica Glava, Tisno | Ticket listings |
| Tisno lies on the channel between Murter island and the mainland | Common knowledge; confirm |
| Split Airport to Tisno roughly 90 to 95 km, about 1 h 20 | Shuttle and transfer listings (about 93 km, about 1 h 20); Murter figure from `destinations/murter.html` (1 h 20). Not computed for Tisno itself |
| Zadar Airport also serves the festivals | General; no distance is stated in the draft |
| Buses run mostly from Split and Zadar, change in the city | A festival transport guide (Defected Croatia notion page); confirm |
| Festivals usually start Wednesday or Thursday and end Monday or Tuesday | 2026 and 2027 dates above; confirm |

## Questions for Ivan

1. Have you driven festival guests to Tisno? Which festivals, from which airport and how long did the drive actually take (night, summer traffic)?
2. Where do you drop guests: at the gate of The Garden Resort, at an apartment in Tisno or Murter, or somewhere else? Is there a place where a car cannot go in?
3. Would you take late-night or early-morning transfers for festival groups? If not, we should not suggest them in the guide.
