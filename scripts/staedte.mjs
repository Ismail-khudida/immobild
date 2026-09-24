// Erzeugt die Städteseiten immobilienfotograf-<slug>.html aus EINER Datenquelle.
// Aufruf: node scripts/staedte.mjs   (danach: node scripts/seo-check.mjs)
//
// Warum ein Generator: Sichtbare FAQ und FAQPage-Schema kommen aus demselben Text
// (garantiert zeichengleich), Kopf/Fuß/Pakete bleiben auf allen Seiten identisch,
// und eine neue Stadt ist ein Datensatz statt einer kopierten Datei.
// Städteseiten NICHT von Hand bearbeiten – Änderungen hier vornehmen.
//
// Fakten (Stadtteile, Bausubstanz, Lage) belegt über Wikipedia/offizielle Stadtseiten,
// Fahrzeiten per OSRM ab Bückeburger Str. 14, 32457 Porta Westfalica (Stand 09/2026).

import { writeFileSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const ORIGIN = "https://immobild.ai/";
const TERMIN = "https://calendar.app.google/85Hebvgn6tX9ZhNb6";

const AUFSCHLAG =
  "Die Pakete gelten als ab-Orientierung; ob und in welcher Höhe eine Anfahrtspauschale anfällt, hängt vom genauen Objektstandort ab und wird vorab klar mitgeteilt.";

export const STAEDTE = [
  {
    slug: "minden",
    name: "Minden",
    region: "nrw",
    fahrt: "15–20 Min.",
    description:
      "Immobilienfotograf für Makler in Minden: Fotos, Drohne und 360-Grad-Rundgang – von der Altstadt bis Dankersen. Rund 15 Minuten aus Porta Westfalica.",
    hero: "Foto, Drohne, Video und 360-Grad-Rundgang für Objekte in Minden – von der Altstadt bis Häverstädt, Dankersen und Todtenhausen.",
    h2: "Minden: kurze Wege, vielfältige Objekte.",
    absaetze: [
      "Der Betrieb sitzt in Porta Westfalica, rund 15 Kilometer und etwa 15–20 Fahrminuten von der Mindener Innenstadt entfernt. Betreut werden alle Stadtteile, darunter Dankersen, Häverstädt, Haddenhausen, Kutenhausen, Todtenhausen, Meißen, Päpinghausen und Hahlen.",
      "Die Objekte in Minden sind so unterschiedlich wie die Stadt: Fachwerk und Bauten der Weserrenaissance rund um Scharn und Marktplatz, Lagen an Weser und Mittellandkanal, Wohngebiete in den Stadtteilen. Bei Fachwerkfassaden kommt es auf eine ausgewogene Belichtung an, damit dunkle Balken und helle Gefache gleichzeitig Zeichnung behalten. Wasserlagen und große Grundstücke zeigen sich am besten aus der Luft – dort, wo eine Drohnenaufnahme erlaubt ist.",
    ],
    faq: [
      ["Wie weit ist Minden von Ihnen entfernt?", "Rund 15 Kilometer: Von Porta Westfalica aus ist die Mindener Innenstadt in etwa 15–20 Minuten erreicht. Termine in Minden und den Stadtteilen lassen sich deshalb meist kurzfristig einrichten."],
      ["Gibt es einen Aufschlag für die Anfahrt nach Minden?", "Bei der kurzen Entfernung in der Regel nicht. Die Pakete gelten als ab-Orientierung; ob und in welcher Höhe eine Anfahrtspauschale anfällt, wird vorab klar mitgeteilt."],
      ["Welche Objekte fotografieren Sie in Minden?", "Von der Etagenwohnung in der Innenstadt über Einfamilienhäuser in den Stadtteilen bis zu Gewerbeobjekten und Neubauprojekten, ebenso Fachwerk- und Altbauobjekte in der Altstadt – mit Fotos, auf Wunsch Drohnenaufnahmen, Objektvideo und begehbarem 360-Grad-Rundgang."],
    ],
  },
  {
    slug: "bad-oeynhausen",
    name: "Bad Oeynhausen",
    region: "nrw",
    fahrt: "25–30 Min.",
    description:
      "Immobilienfotograf für Makler in Bad Oeynhausen: Fotos, Drohne und 360-Grad-Rundgang – vom Kurviertel bis Rehme und Werste, rund 25 Minuten entfernt.",
    hero: "Foto, Drohne, Video und 360-Grad-Rundgang für Objekte in Bad Oeynhausen – vom Kurviertel bis Eidinghausen, Rehme und Werste.",
    h2: "Bad Oeynhausen: Kurstadt zwischen Werre und Weser.",
    absaetze: [
      "Von Porta Westfalica aus sind es rund 26 Kilometer bzw. etwa 25–30 Minuten in die Innenstadt von Bad Oeynhausen. Aufnahmen entstehen in der Kernstadt ebenso wie in Dehme, Eidinghausen, Lohe, Rehme, Volmerdingsen, Werste und Wulferdingsen.",
      "Prägend ist das Kurviertel rund um den von Peter Joseph Lenné gestalteten Kurpark mit Badehaus und Kurhaus; viele Gebäude der Innenstadt stammen aus dem Wiederaufbau ab Mitte der 1950er-Jahre. Dazu kommen Lagen an Werre und Weser sowie der Übergang zum Wiehengebirge im Norden. Für Häuser mit Grundstück oder besonderer Lage lohnt der Blick von oben: Eine Drohnenaufnahme zeigt Umfeld, Garten und Anbindung auf einen Blick.",
    ],
    faq: [
      ["Wie weit ist Bad Oeynhausen von Ihnen entfernt?", "Rund 26 Kilometer, etwa 25–30 Minuten mit dem Auto bis in die Innenstadt. Bad Oeynhausen gehört zum regelmäßig betreuten Gebiet, einschließlich aller Ortsteile von Dehme bis Wulferdingsen."],
      ["Gibt es einen Aufschlag für die Anfahrt nach Bad Oeynhausen?", AUFSCHLAG],
      ["Lohnen sich Drohnenaufnahmen für Objekte in Bad Oeynhausen?", "Vor allem bei Häusern mit Grundstück und bei Lagen an Werre oder Weser zeigt eine Luftaufnahme Umfeld und Lage deutlich besser als ein Bild vom Boden. Ob und in welcher Form ein Drohnenflug am jeweiligen Standort erlaubt ist, wird vor dem Termin geklärt."],
    ],
  },
  {
    slug: "herford",
    name: "Herford",
    region: "nrw",
    fahrt: "35–40 Min.",
    description:
      "Immobilienfotograf für Makler in Herford: Fotos, Drohne und 360-Grad-Rundgang für Altstadt, Radewig und alle Stadtbezirke. Rund 35 Minuten Anfahrt.",
    hero: "Foto, Drohne, Video und 360-Grad-Rundgang für Objekte in Herford – von Altstadt und Radewig bis Elverdissen, Laar und Schwarzenmoor.",
    h2: "Herford: Fachwerk, Hügelland, neun Stadtbezirke.",
    absaetze: [
      "Nach Herford sind es von Porta Westfalica rund 39 Kilometer, etwa 35–40 Minuten. Betreut werden die Innenstadt und die Stadtbezirke Diebrock, Eickum, Elverdissen, Falkendiek, Herringhausen, Laar, Schwarzenmoor und Stedefreund.",
      "In der Innenstadt ist der mittelalterliche Grundriss mit Radewig, Altstadt und Neustadt bis heute ablesbar, dazwischen Fachwerkhäuser wie das Remensniderhaus. Außerhalb prägt das sanft hügelige Ravensberger Hügelland das Bild – bis hinauf zum Dornberg in Schwarzenmoor. Bei Fachwerk- und Altbauobjekten zählen ruhige Perspektiven und eine ausgewogene Belichtung; bei Häusern in Hanglage zeigt eine Drohnenaufnahme Grundstück und Umgebung im Zusammenhang.",
    ],
    faq: [
      ["Fahren Sie für Aufnahmen nach Herford?", "Ja. Herford liegt rund 39 Kilometer bzw. etwa 35–40 Minuten entfernt und gehört zum regelmäßig betreuten Gebiet – von der Innenstadt bis in alle Stadtbezirke."],
      ["Gibt es einen Aufschlag für die Anfahrt nach Herford?", AUFSCHLAG],
      ["Fotografieren Sie auch Fachwerk- und Altbauobjekte?", "Ja. Gerade bei Fachwerk kommt es auf eine ausgewogene Belichtung und ruhige, gerade Perspektiven an, damit Balken, Gefache und Details gut zur Geltung kommen. Störende Elemente lassen sich zusätzlich digital entfernen."],
    ],
  },
  {
    slug: "bielefeld",
    name: "Bielefeld",
    region: "nrw",
    fahrt: "45–55 Min.",
    description:
      "Immobilienfotograf für Makler in Bielefeld: Fotos, Drohne und 360-Grad-Rundgang – von Mitte und Schildesche bis Sennestadt. Rund 45 Minuten Anfahrt.",
    hero: "Foto, Drohne, Video und 360-Grad-Rundgang für Objekte in Bielefeld – von Mitte, Schildesche und Brackwede bis Jöllenbeck und Sennestadt.",
    h2: "Bielefeld: Großstadt am Teutoburger Wald.",
    absaetze: [
      "Von Porta Westfalica nach Bielefeld sind es rund 58 Kilometer, etwa 45–55 Minuten. Aufnahmen entstehen in allen Stadtbezirken, etwa in Mitte, Schildesche, Brackwede, Dornberg, Jöllenbeck, Heepen, Stieghorst und Sennestadt.",
      "Der Gebäudebestand ist stark von der Nachkriegszeit geprägt – die historische Altstadt wurde 1944 weitgehend zerstört. Dazu kommen die in den 1950er-Jahren geplante Sennestadt, Hanglagen am Teutoburger Wald und viele kleinere Wohnungen im Umfeld der Universität. Gerade bei Wohnungen entscheidet die Aufnahme, wie hell, groß und ruhig ein Raum im Portal wirkt: Weitwinkel mit Augenmaß, gerade Linien und digital aufgeräumte Räume machen hier den Unterschied.",
    ],
    faq: [
      ["Fahren Sie für Aufnahmen nach Bielefeld?", "Ja. Bielefeld liegt rund 58 Kilometer bzw. etwa 45–55 Minuten entfernt und gehört zum betreuten Gebiet, von der Innenstadt bis in alle Stadtbezirke."],
      ["Gibt es einen Aufschlag für die Anfahrt nach Bielefeld?", AUFSCHLAG],
      ["Lohnt sich ein 360-Grad-Rundgang auch für Wohnungen?", "Oft ja: Interessenten sehen Raumaufteilung und Zustand schon vor dem Termin und fragen gezielter an. Der begehbare Rundgang ist im Komplett-Paket enthalten und wird als Link übergeben."],
    ],
  },
  {
    slug: "luebbecke",
    name: "Lübbecke",
    region: "nrw",
    fahrt: "35–40 Min.",
    description:
      "Immobilienfotograf für Makler in Lübbecke: Fotos, Drohne und 360-Grad-Rundgang am Wiehengebirge – Kernstadt, Gehlenbeck, Nettelstedt und Blasheim.",
    hero: "Foto, Drohne, Video und 360-Grad-Rundgang für Objekte in Lübbecke – von der Kernstadt bis Gehlenbeck, Nettelstedt und Blasheim.",
    h2: "Lübbecke: am Nordrand des Wiehengebirges.",
    absaetze: [
      "Lübbecke liegt rund 36 Kilometer bzw. etwa 35–40 Minuten von Porta Westfalica entfernt. Betreut werden die Kernstadt und die Ortsteile Alswede, Blasheim, Eilhausen, Gehlenbeck, Nettelstedt, Obermehnen, Stockhausen und Untermehnen.",
      "Die Stadt liegt am Übergang vom bewaldeten Wiehengebirge im Süden ins flache Land im Norden. In der Altstadt finden sich neben klassizistischen Bauten wie dem Berliner Hof vereinzelte Fachwerkhäuser an der Langen Straße. Für Häuser mit Grundstück oder in Hanglage ist die Kombination aus Innenaufnahmen und Drohnenblick auf Haus, Garten und Umgebung besonders aussagekräftig.",
    ],
    faq: [
      ["Fahren Sie für Aufnahmen nach Lübbecke?", "Ja. Lübbecke liegt rund 36 Kilometer bzw. etwa 35–40 Minuten entfernt und gehört zum regelmäßig betreuten Gebiet – von der Kernstadt bis in alle Ortsteile."],
      ["Gibt es einen Aufschlag für die Anfahrt nach Lübbecke?", AUFSCHLAG],
      ["Sind Drohnenaufnahmen am Wiehengebirge möglich?", "Häufig ja – für Häuser am Hang oder mit großem Grundstück ist die Luftaufnahme oft das stärkste Bild. Ob am konkreten Standort geflogen werden darf, etwa wegen Schutzgebieten, wird vor dem Termin geklärt."],
    ],
  },
  {
    slug: "bueckeburg",
    name: "Bückeburg",
    region: "nds",
    fahrt: "5–10 Min.",
    description:
      "Immobilienfotograf für Makler in Bückeburg: Fotos, Drohne und 360-Grad-Rundgang aus der direkten Nachbarschaft – rund 7 Minuten aus Porta Westfalica.",
    hero: "Foto, Drohne, Video und 360-Grad-Rundgang für Objekte in Bückeburg – aus der direkten Nachbarschaft, von der Residenzstadt bis Evesen und Meinsen-Warber.",
    h2: "Bückeburg: direkt nebenan, über die Landesgrenze.",
    absaetze: [
      "Der Betrieb liegt an der Bückeburger Straße in Porta Westfalica – bis in die Bückeburger Innenstadt sind es knapp 4 Kilometer, etwa 5–10 Minuten. Näher liegt keine andere Stadt im Einsatzgebiet. Betreut werden die Kernstadt und die Ortsteile Achum, Bergdorf, Cammer, Evesen, Meinsen-Warber, Müsingen, Rusbend und Scheie.",
      "Die ehemalige Residenzstadt der Grafen und Fürsten zu Schaumburg-Lippe ist geprägt von Schloss, Stadtkirche und einer Altstadt im Zeichen der Weserrenaissance; im Norden queren Mittellandkanal und Wohngebiete die Ortsteile. Ein Punkt, der hier wichtig ist: Nordöstlich der Stadt liegt der Heeresflugplatz Bückeburg mit eigener Kontrollzone. Ob und wie eine Drohnenaufnahme am jeweiligen Objekt möglich ist, wird deshalb vor dem Termin geklärt.",
    ],
    faq: [
      ["Wie weit ist Bückeburg von Ihnen entfernt?", "Knapp 4 Kilometer: Der Betrieb liegt an der Bückeburger Straße in Porta Westfalica, die Bückeburger Innenstadt ist in etwa 5–10 Minuten erreicht."],
      ["Arbeiten Sie auch in Niedersachsen?", "Ja. Bückeburg, Rinteln und Stadthagen im Landkreis Schaumburg gehören genauso zum Einsatzgebiet wie Minden oder Herford – die Landesgrenze liegt direkt vor der Tür."],
      ["Sind Drohnenaufnahmen in Bückeburg möglich?", "Oft ja, aber nicht überall ohne Weiteres: Je nach Lage des Objekts kann wegen der Kontrollzone des Heeresflugplatzes Bückeburg eine Freigabe nötig sein. Das wird vor dem Termin für das konkrete Objekt geklärt."],
    ],
  },
  {
    slug: "rinteln",
    name: "Rinteln",
    region: "nds",
    fahrt: "10–15 Min.",
    description:
      "Immobilienfotograf für Makler in Rinteln: Fotos, Drohne und 360-Grad-Rundgang für die Weser-Altstadt und alle Ortsteile – rund 12 Minuten Anfahrt.",
    hero: "Foto, Drohne, Video und 360-Grad-Rundgang für Objekte in Rinteln – von der Altstadt an der Weser bis Steinbergen, Möllenbeck und Exten.",
    h2: "Rinteln: Weserrenaissance zwischen Weser und Bergen.",
    absaetze: [
      "Rinteln grenzt fast direkt an Porta Westfalica – bis in die Altstadt sind es rund 8 Kilometer, etwa 10–15 Minuten. Betreut werden die Kernstadt und die Ortsteile, darunter Exten, Möllenbeck, Steinbergen, Todenmann, Krankenhagen, Deckbergen, Engern und Schaumburg.",
      "Die Altstadt ist bis heute von zahlreichen Fachwerkhäusern und Bauten der Weserrenaissance geprägt. Rundherum liegen Weser, Wesergebirge, Süntel und Lippisches Bergland – viele Objekte haben damit Lagen, die man am besten von oben versteht. Innen gilt bei Fachwerk und Altbau: ausgewogene Belichtung und ruhige Perspektiven, damit Charakter und Raumwirkung zusammenpassen.",
    ],
    faq: [
      ["Wie weit ist Rinteln von Ihnen entfernt?", "Rund 8 Kilometer, etwa 10–15 Minuten bis in die Altstadt. Rinteln gehört damit zu den am schnellsten erreichbaren Orten im Einsatzgebiet."],
      ["Fotografieren Sie auch Fachwerkhäuser in der Rintelner Altstadt?", "Ja. Bei Fachwerk und Altbau kommt es auf eine ausgewogene Belichtung und ruhige, gerade Perspektiven an. Störende Elemente wie Mülltonnen oder parkende Autos lassen sich zusätzlich digital entfernen."],
      ["Betreuen Sie auch Objekte auf der niedersächsischen Seite?", "Ja. Rinteln, Bückeburg und Stadthagen im Landkreis Schaumburg werden genauso betreut wie die Städte in Ostwestfalen – von Porta Westfalica aus liegt die Landesgrenze direkt nebenan."],
    ],
  },
  {
    slug: "stadthagen",
    name: "Stadthagen",
    region: "nds",
    fahrt: "25–30 Min.",
    description:
      "Immobilienfotograf für Makler in Stadthagen: Fotos, Drohne und 360-Grad-Rundgang für Altstadt, Enzen, Probsthagen und Umland – rund 25 Minuten entfernt.",
    hero: "Foto, Drohne, Video und 360-Grad-Rundgang für Objekte in Stadthagen – von der Fachwerk-Altstadt bis Enzen, Obernwöhren und Probsthagen.",
    h2: "Stadthagen: Kreisstadt mit Fachwerk-Altstadt.",
    absaetze: [
      "Stadthagen liegt rund 19 Kilometer bzw. etwa 25–30 Minuten von Porta Westfalica entfernt. Betreut werden die Kernstadt einschließlich Brandenburg und Bruchhof sowie Enzen, Hobbensen, Hörkamp-Langenbruch, Krebshagen, Obernwöhren, Probsthagen und Reinsen.",
      "In der Altstadt stehen zahlreiche Fachwerkhäuser, darunter das Haus zum Wolf von 1575, dazu das Renaissance-Schloss und das Alte Rathaus im Stil der Weserrenaissance. Die Stadt selbst liegt im Flachland, im Süden erhebt sich der Bückeberg, im Nordwesten liegt der Schaumburger Wald. Für Objekte mit Grundstück zeigt eine Drohnenaufnahme Lage und Umgebung auf einen Blick – bei Altstadtobjekten zählen vor allem ruhige, gerade Perspektiven.",
    ],
    faq: [
      ["Fahren Sie für Aufnahmen nach Stadthagen?", "Ja. Stadthagen liegt rund 19 Kilometer bzw. etwa 25–30 Minuten entfernt und gehört zum regelmäßig betreuten Gebiet – von der Kernstadt bis in alle Ortsteile."],
      ["Gibt es einen Aufschlag für die Anfahrt nach Stadthagen?", AUFSCHLAG],
      ["Arbeiten Sie auch im übrigen Landkreis Schaumburg?", "Auf Anfrage ja. Schwerpunkt im Landkreis Schaumburg sind Bückeburg, Rinteln und Stadthagen; für Objekte in anderen Orten der Region wird die Anfahrt vorab abgestimmt."],
    ],
  },
];

const esc = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const file = (c) => `immobilienfotograf-${c.slug}.html`;
const url = (c) => ORIGIN + file(c);
const PIX = "data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
const srcset = (b) => `assets/${b}-640.webp 640w, assets/${b}-960.webp 960w, assets/${b}.webp 1264w`;
const HERO_SIZES = "(max-width: 1020px) calc(100vw - 40px), 520px";

function page(c) {
  const title = `Immobilienfotograf ${c.name} – Immobild.ai`;
  const land = c.region === "nds" ? "Niedersachsen" : "NRW";
  const ogDesc = `Foto, Drohne, Video und 360-Grad-Rundgang für Makler in ${c.name}, sauber produziert und online bereitgestellt.`;
  const jsonld = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebPage",
        "@id": `${url(c)}#page`,
        url: url(c),
        name: title,
        inLanguage: "de-DE",
        isPartOf: { "@id": `${ORIGIN}#website` },
        about: { "@id": `${ORIGIN}#business` },
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Startseite", item: ORIGIN },
          { "@type": "ListItem", position: 2, name: c.name, item: url(c) },
        ],
      },
      {
        "@type": "Service",
        "@id": `${url(c)}#service`,
        name: `Immobilienfotografie in ${c.name}`,
        serviceType: "Immobilienfotografie, Drohnenaufnahmen, 360-Grad-Rundgang",
        provider: { "@id": `${ORIGIN}#business` },
        areaServed: { "@type": "City", name: c.name, containedInPlace: { "@type": "State", name: land === "NRW" ? "Nordrhein-Westfalen" : "Niedersachsen" } },
        offers: {
          "@type": "Offer",
          priceCurrency: "EUR",
          priceSpecification: { "@type": "PriceSpecification", minPrice: 399, priceCurrency: "EUR", valueAddedTaxIncluded: false },
        },
      },
      {
        "@type": "FAQPage",
        mainEntity: c.faq.map(([q, a]) => ({ "@type": "Question", name: q, acceptedAnswer: { "@type": "Answer", text: a } })),
      },
    ],
  };
  const others = STAEDTE.filter((o) => o.slug !== c.slug);

  return `<!doctype html>
<html lang="de">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <!-- Google Analytics: gtag.js wird erst nach Einwilligung geladen (Banner in script.js).
         Eine gespeicherte Einwilligung wird VOR 'config' gesetzt, damit der Seitenaufruf korrekt zählt. -->
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      (function () {
        var ok = false;
        try { ok = localStorage.getItem('cookieConsent') === 'granted'; } catch (e) {}
        gtag('consent', 'default', { analytics_storage: ok ? 'granted' : 'denied' });
        gtag('js', new Date());
        gtag('config', 'G-8G34GDTRKY');
        if (ok) {
          var s = document.createElement('script');
          s.async = true;
          s.src = 'https://www.googletagmanager.com/gtag/js?id=G-8G34GDTRKY';
          document.head.appendChild(s);
        }
      })();
    </script>
    <!-- Generiert von scripts/staedte.mjs – nicht von Hand bearbeiten. -->
    <title>${esc(title)}</title>
    <meta name="description" content="${esc(c.description)}">
    <meta name="author" content="Immobild.ai · Ismail Khudida">
    <meta name="robots" content="index, follow">
    <meta name="theme-color" content="#f7f8fb">

    <link rel="canonical" href="${url(c)}">
    <meta property="og:site_name" content="Immobild.ai">
    <meta property="og:title" content="${esc(title)}">
    <meta property="og:description" content="${esc(ogDesc)}">
    <meta property="og:type" content="website">
    <meta property="og:url" content="${url(c)}">
    <meta property="og:locale" content="de_DE">
    <meta property="og:image" content="https://immobild.ai/assets/og-image.jpg">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${esc(title)}">
    <meta name="twitter:description" content="${esc(ogDesc)}">
    <meta name="twitter:image" content="https://immobild.ai/assets/og-image.jpg">

    <link rel="icon" href="favicon.ico" sizes="32x32">
    <link rel="icon" href="favicon.svg" type="image/svg+xml">
    <link rel="icon" type="image/png" sizes="32x32" href="assets/favicon-32.png">
    <link rel="apple-touch-icon" href="assets/apple-touch-icon.png">

    <link rel="preload" as="font" href="assets/fonts/PlusJakartaSans.woff2" type="font/woff2" crossorigin>

    <link rel="stylesheet" href="styles.css">
    <script defer src="script.js"></script>

    <script type="application/ld+json">
${JSON.stringify(jsonld, null, 2).replace(/^/gm, "    ")}
    </script>
  </head>
  <body>
    <a class="skip-link" href="#top">Zum Inhalt springen</a>

    <header class="site-header">
      <a class="brand" href="index.html" aria-label="Immobild.ai Startseite">
        <img class="brand-mark" src="favicon.svg" alt="" width="34" height="34">
        <span>Immobild.ai</span>
      </a>
      <button class="menu-button" type="button" aria-label="Menü öffnen" aria-expanded="false" aria-controls="primary-nav">☰</button>
      <nav id="primary-nav" class="nav" aria-label="Hauptnavigation">
        <a href="index.html#vorher-nachher">Vorher / Nachher</a>
        <a href="index.html#leistungen">Leistungen</a>
        <a href="index.html#pakete">Pakete</a>
        <a href="makler-system.html">Für Maklerbüros</a>
        <a href="index.html#kontakt">Kontakt</a>
      </nav>
      <a class="nav-cta" href="${TERMIN}" target="_blank" rel="noopener">Termin besprechen</a>
    </header>

    <main id="top">
      <!-- HERO -->
      <section class="hero">
        <div class="hero-inner">
          <p class="eyebrow">Immobilienmedien für Makler · ${esc(c.name)}</p>
          <h1>Immobilienaufnahmen für Makler in ${esc(c.name)}.</h1>
          <p class="hero-copy">
            ${esc(c.hero)}
          </p>
          <div class="hero-actions">
            <a class="button primary" href="${TERMIN}" target="_blank" rel="noopener">Termin besprechen</a>
            <a class="button ghost" href="index.html#vorher-nachher">Beispiel ansehen</a>
          </div>
        </div>

        <figure class="stage" aria-label="Aufnahmearten: Kamera, Drohne, 360-Grad-Rundgang">
          <div class="stage-frame">
            <img class="stage-img is-active" data-mode="kamera" src="assets/ref-bedroom.webp" srcset="${srcset("ref-bedroom")}" sizes="${HERO_SIZES}" width="1264" height="848" alt="Immobilienfoto eines Schlafzimmers" fetchpriority="high">
            <img class="stage-img" data-mode="drohne" src="${PIX}" data-src="assets/ref-drone.webp" data-srcset="${srcset("ref-drone")}" sizes="${HERO_SIZES}" width="1264" height="848" alt="Drohnenaufnahme eines Hauses aus der Luft" decoding="async">
            <img class="stage-img" data-mode="360" src="${PIX}" data-src="assets/ba-furnished.webp" data-srcset="${srcset("ba-furnished")}" sizes="${HERO_SIZES}" width="1264" height="848" alt="Raum für den 360-Grad-Rundgang" decoding="async">
            <div class="stage-hud stage-hud-kamera" aria-hidden="true"><span></span><span></span><span></span><span></span></div>
            <div class="stage-hud stage-hud-drohne" aria-hidden="true"><b>ALT 42 m</b><b>REC</b></div>
            <div class="stage-hud stage-hud-360" aria-hidden="true"><em>360°</em></div>
          </div>
          <figcaption class="stage-modes">
            <button type="button" class="is-active" data-mode="kamera">Kamera</button>
            <button type="button" data-mode="drohne">Drohne</button>
            <button type="button" data-mode="360">360°-Rundgang</button>
          </figcaption>
        </figure>
      </section>

      <!-- LOKALER KONTEXT (je Stadt eigener, belegter Inhalt) -->
      <section class="section">
        <div class="section-heading">
          <p class="eyebrow">Vor Ort</p>
          <h2>${esc(c.h2)}</h2>
${c.absaetze.map((p) => `          <p>${esc(p)}</p>`).join("\n")}
        </div>
      </section>

      <!-- LEISTUNGEN (kompakt) -->
      <section id="leistungen" class="section dark-section">
        <div class="section-heading">
          <p class="eyebrow">Leistungen</p>
          <h2>Für Objekte in ${esc(c.name)}.</h2>
        </div>
        <div class="deliverables">
          <article><h3>Fotos</h3><p>Innen, außen, Details – aufgehellt, bearbeitet und portalfertig.</p></article>
          <article><h3>Drohnenaufnahmen</h3><p>Grundstück, Lage und Umgebung aus der Luft, wo sinnvoll und erlaubt.</p></article>
          <article><h3>360°-Rundgang</h3><p>Begehbar als Link – Interessenten sehen das Objekt vorab.</p></article>
        </div>
      </section>

      <!-- PAKETE -->
      <section id="pakete" class="section pricing-section">
        <div class="section-heading compact">
          <p class="eyebrow">Pakete</p>
          <h2>Pakete als Orientierung.</h2>
          <p>Digitales Aufräumen und Bildoptimierung sind in jedem Paket enthalten. Preise netto, als ab-Orientierung – der genaue Aufwand hängt vom Objekt und der Anfahrt ab. <a href="kosten-immobilienfotograf.html">Wovon der Preis abhängt</a></p>
        </div>
        <div class="pricing-grid">
          <article class="price-card">
            <p class="package-name">Lite</p>
            <h3>ab 399 €</h3>
            <ul>
              <li>15–25 portalfertige Objektfotos</li>
              <li>Digitales Aufräumen, Aufhellen &amp; Bildoptimierung inkl.</li>
              <li>Online-Übergabe</li>
            </ul>
            <a href="index.html#kontakt">Lite anfragen</a>
          </article>
          <article class="price-card featured">
            <div class="badge">Häufig gewählt</div>
            <p class="package-name">Premium</p>
            <h3>ab 799 €</h3>
            <ul>
              <li>Alles aus Lite</li>
              <li>Bilderanzahl nach Wunsch, je nach Objekt</li>
              <li>Drohnenaufnahmen</li>
              <li>Auf Wunsch 60–90 s Objektvideo</li>
            </ul>
            <a href="index.html#kontakt">Premium anfragen</a>
          </article>
          <article class="price-card">
            <p class="package-name">Komplett</p>
            <h3>ab 1.299 €</h3>
            <ul>
              <li>Alles aus Premium</li>
              <li>Begehbarer 360°-Rundgang inkl.</li>
              <li>Online-Freistellung</li>
              <li>Virtuelle Möblierung der Fotos</li>
            </ul>
            <a href="index.html#kontakt">Komplett anfragen</a>
          </article>
        </div>
      </section>

      <!-- FAQ (Text identisch mit dem FAQPage-Schema oben) -->
      <section class="section faq-section">
        <div class="section-heading compact">
          <p class="eyebrow">Häufige Fragen</p>
          <h2>${esc(c.name)}, kurz beantwortet.</h2>
        </div>
        <div class="faq-list">
${c.faq
  .map(
    ([q, a]) => `          <details>
            <summary>${esc(q)}</summary>
            <p>${esc(a)}</p>
          </details>`
  )
  .join("\n")}
        </div>
      </section>

      <!-- KONTAKT (kompakt) -->
      <section id="kontakt" class="section contact-section">
        <div class="section-heading compact">
          <p class="eyebrow">Kontakt</p>
          <h2>Objekt in ${esc(c.name)} anfragen.</h2>
          <p>Kurz Objekt und Wunschtermin nennen – Rückmeldung folgt zeitnah.</p>
        </div>
        <div class="contact-actions">
          <a class="button primary" href="${TERMIN}" target="_blank" rel="noopener">Termin besprechen</a>
          <a class="button ghost" href="tel:+491783248904">0178 3248904</a>
          <a class="button ghost" href="mailto:info@immobild.ai">info@immobild.ai</a>
        </div>
      </section>
    </main>

    <footer class="site-footer">
      <div>
        <strong>Immobild.ai</strong>
        <p>Foto, Drohne, Video und 360-Grad-Rundgang für Makler in Ostwestfalen und im Schaumburger Land. Sauber produziert und online bereitgestellt.</p>
        <p class="footer-contact"><a href="mailto:info@immobild.ai">info@immobild.ai</a> · <a href="tel:+491783248904">0178 3248904</a></p>
      </div>
      <nav aria-label="Standorte">
        <a href="index.html">Startseite</a>
${others.map((o) => `        <a href="${file(o)}">${esc(o.name)}</a>`).join("\n")}
        <a href="kosten-immobilienfotograf.html">Kosten</a>
        <a href="immobilie-fotos-vorbereiten.html">Checkliste Fototermin</a>
      </nav>
      <nav aria-label="Rechtliches">
        <a href="impressum.html">Impressum</a>
        <a href="datenschutz.html">Datenschutz</a>
      </nav>
    </footer>
  </body>
</html>
`;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  for (const c of STAEDTE) {
    writeFileSync(join(ROOT, file(c)), page(c), "utf8");
    console.log("geschrieben:", file(c));
  }
}
