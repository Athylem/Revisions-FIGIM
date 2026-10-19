// Session d'entraînement : réglages → questions une par une → bilan

import { chargerMatieres, chargerQuestions, melanger, points } from "./moteur.js";
import { ecrire } from "./texte.js";
import * as qcm from "./types/qcm.js";
import * as vraiFaux from "./types/vrai-faux.js";
import * as texteATrous from "./types/texte-a-trous.js";
import * as numerique from "./types/numerique.js";
import * as carte from "./types/carte.js";
import * as probleme from "./types/probleme.js";

const TYPES = {
  "qcm": qcm, "vrai-faux": vraiFaux, "texte-a-trous": texteATrous,
  "numerique": numerique, "carte": carte, "probleme": probleme,
};
const ETOILES = { 1: "★☆☆", 2: "★★☆", 3: "★★★" };

const $ = (sel) => document.querySelector(sel);

let matiere = null;
let nombre = 10;
let session = [];   // questions de la session en cours
let position = 0;
let score = 0;
let serie = 0;
let erreurs = [];

function montrer(ecran) {
  for (const id of ["ecran-reglages", "ecran-question", "ecran-fin"]) $(`#${id}`).hidden = id !== ecran;
  window.scrollTo(0, 0);
}

// Chapitres regroupés : questions de cours d'abord, exercices type DS ensuite
const GENRES = { cours: "Questions de cours", exercices: "Exercices type DS" };

function afficherReglages() {
  const blocs = [];
  for (const [genre, titre] of Object.entries(GENRES)) {
    const chapitres = matiere.chapitres.filter((ch) => (ch.genre ?? "cours") === genre);
    if (chapitres.length === 0) continue;
    const h = document.createElement("h3");
    h.textContent = titre;
    blocs.push(h, ...casesChapitres(chapitres));
  }
  $("#liste-chapitres").replaceChildren(...blocs);
  montrer("ecran-reglages");
}

function casesChapitres(chapitres) {
  return chapitres.map((ch) => {
    const label = document.createElement("label");
    const box = document.createElement("input");
    box.type = "checkbox";
    box.checked = true;
    box.value = ch.id;
    label.append(box, ` ${ch.nom} `);
    const n = document.createElement("span");
    n.className = "discret";
    n.textContent = `(${ch.questions})`;
    label.append(n);
    return label;
  });
}

async function commencer(questions) {
  session = questions;
  position = 0;
  score = 0;
  serie = 0;
  erreurs = [];
  montrer("ecran-question");
  afficherQuestion();
}

function afficherQuestion() {
  const q = session[position];
  $("#progression").textContent = `Question ${position + 1} / ${session.length}`;
  $("#score-en-cours").textContent = `${score} pts`;
  $("#remplissage").style.width = `${(position / session.length) * 100}%`;
  $("#chapitre-question").textContent = q.chapitre;
  $("#difficulte").textContent = ETOILES[q.difficulte];
  $("#consigne").hidden = !q.consigne;
  ecrire($("#consigne"), q.consigne ?? "");
  ecrire($("#enonce"), q.enonce);
  $("#retour").hidden = true;

  const zone = $("#zone-reponse");
  zone.replaceChildren();
  TYPES[q.type].afficher(q, zone, (correct) => corriger(q, correct));
}

// resultat : true/false, ou une note entre 0 et 1 (problème en étapes, carte « à moitié »)
function corriger(q, resultat) {
  const note = Number(resultat);
  const gagne = Math.round(points(q, serie) * note);
  score += gagne;
  if (note === 1) {
    serie++;
    $("#verdict").textContent = `Bonne réponse ! +${gagne} pts${serie >= 3 ? ` · série de ${serie} 🔥` : ""}`;
  } else {
    serie = 0;
    erreurs.push(q);
    $("#verdict").textContent = note > 0 ? `En partie (${Math.round(note * 100)} %) · +${gagne} pts` : "Raté";
  }
  $("#verdict").className = "verdict " + (note === 1 ? "ok" : note > 0 ? "moyen" : "ko");
  $("#score-en-cours").textContent = `${score} pts`;
  $("#explication").hidden = !q.explication;
  ecrire($("#explication"), q.explication ?? "");
  $("#retour").hidden = false;
  $("#suivante").textContent = position + 1 < session.length ? "Suivante" : "Voir le bilan";
  $("#suivante").focus();
}

function suivante() {
  position++;
  if (position < session.length) afficherQuestion();
  else afficherFin();
}

function texteSolution(q) {
  switch (q.type) {
    case "qcm": return q.choix[q.reponse];
    case "texte-a-trous": return q.reponse[0];
    case "numerique": return numerique.formater(q);
    case "carte": return q.reponse;
    case "probleme": return probleme.solution(q, texteSolution);
    default: return q.reponse ? "Vrai" : "Faux";
  }
}

function afficherFin() {
  const bonnes = session.length - erreurs.length;
  $("#score-final").textContent = `${score} pts`;
  $("#bilan").textContent = `${bonnes} bonne${bonnes > 1 ? "s" : ""} réponse${bonnes > 1 ? "s" : ""} sur ${session.length}`;
  $("#revoir-erreurs").hidden = erreurs.length === 0;
  $("#bloc-erreurs").hidden = erreurs.length === 0;

  $("#liste-erreurs").replaceChildren(...erreurs.map((q) => {
    const carte = document.createElement("div");
    carte.className = "carte erreur";
    const enonce = document.createElement("p");
    enonce.className = "enonce";
    ecrire(enonce, q.enonce);
    const solution = document.createElement("p");
    solution.className = "solution";
    ecrire(solution, "**Réponse :** " + texteSolution(q));
    const explication = document.createElement("p");
    explication.className = "discret";
    ecrire(explication, q.explication);
    carte.append(enonce, solution, explication);
    return carte;
  }));
  montrer("ecran-fin");
}

async function lancerDepuisReglages() {
  const choisis = [...document.querySelectorAll("#liste-chapitres input:checked")].map((b) => b.value);
  const chapitres = matiere.chapitres.filter((ch) => choisis.includes(ch.id));
  if (chapitres.length === 0) return;
  const questions = melanger(await chargerQuestions(chapitres));
  commencer(nombre ? questions.slice(0, nombre) : questions);
}

$("#commencer").addEventListener("click", lancerDepuisReglages);
$("#suivante").addEventListener("click", suivante);
$("#rejouer").addEventListener("click", afficherReglages);
$("#revoir-erreurs").addEventListener("click", () => commencer(melanger(erreurs)));

document.querySelectorAll("[data-nombre]").forEach((bouton) => {
  bouton.addEventListener("click", () => {
    nombre = Number(bouton.dataset.nombre);
    document.querySelectorAll("[data-nombre]").forEach((b) => b.classList.toggle("actif", b === bouton));
  });
});

const id = new URLSearchParams(location.search).get("matiere");
chargerMatieres().then((donnees) => {
  matiere = donnees.matieres.find((m) => m.id === id);
  if (!matiere || matiere.chapitres.length === 0) {
    $("#titre-matiere").textContent = "Matière introuvable ou sans questions";
    return;
  }
  document.title = `${matiere.nom} — Révisions FIGIM`;
  $("#titre-matiere").textContent = matiere.nom;
  afficherReglages();
});
