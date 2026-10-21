// Problème type DS : un énoncé commun puis des étapes successives (chacune est une question
// numérique, QCM ou carte). Chaque étape est corrigée avant de passer à la suivante ;
// la note finale est la fraction d'étapes réussies. Les étapes QCM se font en rédaction
// d'abord (on écrit sa réponse avant de voir les propositions).

import { ecrire } from "../texte.js";
import * as numerique from "./numerique.js";
import * as carte from "./carte.js";
import * as vraiFaux from "./vrai-faux.js";
import * as redaction from "./redaction.js";
import * as classer from "./classer.js";
import * as tableau from "./tableau.js";

const ETAPES = {
  "qcm": redaction, "redaction": redaction, "numerique": numerique, "carte": carte, "vrai-faux": vraiFaux,
  "classer": classer, "tableau": tableau,
};

export function afficher(question, zone, repondre) {
  const total = question.etapes.length;
  let note = 0;

  function etape(i) {
    const e = question.etapes[i];
    const bloc = document.createElement("div");
    bloc.className = "etape";
    const titre = document.createElement("p");
    titre.className = "etape-titre";
    ecrire(titre, `**${i + 1}.** ${e.enonce}`);
    const reponse = document.createElement("div");
    bloc.append(titre, reponse);
    zone.append(bloc);

    ETAPES[e.type].afficher(e, reponse, (resultat) => {
      note += Number(resultat);
      if (e.explication) {
        const expl = document.createElement("p");
        expl.className = "discret";
        ecrire(expl, e.explication);
        bloc.append(expl);
      }
      if (i + 1 < total) {
        const suite = document.createElement("button");
        suite.className = "secondaire";
        suite.textContent = "Étape suivante";
        suite.addEventListener("click", () => { suite.remove(); etape(i + 1); });
        bloc.append(suite);
        suite.focus();
      } else {
        repondre(note / total);
      }
    });
  }

  etape(0);
}

export function solution(question, texteSolution) {
  return question.etapes.map((e, i) => `${i + 1}. ${texteSolution(e)}`).join(" · ");
}
