// Carte de cours : question ouverte (définition, schéma, justification…). On réfléchit, on
// retourne la carte, puis on s'auto-évalue. « À moitié » rapporte la moitié des points.

import { ecrire } from "../texte.js";

export function afficher(question, zone, repondre) {
  const retourner = document.createElement("button");
  retourner.textContent = "Voir la réponse";

  retourner.addEventListener("click", () => {
    retourner.remove();
    const verso = document.createElement("div");
    verso.className = "verso";
    ecrire(verso, question.reponse);

    const evaluation = document.createElement("div");
    evaluation.className = "choix trois";
    const choix = [["Je savais", 1], ["À moitié", 0.5], ["Pas su", 0]].map(([texte, note]) => {
      const b = document.createElement("button");
      b.className = "choix-bouton";
      b.textContent = texte;
      b.addEventListener("click", () => {
        choix.forEach((c) => (c.disabled = true));
        b.classList.add(note === 1 ? "bon" : note === 0 ? "faux" : "moyen");
        repondre(note);
      });
      return b;
    });
    evaluation.append(...choix);
    zone.append(verso, evaluation);
  });

  zone.append(retourner);
}
