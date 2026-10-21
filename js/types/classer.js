// Classer : chaque élément (poste comptable, compte, montant…) doit être rangé dans la bonne
// catégorie (Actif immobilisé, Charges financières, « exclu de la CAF »…). On classe tout,
// puis on corrige ; la note est la fraction d'éléments bien classés.

import { ecrire } from "../texte.js";
import { melanger } from "../moteur.js";

export function afficher(question, zone, repondre) {
  const elements = question.ordreFixe ? question.elements : melanger(question.elements);
  const choisis = new Map();   // élément → indice de catégorie choisi

  const valider = document.createElement("button");
  valider.textContent = "Corriger";
  valider.disabled = true;

  const lignes = elements.map((el) => {
    const ligne = document.createElement("div");
    ligne.className = "classer-ligne";
    const texte = document.createElement("p");
    texte.className = "classer-texte";
    ecrire(texte, el.texte);
    const options = document.createElement("div");
    options.className = "classer-options";
    const boutons = question.categories.map((cat, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.className = "classer-bouton";
      ecrire(b, cat);
      b.addEventListener("click", () => {
        if (valider.dataset.fini) return;
        choisis.set(el, i);
        boutons.forEach((x, j) => x.classList.toggle("choisi", j === i));
        valider.disabled = choisis.size < elements.length;
      });
      return b;
    });
    options.append(...boutons);
    ligne.append(texte, options);
    return { el, ligne, boutons };
  });

  valider.addEventListener("click", () => {
    valider.dataset.fini = "1";
    valider.remove();
    let bons = 0;
    for (const { el, ligne, boutons } of lignes) {
      const choix = choisis.get(el);
      boutons.forEach((b) => (b.disabled = true));
      boutons[el.reponse].classList.add("bon");
      if (choix === el.reponse) {
        bons++;
      } else {
        boutons[choix].classList.add("faux");
        ligne.classList.add("rate");
      }
      if (el.explication && choix !== el.reponse) {
        const expl = document.createElement("p");
        expl.className = "discret classer-expl";
        ecrire(expl, el.explication);
        ligne.append(expl);
      }
    }
    const bilan = document.createElement("p");
    bilan.className = "discret";
    bilan.textContent = `${bons} / ${elements.length} bien classés`;
    zone.append(bilan);
    repondre(bons / elements.length);
  });

  zone.append(...lignes.map((l) => l.ligne), valider);
}

export function solution(question) {
  return question.elements.map((e) => `${e.texte} → ${question.categories[e.reponse]}`).join(" · ");
}
