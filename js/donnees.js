// Annexes de données d'une question (compte de résultat « en liste », bilan, fiche de stock…),
// affichées au-dessus des réponses et visibles pendant toutes les étapes, comme les pages
// « DONNÉES » d'un sujet de DS.
// Format : [{ titre, colonnes: ["N-1", "N"], lignes: ["Intertitre", ["Libellé", 10, 12], …], note }]

import { ecrire } from "./texte.js";
import { nombre } from "./types/tableau.js";

export function afficherDonnees(annexes, zone) {
  zone.replaceChildren();
  zone.hidden = !annexes?.length;
  for (const annexe of annexes ?? []) {
    const bloc = document.createElement("div");
    bloc.className = "annexe";
    if (annexe.titre) {
      const titre = document.createElement("p");
      titre.className = "annexe-titre";
      ecrire(titre, annexe.titre);
      bloc.append(titre);
    }
    if (annexe.lignes) {
      const table = document.createElement("table");
      table.className = "tableau-donnees";
      if (annexe.colonnes) {
        const tr = table.createTHead().insertRow();
        for (const c of ["", ...annexe.colonnes]) {
          const th = document.createElement("th");
          th.textContent = c;
          tr.append(th);
        }
      }
      const corps = table.createTBody();
      const largeur = (annexe.colonnes?.length ?? 1) + 1;
      for (const ligne of annexe.lignes) {
        const tr = corps.insertRow();
        if (typeof ligne === "string") {
          tr.className = "ligne-titre";
          const td = tr.insertCell();
          td.colSpan = largeur;
          ecrire(td, ligne);
          continue;
        }
        const [libelle, ...valeurs] = ligne;
        ecrire(tr.insertCell(), libelle);
        for (const v of valeurs) {
          const td = tr.insertCell();
          td.className = "case";
          td.textContent = typeof v === "number" ? nombre(v) : (v ?? "");
        }
      }
      const defile = document.createElement("div");
      defile.className = "defile";
      defile.append(table);
      bloc.append(defile);
    }
    if (annexe.note) {
      const note = document.createElement("p");
      note.className = "discret";
      ecrire(note, annexe.note);
      bloc.append(note);
    }
    zone.append(bloc);
  }
}
