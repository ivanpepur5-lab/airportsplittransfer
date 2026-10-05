# Templated route pages: built from a place table with Croatian cases.
# (EN name, nominative, genitive used after "do"/"iz", EN time, km)
PLACES = [
 ("Split City Center / Ferry Port", "Split centar / trajektna luka", "centra Splita / trajektne luke", "25 min", "u centru Splita ili u trajektnoj luci"),
 ("Podstrana", "Podstrana", "Podstrane", "30 min", "u Podstrani"),
 ("Omiš", "Omiš", "Omiša", "45 min", "u Omišu"),
 ("Makarska", "Makarska", "Makarske", "1 h 20 min", "u Makarskoj"),
 ("Dubrovnik", "Dubrovnik", "Dubrovnika", "3 h 30 min", "u Dubrovniku"),
 ("Brela", "Brela", "Brela", "1 h 5 min", "u Brelima"),
 ("Baška Voda", "Baška Voda", "Baške Vode", "1 h 10 min", "u Baškoj Vodi"),
 ("Trogir", "Trogir", "Trogira", "15 min", "u Trogiru"),
 ("Kaštela", "Kaštela", "Kaštela", "20 min", "u Kaštelima"),
]
T = {}
for en, nom, gen, tm, loc in PLACES:
    T[f"How much does a transfer from Split Airport to {en} cost?"] = f"Koliko košta transfer od Zračne luke Split do {gen}?"
    T[f"How long is the drive from Split Airport to {en}?"] = f"Koliko traje vožnja od Zračne luke Split do {gen}?"
    T[f"The journey takes approximately {tm}, depending on traffic and time of year."] = f"Vožnja traje otprilike {tm}, ovisno o prometu i dobu godine."
    T[f"Private Transfer to {en}"] = f"Privatni transfer do {gen}"
    T[f"Your driver meets you at Split Airport arrivals with a name board, ready to help with luggage. From there it's a direct run to {en}: no shared shuttle, no extra stops, no taximeter."] = f"Vozač vas čeka u dolaznom terminalu Zračne luke Split s vašim imenom na tabli i pomaže s prtljagom. Odatle vozite izravno do {gen}: bez zajedničkog shuttlea, bez usputnih stajanja i bez taksimetra."
    T[f"Split Airport → {en}"] = f"Zračna luka Split → {nom}"
    T[f"{en} → Split Airport"] = f"{nom} → Zračna luka Split"
    T[f"How much does a transfer from {en} to Split Airport cost?"] = f"Koliko košta transfer iz {gen} do Zračne luke Split?"
    T[f"How long is the drive from {en} to Split Airport?"] = f"Koliko traje vožnja iz {gen} do Zračne luke Split?"
    T[f"Your driver picks you up at your {en} address and drives you directly to Split Airport: no shared shuttle, no extra stops, no taximeter."] = f"Vozač vas preuzima na vašoj adresi {loc} i vozi izravno do Zračne luke Split: bez zajedničkog shuttlea, bez usputnih stajanja i bez taksimetra."
    T[f"Split Airport to {en} transfer"] = f"transfer od Zračne luke Split do {gen}"
    T[f"Private transfer from Split Airport to {en}: {tm} drive. Enter your addresses for an instant fixed price. Book online in minutes."] = f"Privatni transfer od Zračne luke Split do {gen}: vožnja {tm}. Upišite adrese i odmah dobivate fiksnu cijenu. Online rezervacija za par minuta."
    T[f"Private transfer from {en} to Split Airport: {tm} drive. Enter your addresses for an instant fixed price. Book online in minutes."] = f"Privatni transfer iz {gen} do Zračne luke Split: vožnja {tm}. Upišite adrese i odmah dobivate fiksnu cijenu. Online rezervacija za par minuta."
    T[f"Split Airport to {en} Transfer | Airport Split Transfer"] = f"Transfer od Zračne luke Split do {gen} | Airport Split Transfer"
    T[f"{en} to Split Airport Transfer | Airport Split Transfer"] = f"Transfer iz {gen} do Zračne luke Split | Airport Split Transfer"

T.update({
"Split Airport to Split City and Ferry Port | Airport Split Transfer": "Taxi Split aerodrom do centra i trajektne luke | Airport Split Transfer",
"Split City and Ferry Port to Split Airport | Airport Split Transfer": "Taxi od centra Splita i trajekta do aerodroma | Airport Split Transfer",
"Split Airport to Dubrovnik Private Transfer | Airport Split Transfer": "Privatni transfer Zračna luka Split do Dubrovnika | Airport Split Transfer",
"The exact price depends on your pickup and drop-off address. Enter both in our booking form to see an instant, fixed price for the Sedan or for the Business Van/Van: tolls, fuel and meet-and-greet at arrivals are always included.": "Točna cijena ovisi o adresi polazišta i odredišta. Upišite obje u obrazac za rezervaciju i odmah ćete vidjeti fiksnu cijenu za limuzinu ili kombi: cestarina, gorivo i doček u dolaznom terminalu uvijek su uključeni.",
"Yes, select \"Return\" when booking to schedule both legs of your trip together. A return transfer automatically includes a 5% discount on the total price.": "Da, pri rezervaciji odaberite \"Povratna\" i dogovorite obje vožnje odjednom. Povratni transfer automatski uključuje 5% popusta na ukupnu cijenu.",
"Airport Transfer": "Aerodromski transfer",
"Split city centre and the ferry port share one flat rate: a Roman-walled old town wrapped around Diocletian's Palace, with the airport just twenty minutes up the coast road.": "Centar Splita i trajektna luka imaju istu cijenu: stara jezgra unutar zidina Dioklecijanove palače, a aerodrom je dvadesetak minuta vožnje uz obalu.",
"Get your fixed price": "Izračunaj fiksnu cijenu",
"Distance": "Udaljenost",
"Travel Time": "Trajanje vožnje",
"Fixed Price": "Fiksna cijena",
"All-Inclusive, No Hidden Fees": "Sve uključeno, bez skrivenih troškova",
"Automatic Return Discount": "Automatski popust na povratnu vožnju",
"About This Route": "O ovoj ruti",
"The price depends on which vehicle you choose: a fixed rate per vehicle class, not per passenger, so a full car costs the same as travelling alone.": "Cijena ovisi o vozilu koje odaberete: fiksna je po vozilu, a ne po putniku, pa puni auto košta isto kao da putujete sami.",
"Enter your exact pickup and drop-off address to get an instant, fixed price for the Sedan and for the Business Van/Van on this route.": "Upišite točnu adresu polazišta i odredišta i odmah dobivate fiksnu cijenu za limuzinu i kombi na ovoj ruti.",
"Podstrana is a quiet coastal suburb just southeast of Split, a short hop along the water from the airport.": "Podstrana je mirno mjesto uz more odmah jugoistočno od Splita, na kratkoj vožnji uz obalu od aerodroma.",
"Omiš sits where the Cetina River cuts through limestone cliffs into the Adriatic, a short run south of Split along the coastal road.": "Omiš leži na mjestu gdje se rijeka Cetina probija kroz vapnenačke stijene u Jadran, kratko južno od Splita uz obalnu cestu.",
"Makarska is the anchor town of the Makarska Riviera, backed by the Biokovo massif and fronted by a long pebble beach and palm-lined promenade.": "Makarska je središte Makarske rivijere, ispod masiva Biokova, s dugom šljunčanom plažom i rivom s palmama.",
"Dubrovnik's walled old town on the southern Adriatic is reached from Split via the coastal road, crossing the short Neum corridor in Bosnia and Herzegovina.": "Do dubrovačke stare jezgre unutar zidina iz Splita se vozi obalnom cestom, preko kratkog koridora kod Neuma u Bosni i Hercegovini.",
"Brela is famous for pine-shaded coves and the Punta Rata beach, regularly ranked among the most photographed beaches in Croatia.": "Brela su poznata po uvalama u hladu borova i plaži Punta Rata, jednoj od najfotografiranijih plaža u Hrvatskoj.",
"Baška Voda is a quieter resort town on the Makarska Riviera, known for its long shingle beach and relaxed harbour promenade.": "Baška Voda je mirnije turističko mjesto na Makarskoj rivijeri, poznato po dugoj šljunčanoj plaži i opuštenoj rivi.",
"How early should I book my pickup for a flight from Split Airport?": "Koliko ranije trebam rezervirati preuzimanje za let iz Zračne luke Split?",
"Tell us your flight time when you book and we'll schedule your pickup accordingly. We recommend allowing at least 2.5-3 hours before departure. If your plans change, just message us on WhatsApp and we'll adjust the pickup time.": "Pri rezervaciji nam napišite vrijeme leta i prema njemu ćemo dogovoriti preuzimanje. Preporučujemo da na aerodromu budete barem 2,5 do 3 sata prije polijetanja. Ako se planovi promijene, javite nam se na WhatsApp i pomaknut ćemo vrijeme preuzimanja.",
"Private Transfer to Split Airport": "Privatni transfer do Zračne luke Split",
"Travelling the other way? See our": "Putujete u suprotnom smjeru? Pogledajte",
"20 km": "20 km", "27 km": "27 km", "45 km": "45 km", "89 km": "89 km", "230 km": "230 km", "60 km": "60 km", "65 km": "65 km",
"25 min": "25 min", "30 min": "30 min", "45 min": "45 min", "1 h 20 min": "1 h 20 min", "3 h 30 min": "3 h 30 min", "1 h 5 min": "1 h 5 min", "1 h 10 min": "1 h 10 min",
})
