// Session d'entraînement : réglages → questions une par une → bilan

import { chargerMatieres, chargerQuestions, melanger, points } from "./moteur.js";
import { ecrire } from "./texte.js";
import * as qcm from "./types/qcm.js";
import * as vraiFaux from "./types/vrai-faux.js";

const TYPES = { "qcm": qcm, "vrai-faux": vraiFaux };
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

function afficherReglages() {
  const cases = matiere.chapitres.map((ch) => {
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
  $("#liste-chapitres").replaceChildren(...cases);
  montrer("ecran-reglages");
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
  ecrire($("#enonce"), q.enonce);
  $("#retour").hidden = true;

  const zone = $("#zone-reponse");
  zone.replaceChildren();
  TYPES[q.type].afficher(q, zone, (correct) => corriger(q, correct));
}

function corriger(q, correct) {
  if (correct) {
    const gagne = points(q, serie);
    score += gagne;
    serie++;
    $("#verdict").textContent = `Bonne réponse ! +${gagne} pts${serie >= 3 ? ` · série de ${serie} 🔥` : ""}`;
  } else {
    serie = 0;
    erreurs.push(q);
    $("#verdict").textContent = "Raté";
  }
  $("#verdict").className = "verdict " + (correct ? "ok" : "ko");
  $("#score-en-cours").textContent = `${score} pts`;
  ecrire($("#explication"), q.explication);
  $("#retour").hidden = false;
  $("#suivante").textContent = position + 1 < session.length ? "Suivante" : "Voir le bilan";
  $("#suivante").focus();
}

function suivante() {
  position++;
  if (position < session.length) afficherQuestion();
  else afficherFin();
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
    ecrire(solution, "**Réponse :** " + (q.type === "qcm" ? q.choix[q.reponse] : q.reponse ? "Vrai" : "Faux"));
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
