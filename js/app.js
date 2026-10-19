// Accueil : pseudo + liste des matières lue depuis contenu/matieres.json

const CLE_PSEUDO = "figim.pseudo";

// localStorage peut être indisponible (navigation privée, stockage bloqué)
function lirePseudo() {
  try { return localStorage.getItem(CLE_PSEUDO); } catch { return null; }
}
function ecrirePseudo(nom) {
  try { localStorage.setItem(CLE_PSEUDO, nom); } catch { /* tant pis, on le redemandera */ }
}

const $ = (sel) => document.querySelector(sel);

let pseudo = lirePseudo();
let donnees = null;
let filtre = "toutes";

function nbQuestions(matiere) {
  return matiere.chapitres.reduce((n, ch) => n + (ch.questions ?? 0), 0);
}

function joursAvant(dateIso) {
  const aujourdhui = new Date();
  aujourdhui.setHours(0, 0, 0, 0);
  return Math.round((new Date(dateIso) - aujourdhui) / 86400000);
}

function afficherPseudo() {
  $("#ecran-pseudo").hidden = false;
  $("#ecran-accueil").hidden = true;
  $("#joueur").hidden = true;
  $("#champ-pseudo").value = pseudo ?? "";
  $("#champ-pseudo").focus();
}

function afficherAccueil() {
  $("#ecran-pseudo").hidden = true;
  $("#ecran-accueil").hidden = false;
  $("#joueur").hidden = false;
  $("#joueur").textContent = pseudo;
  $("#joueur").title = "Changer de pseudo";
  $("#bonjour").textContent = `Salut ${pseudo} 👋`;
  if (donnees) dessinerMatieres();
}

function dessinerDS() {
  const avenir = donnees.matieres
    .filter((m) => m.ds && joursAvant(m.ds) >= 0)
    .sort((a, b) => a.ds.localeCompare(b.ds))
    .slice(0, 3);
  $("#prochains-ds").hidden = avenir.length === 0;
  $("#liste-ds").replaceChildren(...avenir.map((m) => {
    const li = document.createElement("li");
    const j = joursAvant(m.ds);
    li.innerHTML = `<strong></strong> <span class="discret"></span>`;
    li.querySelector("strong").textContent = m.nom;
    li.querySelector("span").textContent = j === 0 ? "aujourd'hui !" : `dans ${j} jour${j > 1 ? "s" : ""}`;
    return li;
  }));
}

function carteMatiere(m) {
  const n = nbQuestions(m);
  const el = document.createElement(n > 0 ? "a" : "div");
  el.className = "matiere" + (n > 0 ? "" : " verrouillee");
  if (n > 0) el.href = `jouer.html?matiere=${encodeURIComponent(m.id)}`;

  const nom = document.createElement("h3");
  nom.textContent = m.nom;
  const prof = document.createElement("p");
  prof.className = "discret";
  prof.textContent = m.prof;
  const etat = document.createElement("p");
  etat.className = "etat";
  etat.textContent = n > 0 ? `${n} questions` : m.notes ? "Questions en préparation" : "Bientôt";

  el.append(nom, prof, etat);
  return el;
}

function dessinerMatieres() {
  $("#annee").textContent = donnees.annee;
  dessinerDS();

  const visibles = donnees.matieres.filter((m) => filtre === "toutes" || nbQuestions(m) > 0);
  const groupes = Map.groupBy(visibles, (m) => m.groupe);

  const conteneur = $("#matieres");
  conteneur.replaceChildren();
  if (visibles.length === 0) {
    const vide = document.createElement("p");
    vide.className = "discret";
    vide.textContent = "Aucune matière jouable pour l'instant — les premières questions arrivent bientôt.";
    conteneur.append(vide);
    return;
  }
  for (const [groupe, matieres] of groupes) {
    const titre = document.createElement("h2");
    titre.textContent = groupe;
    const grille = document.createElement("div");
    grille.className = "grille";
    grille.append(...matieres.map(carteMatiere));
    conteneur.append(titre, grille);
  }
}

$("#form-pseudo").addEventListener("submit", (e) => {
  e.preventDefault();
  const nom = $("#champ-pseudo").value.trim();
  if (!nom) return;
  pseudo = nom;
  ecrirePseudo(nom);
  afficherAccueil();
});

$("#joueur").addEventListener("click", afficherPseudo);

document.querySelectorAll("[data-filtre]").forEach((bouton) => {
  bouton.addEventListener("click", () => {
    filtre = bouton.dataset.filtre;
    document.querySelectorAll("[data-filtre]").forEach((b) => b.classList.toggle("actif", b === bouton));
    dessinerMatieres();
  });
});

pseudo ? afficherAccueil() : afficherPseudo();

fetch("contenu/matieres.json")
  .then((r) => r.json())
  .then((json) => { donnees = json; if (pseudo) dessinerMatieres(); })
  .catch(() => {
    $("#matieres").textContent = "Impossible de charger les matières. (En local, lance un petit serveur : voir README.)";
  });
