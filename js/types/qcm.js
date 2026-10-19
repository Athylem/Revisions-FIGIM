// QCM : une bonne réponse parmi plusieurs choix, affichés dans un ordre aléatoire

import { ecrire } from "../texte.js";
import { melanger } from "../moteur.js";

export function afficher(question, zone, repondre) {
  const liste = document.createElement("div");
  liste.className = "choix";

  const boutons = melanger(question.choix.map((texte, indice) => ({ texte, indice }))).map(({ texte, indice }) => {
    const bouton = document.createElement("button");
    bouton.className = "choix-bouton";
    bouton.dataset.indice = indice;
    ecrire(bouton, texte);
    bouton.addEventListener("click", () => {
      const correct = indice === question.reponse;
      for (const b of boutons) {
        b.disabled = true;
        if (Number(b.dataset.indice) === question.reponse) b.classList.add("bon");
      }
      if (!correct) bouton.classList.add("faux");
      repondre(correct);
    });
    return bouton;
  });

  liste.append(...boutons);
  zone.append(liste);
}
