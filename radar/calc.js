// Rechenlogik des Eigentümer-Radars – reine Funktionen ohne DOM,
// damit sie identisch im Browser (radar.js) und in Node (calc.test.mjs) laufen.
//
// Methodik (bewusst einfache, ehrliche Näherung – Ergebnis IMMER als Spanne):
//   Grundstück: Bodenrichtwert × Fläche                        (Spanne ±10 %)
//   Haus:       Bodenwert + Sachwert-Näherung fürs Gebäude     (Spanne ±15 %)
//   Wohnung:    Vergleichswert über €/m² je Stadt und Lage     (Spanne ±12 %)

export const ZUSTAND_FAKTOR = {
  renovierungsbeduerftig: 0.8,
  gepflegt: 1.0,
  neuwertig: 1.15,
};

export const SPANNE = { haus: 0.15, wohnung: 0.12, grundstueck: 0.1 };

const NHK_QM = 1900; // Herstellungskosten €/m² Wohnfläche (EFH mittlerer Standard, inkl. Baunebenkosten)
const GESAMTNUTZUNG = 80; // Jahre – lineare Alterswertminderung (Sachwert-Näherung)
const RESTWERT = 0.3; // Gebäudewert fällt nie unter 30 % (laufende Instandhaltung unterstellt)

// Auf „präsentierbare" Beträge runden: unter 100.000 € auf Tausender, darüber auf 5.000er.
export function rundeWert(v) {
  const schritt = v >= 100000 ? 5000 : 1000;
  return Math.round(v / schritt) * schritt;
}

function zahl(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : NaN;
}

// Wirft Error mit sprechendem Code bei ungültiger Eingabe – der Aufrufer zeigt die Meldung an.
export function berechneWert(eingabe, daten, jetztJahr = new Date().getFullYear()) {
  const stadt = daten.staedte[eingabe.stadt];
  if (!stadt) throw new Error("unbekannte_stadt");

  const lage = eingabe.lage;
  if (!["einfach", "mittel", "gut"].includes(lage)) throw new Error("lage");

  const art = eingabe.objektart;
  let mittelRoh;

  if (art === "grundstueck") {
    const fl = zahl(eingabe.grundstuecksflaeche);
    if (!(fl >= 50 && fl <= 20000)) throw new Error("grundstuecksflaeche");
    mittelRoh = stadt.bodenrichtwert[lage] * fl;
  } else if (art === "haus" || art === "wohnung") {
    const wfl = zahl(eingabe.wohnflaeche);
    if (!(wfl >= 20 && wfl <= 1000)) throw new Error("wohnflaeche");

    const baujahr = zahl(eingabe.baujahr);
    if (!(baujahr >= 1850 && baujahr <= jetztJahr)) throw new Error("baujahr");
    const alter = jetztJahr - baujahr;

    const zustand = ZUSTAND_FAKTOR[eingabe.zustand];
    if (!zustand) throw new Error("zustand");

    if (art === "haus") {
      const gfl = zahl(eingabe.grundstuecksflaeche);
      if (!(gfl >= 50 && gfl <= 20000)) throw new Error("grundstuecksflaeche");
      const altersfaktor = 1 - Math.min(alter / GESAMTNUTZUNG, 1 - RESTWERT);
      const bodenwert = stadt.bodenrichtwert[lage] * gfl;
      const gebaeudewert = NHK_QM * wfl * altersfaktor * zustand;
      mittelRoh = bodenwert + gebaeudewert;
    } else {
      // Wohnungen verlieren im Vergleichswert deutlich sanfter an Alterswert als die Sachwert-Gerade.
      const altersfaktor = 1 - (Math.min(Math.max(alter, 0), 70) / 70) * 0.3;
      mittelRoh = stadt.wohnung_qm[lage] * wfl * altersfaktor * zustand;
    }
  } else {
    throw new Error("objektart");
  }

  const s = SPANNE[art];
  return {
    mittel: rundeWert(mittelRoh),
    min: rundeWert(mittelRoh * (1 - s)),
    max: rundeWert(mittelRoh * (1 + s)),
  };
}
