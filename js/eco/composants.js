// Briques des ateliers d'économie d'entreprise : on construit sa copie comme au DS.
// - placement : ranger des lignes (jetons) dans des blocs (zones), puis vérifier
// - grilleCalcul : remplir un tableau de montants, vérifier, recommencer ou voir la correction
// - choix : une seule réponse parmi quelques propositions (qualifier une situation)
// - Phases : les étapes d'un atelier, débloquées l'une après l'autre
// Chaque brique note la réussite « du premier coup » dans un Suivi, affiché à la fin.

import { ecrire } from "../texte.js";
import { melanger } from "../moteur.js";
import { lireNombre } from "../types/numerique.js";

export const fmt = (n) => n.toLocaleString("fr-FR", { maximumFractionDigits: 2 });

export function el(tag, classe, texte) {
  const e = document.createElement(tag);
  if (classe) e.className = classe;
  if (texte !== undefined) ecrire(e, String(texte));
  return e;
}

function bouton(texte, classe = "") {
  const b = el("button", classe, texte);
  b.type = "button";
  return b;
}

export class Suivi {
  constructor() { this.etapes = []; }
  noter(nom, bons, total) { this.etapes.push({ nom, bons, total }); }
}

// ---------- Placement ----------
// jetons : [{ texte, montant?, cible: id | [ids], aide?, ancre? }]
//   ancre : élément du document de départ (ligne ou case) sur lequel on clique pour prendre la ligne ;
//   sans ancre, le jeton est une étiquette dans une réserve au-dessus des blocs (ordre de la cascade, journal).
// zones  : [{ id, titre, court?, conteneur?, unique? }] ; « court » = étiquette affichée dans le document
// inactives : éléments du document à griser (lignes qui ne servent pas dans cette étape)
export function placement({ jetons, zones, suivi, nom, quandFini, consigne, inactives = [] }) {
  const parDocument = jetons.some((j) => j.ancre);
  const racine = el("div", "placement");
  const aideTxt = el("p", "discret", consigne ?? (parDocument
    ? "Clique une ligne du **document de départ** (à gauche), puis le bloc de ta copie où elle va. Reclique une ligne pour la déplacer."
    : "Clique une étiquette, puis la case où elle va. Clique une étiquette placée pour la remettre en haut."));
  const reserve = el("div", "reserve");
  const zonesParDefaut = el("div", "zones");
  const remarques = el("ul", "remarques");
  const ecoute = new AbortController();
  let choisi = null;
  let fini = false;
  let premierEssai = true;
  const position = new Map();   // jeton → id de zone
  const depots = new Map();     // id de zone → élément de dépôt
  const zonesParId = new Map(zones.map((z) => [z.id, z]));
  const uniques = new Set(zones.filter((z) => z.unique).map((z) => z.id));

  // Le document repart propre (une étape précédente a pu le marquer)
  const doc = jetons.find((j) => j.ancre)?.ancre.closest("#donnees");
  if (doc) {
    doc.querySelectorAll(".badge-zone").forEach((b) => b.remove());
    doc.querySelectorAll(".cliquable, .placee, .choisie, .bon, .faux, .inactive")
      .forEach((e) => e.classList.remove("cliquable", "placee", "choisie", "bon", "faux", "inactive"));
  }
  inactives.forEach((e) => e.classList.add("inactive"));

  for (const z of zones) {
    const boite = el("div", "zone" + (z.unique ? " zone-unique" : ""));
    boite.append(el("p", "zone-titre", z.titre));
    const depot = el("div", "zone-depot");
    boite.append(depot);
    // Un clic n'importe où dans le bloc (même sur une étiquette déjà posée) y pose la ligne choisie
    boite.addEventListener("click", () => {
      if (fini || !choisi) return;
      poser(choisi, z.id);
    });
    depots.set(z.id, depot);
    (z.conteneur ?? zonesParDefaut).append(boite);
  }

  const puces = new Map();   // jeton → étiquette (dans la réserve ou dans un bloc)
  const badges = new Map();  // jeton → badge affiché sur la ligne du document
  for (const j of j_ordre()) {
    const puce = bouton("", "jeton");
    puce.append(el("span", "jeton-texte", j.texte));
    if (j.montant !== undefined) puce.append(el("span", "jeton-montant", typeof j.montant === "number" ? fmt(j.montant) : j.montant));
    puce.addEventListener("click", (e) => {
      if (fini) return;
      // Une autre ligne est choisie : le clic sert à la poser dans ce bloc (géré par le bloc)
      if (choisi && choisi !== j && position.has(j)) return;
      e.stopPropagation();
      if (puce.classList.contains("bloque")) return;
      if (position.has(j)) retirer(j);
      else choisir(choisi === j ? null : j);
    });
    puces.set(j, puce);
    if (j.ancre) {
      j.ancre.classList.add("cliquable");
      const badge = el("span", "badge-zone");
      (j.ancre.tagName === "TR" ? j.ancre.cells[0] : j.ancre).append(badge);
      badges.set(j, badge);
      j.ancre.addEventListener("click", () => {
        if (fini || puce.classList.contains("bloque")) return;
        if (position.has(j)) retirer(j);
        choisir(choisi === j ? null : j);
      }, { signal: ecoute.signal });
    } else {
      reserve.append(puce);
    }
  }
  function j_ordre() { return parDocument ? jetons : melanger(jetons); }

  function choisir(j) {
    choisi = j;
    for (const [jj, p] of puces) {
      p.classList.toggle("choisi", jj === j);
      jj.ancre?.classList.toggle("choisie", jj === j);
    }
  }

  function retirer(j) {
    position.delete(j);
    const p = puces.get(j);
    p.classList.remove("faux");
    if (j.ancre) {
      p.remove();
      j.ancre.classList.remove("placee", "faux");
      badges.get(j).textContent = "";
    } else {
      reserve.append(p);
    }
    choisir(null);
    majBouton();
  }

  function poser(j, zoneId) {
    if (uniques.has(zoneId)) {
      for (const [autre, z] of [...position]) if (z === zoneId) retirer(autre);
    }
    position.set(j, zoneId);
    const p = puces.get(j);
    depots.get(zoneId).append(p);
    p.classList.remove("faux");
    if (j.ancre) {
      j.ancre.classList.remove("faux");
      j.ancre.classList.add("placee");
      const z = zonesParId.get(zoneId);
      badges.get(j).textContent = `→ ${z.court ?? z.titre}`;
    }
    choisir(null);
    majBouton();
  }

  const verifier = bouton("Vérifier le placement");
  const solution = bouton("Voir la solution", "secondaire");
  const reste = el("span", "discret");
  const actions = el("div", "actions-atelier");
  actions.append(verifier, solution, reste);
  function majBouton() {
    const n = jetons.length - position.size;
    verifier.disabled = n > 0;
    reste.textContent = n > 0 ? `${n} ligne(s) à placer` : "";
  }
  majBouton();

  const ok = (j, z) => [j.cible].flat().includes(z);
  const marquer = (j, bien) => {
    puces.get(j).classList.toggle("faux", !bien);
    j.ancre?.classList.toggle("faux", !bien);
    j.ancre?.classList.toggle("bon", bien);
    if (bien) puces.get(j).classList.add("bloque");
  };

  verifier.addEventListener("click", () => {
    let bons = 0;
    remarques.replaceChildren(...lesAides(jetons.filter((j) => !ok(j, position.get(j)))));
    for (const j of jetons) {
      const bien = ok(j, position.get(j));
      marquer(j, bien);
      if (bien) bons++;
    }
    if (premierEssai) { suivi?.noter(nom, bons, jetons.length); premierEssai = false; }
    if (bons === jetons.length) terminer("Tout est bien placé ✔");
    else remarques.prepend(el("li", "verdict-ko", `${jetons.length - bons} ligne(s) mal placée(s), en rouge : reclique-les pour les déplacer, puis revérifie.`));
  });

  solution.addEventListener("click", () => {
    if (premierEssai) { suivi?.noter(nom, 0, jetons.length); premierEssai = false; }
    for (const j of jetons) {
      if (position.get(j) !== [j.cible].flat()[0] || !ok(j, position.get(j))) poser(j, [j.cible].flat()[0]);
      marquer(j, true);
    }
    remarques.replaceChildren(...lesAides(jetons));
    terminer("Solution affichée");
  });

  // Une remarque par aide différente (plusieurs lignes peuvent partager la même explication)
  function lesAides(liste) {
    const vues = new Set();
    return liste.filter((j) => j.aide && !vues.has(j.aide) && vues.add(j.aide))
      .map((j) => el("li", "", `**${j.texte}** : ${j.aide}`));
  }

  function terminer(message) {
    fini = true;
    ecoute.abort();
    choisir(null);
    jetons.forEach((j) => j.ancre?.classList.remove("cliquable"));
    inactives.forEach((e) => e.classList.remove("inactive"));
    actions.replaceChildren(el("p", "verdict-ok", message));
    reserve.remove();
    quandFini?.();
  }

  racine.append(aideTxt);
  if (reserve.childElementCount) racine.append(reserve);
  if (zonesParDefaut.childElementCount) racine.append(zonesParDefaut);
  racine.append(actions, remarques);
  return racine;
}

// ---------- Grille de calcul ----------
// lignes : [{ libelle, attendu: nombre | [nombres] | null, aide?, total?, donne?, titre? }]
export function grilleCalcul({ lignes, colonnes = ["Montant"], suivi, nom, quandFini, ecart = 0 }) {
  const racine = el("div", "grille-calcul");
  const table = el("table", "tableau-saisie");
  const tete = table.createTHead().insertRow();
  for (const c of ["", ...colonnes]) tete.append(el("th", "", c));
  const corps = table.createTBody();
  const cases = [];
  for (const l of lignes) {
    const tr = corps.insertRow();
    if (l.titre) {
      tr.className = "ligne-titre";
      const td = tr.insertCell();
      td.colSpan = colonnes.length + 1;
      ecrire(td, l.titre);
      continue;
    }
    if (l.total) tr.className = "ligne-total";
    ecrire(tr.insertCell(), l.libelle);
    [l.attendu].flat().forEach((att) => {
      const td = tr.insertCell();
      td.className = "case";
      if (l.donne || att === null) { td.textContent = att === null ? "" : fmt(att); td.classList.add("donnee"); return; }
      const champ = document.createElement("input");
      champ.inputMode = "decimal";
      champ.autocomplete = "off";
      td.append(champ);
      cases.push({ l, att, champ, td });
    });
  }
  const defile = el("div", "defile");
  defile.append(table);

  const verifier = bouton("Vérifier mes calculs");
  const correction = bouton("Afficher la correction", "secondaire");
  const actions = el("div", "actions-atelier");
  actions.append(verifier, correction);
  const aides = el("ul", "remarques");
  let premierEssai = true;

  const juste = (c) => {
    const v = lireNombre(c.champ.value);
    return !Number.isNaN(v) && Math.abs(v - c.att) <= (c.l.ecart ?? ecart) + 1e-9;
  };

  verifier.addEventListener("click", () => {
    let bons = 0;
    for (const c of cases) {
      const j = juste(c);
      c.champ.classList.toggle("bon", j);
      c.champ.classList.toggle("faux", !j);
      if (j) { bons++; c.champ.disabled = true; }
    }
    if (premierEssai) { suivi?.noter(nom, bons, cases.length); premierEssai = false; }
    if (bons === cases.length) {
      actions.replaceChildren(el("p", "verdict-ok", "Tous les calculs sont justes ✔"));
      quandFini?.();
    } else {
      aides.replaceChildren(el("li", "verdict-ko", `${cases.length - bons} case(s) fausse(s) : refais le calcul (indice : survole ou regarde la formule en cliquant « Afficher la correction »).`));
    }
  });

  correction.addEventListener("click", () => {
    if (premierEssai) {
      suivi?.noter(nom, cases.filter(juste).length, cases.length);
      premierEssai = false;
    }
    for (const c of cases) {
      const j = juste(c);
      c.champ.disabled = true;
      c.champ.classList.toggle("bon", j);
      c.champ.classList.toggle("faux", !j);
      if (!j) c.td.append(el("span", "attendu", fmt(c.att)));
    }
    aides.replaceChildren(...lignes.filter((l) => l.aide && !l.donne).map((l) => el("li", "", `**${l.libelle}** : ${l.aide}`)));
    actions.replaceChildren(el("p", "discret", "Correction affichée."));
    quandFini?.();
  });

  racine.append(defile, actions, aides);
  cases[0]?.champ.focus({ preventScroll: true });
  return racine;
}

// ---------- Choix ----------
export function choix({ options, bonne, explication, suivi, nom, quandFini }) {
  const racine = el("div", "choix");
  const boutons = options.map((texte, i) => {
    const b = bouton(texte, "choix-bouton");
    b.addEventListener("click", () => {
      boutons.forEach((x, k) => { x.disabled = true; if (k === bonne) x.classList.add("bon"); });
      if (i !== bonne) b.classList.add("faux");
      suivi?.noter(nom, i === bonne ? 1 : 0, 1);
      if (explication) racine.append(el("p", "discret", explication));
      quandFini?.();
    });
    return b;
  });
  racine.append(...boutons);
  return racine;
}

// ---------- Phases ----------
export class Phases {
  constructor(conteneur, suivi) {
    this.conteneur = conteneur;
    this.suivi = suivi;
    this.liste = [];
  }
  ajouter(titre, consigne, construire) { this.liste.push({ titre, consigne, construire }); return this; }
  lancer() { this.conteneur.replaceChildren(); this.ouvrir(0); }
  ouvrir(i) {
    if (i >= this.liste.length) return this.bilan();
    const { titre, consigne, construire } = this.liste[i];
    const sec = el("section", "phase");
    sec.append(el("h3", "phase-titre", titre));
    if (consigne) sec.append(el("p", "phase-consigne", consigne));
    this.conteneur.append(sec);
    let deja = false;
    construire(sec, () => { if (!deja) { deja = true; this.ouvrir(i + 1); } });
    if (i > 0) sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }
  bilan() {
    const sec = el("section", "phase bilan-atelier");
    sec.append(el("h3", "phase-titre", "Bilan de l'atelier"));
    const liste = el("ul");
    let b = 0, t = 0;
    for (const e of this.suivi.etapes) {
      b += e.bons; t += e.total;
      liste.append(el("li", "", `${e.nom} : **${e.bons} / ${e.total}** juste(s) du premier coup`));
    }
    sec.append(el("p", "score-final", `${t ? Math.round((100 * b) / t) : 0} %`), liste,
      el("p", "discret", "Refais l'atelier avec « Nouveau cas » jusqu'à tout réussir du premier coup."));
    this.conteneur.append(sec);
    sec.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}
