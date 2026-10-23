// Page d'une matière : on choisit entre ses chapitres de cours et ses entraînements

import { chargerMatieres } from "./moteur.js";

const $ = (sel) => document.querySelector(sel);

// Mêmes familles que l'écran de réglages du quiz (jouer.js)
const GENRES = { ds: "Sujets complets type DS", cours: "Questions de cours", exercices: "Exercices type DS" };

function carte(href, surtitre, titre, etat) {
  const el = document.createElement("a");
  el.className = "matiere";
  el.href = href;
  const haut = document.createElement("p");
  haut.className = "discret";
  haut.textContent = surtitre;
  const nom = document.createElement("h3");
  nom.textContent = titre;
  el.append(haut, nom);
  if (etat) {
    const bas = document.createElement("p");
    bas.className = "etat";
    bas.textContent = etat;
    el.append(bas);
  }
  return el;
}

function joursAvant(dateIso) {
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  return Math.round((new Date(dateIso) - aujourdhui) / 86400000);
}

function dessinerCours(m) {
  const cours = m.cours ?? [];
  $("#bloc-cours").hidden = cours.length === 0;
  $("#liste-cours").replaceChildren(...cours.map((ch) => {
    // « Chapitre 1 — Signaux et systèmes » → surtitre « Chapitre 1 », titre « Signaux et systèmes »
    const [numero, titre] = ch.nom.includes(" — ") ? ch.nom.split(" — ", 2) : ["Cours", ch.nom];
    const href = `cours.html?matiere=${encodeURIComponent(m.id)}&chapitre=${encodeURIComponent(ch.id)}`;
    if (!ch.resume) return carte(href, numero, titre, "Lire le cours");
    // Deux liens dans la carte : le cours complet et son résumé
    const el = carte(href, numero, titre);
    const div = document.createElement("div");
    div.className = el.className + " double";
    div.append(...el.childNodes);
    const liens = document.createElement("p");
    liens.className = "etat liens-carte";
    for (const [lien, texte] of [[href, "Cours"], [`${href}&vue=resume`, "Résumé"]]) {
      const a = document.createElement("a");
      a.href = lien;
      a.textContent = texte;
      liens.append(a);
    }
    div.append(liens);
    return div;
  }));
}

function dessinerExercices(m) {
  const cartes = [];
  const nb = (chapitres) => chapitres.reduce((n, ch) => n + ch.questions, 0);
  const quiz = `jouer.html?matiere=${encodeURIComponent(m.id)}`;

  if (m.page) {
    cartes.push(carte(m.page, "Entraînement", m.nom, m.etat));
    // La page dédiée remplace les exercices ; les questions de cours restent en quiz
    const cours = m.chapitres.filter((ch) => (ch.genre ?? "cours") === "cours");
    if (cours.length) cartes.push(carte(`${quiz}&genre=cours`, "Quiz", GENRES.cours, `${nb(cours)} questions`));
  } else {
    for (const [genre, titre] of Object.entries(GENRES)) {
      const chapitres = m.chapitres.filter((ch) => (ch.genre ?? "cours") === genre);
      if (chapitres.length === 0) continue;
      const s = chapitres.length > 1 ? "s" : "";
      cartes.push(carte(`${quiz}&genre=${genre}`, `${chapitres.length} chapitre${s}`, titre, `${nb(chapitres)} questions`));
    }
    if (cartes.length > 1) cartes.push(carte(quiz, "Tout", "Tout mélanger", `${nb(m.chapitres)} questions`));
  }

  $("#bloc-exercices").hidden = false;
  if (cartes.length === 0) {
    const vide = document.createElement("p");
    vide.className = "discret";
    vide.textContent = "Pas encore d'exercices pour cette matière.";
    $("#liste-exercices").replaceChildren(vide);
  } else {
    $("#liste-exercices").replaceChildren(...cartes);
  }
}

const id = new URLSearchParams(location.search).get("matiere");
chargerMatieres().then((donnees) => {
  const m = donnees.matieres.find((x) => x.id === id);
  if (!m) {
    $("#titre-matiere").textContent = "Matière introuvable";
    return;
  }
  document.title = `${m.nom} — Révisions FIGIM`;
  $("#titre-matiere").textContent = m.nom;
  const j = m.ds ? joursAvant(m.ds) : -1;
  $("#sous-titre").textContent = m.prof + (j > 0 ? ` · DS dans ${j} jour${j > 1 ? "s" : ""}` : j === 0 ? " · DS aujourd'hui !" : "");
  dessinerCours(m);
  dessinerExercices(m);
});
