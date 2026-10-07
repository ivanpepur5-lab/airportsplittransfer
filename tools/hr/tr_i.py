# More route pages from the same templates as tr_d (phase 2).
# (EN name, nominative, genitive after do/iz, EN time, locative)
PLACES = [
 ("Biograd na Moru", "Biograd na Moru", "Biograda na Moru", "1 h 10 min", "u Biogradu na Moru"),
 ("Murter", "Murter", "Murtera", "1 h 10 min", "u Murteru"),
 ("Podgora", "Podgora", "Podgore", "1 h 20 min", "u Podgori"),
 ("Šibenik", "Šibenik", "Šibenika", "55 min", "u Šibeniku"),
 ("Vodice", "Vodice", "Vodica", "1 h", "u Vodicama"),
 ("Zadar", "Zadar", "Zadra", "1 h 45 min", "u Zadru"),
 ("Plitvice Lakes", "Plitvička jezera", "Plitvičkih jezera", "3 h", "na Plitvičkim jezerima"),
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
"Split Airport to Biograd na Moru | Airport Split Transfer": "Transfer od Zračne luke Split do Biograda na Moru | Airport Split Transfer",
"Private transfer from Split Airport to Biograd na Moru: 1 h 10 min drive. Enter your addresses for an instant fixed price.": "Privatni transfer od Zračne luke Split do Biograda na Moru: vožnja 1 h 10 min. Upišite adrese i odmah dobivate fiksnu cijenu.",
"Biograd na Moru is a historic coastal town midway to Zadar, home to Marina Kornati, one of Croatia's largest marinas and the main gateway for sailing charters to the Kornati and Telašćica national parks. Joining a charter? See our": "Biograd na Moru je povijesni gradić na obali na pola puta do Zadra, u kojem je Marina Kornati, jedna od najvećih marina u Hrvatskoj i glavna polazna točka charter plovidbe prema Nacionalnom parku Kornati i Parku prirode Telašćica. Idete na charter? Pogledajte našu",
"Marina Kornati transfer page": "stranicu za transfer do Marine Kornati",
"Biograd na Moru is a historic coastal town midway to Zadar, home to Marina Kornati, one of Croatia's largest marinas and the main gateway for sailing charters to the Kornati and Telašćica national parks.": "Biograd na Moru je povijesni gradić na obali na pola puta do Zadra, u kojem je Marina Kornati, jedna od najvećih marina u Hrvatskoj i glavna polazna točka charter plovidbe prema Nacionalnom parku Kornati i Parku prirode Telašćica.",
"100 km": "100 km",
"Your driver meets you at Split Airport arrivals with a name board, ready to help with luggage. From there it's a direct run to Biograd na Moru and Marina Kornati: no shared shuttle, no extra stops, no taximeter.": "Vozač vas čeka u dolaznom terminalu Zračne luke Split s vašim imenom na tabli i pomaže s prtljagom. Odatle vozite izravno do Biograda na Moru i Marine Kornati: bez zajedničkog shuttlea, bez usputnih stajanja i bez taksimetra.",
"The price depends on which vehicle you choose: a fixed rate per vehicle class, not per passenger, so a full car costs the same as travelling alone. Popular with sailing crews joining a charter at Marina Kornati and needing to move gear straight from arrivals.": "Cijena ovisi o vozilu koje odaberete: fiksna je po vozilu, a ne po putniku, pa puni auto košta isto kao da putujete sami. Česta je među posadama koje se ukrcavaju na charter u Marini Kornati i opremu moraju prevesti ravno s aerodroma.",
"Murter is a bridge-connected island town north of Split, best known as the main gateway to the Kornati archipelago and its national park.": "Murter je otočno mjesto sjeverno od Splita, s kopnom povezano mostom, najpoznatije kao glavna polazna točka prema Kornatima i nacionalnom parku.",
"68 km": "68 km",
"Podgora is a quiet resort town on the Makarska Riviera, set beneath the Biokovo mountain with pebble beaches and a relaxed seafront promenade.": "Podgora je mirno turističko mjesto na Makarskoj rivijeri, podno Biokova, sa šljunčanim plažama i opuštenom šetnicom uz more.",
"88 km": "88 km",
"Šibenik is the oldest native Croatian town on the Adriatic, home to the UNESCO-listed St. James Cathedral and gateway to the Kornati islands.": "Šibenik je najstariji hrvatski grad na Jadranu, s katedralom sv. Jakova pod zaštitom UNESCO-a i polazna točka prema Kornatima.",
"50 km": "50 km",
"55 min": "55 min",
"Vodice is a lively marina town just north of Šibenik, popular for its beach promenade and easy access to the Krka waterfalls.": "Vodice su živo mjesto s marinom odmah sjeverno od Šibenika, omiljeno zbog šetnice uz plažu i blizine slapova Krke.",
"55 km": "55 km",
"1 h": "1 h",
"Zadar blends a Roman and Venetian old town with modern landmarks like the Sea Organ, roughly ninety minutes north of Split along the A1.": "Zadar spaja rimsku i mletačku staru jezgru sa suvremenim znamenitostima poput Morskih orgulja, otprilike devedeset minuta sjeverno od Splita autocestom A1.",
"160 km": "160 km",
"1 h 45 min": "1 h 45 min",
"Both a private one-way transfer from Split Airport to Plitvice Lakes and a private full-day trip with return to Split start from €430. For a one-way transfer, the exact price depends on your pickup and drop-off address. Enter both in our booking form to see an instant, fixed price for the Sedan or for the Business Van/Van: tolls, fuel and meet-and-greet at arrivals are always included.": "I privatni transfer u jednom smjeru od Zračne luke Split do Plitvičkih jezera i privatni cjelodnevni izlet s povratkom u Split počinju od 430 €. Za transfer u jednom smjeru točna cijena ovisi o adresi polazišta i odredišta. Upišite obje u obrazac za rezervaciju i odmah ćete vidjeti fiksnu cijenu za limuzinu ili kombi: cestarina, gorivo i doček u dolaznom terminalu uvijek su uključeni.",
"Plitvice Lakes National Park, a UNESCO World Heritage Site, is a chain of sixteen terraced turquoise lakes connected by waterfalls, best visited as a full day trip.": "Nacionalni park Plitvička jezera, na UNESCO-ovu popisu svjetske baštine, niz je od šesnaest kaskadnih tirkiznih jezera povezanih slapovima, a najbolje ga je posjetiti kao cjelodnevni izlet.",
"260 km": "260 km",
"3 h": "3 h",
"View the Day Trip": "Pogledaj izlet",
})
