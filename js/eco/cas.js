// Cas des ateliers : générés au hasard (chiffres ronds, faisables sans calculatrice, comme au DS)
// ou repris des TD (VELORAMA, PITAIN FLAM, NOÉ, VALIANT, BELLESSENCE, VITAMINES).
// Les montants des TD ont été vérifiés contre les corrigés (outils/gen_af.py).

export function hasard(graine) {
  let a = graine >>> 0;
  const r = () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  r.choix = (liste) => liste[Math.floor(r() * liste.length)];
  r.entre = (min, max, pas = 1) => min + pas * Math.floor(r() * (Math.floor((max - min) / pas) + 1));
  return r;
}

const NOMS = ["BLE", "ORGE", "SEIGLE", "AVOINE", "MAÏS", "ÉPEAUTRE", "SARRASIN", "MILLET", "LIN", "CHANVRE"];

// ===================================================================================
// Compte de résultat
// ===================================================================================
// [compte, libellé, côté] ; côté : P produits d'exploitation, PF, PX, C charges d'exploitation, CF, CX, CI (IS, participation)
export const COMPTES = [
  ["707", "Ventes de marchandises", "P"], ["701", "Production vendue — biens", "P"], ["706", "Production vendue — services", "P"],
  ["713", "Production stockée (SF − SI)", "P"], ["72", "Production immobilisée", "P"], ["74", "Subventions d'exploitation", "P"],
  ["747", "Quote-part des subventions d'investissement virée au résultat", "P"],
  ["781", "Reprises sur amortissements, dépréciations et provisions", "P"], ["75", "Autres produits de gestion courante", "P"],
  ["757", "Produits des cessions d'immobilisations corporelles", "P"],
  ["76", "Produits financiers (intérêts reçus)", "PF"], ["767", "Produits des cessions d'immobilisations financières", "PF"],
  ["786", "Reprises financières sur provisions", "PF"], ["77", "Produits exceptionnels", "PX"],
  ["607", "Achats de marchandises", "C"], ["6037", "Variation des stocks de marchandises (SI − SF)", "C"],
  ["601", "Achats de matières premières", "C"], ["6031", "Variation des stocks de matières premières (SI − SF)", "C"],
  ["61/62", "Autres achats et charges externes", "C"], ["63", "Impôts, taxes et versements assimilés", "C"],
  ["641", "Salaires et traitements", "C"], ["645", "Charges sociales", "C"],
  ["681", "Dotations aux amortissements, dépréciations et provisions", "C"], ["65", "Autres charges de gestion courante", "C"],
  ["657", "Valeurs comptables des immobilisations corporelles cédées", "C"],
  ["66", "Charges d'intérêts", "CF"], ["667", "Valeurs comptables des immobilisations financières cédées", "CF"],
  ["686", "Dotations financières aux provisions", "CF"], ["67", "Charges exceptionnelles", "CX"],
  ["691", "Participation des salariés", "CI"], ["695", "Impôt sur les bénéfices", "CI"],
];

const vide = () => Object.fromEntries(COMPTES.map(([k]) => [k, 0]));

export function soldes(c) {
  const s = {};
  s.CA = c["707"] + c["701"] + c["706"];
  s.cout = c["607"] + c["6037"];
  s.MC = c["707"] - s.cout;
  s.prod = c["701"] + c["706"] + c["713"] + c["72"];
  s.conso = c["601"] + c["6031"] + c["61/62"];
  s.VA = s.MC + s.prod - s.conso;
  s.perso = c["641"] + c["645"];
  s.EBE = s.VA + c["74"] - c["63"] - s.perso;
  s.plus = c["781"] + c["75"] + c["747"] + c["757"];
  s.moins = c["681"] + c["65"] + c["657"];
  s.RE = s.EBE + s.plus - s.moins;
  s.pf = c["76"] + c["786"] + c["767"];
  s.cf = c["66"] + c["686"] + c["667"];
  s.RF = s.pf - s.cf;
  s.RCAI = s.RE + s.RF;
  s.RX = c["77"] - c["67"];
  s.impot = c["691"] + c["695"];
  s.RN = s.RCAI + s.RX - s.impot;
  s.CAF = s.EBE + c["75"] - c["65"] + c["76"] - c["66"] + c["77"] - c["67"] - s.impot;
  s.CAFadd = s.RN + c["681"] + c["686"] - c["781"] - c["786"] + c["657"] + c["667"] - c["757"] - c["767"] - c["747"];
  s.produits = COMPTES.filter(([, , t]) => t.startsWith("P")).reduce((n, [k]) => n + c[k], 0);
  s.charges = COMPTES.filter(([, , t]) => t.startsWith("C")).reduce((n, [k]) => n + c[k], 0);
  return s;
}

// Numéros affichés pour le détail des charges externes (tous rangés comme 61/62)
const NUM_EXTERNES = { "Frais d'énergie": "6061", "Frais de téléphone": "626", "Frais de publicité": "623" };

// Lignes du CR « en liste » (le détail des charges externes remplace la ligne 61/62) ;
// code = compte servant au calcul, num = numéro affiché
export function lignesCR(cas) {
  const lignes = [];
  for (const [code, libelle, cote] of COMPTES) {
    if (code === "61/62" && cas.externes) {
      for (const [lib, v] of cas.externes) lignes.push({ code, num: NUM_EXTERNES[lib] ?? code, libelle: lib, montant: v, cote });
    } else if (cas.c[code] !== 0) {
      lignes.push({ code, num: code, libelle, montant: cas.c[code], cote });
    }
  }
  return lignes;
}

function avec(d) { return { ...vide(), ...d }; }

export const CR_TD = {
  velorama: {
    nom: "VELORAMA (exercice N)", unite: "k€", source: "Cas VELORAMA, corrigé partie 1",
    c: avec({ "707": 1240, "701": 700, "706": 210, "713": 20, "747": 6, "781": 18, "75": 4, "607": 830, "6037": -10, "601": 275, "6031": 8,
      "61/62": 320, "63": 42, "641": 395, "645": 165, "681": 95, "65": 6, "76": 3, "767": 30, "66": 25, "667": 26, "686": 5, "77": 8, "695": 14 }),
  },
  pitain: {
    nom: "PITAIN FLAM (exercice N)", unite: "k€", source: "Cas PITAIN FLAM, corrigé partie 1",
    c: avec({ "707": 180, "701": 1535, "706": 930, "713": -8, "747": 5, "781": 14, "75": 3, "607": 108, "6037": -2, "601": 765, "6031": 5,
      "61/62": 548, "63": 52, "641": 675, "645": 275, "681": 138, "65": 7, "76": 2, "767": 22, "66": 31, "667": 18, "686": 4, "77": 6, "695": 16 }),
  },
  noe: {
    nom: "NOÉ (exercice N)", unite: "€", source: "Cas NOÉ, corrigé",
    c: avec({ "707": 1800000, "701": 3001000, "706": 40000, "713": 16000, "74": 20000, "75": 14000, "607": 1200000, "6037": -120000,
      "601": 1600000, "6031": -50000, "61/62": 224000, "63": 100000, "641": 900000, "645": 400000, "681": 178000, "65": 108000,
      "76": 10000, "66": 20000, "77": 12000, "67": 18000, "691": 4000, "695": 32000 }),
    externes: [["Frais d'énergie", 1000], ["Frais de téléphone", 3000], ["Frais de publicité", 20000], ["Autres achats et charges externes", 200000]],
  },
};

export function genererCR(graine) {
  const r = hasard(graine);
  for (;;) {
    const ca = r.choix([1000, 1200, 1500, 2000]);
    const vm = (r.entre(2, 5) * ca) / 10;
    const pv = ca - vm;
    const serv = r.choix([0, 50, 100]);
    const c = avec({
      "707": vm, "701": pv - serv, "706": serv, "713": r.choix([-20, -10, 0, 10, 20, 30]), "72": r.choix([0, 0, 20]),
      "74": r.choix([0, 10, 20]), "781": r.choix([0, 5, 10]), "75": r.choix([0, 5, 10]),
      "607": Math.floor((vm * r.choix([5, 6, 7])) / 10 / 5) * 5, "6037": r.choix([-10, -5, 5, 10]),
      "601": Math.floor((pv * r.choix([3, 4])) / 10 / 10) * 10, "6031": r.choix([-50, -20, 10, 20]),
      "63": r.choix([20, 25, 30, 40]), "681": r.choix([20, 30, 40, 50]), "65": r.choix([0, 5]),
      "66": r.choix([10, 15, 20]), "76": r.choix([0, 5]), "686": r.choix([0, 0, 5]), "691": r.choix([0, 5]),
      "77": r.choix([0, 0, 5, 10]), "67": r.choix([0, 2, 5]),
    });
    const externes = [["Frais d'énergie", r.choix([40, 60, 80, 100])], ["Frais de téléphone", r.choix([10, 20])],
      ["Frais de publicité", r.choix([30, 50, 80])], ["Autres achats et charges externes", r.choix([40, 50, 70])]];
    c["61/62"] = externes.reduce((n, [, v]) => n + v, 0);
    if (r() < 0.6) { c["757"] = r.choix([10, 15, 20, 30]); c["657"] = r.choix([5, 8, 12, 20, 25]); }
    if (r() < 0.3) { c["767"] = r.choix([10, 20]); c["667"] = r.choix([5, 15]); }
    // Charges de personnel tirées d'un EBE réaliste (8 à 15 % du CA)
    let s = soldes(c);
    const ebe = Math.floor((ca * r.choix([8, 10, 12, 15])) / 100 / 5) * 5;
    const perso = s.VA + c["74"] - c["63"] - ebe;
    c["641"] = Math.floor((perso * 2) / 3 / 10) * 10;
    c["645"] = perso - c["641"];
    if (c["641"] <= 0) continue;
    s = soldes(c);
    const base = s.RCAI + s.RX - c["691"];
    if (base <= 20) continue;
    c["695"] = Math.floor(base / 4 / 5) * 5;
    return { nom: `${r.choix(NOMS)} (cas n° ${graine})`, unite: "k€", c, externes, source: "Cas généré (format du DS 2023-2024, dossier « Cas BLE »)" };
  }
}

// ===================================================================================
// Bilan → bilan fonctionnel
// ===================================================================================
// Blocs du bilan fonctionnel
export const BF = {
  ES: "Emplois stables", ACE: "Actif circulant d'exploitation", ACHE: "Actif circulant hors exploitation", TA: "Trésorerie active",
  RS: "Ressources stables", PCE: "Passif circulant d'exploitation", PCHE: "Passif circulant hors exploitation", TP: "Trésorerie passive",
};

// actif : [libellé, brut, A&D, bloc du brut] ; passif : [libellé, montant, bloc]
export const BILANS_TD = {
  velorama: {
    nom: "VELORAMA (31.12.N)", unite: "k€",
    actif: [["Immobilisations incorporelles", 80, 0, "ES"], ["Immobilisations corporelles", 1000, 455, "ES"], ["Immobilisations financières", 64, 5, "ES"],
      ["Stocks de marchandises", 220, 0, "ACE"], ["Stocks de matières premières", 37, 0, "ACE"], ["Stocks de produits finis", 80, 0, "ACE"],
      ["Clients", 300, 17, "ACE"], ["Autres créances d'exploitation", 34, 0, "ACE"], ["Créances diverses (hors exploitation)", 6, 0, "ACHE"],
      ["Disponibilités", 107, 0, "TA"], ["Charges constatées d'avance", 9, 0, "ACE"]],
    passif: [["Capital", 300, "RS"], ["Réserve légale", 21, "RS"], ["Autres réserves", 95, "RS"], ["Report à nouveau", 5, "RS"],
      ["Résultat de l'exercice", 43, "RS"], ["Subventions d'investissement", 30, "RS"], ["Provisions pour risques et charges", 25, "RS"],
      ["Emprunts bancaires", 500, "RS"], ["Concours bancaires courants", 40, "TP"], ["Fournisseurs", 255, "PCE"],
      ["Dettes fiscales et sociales", 120, "PCE"], ["Dettes sur immobilisations", 20, "PCHE"], ["Autres dettes (impôt sur les bénéfices)", 6, "PCHE"]],
    ca: 2150,
  },
  pitain: {
    nom: "PITAIN FLAM (31.12.N)", unite: "k€",
    actif: [["Immobilisations incorporelles", 160, 0, "ES"], ["Immobilisations corporelles", 1560, 812, "ES"], ["Immobilisations financières", 52, 4, "ES"],
      ["Stocks de marchandises", 32, 0, "ACE"], ["Stocks de matières premières", 50, 0, "ACE"], ["Stocks de produits finis", 40, 0, "ACE"],
      ["Clients", 310, 10, "ACE"], ["Autres créances d'exploitation", 44, 0, "ACE"], ["Créances diverses (hors exploitation)", 8, 0, "ACHE"],
      ["Disponibilités", 191, 0, "TA"], ["Charges constatées d'avance", 12, 0, "ACE"]],
    passif: [["Capital", 400, "RS"], ["Réserve légale", 32, "RS"], ["Autres réserves", 40, "RS"], ["Report à nouveau", 9, "RS"],
      ["Résultat de l'exercice", 49, "RS"], ["Subventions d'investissement", 35, "RS"], ["Provisions pour risques et charges", 30, "RS"],
      ["Emprunts bancaires", 550, "RS"], ["Concours bancaires courants", 45, "TP"], ["Fournisseurs", 238, "PCE"],
      ["Dettes fiscales et sociales", 172, "PCE"], ["Dettes sur immobilisations", 25, "PCHE"], ["Autres dettes (impôt sur les bénéfices)", 8, "PCHE"]],
    ca: 2645,
  },
  noe: {
    nom: "NOÉ (31.12.N)", unite: "€",
    actif: [["Marques", 500000, 0, "ES"], ["Terrains", 600000, 0, "ES"], ["Matériel de production", 500000, 175000, "ES"],
      ["Immobilisations financières", 307000, 0, "ES"], ["Stock de marchandises", 220000, 0, "ACE"], ["Stock de matières premières", 80000, 0, "ACE"],
      ["Stock de produits finis", 40000, 0, "ACE"], ["Créances clients normales TTC", 180000, 0, "ACE"], ["Créances clients douteuses HT", 15000, 3000, "ACE"],
      ["Banque (disponibilités)", 252000, 0, "TA"]],
    passif: [["Capital social", 1000000, "RS"], ["Réserves", 42000, "RS"], ["Report à nouveau", 8000, "RS"], ["Résultat net", 299000, "RS"],
      ["Emprunt bancaire — part à plus d'un an", 600000, "RS"], ["Emprunt bancaire — part à moins d'un an", 200000, "TP"],
      ["Dettes fournisseurs", 345000, "PCE"], ["Dettes envers les organismes sociaux", 12000, "PCE"], ["Dettes fiscales", 10000, "PCE"]],
    ca: 4841000, note: "Dans le corrigé NOÉ, la part de l'emprunt à moins d'un an est classée en trésorerie passive.",
  },
};

export function genererBilan(graine) {
  const r = hasard(graine);
  for (;;) {
    const incorp = r.choix([0, 50, 100]);
    const corp = r.entre(400, 900, 100);
    const amort = (r.entre(2, 5) * corp) / 10;
    const fin = r.choix([0, 20, 50]);
    const st = r.entre(60, 180, 20);
    const cli = r.entre(100, 280, 20);
    const dep = r.choix([0, 10, 20]);
    const autres = r.choix([0, 10, 20]);
    const div = r.choix([0, 5, 10]);
    const dispo = r.choix([10, 20, 40, 80, 150]);
    const passif = [["Capital", r.choix([200, 300, 400]), "RS"], ["Réserves", r.choix([20, 50, 80]), "RS"],
      ["Résultat de l'exercice", r.choix([20, 30, 40, 50]), "RS"], ["Provisions pour risques et charges", r.choix([0, 10, 20]), "RS"],
      ["Fournisseurs", r.entre(80, 200, 20), "PCE"], ["Dettes fiscales et sociales", r.choix([30, 40, 60]), "PCE"],
      ["Dettes sur immobilisations", r.choix([0, 0, 10, 20]), "PCHE"], ["Concours bancaires courants", r.choix([0, 0, 20, 50, 100, 200]), "TP"]];
    const actif = [["Immobilisations incorporelles", incorp, 0, "ES"], ["Immobilisations corporelles", corp, amort, "ES"],
      ["Immobilisations financières", fin, 0, "ES"], ["Stocks", st, 0, "ACE"], ["Clients", cli, dep, "ACE"],
      ["Autres créances d'exploitation", autres, 0, "ACE"], ["Créances diverses (hors exploitation)", div, 0, "ACHE"], ["Disponibilités", dispo, 0, "TA"]];
    const net = actif.reduce((n, [, b, a]) => n + b - a, 0);
    const emprunt = net - passif.reduce((n, [, m]) => n + m, 0);
    if (emprunt < 50 || emprunt % 10) continue;
    passif.splice(4, 0, ["Emprunts bancaires (> 1 an)", emprunt, "RS"]);
    return { nom: `${r.choix(NOMS)} (cas n° ${graine})`, unite: "k€", actif: actif.filter((l) => l[1]), passif: passif.filter((l) => l[1]), ca: null };
  }
}

export function agregats(b) {
  const t = Object.fromEntries(Object.keys(BF).map((k) => [k, 0]));
  for (const [, brut, ad, bloc] of b.actif) { t[bloc] += brut; t.RS += ad; }
  for (const [, m, bloc] of b.passif) t[bloc] += m;
  const g = { ...t };
  g.emplois = t.ES + t.ACE + t.ACHE + t.TA;
  g.ressources = t.RS + t.PCE + t.PCHE + t.TP;
  g.FRNG = t.RS - t.ES;
  g.BFRE = t.ACE - t.PCE;
  g.BFRHE = t.ACHE - t.PCHE;
  g.BFR = g.BFRE + g.BFRHE;
  g.TN = t.TA - t.TP;
  return g;
}

// ===================================================================================
// Amortissement et cession
// ===================================================================================
// Jours de la mise en service au 31.12 (mois de 30 jours) : 15.03 → 285 ; 01.04 → 270
export const joursFin = (jour, mois) => (jour === 15 ? (12 - mois) * 30 + 15 : (13 - mois) * 30);

export const AMORT_TD = {
  valiant: { nom: "VALIANT", vb: 100000, n: 4, jour: 15, mois: 8, cesMois: 4, cesAn: 3, prix: 25000,
    note: "Acquis le 07.08.N, mis en service le 15.08.N (c'est la mise en service qui compte)." },
};

export function genererAmort(graine) {
  const r = hasard(graine);
  const annuite = r.choix([2400, 4800, 6000, 7200, 9600, 12000, 24000]);
  const n = r.choix([4, 5, 8, 10]);
  const vb = annuite * n;
  return { nom: `${r.choix(NOMS)} (cas n° ${graine})`, vb, n, jour: r.choix([1, 15]), mois: r.entre(2, 11),
    cesMois: r.entre(2, 11), cesAn: r.entre(2, Math.min(n, 5) - 1), prix: (r.entre(2, 8) * vb) / 10 };
}

export function planAmort(a) {
  const annuite = a.vb / a.n;
  const j1 = joursFin(a.jour, a.mois);
  const jc = (a.cesMois - 1) * 30;
  const lignes = [];
  let cumul = 0;
  for (let k = 0; k <= a.cesAn; k++) {
    const jours = k === 0 ? j1 : k === a.cesAn ? jc : 360;
    const dot = (annuite * jours) / 360;
    cumul += dot;
    lignes.push({ annee: k === 0 ? "N" : `N+${k}`, jours, dot, cumul, vnc: a.vb - cumul });
  }
  const vnc = a.vb - cumul;
  return { annuite, taux: 100 / a.n, j1, jc, lignes, cumul, vnc, resultat: a.prix - vnc, tva: a.prix / 5, dc: lignes.at(-1).dot };
}

// ===================================================================================
// Bilan et compte de résultat à partir d'une liste (BELLESSENCE, VITAMINES)
// ===================================================================================
export const CODES = ["AI", "AC", "CP", "D", "CE", "CF", "CEx", "PE", "PF", "PEx"];

// postes : [libellé, montant, code] ; stocks : [{nom, si, sf, sens: "achat" | "production"}]
export const LISTES_TD = {
  bellessence: {
    nom: "BELLESSENCE", unite: "€", note: "Entreprise industrielle, pas de marchandises.",
    stocks: [{ nom: "matières premières", si: 0, sf: 14000, sens: "achat" }, { nom: "produits finis", si: 0, sf: 3000, sens: "production" }],
    postes: [["Matériel de manutention", 12000, "AI"], ["Brevet", 30000, "AI"], ["Clients", 2500, "AC"], ["Charges sociales", 22000, "CE"],
      ["Fournisseurs de biens et services", 4000, "D"], ["Autres achats et charges externes", 13000, "CE"], ["Terrain", 80000, "AI"],
      ["Impôts et taxes", 5000, "CE"], ["Matériel informatique", 10000, "AI"], ["Mobilier", 6000, "AI"], ["Emprunt auprès des établissements de crédit", 150000, "D"],
      ["Créances sur l'État", 1500, "AC"], ["Dettes envers le personnel", 3000, "D"], ["Caisse", 500, "AC"], ["Achats de matières premières", 75000, "CE"],
      ["Fournisseurs d'immobilisations", 8000, "D"], ["Capital social", 220000, "CP"], ["Dettes fiscales", 2500, "D"], ["Production vendue", 200000, "PE"],
      ["Prestations de services", 4000, "PE"], ["Constructions", 165000, "AI"], ["Marque", 20000, "AI"], ["Services extérieurs", 22000, "CE"],
      ["Matériel de transport", 42000, "AI"], ["Salaires", 50000, "CE"], ["Intérêts versés sur l'emprunt", 1500, "CF"], ["Banque", 13500, "AC"],
      ["Matériel de conditionnement", 20000, "AI"], ["Stock de matières premières (31.12)", 14000, "AC"], ["Stock de produits finis (31.12)", 3000, "AC"]],
  },
  vitamines: {
    nom: "VITAMINES", unite: "€", note: "Deux banques : Société Générale (solde positif) et BNP (découvert). PCG 2025.",
    stocks: [{ nom: "marchandises", si: 1000, sf: 400, sens: "achat" }, { nom: "matières premières", si: 2000, sf: 2500, sens: "achat" },
      { nom: "produits finis", si: 3000, sf: 2800, sens: "production" }],
    postes: [["Marque", 25000, "AI"], ["Créances État", 3000, "AC"], ["Intérêts versés sur l'emprunt", 1800, "CF"], ["Fonds de commerce", 30000, "AI"],
      ["Amendes et pénalités fiscales", 1200, "CEx"], ["Fournisseurs d'immobilisations", 5000, "D"],
      ["Valeurs comptables des immobilisations cédées", 2000, "CE"], ["Services extérieurs", 4000, "CE"], ["Constructions", 400000, "AI"],
      ["Salaires", 85000, "CE"], ["Mobilier (brut)", 2200, "AI"], ["Fournisseurs", 4500, "D"], ["Clients", 13000, "AC"], ["Banque (Société Générale)", 4300, "AC"],
      ["Concours bancaires courants (BNP)", 2000, "D"], ["Dettes fiscales", 2700, "D"], ["Capital social", 500000, "CP"], ["Dettes personnel", 2000, "D"],
      ["Emprunts auprès des établissements de crédit", 300000, "D"], ["Achats de marchandises", 50000, "CE"],
      ["Produits des cessions d'immobilisations", 3000, "PE"], ["Prestations de services", 45000, "PE"], ["Achats de matières premières", 140000, "CE"],
      ["Matériel de production (brut)", 130000, "AI"], ["Autres achats et charges externes", 3500, "CE"], ["Terrain", 150000, "AI"],
      ["Impôts et taxes", 1900, "CE"], ["Amortissements (à déduire de l'actif immobilisé)", -33000, "AI"], ["Matériel informatique (brut)", 14000, "AI"],
      ["Charges sociales", 40000, "CE"], ["Ventes de marchandises", 110000, "PE"], ["Caisse", 300, "AC"], ["Matériel de transport (brut)", 70000, "AI"],
      ["Dotations aux amortissements", 15000, "CE"], ["Production vendue", 185000, "PE"], ["Stock de marchandises (31.12)", 400, "AC"],
      ["Stock de matières premières (31.12)", 2500, "AC"], ["Stock de produits finis (31.12)", 2800, "AC"]],
  },
};

export function genererListe(graine) {
  const r = hasard(graine);
  for (;;) {
    const sf = r.choix([10, 15, 20]);
    const stocks = [{ nom: "matières premières", si: r.choix([5, 10, 20, 25]), sf, sens: "achat" }];
    const postes = [["Terrain", r.choix([50, 80, 100]), "AI"], ["Constructions", r.choix([100, 150, 200]), "AI"],
      ["Matériel industriel", r.choix([40, 60, 80]), "AI"], ["Brevet", r.choix([10, 20, 30]), "AI"],
      ["Clients", r.choix([10, 20, 30]), "AC"], ["Banque", r.choix([5, 10, 25]), "AC"],
      ["Emprunt auprès des établissements de crédit", r.choix([100, 120, 150]), "D"], ["Fournisseurs", r.choix([10, 15, 20]), "D"],
      ["Dettes fiscales et sociales", r.choix([5, 10]), "D"], ["Achats de matières premières", r.choix([60, 80, 100]), "CE"],
      ["Salaires et charges sociales", r.choix([40, 50, 60]), "CE"], ["Autres achats et charges externes", r.choix([10, 20]), "CE"],
      ["Dotations aux amortissements", r.choix([10, 15, 20]), "CE"], ["Intérêts d'emprunt", r.choix([2, 5]), "CF"],
      ["Production vendue", r.choix([200, 250, 300]), "PE"], ["Intérêts reçus", r.choix([0, 2]), "PF"]];
    if (r() < 0.5) postes.push(["Produits des cessions d'immobilisations corporelles", 10, "PE"], ["Valeurs comptables des immobilisations cédées", 6, "CE"]);
    if (r() < 0.4) postes.push(["Perte due à un sinistre majeur non assuré", 5, "CEx"]);
    const liste = { nom: `${r.choix(NOMS)} (cas n° ${graine})`, unite: "k€", stocks, postes: postes.filter((p) => p[1]) };
    liste.postes.push(["Stock de matières premières (31.12)", sf, "AC"]);
    const t = totauxListe({ ...liste, postes: [...liste.postes, ["Capital social", 0, "CP"]] });
    const capital = t.actif - t.resultat - t.D;
    if (capital > 0 && capital % 10 === 0 && t.resultat !== 0) {
      liste.postes.push(["Capital social", capital, "CP"]);
      return liste;
    }
  }
}

export function variation(s) { return s.sens === "achat" ? s.si - s.sf : s.sf - s.si; }

export function totauxListe(l) {
  const t = Object.fromEntries(CODES.map((c) => [c, 0]));
  for (const [, m, c] of l.postes) t[c] += m;
  for (const s of l.stocks) t[s.sens === "achat" ? "CE" : "PE"] += variation(s);
  t.charges = t.CE + t.CF + t.CEx;
  t.produits = t.PE + t.PF + t.PEx;
  t.resultat = t.produits - t.charges;
  t.actif = t.AI + t.AC;
  t.CPtot = t.CP + t.resultat;
  t.passif = t.CPtot + t.D;
  return t;
}
