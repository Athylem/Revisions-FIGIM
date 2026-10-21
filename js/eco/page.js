// Page « Économie d'entreprise » : choix de l'atelier et du cas, puis l'atelier lui-même.

import { el } from "./composants.js";
import { Suivi } from "./composants.js";
import { CR_TD, BILANS_TD, AMORT_TD, LISTES_TD, genererCR, genererBilan, genererAmort, genererListe } from "./cas.js";
import { atelierSIG, atelierCAF, atelierBilan, atelierAmort, atelierListe } from "./ateliers.js";

const ATELIERS = {
  sig: { nom: "SIG", titre: "Soldes intermédiaires de gestion", dossier: "Compte de résultat en liste → tableau des SIG",
    lancer: atelierSIG, generer: genererCR, td: CR_TD },
  caf: { nom: "CAF", titre: "Capacité d'autofinancement", dossier: "Compte de résultat → CAF soustractive et additive",
    lancer: atelierCAF, generer: genererCR, td: CR_TD },
  bf: { nom: "Bilan fonctionnel", titre: "Bilan fonctionnel, FRNG, BFR, TN", dossier: "Bilan comptable → bilan fonctionnel → équilibre",
    lancer: atelierBilan, generer: genererBilan, td: BILANS_TD },
  immo: { nom: "Immobilisations", titre: "Amortissement et cession", dossier: "Frise → plan d'amortissement → cession → écritures",
    lancer: atelierAmort, generer: genererAmort, td: AMORT_TD },
  liste: { nom: "Bilan & CR", titre: "Bilan et compte de résultat", dossier: "Liste de données → classer → CR et bilan",
    lancer: atelierListe, generer: genererListe, td: LISTES_TD },
};

const $ = (s) => document.querySelector(s);
let courant = new URLSearchParams(location.search).get("atelier") ?? "sig";
if (!ATELIERS[courant]) courant = "sig";

function onglets() {
  $("#onglets").replaceChildren(...Object.entries(ATELIERS).map(([id, a]) => {
    const b = el("button", id === courant ? "actif" : "", a.nom);
    b.type = "button";
    b.addEventListener("click", () => { courant = id; history.replaceState(null, "", `?atelier=${id}`); onglets(); choixCas(); });
    return b;
  }));
}

function choixCas() {
  const a = ATELIERS[courant];
  $("#titre-atelier").textContent = a.titre;
  $("#dossier-atelier").textContent = a.dossier;
  const nouveau = el("button", "", "Nouveau cas (chiffres ronds, sans calculatrice)");
  nouveau.type = "button";
  nouveau.addEventListener("click", () => lancer(a.generer(Math.floor(Math.random() * 9000) + 1000)));
  const td = Object.values(a.td).map((cas) => {
    const b = el("button", "secondaire", `Cas du TD : ${cas.nom}`);
    b.type = "button";
    b.addEventListener("click", () => lancer(cas));
    return b;
  });
  $("#choix-cas").replaceChildren(nouveau, ...td);
  $("#donnees").replaceChildren(el("p", "discret", "Choisis un cas pour afficher le document de départ."));
  $("#copie").replaceChildren();
}

function lancer(cas) {
  const a = ATELIERS[courant];
  a.lancer(cas, $("#donnees"), $("#copie"), new Suivi());
  $("#espace").scrollIntoView({ behavior: "smooth", block: "start" });
}

onglets();
choixCas();
