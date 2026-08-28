# Online Survival Test · v0.5.3.2

Statische, lokal laufende Website für einen anspruchsvollen Medienkompetenz-Test für ca. 11- und 13-Jährige.

## Neu in v0.5.3

- **Screenshot-Lab:** echte PNG-Screenshot-Simulationen statt nur HTML-Karten.
- **Anklickbare Hotspots:** Kinder markieren Warnzeichen direkt im Profil bzw. Chat.
- **Grooming-Fokus:** mehr Aufgaben zu Vertrauensaufbau, Isolation, Geheimhaltung, Geschenken, Gegenleistungen, privaten Kanälen und Kurskorrektur.
- **Gruppendruck/Cybermobbing:** Grenzen im Chat erkennen und unterscheiden, wer die Grenze setzt und wer sie verletzt.
- **Eltern-/Lehrer-Modus erweitert:** Bei der Nachbesprechung einer gerade absolvierten Testsession wird sichtbar, welche visuellen Warnzeichen erkannt, übersehen oder fälschlich markiert wurden.
- **Pädagogische Fokusnotizen** bei ausgewählten Aufgaben.
- **Druck/PDF:** Ergebnisbalken bleiben auch beim PDF-Druck sichtbar.

## Starten

Einfach `index.html` öffnen. Für Hosting den gesamten Ordner unverändert bereitstellen.

Geeignet für GitHub Pages, Netlify, Cloudflare Pages, Vercel Static Hosting oder klassischen Webspace. Es wird kein Backend benötigt.

## Dateien

- `index.html` – Oberfläche
- `app.js` – Hauptfragen und Basisauswertung
- `social-pack.js` – zusätzliche Social-/Grooming-Aufgaben
- `visual-pack.js` – visuelle HTML-Simulationen
- `scenario-engine.js` – verzweigte Entscheidungssimulationen
- `educator.js` – Eltern-/Lehrer-Modus
- `v05-pack.js` – Screenshot-Lab, Hotspots und Session-Nachbesprechung
- `styles.css` – komplettes Styling und Print-CSS
- `assets/screenshots/*.png` – eigens erstellte, vollständig fiktive Screenshot-Simulationen

## Datenschutz

Die Website sendet keine Testergebnisse an einen Server. Alles läuft lokal im Browser. Alle dargestellten Personen, Accounts, Plattformen und Chatverläufe sind fiktiv.

## Hinweis

Der Test ist kein diagnostisches Instrument. Besonders bei Grooming, Erpressung oder Cybermobbing sollte das Ergebnis als Gesprächseinstieg verstanden werden. Ein wichtiges Lernziel ist, dass Kinder auch nach einem Fehler jederzeit stoppen, Hilfe holen und eine Situation neu bewerten können.


## Neu in v0.5.3: Echtfoto-vs-KI-Lab

Eine neue Expert-Aufgabe zeigt sechs Porträts. Drei sind echte Fotografien von Pexels, drei wurden mit KI speziell für den Test erzeugt. Pro Bild wird „Echte Fotografie“ oder „KI-generiert“ gewählt. Die Auswertung bewertet jedes Bild einzeln.

**Datenschutz/Hosting-Hinweis:** Die drei Pexels-Vergleichsfotos werden in dieser Version direkt von `images.pexels.com` geladen. Testergebnisse und Antworten bleiben vollständig lokal im Browser. Wenn du den Test ohne externe Bildaufrufe hosten willst, lade die drei Pexels-Fotos selbst herunter, lege sie unter `assets/people/` ab und ersetze die drei URLs in `v051-pack.js` durch lokale Pfade. Beachte dabei die Pexels-Lizenz und ggf. Persönlichkeitsrechte der abgebildeten Personen.

Pädagogisch wichtig: Die Aufgabe soll nicht vermitteln, dass KI-Bilder immer zuverlässig „am Gesicht“ erkannt werden können. Im Eltern-/Lehrer-Modus wird deshalb ausdrücklich empfohlen, Quellenprüfung und Kontext höher zu gewichten als reine visuelle Intuition.


## Neu in v0.5.3

Screenshot-Labs verwenden keine vorab klickbaren Hotspot-Flächen mehr. Der **gesamte Screenshot ist frei markierbar**. Ein Klick/Tap setzt eine sichtbare Markierung an exakt dieser Position; ein Klick auf die Markierung entfernt sie wieder. Die Lösungsrechtecke bleiben unsichtbar und werden ausschließlich intern zur Auswertung verwendet. Dadurch kann die Oberfläche nicht mehr verraten, welche Nachrichten oder Bildbereiche als Antwort vorgesehen sind.

## v0.5.9
- KI-Bilder-Lab mit sechs eindeutig unterschiedlichen Personen.
- Echt- und KI-Bilder unter vergleichbaren Alltags-Fotobedingungen statt Lookalike-Paaren.
- Keine Nummern/Bubbles/Overlays auf den Fotos.
- Alle sechs Bilder lokal, 600×600 px und byte-genau gleich groß; zusätzlich Preloading.
- Reihenfolge wird pro neuem Testdurchlauf zufällig gemischt.
- Pro Bild zusätzliche Sicherheitseinschätzung von 50–100 %.
- Ergebnis kann hochsichere Fehlentscheidungen als Gesprächsanlass markieren.


## v0.5.9
- Antwortreihenfolge aller normalen Auswahlfragen wird pro Seitenaufruf zufällig gemischt; richtige und Red-Flag-Indizes werden korrekt remappt.
- Antwortreihenfolge in allen Branching-Simulationen wird ebenfalls zufällig gemischt.
- Formulierungen bei Sprachnachricht, Free-Robux-Frage und privatem Bild korrigiert.
- Gruppenchat-Simulation verwendet nun ein plausibles peinliches Foto statt eines unmöglichen „Screenshots von einem Versprecher“.
- Gruppenchat-Screenshot komplett neu gerendert: dunkle Message-Bubbles und sichtbares tatsächlich gesendetes Bild.
- Ergebnisansicht enthält eine detaillierte Nachbesprechung mit eigener Antwort/Markierung und erwarteter Lösung; Screenshot-Aufgaben zeigen Nutzer-Markierungen und erwartete Bereiche direkt im Bild.
