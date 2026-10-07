# More route pages from the same templates as tr_d (phase 2).
# (EN name, nominative, "to" form, "from" form, EN time, "at your address in" form)
PLACES = [
 ("Biograd na Moru", "Biograd na Moru", "a Biograd na Moru", "da Biograd na Moru", "1 h 10 min", "a Biograd na Moru"),
 ("Murter", "Murter", "a Murter", "da Murter", "1 h 10 min", "a Murter"),
 ("Podgora", "Podgora", "a Podgora", "da Podgora", "1 h 20 min", "a Podgora"),
 ("Šibenik", "Šibenik", "a Šibenik", "da Šibenik", "55 min", "a Šibenik"),
 ("Vodice", "Vodice", "a Vodice", "da Vodice", "1 h", "a Vodice"),
 ("Zadar", "Zadar", "a Zadar", "da Zadar", "1 h 45 min", "a Zadar"),
 ("Plitvice Lakes", "Laghi di Plitvice", "ai Laghi di Plitvice", "dai Laghi di Plitvice", "3 h", "ai Laghi di Plitvice"),
]
T = {}
for en, nom, to, frm, tm, loc in PLACES:
    T[f"How much does a transfer from Split Airport to {en} cost?"] = f"Quanto costa un transfer dall'aeroporto di Spalato {to}?"
    T[f"How long is the drive from Split Airport to {en}?"] = f"Quanto dura il tragitto dall'aeroporto di Spalato {to}?"
    T[f"The journey takes approximately {tm}, depending on traffic and time of year."] = f"Il viaggio dura circa {tm}, a seconda del traffico e del periodo dell'anno."
    T[f"Private Transfer to {en}"] = f"Transfer privato {to}"
    T[f"Your driver meets you at Split Airport arrivals with a name board, ready to help with luggage. From there it's a direct run to {en}: no shared shuttle, no extra stops, no taximeter."] = f"L'autista ti aspetta agli arrivi dell'aeroporto di Spalato con un cartello con il tuo nome, pronto ad aiutarti con i bagagli. Da lì si va direttamente {to}: niente navetta condivisa, niente fermate intermedie, niente tassametro."
    T[f"Split Airport → {en}"] = f"Aeroporto di Spalato → {nom}"
    T[f"{en} → Split Airport"] = f"{nom} → Aeroporto di Spalato"
    T[f"How much does a transfer from {en} to Split Airport cost?"] = f"Quanto costa un transfer {frm} all'aeroporto di Spalato?"
    T[f"How long is the drive from {en} to Split Airport?"] = f"Quanto dura il tragitto {frm} all'aeroporto di Spalato?"
    T[f"Your driver picks you up at your {en} address and drives you directly to Split Airport: no shared shuttle, no extra stops, no taximeter."] = f"L'autista ti viene a prendere al tuo indirizzo {loc} e ti porta direttamente all'aeroporto di Spalato: niente navetta condivisa, niente fermate intermedie, niente tassametro."
    T[f"Split Airport to {en} transfer"] = f"transfer dall'aeroporto di Spalato {to}"
    T[f"Private transfer from Split Airport to {en}: {tm} drive. Enter your addresses for an instant fixed price. Book online in minutes."] = f"Transfer privato dall'aeroporto di Spalato {to}: {tm} di viaggio. Inserisci gli indirizzi e ottieni subito un prezzo fisso. Prenoti online in pochi minuti."
    T[f"Private transfer from {en} to Split Airport: {tm} drive. Enter your addresses for an instant fixed price. Book online in minutes."] = f"Transfer privato {frm} all'aeroporto di Spalato: {tm} di viaggio. Inserisci gli indirizzi e ottieni subito un prezzo fisso. Prenoti online in pochi minuti."
    T[f"Split Airport to {en} Transfer | Airport Split Transfer"] = f"Transfer dall'aeroporto di Spalato {to} | Airport Split Transfer"
    T[f"{en} to Split Airport Transfer | Airport Split Transfer"] = f"Transfer {frm} all'aeroporto di Spalato | Airport Split Transfer"
T.update({
"Split Airport to Biograd na Moru | Airport Split Transfer": "Transfer dall'aeroporto di Spalato a Biograd na Moru | Airport Split Transfer",
"Private transfer from Split Airport to Biograd na Moru: 1 h 10 min drive. Enter your addresses for an instant fixed price.": "Transfer privato dall'aeroporto di Spalato a Biograd na Moru: 1 h 10 min di viaggio. Inserisci gli indirizzi e ottieni subito un prezzo fisso.",
"Biograd na Moru is a historic coastal town midway to Zadar, home to Marina Kornati, one of Croatia's largest marinas and the main gateway for sailing charters to the Kornati and Telašćica national parks. Joining a charter? See our": "Biograd na Moru è una storica cittadina costiera a metà strada verso Zadar, sede della Marina Kornati, una delle marine più grandi della Croazia e principale punto di partenza dei charter verso il Parco nazionale delle Kornati e il Parco naturale di Telašćica. Ti imbarchi su un charter? Vedi la nostra",
"Marina Kornati transfer page": "pagina dei transfer per la Marina Kornati",
"Biograd na Moru is a historic coastal town midway to Zadar, home to Marina Kornati, one of Croatia's largest marinas and the main gateway for sailing charters to the Kornati and Telašćica national parks.": "Biograd na Moru è una storica cittadina costiera a metà strada verso Zadar, sede della Marina Kornati, una delle marine più grandi della Croazia e principale punto di partenza dei charter verso il Parco nazionale delle Kornati e il Parco naturale di Telašćica.",
"100 km": "100 km",
"Your driver meets you at Split Airport arrivals with a name board, ready to help with luggage. From there it's a direct run to Biograd na Moru and Marina Kornati: no shared shuttle, no extra stops, no taximeter.": "L'autista ti aspetta agli arrivi dell'aeroporto di Spalato con un cartello con il tuo nome, pronto ad aiutarti con i bagagli. Da lì si va direttamente a Biograd na Moru e alla Marina Kornati: niente navetta condivisa, niente fermate intermedie, niente tassametro.",
"The price depends on which vehicle you choose: a fixed rate per vehicle class, not per passenger, so a full car costs the same as travelling alone. Popular with sailing crews joining a charter at Marina Kornati and needing to move gear straight from arrivals.": "Il prezzo dipende dal veicolo scelto: una tariffa fissa per tipo di veicolo, non per passeggero, quindi un'auto piena costa come viaggiare da soli. Molto richiesto dagli equipaggi che si imbarcano alla Marina Kornati e devono portare l'attrezzatura direttamente dagli arrivi.",
"Murter is a bridge-connected island town north of Split, best known as the main gateway to the Kornati archipelago and its national park.": "Murter è un paese su un'isola collegata alla terraferma da un ponte, a nord di Spalato, noto soprattutto come principale porta d'accesso all'arcipelago delle Kornati e al suo parco nazionale.",
"68 km": "68 km",
"Podgora is a quiet resort town on the Makarska Riviera, set beneath the Biokovo mountain with pebble beaches and a relaxed seafront promenade.": "Podgora è una tranquilla località della Riviera di Makarska, ai piedi del monte Biokovo, con spiagge di ciottoli e un rilassante lungomare.",
"88 km": "88 km",
"Šibenik is the oldest native Croatian town on the Adriatic, home to the UNESCO-listed St. James Cathedral and gateway to the Kornati islands.": "Šibenik è la più antica città croata dell'Adriatico, sede della Cattedrale di San Giacomo, patrimonio UNESCO, e porta d'accesso alle isole Kornati.",
"50 km": "50 km",
"55 min": "55 min",
"Vodice is a lively marina town just north of Šibenik, popular for its beach promenade and easy access to the Krka waterfalls.": "Vodice è una vivace località con marina appena a nord di Šibenik, apprezzata per il lungomare sulla spiaggia e la vicinanza alle cascate di Krka.",
"55 km": "55 km",
"1 h": "1 h",
"Zadar blends a Roman and Venetian old town with modern landmarks like the Sea Organ, roughly ninety minutes north of Split along the A1.": "Zadar unisce un centro storico romano e veneziano a simboli moderni come l'Organo marino, a circa novanta minuti a nord di Spalato lungo l'autostrada A1.",
"160 km": "160 km",
"1 h 45 min": "1 h 45 min",
"Both a private one-way transfer from Split Airport to Plitvice Lakes and a private full-day trip with return to Split start from €430. For a one-way transfer, the exact price depends on your pickup and drop-off address. Enter both in our booking form to see an instant, fixed price for the Sedan or for the Business Van/Van: tolls, fuel and meet-and-greet at arrivals are always included.": "Sia il transfer privato di sola andata dall'aeroporto di Spalato ai Laghi di Plitvice sia l'escursione privata di un giorno con rientro a Spalato partono da 430 €. Per il transfer di sola andata il prezzo esatto dipende dall'indirizzo di partenza e di arrivo. Inseriscili entrambi nel modulo di prenotazione e vedrai subito il prezzo fisso per la berlina o per il van: pedaggi, carburante e accoglienza agli arrivi sono sempre inclusi.",
"Plitvice Lakes National Park, a UNESCO World Heritage Site, is a chain of sixteen terraced turquoise lakes connected by waterfalls, best visited as a full day trip.": "Il Parco nazionale dei Laghi di Plitvice, patrimonio mondiale UNESCO, è una catena di sedici laghi turchesi a terrazze collegati da cascate, da visitare idealmente con un'escursione di un giorno.",
"260 km": "260 km",
"3 h": "3 h",
"View the Day Trip": "Vedi l'escursione",
})
