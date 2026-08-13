// Deterministische Tests gegen Handrechnungen: node radar/calc.test.mjs
// jetztJahr wird fest übergeben, damit die Erwartungswerte nie vom Datum abhängen.
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { berechneWert, rundeWert } from "./calc.js";

const daten = JSON.parse(readFileSync(new URL("./data/richtwerte.json", import.meta.url), "utf8"));
const JAHR = 2026;

// --- Rundung ---
assert.equal(rundeWert(72400), 72000);
assert.equal(rundeWert(72500), 73000);
assert.equal(rundeWert(168555), 170000);
assert.equal(rundeWert(198300), 200000);

// --- Grundstück: BRW Minden mittel 160 €/m² × 500 m² = 80.000, Spanne ±10 % ---
assert.deepEqual(
  berechneWert({ objektart: "grundstueck", stadt: "minden", lage: "mittel", grundstuecksflaeche: 500 }, daten, JAHR),
  { mittel: 80000, min: 72000, max: 88000 }
);

// --- Haus: Porta Westfalica mittel, 140 m² Wfl, 400 m² Grund, Bj. 1990, gepflegt ---
// Boden 130×400=52.000; Alter 36 → Faktor 1−36/80=0,55; Gebäude 1900×140×0,55×1,0=146.300
// Summe 198.300 → gerundet 200.000; ±15 %: 168.555→170.000 / 228.045→230.000
assert.deepEqual(
  berechneWert(
    { objektart: "haus", stadt: "porta-westfalica", lage: "mittel", wohnflaeche: 140, grundstuecksflaeche: 400, baujahr: 1990, zustand: "gepflegt" },
    daten,
    JAHR
  ),
  { mittel: 200000, min: 170000, max: 230000 }
);

// --- Haus, Altbau am Restwert-Boden: Bielefeld gut, Bj. 1900 (Alter 126 → Faktor 0,3), renovierungsbedürftig 0,8 ---
// Boden 520×600=312.000; Gebäude 1900×180×0,3×0,8=82.080; Summe 394.080 → 395.000; ±15 %: 335.000 / 455.000
assert.deepEqual(
  berechneWert(
    { objektart: "haus", stadt: "bielefeld", lage: "gut", wohnflaeche: 180, grundstuecksflaeche: 600, baujahr: 1900, zustand: "renovierungsbeduerftig" },
    daten,
    JAHR
  ),
  { mittel: 395000, min: 335000, max: 455000 }
);

// --- Wohnung: Minden mittel 2.000 €/m² × 80 m², Bj. 2010 (Alter 16 → Faktor 1−16/70·0,3), neuwertig 1,15 ---
// 2000×80×0,93142857×1,15 = 171.382,86 → 170.000; ±12 %: 150.816,91→150.000 / 191.948,80→190.000
assert.deepEqual(
  berechneWert(
    { objektart: "wohnung", stadt: "minden", lage: "mittel", wohnflaeche: 80, baujahr: 2010, zustand: "neuwertig" },
    daten,
    JAHR
  ),
  { mittel: 170000, min: 150000, max: 190000 }
);

// --- Fehlerpfade: sprechende Codes statt stiller Falschwerte ---
const faelle = [
  [{ objektart: "haus", stadt: "gibtsnicht", lage: "mittel" }, "unbekannte_stadt"],
  [{ objektart: "haus", stadt: "minden", lage: "toplage" }, "lage"],
  [{ objektart: "villa", stadt: "minden", lage: "mittel" }, "objektart"],
  [{ objektart: "wohnung", stadt: "minden", lage: "mittel", wohnflaeche: 5, baujahr: 2000, zustand: "gepflegt" }, "wohnflaeche"],
  [{ objektart: "wohnung", stadt: "minden", lage: "mittel", wohnflaeche: 80, baujahr: 2050, zustand: "gepflegt" }, "baujahr"],
  [{ objektart: "wohnung", stadt: "minden", lage: "mittel", wohnflaeche: 80, baujahr: 2000, zustand: "prunkvoll" }, "zustand"],
  [{ objektart: "haus", stadt: "minden", lage: "mittel", wohnflaeche: 140, grundstuecksflaeche: 10, baujahr: 2000, zustand: "gepflegt" }, "grundstuecksflaeche"],
  [{ objektart: "grundstueck", stadt: "minden", lage: "mittel", grundstuecksflaeche: "abc" }, "grundstuecksflaeche"],
];
for (const [eingabe, code] of faelle) {
  assert.throws(() => berechneWert(eingabe, daten, JAHR), new Error(code), `erwarteter Fehler: ${code}`);
}

// --- Jede Stadt/Lage liefert plausible, positive Spannen ---
for (const key of Object.keys(daten.staedte)) {
  for (const lage of ["einfach", "mittel", "gut"]) {
    const r = berechneWert(
      { objektart: "haus", stadt: key, lage, wohnflaeche: 130, grundstuecksflaeche: 450, baujahr: 1995, zustand: "gepflegt" },
      daten,
      JAHR
    );
    assert.ok(r.min > 0 && r.min < r.mittel && r.mittel < r.max, `Spanne inkonsistent für ${key}/${lage}`);
  }
}

console.log("calc.test.mjs: alle Tests bestanden");
