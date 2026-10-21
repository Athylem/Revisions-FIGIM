// Tableau à compléter, comme sur la copie du DS : on remplit toutes les cases (sans calculatrice),
// puis on corrige d'un coup. Chaque case fausse affiche la valeur attendue et le calcul (« aide »).
// Lignes « donne » : déjà remplies (rappel d'une donnée) ; lignes « titre » : intertitre.
// Écart toléré : `ecart` (absolu) sur la ligne ou la question, 0 par défaut (calculs exacts).

import { ecrire } from "../texte.js";
import { lireNombre } from "./numerique.js";

export const nombre = (n) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

export function afficher(question, zone, repondre) {
  const colonnes = question.colonnes ?? ["Montant"];
  const table = document.createElement("table");
  table.className = "tableau-saisie";

  const entete = table.createTHead().insertRow();
  for (const titre of [question.titreLignes ?? "", ...colonnes]) {
    const th = document.createElement("th");
    th.textContent = titre;
    entete.append(th);
  }

  const corps = table.createTBody();
  const cases = [];   // { ligne, champ, attendu, td }
  for (const ligne of question.lignes) {
    const tr = corps.insertRow();
    if (ligne.titre) {
      tr.className = "ligne-titre";
      const td = tr.insertCell();
      td.colSpan = colonnes.length + 1;
      ecrire(td, ligne.titre);
      continue;
    }
    if (ligne.total) tr.className = "ligne-total";
    const libelle = tr.insertCell();
    ecrire(libelle, ligne.libelle);
    ligne.valeurs.forEach((attendu, c) => {
      const td = tr.insertCell();
      td.className = "case";
      if (ligne.donne || attendu === null) {
        td.textContent = attendu === null ? "" : nombre(attendu);
        td.classList.add("donnee");
        return;
      }
      const champ = document.createElement("input");
      champ.inputMode = "decimal";
      champ.autocomplete = "off";
      champ.setAttribute("aria-label", `${ligne.libelle} (${colonnes[c]})`);
      td.append(champ);
      cases.push({ ligne, champ, attendu, td });
    });
  }

  const valider = document.createElement("button");
  valider.textContent = "Corriger le tableau";
  valider.addEventListener("click", () => {
    valider.remove();
    let bons = 0;
    const lignesRatees = new Set();
    for (const { ligne, champ, attendu, td } of cases) {
      champ.disabled = true;
      const valeur = lireNombre(champ.value);
      const ecart = ligne.ecart ?? question.ecart ?? 0;
      const correct = !Number.isNaN(valeur) && Math.abs(valeur - attendu) <= ecart + 1e-9;
      champ.classList.add(correct ? "bon" : "faux");
      if (correct) bons++;
      else {
        const att = document.createElement("span");
        att.className = "attendu";
        att.textContent = nombre(attendu);
        td.append(att);
        lignesRatees.add(ligne);
      }
    }
    // Le calcul de chaque ligne ratée, sous le tableau
    const aides = question.lignes.filter((l) => lignesRatees.has(l) && l.aide);
    if (aides.length) {
      const liste = document.createElement("ul");
      liste.className = "aides";
      for (const l of aides) {
        const li = document.createElement("li");
        ecrire(li, `**${l.libelle}** : ${l.aide}`);
        liste.append(li);
      }
      zone.append(liste);
    }
    const bilan = document.createElement("p");
    bilan.className = "discret";
    bilan.textContent = `${bons} / ${cases.length} cases justes`;
    zone.append(bilan);
    repondre(cases.length ? bons / cases.length : 1);
  });

  const enveloppe = document.createElement("div");
  enveloppe.className = "defile";
  enveloppe.append(table);
  zone.append(enveloppe, valider);
  cases[0]?.champ.focus();
}

export function solution(question) {
  return question.lignes
    .filter((l) => !l.titre && !l.donne && l.valeurs.some((v) => v !== null))
    .map((l) => `${l.libelle} = ${l.valeurs.map((v) => (v === null ? "—" : nombre(v))).join(" / ")}`)
    .join(" · ");
}
