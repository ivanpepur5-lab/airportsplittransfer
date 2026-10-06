# Templated route pages: built from a place table with Italian prepositions.
# (EN name, nominative, "to" form, "from" form, EN time, "at your address in" form)
SIMPLE = ["Podstrana", "Omiš", "Makarska", "Dubrovnik", "Brela", "Baška Voda", "Trogir", "Kaštela"]
TIMES = {"Podstrana": "30 min", "Omiš": "45 min", "Makarska": "1 h 20 min", "Dubrovnik": "3 h 30 min", "Brela": "1 h 5 min", "Baška Voda": "1 h 10 min", "Trogir": "15 min", "Kaštela": "20 min"}
PLACES = [("Split City Center / Ferry Port", "Centro di Spalato / porto traghetti", "al centro di Spalato o al porto traghetti", "dal centro di Spalato o dal porto traghetti", "25 min", "nel centro di Spalato o al porto")]
PLACES += [(p, p, "a " + p, "da " + p, TIMES[p], "a " + p) for p in SIMPLE]
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
"Split Airport to Split City and Ferry Port | Airport Split Transfer": "Transfer dall'aeroporto di Spalato al centro e al porto | Airport Split Transfer",
"Split City and Ferry Port to Split Airport | Airport Split Transfer": "Transfer dal centro di Spalato e dal porto all'aeroporto | Airport Split Transfer",
"Split Airport to Dubrovnik Private Transfer | Airport Split Transfer": "Transfer privato dall'aeroporto di Spalato a Dubrovnik | Airport Split Transfer",
"The exact price depends on your pickup and drop-off address. Enter both in our booking form to see an instant, fixed price for the Sedan or for the Business Van/Van: tolls, fuel and meet-and-greet at arrivals are always included.": "Il prezzo esatto dipende dall'indirizzo di partenza e di arrivo. Inseriscili entrambi nel modulo di prenotazione e vedrai subito il prezzo fisso per la berlina o per il van: pedaggi, carburante e accoglienza agli arrivi sono sempre inclusi.",
"Yes, select \"Return\" when booking to schedule both legs of your trip together. A return transfer automatically includes a 5% discount on the total price.": "Sì, scegli \"Andata e ritorno\" durante la prenotazione per organizzare entrambe le tratte insieme. Il ritorno include automaticamente uno sconto del 5% sul prezzo totale.",
"Airport Transfer": "Transfer aeroportuale",
"Split city centre and the ferry port share one flat rate: a Roman-walled old town wrapped around Diocletian's Palace, with the airport just twenty minutes up the coast road.": "Il centro di Spalato e il porto dei traghetti hanno la stessa tariffa: un centro storico racchiuso nelle mura romane del Palazzo di Diocleziano, con l'aeroporto a soli venti minuti lungo la strada costiera.",
"Get your fixed price": "Calcola il prezzo fisso",
"Distance": "Distanza",
"Travel Time": "Durata del viaggio",
"Fixed Price": "Prezzo fisso",
"All-Inclusive, No Hidden Fees": "Tutto incluso, nessun costo nascosto",
"Automatic Return Discount": "Sconto automatico sul ritorno",
"About This Route": "Questo percorso",
"The price depends on which vehicle you choose: a fixed rate per vehicle class, not per passenger, so a full car costs the same as travelling alone.": "Il prezzo dipende dal veicolo scelto: una tariffa fissa per tipo di veicolo, non per passeggero, quindi un'auto piena costa come viaggiare da soli.",
"Enter your exact pickup and drop-off address to get an instant, fixed price for the Sedan and for the Business Van/Van on this route.": "Inserisci l'indirizzo esatto di partenza e di arrivo per ottenere subito il prezzo fisso della berlina e del van su questo percorso.",
"Podstrana is a quiet coastal suburb just southeast of Split, a short hop along the water from the airport.": "Podstrana è una tranquilla località costiera appena a sud-est di Spalato, a breve distanza dall'aeroporto lungo il mare.",
"Omiš sits where the Cetina River cuts through limestone cliffs into the Adriatic, a short run south of Split along the coastal road.": "Omiš sorge dove il fiume Cetina si apre un varco tra le pareti calcaree e sfocia nell'Adriatico, poco a sud di Spalato lungo la strada costiera.",
"Makarska is the anchor town of the Makarska Riviera, backed by the Biokovo massif and fronted by a long pebble beach and palm-lined promenade.": "Makarska è il centro principale della Riviera di Makarska, ai piedi del massiccio del Biokovo, con una lunga spiaggia di ciottoli e un lungomare con le palme.",
"Dubrovnik's walled old town on the southern Adriatic is reached from Split via the coastal road, crossing the short Neum corridor in Bosnia and Herzegovina.": "Il centro storico murato di Dubrovnik, nell'Adriatico meridionale, si raggiunge da Spalato lungo la strada costiera, attraversando il breve corridoio di Neum in Bosnia ed Erzegovina.",
"Brela is famous for pine-shaded coves and the Punta Rata beach, regularly ranked among the most photographed beaches in Croatia.": "Brela è famosa per le calette all'ombra dei pini e per la spiaggia di Punta Rata, spesso citata tra le più fotografate della Croazia.",
"Baška Voda is a quieter resort town on the Makarska Riviera, known for its long shingle beach and relaxed harbour promenade.": "Baška Voda è una località più tranquilla della Riviera di Makarska, nota per la lunga spiaggia di ghiaia e il rilassante lungomare del porto.",
"How early should I book my pickup for a flight from Split Airport?": "Con quanto anticipo devo fissare il ritiro per un volo dall'aeroporto di Spalato?",
"Tell us your flight time when you book and we'll schedule your pickup accordingly. We recommend allowing at least 2.5-3 hours before departure. If your plans change, just message us on WhatsApp and we'll adjust the pickup time.": "Indicaci l'orario del volo quando prenoti e programmeremo il ritiro di conseguenza. Consigliamo di arrivare in aeroporto almeno 2,5–3 ore prima della partenza. Se i tuoi piani cambiano, scrivici su WhatsApp e sposteremo l'orario di ritiro.",
"Private Transfer to Split Airport": "Transfer privato per l'aeroporto di Spalato",
"Travelling the other way? See our": "Viaggi nella direzione opposta? Vedi il nostro",
"20 km": "20 km", "27 km": "27 km", "45 km": "45 km", "89 km": "89 km", "230 km": "230 km", "60 km": "60 km", "65 km": "65 km",
"25 min": "25 min", "30 min": "30 min", "45 min": "45 min", "1 h 20 min": "1 h 20 min", "3 h 30 min": "3 h 30 min", "1 h 5 min": "1 h 5 min", "1 h 10 min": "1 h 10 min",
})
