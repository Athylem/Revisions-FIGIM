// Rédaction puis QCM : on écrit d'abord sa réponse, puis on affiche les propositions et on
// choisit celle qui correspond. Le QCM est corrigé (vrais points) ; la réponse rédigée reste
// affichée pour se comparer, avec le corrigé détaillé (« modele ») s'il existe.

import { ecrire } from "../texte.js";
import * as qcm from "./qcm.js";

export function afficher(question, zone, repondre) {
  const brouillon = document.createElement("textarea");
  brouillon.className = "brouillon";
  brouillon.rows = 3;
  brouillon.placeholder = "Écris ta réponse ici avant de voir les propositions…";

  const voir = document.createElement("button");
  voir.textContent = "Voir les propositions";
  voir.disabled = true;
  brouillon.addEventListener("input", () => (voir.disabled = brouillon.value.trim() === ""));

  voir.addEventListener("click", () => {
    voir.remove();
    brouillon.readOnly = true;
    const consigne = document.createElement("p");
    consigne.className = "discret";
    consigne.textContent = "Quelle proposition correspond à ta réponse ?";
    const propositions = document.createElement("div");
    zone.append(consigne, propositions);
    qcm.afficher(question, propositions, (correct) => {
      if (question.modele) {
        const verso = document.createElement("div");
        verso.className = "verso";
        ecrire(verso, "**Corrigé :** " + question.modele);
        zone.append(verso);
      }
      repondre(correct);
    });
  });

  zone.append(brouillon, voir);
  brouillon.focus();
}
