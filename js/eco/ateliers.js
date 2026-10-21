// Les cinq ateliers : chacun reproduit un dossier du DS. On a le document de départ à gauche
// (données) et on construit sa copie à droite, phase par phase : structure → placement → calculs.

import { el, fmt, placement, grilleCalcul, choix, Phases } from "./composants.js";
import { COMPTES, soldes, lignesCR, BF, agregats, planAmort, CODES, totauxListe, variation } from "./cas.js";

// ---------- Affichage des documents de départ ----------
// lignes : texte (intertitre), [libellé, valeurs…] ou { cells: [libellé, valeurs…], ref, num } ;
// refs (Map) reçoit ref → <tr> pour rendre les lignes cliquables dans les ateliers ; num = numéro de compte.
function tableau(titre, colonnes, lignes, note, refs) {
  const bloc = el("div", "annexe");
  if (titre) bloc.append(el("p", "annexe-titre", titre));
  const t = el("table", "tableau-donnees");
  if (colonnes) {
    const tr = t.createTHead().insertRow();
    for (const c of ["", ...colonnes]) tr.append(el("th", "", c));
  }
  const corps = t.createTBody();
  for (const l of lignes) {
    const tr = corps.insertRow();
    if (typeof l === "string") { tr.className = "ligne-titre"; const td = tr.insertCell(); td.colSpan = (colonnes?.length ?? 1) + 1; td.textContent = l; continue; }
    const [lib, ...vals] = Array.isArray(l) ? l : l.cells;
    if (!Array.isArray(l)) refs?.set(l.ref, tr);
    const td = tr.insertCell();
    if (!Array.isArray(l) && l.num) td.append(el("span", "num-compte", l.num));
    td.append(el("span", "", lib));
    for (const v of vals) { const td = tr.insertCell(); td.className = "case"; td.textContent = typeof v === "number" ? fmt(v) : (v ?? ""); }
  }
  const d = el("div", "defile");
  d.append(t);
  bloc.append(d);
  if (note) bloc.append(el("p", "discret", note));
  return bloc;
}

const BLOCS_CR = [["PRODUITS D'EXPLOITATION", "P"], ["PRODUITS FINANCIERS", "PF"], ["PRODUITS EXCEPTIONNELS", "PX"],
  ["CHARGES D'EXPLOITATION", "C"], ["CHARGES FINANCIÈRES", "CF"], ["CHARGES EXCEPTIONNELLES", "CX"], ["IMPÔT ET PARTICIPATION", "CI"]];

// Affiche le CR « en liste » et renvoie la correspondance ligne du CR → ligne du tableau
function afficherCR(cas, zone, toutes) {
  const s = soldes(cas.c);
  const lignes = [];
  const refs = new Map();
  for (const [titre, cote] of BLOCS_CR) {
    const du = toutes.filter((l) => l.cote === cote);
    if (!du.length) continue;
    lignes.push(titre, ...du.map((l) => ({ cells: [l.libelle, l.montant], ref: l, num: l.num })));
  }
  lignes.push(["**Total des produits**", s.produits], ["**Total des charges**", s.charges], ["**Résultat net de l'exercice**", s.RN]);
  zone.replaceChildren(tableau(`Compte de résultat (en liste) — ${cas.nom}, en ${cas.unite}`, ["Montant"], lignes, cas.source, refs));
  return refs;
}

// ---------- 1. SIG ----------
// [solde, [[id de zone, titre, étiquette courte affichée sur la ligne du document]]]
const CASCADE = [
  ["Marge commerciale", [["mc+", "+ Ventes de marchandises", "MC +"], ["mc-", "− Coût d'achat des marchandises vendues", "MC −"]]],
  ["Production de l'exercice", [["prod", "+ Production vendue, stockée, immobilisée", "Production +"]]],
  ["Valeur ajoutée", [["va-", "MC + Production − consommations en provenance des tiers", "VA −"]]],
  ["Excédent brut d'exploitation", [["ebe+", "VA +", "EBE +"], ["ebe-", "VA −", "EBE −"]]],
  ["Résultat d'exploitation", [["re+", "EBE +", "RE +"], ["re-", "EBE −", "RE −"]]],
  ["Résultat courant avant impôts", [["rf+", "RE + produits financiers", "RCAI +"], ["rf-", "RE − charges financières", "RCAI −"]]],
  ["Résultat exceptionnel", [["rx+", "+", "Exc. +"], ["rx-", "−", "Exc. −"]]],
  ["Résultat net", [["rn-", "RCAI ± R. exceptionnel −", "RN −"]]],
];
const ZONE_SIG = {
  "707": "mc+", "607": "mc-", "6037": "mc-", "701": "prod", "706": "prod", "713": "prod", "72": "prod",
  "601": "va-", "6031": "va-", "61/62": "va-", "74": "ebe+", "63": "ebe-", "641": "ebe-", "645": "ebe-",
  "781": "re+", "75": "re+", "747": "re+", "757": "re+", "681": "re-", "65": "re-", "657": "re-",
  "76": "rf+", "786": "rf+", "767": "rf+", "66": "rf-", "686": "rf-", "667": "rf-", "77": "rx+", "67": "rx-", "691": "rn-", "695": "rn-",
};
const AIDES = {
  "6037": "la variation de stock de marchandises corrige les achats : coût d'achat des marchandises vendues = 607 + 6037 (dans la marge commerciale).",
  "6031": "la variation de stock de MP corrige les achats de MP : consommation (dans la VA).",
  "601": "achats de MP = consommation en provenance des tiers (VA). Seules les marchandises vont dans la marge commerciale.",
  "61/62": "charge externe (énergie, téléphone, publicité, loyers…) : consommation en provenance des tiers (VA).",
  "713": "la production stockée fait partie de la production de l'exercice (pas du CA).",
  "72": "production immobilisée : production de l'exercice.",
  "74": "subvention d'exploitation : on l'ajoute entre VA et EBE.",
  "63": "impôts et taxes : retirés entre VA et EBE (l'IS, lui, est tout en bas).",
  "641": "charges de personnel : retirées entre VA et EBE.", "645": "charges de personnel : retirées entre VA et EBE.",
  "781": "reprise (produit calculé) : entre EBE et résultat d'exploitation.",
  "681": "dotation (charge calculée) : entre EBE et résultat d'exploitation.",
  "747": "quote-part de subvention d'investissement : entre EBE et résultat d'exploitation.",
  "757": "PCG 2025 : cession d'immobilisation corporelle → résultat d'exploitation (plus en exceptionnel).",
  "657": "PCG 2025 : valeur comptable de l'immobilisation corporelle cédée → résultat d'exploitation.",
  "767": "cession d'immobilisation **financière** (titres) → résultat financier.",
  "667": "valeur comptable d'une immobilisation **financière** cédée → résultat financier.",
  "686": "dotation financière → résultat financier.", "786": "reprise financière → résultat financier.",
  "75": "autre produit de gestion courante : entre EBE et RE.", "65": "autre charge de gestion courante : entre EBE et RE.",
  "66": "intérêts : résultat financier (donc RCAI).", "76": "intérêts reçus : résultat financier.",
  "77": "PCG 2025 : exceptionnel = événements majeurs et inhabituels.", "67": "charge exceptionnelle.",
  "691": "la participation est retirée après le RCAI et l'exceptionnel.", "695": "l'IS est retiré en tout dernier.",
};

export function atelierSIG(cas, donnees, copie, suivi) {
  const lignes = lignesCR(cas);
  const refs = afficherCR(cas, donnees, lignes);
  const c = cas.c, s = soldes(c);
  const P = new Phases(copie, suivi);
  let squelette;

  P.ajouter("① L'ordre de la cascade", "Range les soldes intermédiaires de gestion dans l'ordre où on les calcule (clique un solde, puis la case).", (sec, fini) => {
    const zones = CASCADE.map((_, i) => ({ id: i, titre: `${i + 1}.`, unique: true }));
    // MC et Production sont interchangeables (rangs 1 et 2) ; la 1re cible sert pour la solution
    const jetons = CASCADE.map(([nom], i) => ({ texte: nom, cible: i === 0 ? [0, 1] : i === 1 ? [1, 0] : [i],
      aide: "ordre : MC et Production → VA → EBE → RE → RCAI → R. exceptionnel → RN." }));
    sec.append(placement({ jetons, zones, suivi, nom: "Ordre de la cascade", quandFini: fini,
      consigne: "Clique un solde, puis la case de son rang." }));
  });

  P.ajouter("② Répartir le compte de résultat dans la cascade", "Chaque ligne du compte de résultat (à gauche) sert dans un seul solde, avec un signe + ou −. Clique la ligne dans le document, puis le bloc de la cascade.", (sec, fini) => {
    squelette = el("div", "squelette");
    const zones = [];
    for (const [nom, sous] of CASCADE) {
      const g = el("div", "groupe-solde");
      g.append(el("p", "groupe-titre", `= ${nom}`));
      const z = el("div", "sous-zones");
      g.append(z);
      squelette.append(g);
      for (const [id, titre, court] of sous) zones.push({ id, titre, court, conteneur: z });
    }
    const jetons = lignes.map((l) => ({ texte: `${l.num} ${l.libelle}`, montant: l.montant, cible: ZONE_SIG[l.code], aide: AIDES[l.code], ancre: refs.get(l) }));
    const p = placement({ jetons, zones, suivi, nom: "Répartition des lignes", quandFini: fini });
    p.insertBefore(squelette, p.querySelector(".actions-atelier"));
    sec.append(p);
  });

  P.ajouter("③ Calculer les soldes", `Calcule chaque ligne (en ${cas.unite}). Montants à retrancher : tape-les sans signe ; seuls les soldes (et les variations) peuvent être négatifs. Contrôle final : le résultat net doit être celui du CR.`, (sec, fini) => {
    sec.append(grilleCalcul({ suivi, nom: "Calcul des SIG", quandFini: fini, colonnes: [cas.unite], lignes: [
      { libelle: "Ventes de marchandises (707)", attendu: c["707"] },
      { libelle: "− Coût d'achat des marchandises vendues (607 + 6037)", attendu: s.cout, aide: "achats de marchandises + variation de stock (SI − SF)" },
      { libelle: "= Marge commerciale", attendu: s.MC, total: true },
      { libelle: "Production de l'exercice (701 + 706 + 713 + 72)", attendu: s.prod, aide: "production vendue (biens + services) + production stockée + immobilisée" },
      { libelle: "− Consommations en provenance des tiers (601 + 6031 + 61/62)", attendu: s.conso, aide: "achats de MP + variation de stock de MP + toutes les charges externes" },
      { libelle: "= Valeur ajoutée", attendu: s.VA, total: true, aide: "MC + production − consommations" },
      { libelle: "+ Subventions d'exploitation (74)", attendu: c["74"] },
      { libelle: "− Impôts, taxes et versements assimilés (63)", attendu: c["63"] },
      { libelle: "− Charges de personnel (641 + 645)", attendu: s.perso, aide: "salaires + charges sociales" },
      { libelle: "= Excédent brut d'exploitation", attendu: s.EBE, total: true },
      { libelle: "+ Reprises et autres produits (781 + 75 + 747 + 757)", attendu: s.plus, aide: "781 + 75 + 747 + 757 (cessions d'immos corporelles)" },
      { libelle: "− Dotations et autres charges (681 + 65 + 657)", attendu: s.moins, aide: "681 + 65 + 657" },
      { libelle: "= Résultat d'exploitation", attendu: s.RE, total: true },
      { libelle: "+ Produits financiers (76 + 767 + 786)", attendu: s.pf, aide: "76 + 786 + 767" },
      { libelle: "− Charges financières (66 + 667 + 686)", attendu: s.cf, aide: "66 + 686 + 667" },
      { libelle: "= Résultat courant avant impôts", attendu: s.RCAI, total: true },
      { libelle: "± Résultat exceptionnel (77 − 67)", attendu: s.RX, aide: "77 − 67" },
      { libelle: "− Participation et impôt sur les bénéfices (691 + 695)", attendu: s.impot },
      { libelle: "= Résultat net", attendu: s.RN, total: true, aide: "doit être égal à total produits − total charges" },
    ] }));
  });
  P.lancer();
}

// ---------- 2. CAF ----------
const DANS_EBE = new Set(["707", "607", "6037", "701", "706", "713", "72", "601", "6031", "61/62", "74", "63", "641", "645"]);
const CAF_S = { "75": "plus", "76": "plus", "77": "plus", "65": "moins", "66": "moins", "67": "moins", "691": "moins", "695": "moins" };
const CAF_A = { "681": "plus", "686": "plus", "657": "plus", "667": "plus", "781": "moins", "786": "moins", "757": "moins", "767": "moins", "747": "moins" };
const AIDES_CAF = {
  "681": "charge calculée (pas de décaissement).", "686": "charge calculée.", "781": "produit calculé (pas d'encaissement).", "786": "produit calculé.",
  "747": "produit calculé (quote-part de subvention).", "757": "opération de cession : exclue de la CAF.", "657": "opération de cession : exclue de la CAF.",
  "767": "opération de cession : exclue.", "667": "opération de cession : exclue.",
  "75": "produit encaissable hors EBE.", "76": "produit encaissable.", "77": "produit encaissable.",
  "65": "charge décaissable hors EBE.", "66": "charge décaissable.", "67": "charge décaissable.", "691": "décaissée.", "695": "décaissé.",
};

export function atelierCAF(cas, donnees, copie, suivi) {
  const lignes = lignesCR(cas);
  const refs = afficherCR(cas, donnees, lignes);
  const c = cas.c, s = soldes(c);
  donnees.append(el("p", "rappel", `Donnés (calculés dans l'atelier SIG) : **EBE = ${fmt(s.EBE)}** ; **résultat net = ${fmt(s.RN)}** ${cas.unite}.`));
  const P = new Phases(copie, suivi);

  P.ajouter("① Méthode soustractive : que faire de chaque ligne ?", "On part de l'EBE. Pour chaque ligne du CR : à ajouter, à retirer, déjà comptée dans l'EBE, ou exclue de la CAF (élément calculé ou cession) ?", (sec, fini) => {
    const zones = [["plus", "+ Produit encaissable à ajouter", "+ CAF"], ["moins", "− Charge décaissable à retirer", "− CAF"],
      ["ebe", "Déjà compté dans l'EBE", "dans l'EBE"], ["exclu", "Exclu : calculé ou cession", "exclu"]].map(([id, titre, court]) => ({ id, titre, court }));
    const jetons = lignes.map((l) => ({ texte: `${l.num} ${l.libelle}`, montant: l.montant, ancre: refs.get(l),
      cible: DANS_EBE.has(l.code) ? "ebe" : CAF_S[l.code] ?? "exclu",
      aide: DANS_EBE.has(l.code) ? "cette ligne est au-dessus de l'EBE : elle y est déjà." : AIDES_CAF[l.code] }));
    sec.append(placement({ jetons, zones, suivi, nom: "Tri pour la CAF soustractive", quandFini: fini }));
  });

  P.ajouter("② Calculer la CAF (soustractive)", `En ${cas.unite} ; montants retranchés tapés sans signe.`, (sec, fini) => {
    const l = [{ libelle: "Excédent brut d'exploitation", attendu: s.EBE, donne: true }];
    const ajout = (code, lib) => { if (c[code]) l.push({ libelle: lib, attendu: c[code] }); };
    ajout("75", "+ Autres produits de gestion courante (75)"); ajout("65", "− Autres charges de gestion courante (65)");
    ajout("76", "+ Produits financiers encaissables (76)"); ajout("66", "− Charges d'intérêts (66)");
    ajout("77", "+ Produits exceptionnels (77)"); ajout("67", "− Charges exceptionnelles (67)");
    ajout("691", "− Participation des salariés (691)"); ajout("695", "− Impôt sur les bénéfices (695)");
    l.push({ libelle: "= Capacité d'autofinancement", attendu: s.CAF, total: true, aide: "EBE + produits encaissables − charges décaissables" });
    sec.append(grilleCalcul({ lignes: l, colonnes: [cas.unite], suivi, nom: "CAF soustractive", quandFini: fini }));
  });

  P.ajouter("③ Méthode additive : que faire de chaque ligne ?", "On part du résultat net, qui contient déjà tout. On neutralise les éléments calculés et les cessions : à rajouter, à retirer, ou rien à faire ?", (sec, fini) => {
    const zones = [["plus", "+ À rajouter au résultat net", "+ RN"], ["moins", "− À retirer du résultat net", "− RN"],
      ["rien", "Rien à faire (encaissé ou décaissé)", "rien"]].map(([id, titre, court]) => ({ id, titre, court }));
    const inactives = lignes.filter((l) => DANS_EBE.has(l.code)).map((l) => refs.get(l));
    const jetons = lignes.filter((l) => !DANS_EBE.has(l.code)).map((l) => ({ texte: `${l.num} ${l.libelle}`, montant: l.montant, ancre: refs.get(l), cible: CAF_A[l.code] ?? "rien",
      aide: CAF_A[l.code] === "plus" ? "charge non décaissée (calculée ou valeur d'un actif cédé) : on la rajoute." :
        CAF_A[l.code] === "moins" ? "produit non encaissé dans l'activité (calculé ou prix de cession) : on le retire." : "vrai flux : déjà correct dans le résultat net." }));
    sec.append(placement({ jetons, zones, inactives, suivi, nom: "Tri pour la CAF additive", quandFini: fini,
      consigne: "Les lignes grisées (au-dessus de l'EBE) ne changent rien. Clique les autres lignes du **document de départ**, puis le bloc." }));
  });

  P.ajouter("④ Calculer la CAF (additive) et comparer", "Les deux méthodes doivent donner exactement la même CAF.", (sec, fini) => {
    sec.append(grilleCalcul({ colonnes: [cas.unite], suivi, nom: "CAF additive", quandFini: fini, lignes: [
      { libelle: "Résultat net", attendu: s.RN, donne: true },
      { libelle: "+ Dotations (681 + 686)", attendu: c["681"] + c["686"] },
      { libelle: "− Reprises (781 + 786)", attendu: c["781"] + c["786"] },
      { libelle: "+ Valeurs comptables des actifs cédés (657 + 667)", attendu: c["657"] + c["667"] },
      { libelle: "− Produits des cessions (757 + 767)", attendu: c["757"] + c["767"] },
      { libelle: "− Quote-part des subventions d'investissement (747)", attendu: c["747"] },
      { libelle: "= Capacité d'autofinancement", attendu: s.CAF, total: true, aide: `même valeur que la méthode soustractive (${fmt(s.CAF)})` },
    ] }));
  });
  P.lancer();
}

// ---------- 3. Bilan fonctionnel ----------
const SITUATIONS = [
  "Équilibre sain : le FRNG finance tout le BFR, la trésorerie est positive",
  "FRNG insuffisant : trésorerie négative, l'entreprise dépend des découverts",
  "BFR négatif : l'exploitation dégage de la trésorerie (type grande distribution)",
  "FRNG négatif : des immobilisations sont financées à court terme (risqué)",
];

function schema(g, unite) {
  const max = Math.max(Math.abs(g.BFR), Math.abs(g.FRNG), Math.abs(g.TN), 1);
  const barre = (lib, v, cls) => {
    const b = el("div", `barre-schema ${cls}`);
    b.style.height = `${Math.max(18, (Math.abs(v) / max) * 160)}px`;
    b.append(el("span", "", `${lib}\n${fmt(v)}`));
    return b;
  };
  const s = el("div", "schema");
  const gauche = el("div", "pile");
  gauche.append(barre("BFR", g.BFR, "bfr"));
  if (g.TN > 0) gauche.append(barre("TN", g.TN, "tn-pos"));
  const droite = el("div", "pile");
  droite.append(barre("FRNG", g.FRNG, "frng"));
  if (g.TN < 0) droite.append(barre("TN", g.TN, "tn-neg"));
  s.append(gauche, droite);
  const legende = el("p", "discret", `FRNG = BFR + TN (en ${unite})`);
  const bloc = el("div");
  bloc.append(s, legende);
  return bloc;
}

export function atelierBilan(cas, donnees, copie, suivi) {
  const net = cas.actif.reduce((n, [, b, a]) => n + b - a, 0);
  const refs = new Map();
  donnees.replaceChildren(
    tableau(`Bilan au 31.12 (avant répartition) — ${cas.nom}, en ${cas.unite}`, ["Brut", "Amort. & dépréc.", "Net"],
      ["ACTIF", ...cas.actif.map((l) => ({ cells: [l[0], l[1], l[2], l[1] - l[2]], ref: l })), ["**Total actif**", null, null, net]], null, refs),
    tableau(null, ["Montant"], ["PASSIF", ...cas.passif.map((l) => ({ cells: [l[0], l[1]], ref: l })),
      ["**Total passif**", cas.passif.reduce((n, [, m]) => n + m, 0)]], cas.note, refs),
  );
  const g = agregats(cas);
  const P = new Phases(copie, suivi);

  P.ajouter("① Reclasser le bilan comptable", "Dans le bilan de gauche, clique un montant (actif : la case **Brut**, puis la case **Amort. & dépréc.** séparément ; passif : la ligne), puis le bloc du bilan fonctionnel où il va. Les amortissements/dépréciations deviennent une ressource.", (sec, fini) => {
    const plan = el("div", "bilan-fonctionnel");
    const colE = el("div", "colonne-bf"), colR = el("div", "colonne-bf");
    colE.append(el("p", "groupe-titre", "EMPLOIS (actif)"));
    colR.append(el("p", "groupe-titre", "RESSOURCES (passif)"));
    plan.append(colE, colR);
    const zones = ["ES", "ACE", "ACHE", "TA"].map((id) => ({ id, titre: BF[id], court: id, conteneur: colE }))
      .concat(["RS", "PCE", "PCHE", "TP"].map((id) => ({ id, titre: BF[id], court: id, conteneur: colR })));
    const AIDE_BF = { ES: "immobilisation, en valeur brute.", ACE: "élément du cycle d'exploitation (stocks, clients bruts, créances d'exploitation, charges constatées d'avance).",
      ACHE: "créance hors exploitation.", TA: "disponibilités.", RS: "capitaux propres (résultat compris), provisions, emprunts, et tous les amortissements/dépréciations.",
      PCE: "dette d'exploitation (fournisseurs, fiscales et sociales).", PCHE: "dette hors exploitation (dettes sur immobilisations, IS à payer).",
      TP: "trésorerie passive : concours bancaires courants (et dettes financières à court terme isolées)." };
    const jetons = [
      ...cas.actif.map((l) => ({ texte: `${l[0]} (brut)`, montant: l[1], cible: l[3], aide: AIDE_BF[l[3]], ancre: refs.get(l).cells[1] })),
      ...cas.actif.filter((l) => l[2]).map((l) => ({ texte: `Amort. / dépréc. — ${l[0]}`, montant: l[2], cible: "RS",
        aide: "retirés de l'actif (on travaille en brut), ils sont ajoutés aux ressources stables.", ancre: refs.get(l).cells[2] })),
      ...cas.passif.map((l) => ({ texte: l[0], montant: l[1], cible: l[2], aide: AIDE_BF[l[2]], ancre: refs.get(l) })),
    ];
    const p = placement({ jetons, zones, suivi, nom: "Reclassement", quandFini: fini });
    p.insertBefore(plan, p.querySelector(".actions-atelier"));
    sec.append(p);
  });

  P.ajouter("② Totaux du bilan fonctionnel", `En ${cas.unite}. Le total est plus grand que celui du bilan comptable : les amortissements sont comptés à l'actif (brut) et au passif.`, (sec, fini) => {
    sec.append(grilleCalcul({ colonnes: [cas.unite], suivi, nom: "Bilan fonctionnel", quandFini: fini, lignes: [
      { titre: "Emplois" },
      ...["ES", "ACE", "ACHE", "TA"].map((k) => ({ libelle: BF[k], attendu: g[k] })),
      { libelle: "Total des emplois", attendu: g.emplois, total: true },
      { titre: "Ressources" },
      ...["RS", "PCE", "PCHE", "TP"].map((k) => ({ libelle: BF[k], attendu: g[k] })),
      { libelle: "Total des ressources", attendu: g.ressources, total: true, aide: "égal au total des emplois" },
    ] }));
  });

  P.ajouter("③ FRNG, BFR, trésorerie nette", "Vérifie : TN = FRNG − BFR.", (sec, fini) => {
    const l = [
      { libelle: "FRNG = ressources stables − emplois stables", attendu: g.FRNG },
      { libelle: "BFR d'exploitation = ACE − PCE", attendu: g.BFRE },
      { libelle: "BFR hors exploitation = ACHE − PCHE", attendu: g.BFRHE },
      { libelle: "BFR = BFRE + BFRHE", attendu: g.BFR, total: true },
      { libelle: "Trésorerie nette = TA − TP", attendu: g.TN, total: true, aide: "= FRNG − BFR" },
    ];
    if (cas.ca) l.push({ libelle: "BFR en jours de CA (BFR / CA × 360, 1 décimale)", attendu: Math.round((g.BFR / cas.ca) * 3600) / 10, ecart: 0.1,
      aide: `CA = ${fmt(cas.ca)}` });
    sec.append(grilleCalcul({ lignes: l, colonnes: [cas.unite], suivi, nom: "FRNG / BFR / TN", quandFini: fini }));
  });

  P.ajouter("④ Qualifier l'équilibre", "Quelle situation ? (le schéma s'affiche après ta réponse)", (sec, fini) => {
    const bonne = g.FRNG <= 0 ? 3 : g.BFR <= 0 ? 2 : g.TN >= 0 ? 0 : 1;
    sec.append(choix({ options: SITUATIONS, bonne, suivi, nom: "Situation", quandFini: () => { sec.append(schema(g, cas.unite)); fini(); },
      explication: `FRNG ${fmt(g.FRNG)} ; BFR ${fmt(g.BFR)} ; TN ${fmt(g.TN)}.` }));
  });
  P.lancer();
}

// ---------- 4. Amortissement et cession ----------
const MOIS = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"];

export function atelierAmort(cas, donnees, copie, suivi) {
  const p = planAmort(cas);
  const date = `${String(cas.jour).padStart(2, "0")}.${String(cas.mois).padStart(2, "0")}.N`;
  const fin = `01.${String(cas.cesMois).padStart(2, "0")}.N+${cas.cesAn}`;
  const carte = el("div", "annexe");
  carte.append(el("p", "annexe-titre", `Cas ${cas.nom} (PCG 2025, clôture au 31.12, TVA 20 %)`),
    el("p", "", `Matériel industriel (compte 215) : **${fmt(cas.vb)} € HT**, mis en service le **${date}**, amortissement **linéaire sur ${cas.n} ans**.`),
    el("p", "", `Cédé le **${fin}** pour **${fmt(cas.prix)} € HT**, réglé par chèque.`),
    el("p", "discret", "Année de 360 jours (12 mois de 30 jours). " + (cas.note ?? "")));
  donnees.replaceChildren(carte);
  const P = new Phases(copie, suivi);

  P.ajouter("① La frise", "Avant le tableau : le taux, l'annuité pleine et les deux prorata (1re année, année de la cession).", (sec, fini) => {
    sec.append(grilleCalcul({ colonnes: ["Valeur"], suivi, nom: "Frise", quandFini: fini, lignes: [
      { libelle: "Taux linéaire (en %)", attendu: p.taux, aide: `1 / ${cas.n}` },
      { libelle: "Annuité pleine (€)", attendu: p.annuite, aide: `${fmt(cas.vb)} × 1/${cas.n}` },
      { libelle: `Jours de la 1re année (du ${date} au 31.12)`, attendu: p.j1, aide: "jours restants du mois + 30 par mois complet (mise en service le 1er : mois complet)" },
      { libelle: `Jours de l'année de cession (du 01.01 au ${fin.slice(0, 5)})`, attendu: p.jc, aide: "30 par mois écoulé" },
    ] }));
  });

  P.ajouter("② Le plan d'amortissement jusqu'à la cession", "Dotation = VB × 1/n × jours/360 ; cumul = somme des dotations ; VNC = VB − cumul.", (sec, fini) => {
    sec.append(grilleCalcul({ colonnes: ["Dotation", "Cumul", "VNC fin"], suivi, nom: "Plan d'amortissement", quandFini: fini,
      lignes: p.lignes.map((l, k) => ({ libelle: `${l.annee} (${l.jours} j)${k === p.lignes.length - 1 ? " — jusqu'à la cession" : ""}`,
        attendu: [l.dot, l.cumul, l.vnc], aide: `${fmt(cas.vb)} × 1/${cas.n} × ${l.jours}/360` })) }));
  });

  P.ajouter("③ Le résultat de cession", "Depuis le PCG 2025 : en exploitation (757 − 657).", (sec, fini) => {
    sec.append(grilleCalcul({ colonnes: ["€"], suivi, nom: "Résultat de cession", quandFini: fini, lignes: [
      { libelle: "Valeur comptable de l'immobilisation cédée (657)", attendu: p.vnc, aide: `${fmt(cas.vb)} − ${fmt(p.cumul)}` },
      { libelle: "Résultat de cession (+ plus-value, − moins-value)", attendu: p.resultat, aide: `${fmt(cas.prix)} − ${fmt(p.vnc)}` },
    ] }));
  });

  P.ajouter("④ Les écritures du jour de la cession", "Place chaque compte dans la bonne écriture, au débit ou au crédit.", (sec, fini) => {
    const journal = el("div", "journal");
    const zones = [];
    for (const [id, titre] of [["e1", `① Cession (${fin})`], ["e2", "② Dotation complémentaire"], ["e3", "③ Sortie de l'immobilisation"]]) {
      const ligne = el("div", "ecriture");
      ligne.append(el("p", "groupe-titre", titre));
      const dc = el("div", "sous-zones");
      ligne.append(dc);
      journal.append(ligne);
      zones.push({ id: `${id}d`, titre: "Débit", conteneur: dc }, { id: `${id}c`, titre: "Crédit", conteneur: dc });
    }
    const jetons = [
      { texte: "512 Banque", montant: cas.prix + p.tva, cible: "e1d", aide: "on encaisse le prix TTC." },
      { texte: "757 Produits des cessions d'immobilisations", montant: cas.prix, cible: "e1c", aide: "produit, au prix HT." },
      { texte: "44571 TVA collectée", montant: p.tva, cible: "e1c", aide: "dette envers l'État." },
      { texte: "681 Dotations aux amortissements", montant: p.dc, cible: "e2d", aide: "charge du 01.01 à la date de cession." },
      { texte: "2815 Amortissements du matériel", montant: p.dc, cible: "e2c", aide: "le cumul d'amortissement augmente (crédit)." },
      { texte: "657 Valeur comptable des immobilisations cédées", montant: p.vnc, cible: "e3d", aide: "la VNC devient une charge." },
      { texte: "2815 Amortissements du matériel", montant: p.cumul, cible: "e3d", aide: "on solde le cumul (débit)." },
      { texte: "215 Matériel industriel", montant: cas.vb, cible: "e3c", aide: "on sort la valeur brute (crédit)." },
    ];
    const pl = placement({ jetons, zones, suivi, nom: "Écritures", quandFini: fini });
    pl.insertBefore(journal, pl.querySelector(".actions-atelier"));
    sec.append(pl);
  });
  P.lancer();
}

// ---------- 5. Bilan et compte de résultat à partir d'une liste ----------
const NOMS_CODES = { AI: "Actif immobilisé", AC: "Actif circulant", CP: "Capitaux propres", D: "Dettes",
  CE: "Charges d'exploitation", CF: "Charges financières", CEx: "Charges exceptionnelles", PE: "Produits d'exploitation", PF: "Produits financiers", PEx: "Produits exceptionnels" };
const AIDE_CODES = { AI: "bien durable (classe 2) ; les amortissements s'en déduisent.", AC: "stocks de fin, créances, banque, caisse.",
  CP: "capital (et réserves, résultat).", D: "emprunts, fournisseurs, dettes fiscales et sociales, découverts.",
  CE: "consommation liée à l'activité (achats, variation de stock, personnel, impôts, dotations, 657).", CF: "intérêts.",
  CEx: "événement majeur et inhabituel, amendes (corrigé VITAMINES).", PE: "ventes, production, 757 (PCG 2025).", PF: "intérêts reçus.", PEx: "produit exceptionnel." };

// Numéros de compte des postes des listes (TD et cas générés)
const NUM_POSTES = {
  "Terrain": "211", "Constructions": "213", "Matériel industriel": "215", "Matériel de production (brut)": "215",
  "Matériel de manutention": "215", "Matériel de conditionnement": "215", "Brevet": "205", "Marque": "205", "Fonds de commerce": "207",
  "Matériel de transport": "2182", "Matériel de transport (brut)": "2182", "Matériel informatique": "2183", "Matériel informatique (brut)": "2183",
  "Mobilier": "2184", "Mobilier (brut)": "2184", "Amortissements (à déduire de l'actif immobilisé)": "28",
  "Clients": "411", "Créances sur l'État": "44", "Créances État": "44", "Banque": "512", "Banque (Société Générale)": "512", "Caisse": "53",
  "Capital social": "101", "Emprunt auprès des établissements de crédit": "164", "Emprunts auprès des établissements de crédit": "164",
  "Fournisseurs": "401", "Fournisseurs de biens et services": "401", "Fournisseurs d'immobilisations": "404",
  "Dettes fiscales": "44", "Dettes envers le personnel": "421", "Dettes personnel": "421", "Dettes fiscales et sociales": "42/43/44",
  "Concours bancaires courants (BNP)": "519",
  "Achats de matières premières": "601", "Achats de marchandises": "607", "Autres achats et charges externes": "61/62", "Services extérieurs": "61",
  "Impôts et taxes": "63", "Salaires": "641", "Charges sociales": "645", "Salaires et charges sociales": "641/645",
  "Dotations aux amortissements": "681", "Valeurs comptables des immobilisations cédées": "657", "Intérêts versés sur l'emprunt": "661",
  "Intérêts d'emprunt": "661", "Amendes et pénalités fiscales": "67", "Perte due à un sinistre majeur non assuré": "67",
  "Production vendue": "701", "Prestations de services": "706", "Ventes de marchandises": "707",
  "Produits des cessions d'immobilisations": "757", "Produits des cessions d'immobilisations corporelles": "757", "Intérêts reçus": "76",
  "Stock de matières premières (31.12)": "31", "Stock de produits finis (31.12)": "355", "Stock de marchandises (31.12)": "37",
};
// Stock (bilan) et variation (compte de résultat) selon la nature du stock
const NUM_STOCKS = { "matières premières": ["31", "6031"], "produits finis": ["355", "713"], "marchandises": ["37", "6037"] };
const avecNum = (lib) => (NUM_POSTES[lib] ? `${NUM_POSTES[lib]} ${lib}` : lib);

export function atelierListe(cas, donnees, copie, suivi) {
  const refs = new Map();
  donnees.replaceChildren(
    tableau(`Stocks — ${cas.nom}, en ${cas.unite}`, ["SI (01.01)", "SF (31.12)", "Variation"],
      cas.stocks.map((s) => ({ cells: [`Stock de ${s.nom}`, s.si, s.sf, "à calculer"], ref: s, num: NUM_STOCKS[s.nom]?.join(" / ") })), null, refs),
    tableau(`Données au 31.12.N, en ${cas.unite}`, ["Montant"], cas.postes.map((p) => ({ cells: [p[0], p[1]], ref: p, num: NUM_POSTES[p[0]] })), cas.note, refs),
  );
  const t = totauxListe(cas);
  const P = new Phases(copie, suivi);

  P.ajouter("① Les variations de stocks", "Achats (marchandises, MP) : SI − SF, en charges. Produits finis : SF − SI (production stockée), en produits.", (sec, fini) => {
    // Une fois calculées, les variations apparaissent dans le document (on les classe à l'étape suivante)
    const montrer = () => { for (const s of cas.stocks) refs.get(s).cells[3].textContent = fmt(variation(s)); fini(); };
    sec.append(grilleCalcul({ colonnes: [cas.unite], suivi, nom: "Variations de stocks", quandFini: montrer,
      lignes: cas.stocks.map((s) => ({ libelle: s.sens === "achat" ? `Variation de stock de ${s.nom} (SI − SF)` : "Production stockée (SF − SI)",
        attendu: variation(s), aide: s.sens === "achat" ? `${fmt(s.si)} − ${fmt(s.sf)}` : `${fmt(s.sf)} − ${fmt(s.si)}` })) }));
  });

  P.ajouter("② Classer chaque information", "Clique chaque ligne des données (à gauche), variations de stocks comprises, puis son bloc : bilan (AI, AC, CP, D) ou compte de résultat (charges / produits d'exploitation, financiers, exceptionnels).", (sec, fini) => {
    const plan = el("div", "bilan-fonctionnel");
    const bilan = el("div", "colonne-bf"), cr = el("div", "colonne-bf");
    bilan.append(el("p", "groupe-titre", "BILAN"));
    cr.append(el("p", "groupe-titre", "COMPTE DE RÉSULTAT"));
    plan.append(bilan, cr);
    const zones = CODES.map((id) => ({ id, titre: `${id} — ${NOMS_CODES[id]}`, court: id, conteneur: ["AI", "AC", "CP", "D"].includes(id) ? bilan : cr }));
    const jetons = [
      ...cas.postes.map((p) => ({ texte: avecNum(p[0]), montant: p[1], cible: p[2], aide: AIDE_CODES[p[2]], ancre: refs.get(p) })),
      ...cas.stocks.map((s) => ({ texte: `${NUM_STOCKS[s.nom][1]} ${s.sens === "achat" ? `Variation de stock de ${s.nom}` : "Production stockée"}`, montant: variation(s),
        cible: s.sens === "achat" ? "CE" : "PE", aide: "la variation va au compte de résultat ; le stock final, au bilan.", ancre: refs.get(s) })),
    ];
    const p = placement({ jetons, zones, suivi, nom: "Classement", quandFini: fini });
    p.insertBefore(plan, p.querySelector(".actions-atelier"));
    sec.append(p);
  });

  P.ajouter("③ Le compte de résultat et le bilan", "Le résultat du CR va dans les capitaux propres et équilibre le bilan.", (sec, fini) => {
    sec.append(grilleCalcul({ colonnes: [cas.unite], suivi, nom: "Totaux", quandFini: fini, lignes: [
      { titre: "Compte de résultat" },
      { libelle: "Charges d'exploitation", attendu: t.CE, aide: "avec les variations de stocks (SI − SF)" },
      { libelle: "Charges financières", attendu: t.CF }, { libelle: "Charges exceptionnelles", attendu: t.CEx },
      { libelle: "Total des charges", attendu: t.charges, total: true },
      { libelle: "Produits d'exploitation", attendu: t.PE, aide: "avec la production stockée (SF − SI)" },
      { libelle: "Produits financiers", attendu: t.PF }, { libelle: "Produits exceptionnels", attendu: t.PEx },
      { libelle: "Total des produits", attendu: t.produits, total: true },
      { libelle: "Résultat (bénéfice +, perte −)", attendu: t.resultat, total: true, aide: "produits − charges" },
      { titre: "Bilan" },
      { libelle: "Actif immobilisé", attendu: t.AI }, { libelle: "Actif circulant", attendu: t.AC },
      { libelle: "Total actif", attendu: t.actif, total: true },
      { libelle: "Capitaux propres (résultat compris)", attendu: t.CPtot, aide: "capital + résultat" },
      { libelle: "Dettes", attendu: t.D },
      { libelle: "Total passif", attendu: t.passif, total: true, aide: "égal au total actif" },
    ] }));
  });
  P.lancer();
}

export { COMPTES };
