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
// jetons : [{ texte, montant?, cible: id | [ids], aide? }]
// zones  : [{ id, titre, conteneur? (élément où dessiner la zone), unique? (un seul jeton) }]
export function placement({ jetons, zones, suivi, nom, quandFini, consigne }) {
  const racine = el("div", "placement");
  const aideTxt = el("p", "discret", consigne ?? "Clique une ligne, puis le bloc où elle va. Clique une ligne déjà placée pour la remettre en haut.");
  const reserve = el("div", "reserve");
  const zonesParDefaut = el("div", "zones");
  const remarques = el("ul", "remarques");
  let choisi = null;
  let fini = false;
  let premierEssai = true;
  const position = new Map();   // jeton → id de zone
  const depots = new Map();     // id de zone → élément de dépôt
  const uniques = new Set(zones.filter((z) => z.unique).map((z) => z.id));

  for (const z of zones) {
    const boite = el("div", "zone" + (z.unique ? " zone-unique" : ""));
    boite.append(el("p", "zone-titre", z.titre));
    const depot = el("div", "zone-depot");
    boite.append(depot);
    boite.addEventListener("click", (e) => {
      if (fini || !choisi || e.target.closest(".jeton")) return;
      poser(choisi, z.id);
    });
    depots.set(z.id, depot);
    (z.conteneur ?? zonesParDefaut).append(boite);
  }

  const elements = new Map();
  for (const j of melanger(jetons)) {
    const b = bouton("", "jeton");
    b.append(el("span", "jeton-texte", j.texte));
    if (j.montant !== undefined) b.append(el("span", "jeton-montant", typeof j.montant === "number" ? fmt(j.montant) : j.montant));
    b.addEventListener("click", () => {
      if (fini || b.classList.contains("bloque")) return;
      if (position.has(j)) {
        position.delete(j);
        b.classList.remove("faux");
        reserve.append(b);
        choisir(null);
      } else {
        choisir(choisi === j ? null : j);
      }
      majBouton();
    });
    elements.set(j, b);
    reserve.append(b);
  }

  function choisir(j) {
    choisi = j;
    for (const [jj, b] of elements) b.classList.toggle("choisi", jj === j);
  }

  function poser(j, zoneId) {
    if (uniques.has(zoneId)) {
      for (const [autre, z] of position) {
        if (z === zoneId) { position.delete(autre); elements.get(autre).classList.remove("faux"); reserve.append(elements.get(autre)); }
      }
    }
    position.set(j, zoneId);
    depots.get(zoneId).append(elements.get(j));
    elements.get(j).classList.remove("faux");
    choisir(null);
    majBouton();
  }

  const verifier = bouton("Vérifier le placement");
  const solution = bouton("Voir la solution", "secondaire");
  const actions = el("div", "actions-atelier");
  actions.append(verifier, solution);
  function majBouton() { verifier.disabled = position.size < jetons.length; }
  majBouton();

  const ok = (j, z) => [j.cible].flat().includes(z);

  verifier.addEventListener("click", () => {
    let bons = 0;
    remarques.replaceChildren(...lesAides([...elements.keys()].filter((j) => !ok(j, position.get(j)))));
    for (const [j, b] of elements) {
      const bien = ok(j, position.get(j));
      b.classList.toggle("faux", !bien);
      if (bien) { bons++; b.classList.add("bloque"); }
    }
    if (premierEssai) { suivi?.noter(nom, bons, jetons.length); premierEssai = false; }
    if (bons === jetons.length) terminer("Tout est bien placé ✔");
    else remarques.prepend(el("li", "verdict-ko", `${jetons.length - bons} ligne(s) mal placée(s), en rouge : corrige-les puis revérifie.`));
  });

  solution.addEventListener("click", () => {
    if (premierEssai) { suivi?.noter(nom, 0, jetons.length); premierEssai = false; }
    for (const [j, b] of elements) {
      const cible = [j.cible].flat()[0];
      position.set(j, cible);
      depots.get(cible).append(b);
      b.classList.remove("faux", "choisi");
      b.classList.add("bloque");
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
    actions.replaceChildren(el("p", "verdict-ok", message));
    reserve.remove();
    quandFini?.();
  }

  racine.append(aideTxt, reserve);
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
