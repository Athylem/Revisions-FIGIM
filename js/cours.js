// Lecture d'un chapitre de cours : Markdown (copié du vault par outils/gen_cours.py)
// rendu avec marked, formules KaTeX, encadrés façon Obsidian (> [!tip] Titre)

import { chargerMatieres } from "./moteur.js";
import { formules } from "./texte.js";

const $ = (sel) => document.querySelector(sel);

// Type d'encadré Obsidian → couleur (classe CSS) et titre par défaut
const ENCADRES = {
  note: ["info", "Note"], info: ["info", "Info"], example: ["info", "Exemple"],
  tip: ["bon", "Astuce"], success: ["bon", "À retenir"],
  important: ["accent", "Important"], question: ["accent", "Question"],
  warning: ["moyen", "Attention"],
};

// Même règle que outils/gen_cours.py : sans accents, minuscules, tout le reste devient « - »
export function ancre(titre) {
  return titre.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

function echapper(texte) {
  return texte.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

// Les formules sont mises de côté avant marked, sinon il prend leurs * _ | pour de la mise en forme
function versHtml(md) {
  const mises = [];
  const garder = (f) => `⟦${mises.push(f) - 1}⟧`;
  md = md.replace(/\$\$[\s\S]+?\$\$/g, garder).replace(/\$[^$\n]+?\$/g, garder);
  return window.marked.parse(md).replace(/⟦(\d+)⟧/g, (_, i) => echapper(mises[i]));
}

function encadres(article) {
  for (const bloc of article.querySelectorAll("blockquote")) {
    const premier = bloc.firstElementChild;
    const m = premier?.tagName === "P" && premier.innerHTML.match(/^\[!(\w+)\][+-]?[ \t]*([^\n]*)\n?/);
    if (!m) continue;
    const [couleur, titreParDefaut] = ENCADRES[m[1].toLowerCase()] ?? ENCADRES.note;
    premier.innerHTML = premier.innerHTML.slice(m[0].length);
    if (!premier.innerHTML.trim()) premier.remove();
    const titre = document.createElement("p");
    titre.className = "encadre-titre";
    titre.innerHTML = m[2] || titreParDefaut;
    bloc.prepend(titre);
    bloc.className = `encadre ${couleur}`;
  }
}

function sommaire(article) {
  const titres = [...article.querySelectorAll("h2, h3, h4")];
  for (const h of titres) h.id = ancre(h.textContent);

  const liste = $("#liste-sommaire");
  let sousListe = null;
  for (const h of titres.filter((h) => h.tagName !== "H4")) {
    const li = document.createElement("li");
    const a = document.createElement("a");
    a.href = `#${h.id}`;
    a.innerHTML = h.innerHTML;
    li.append(a);
    if (h.tagName === "H2") {
      liste.append(li);
      sousListe = document.createElement("ol");
      li.append(sousListe);
    } else {
      (sousListe ?? liste).append(li);
    }
  }
  for (const ol of liste.querySelectorAll("ol:empty")) ol.remove();
  $("#sommaire").hidden = titres.length === 0;
}

function navigation(matiere, position) {
  const lien = (ch, sens) => {
    const a = document.createElement("a");
    a.className = `matiere ${sens}`;
    a.href = `cours.html?matiere=${encodeURIComponent(matiere.id)}&chapitre=${encodeURIComponent(ch.id)}`;
    const p = document.createElement("p");
    p.className = "discret";
    p.textContent = sens === "precedent" ? "← Précédent" : "Suivant →";
    const h = document.createElement("h3");
    h.textContent = ch.nom;
    a.append(p, h);
    return a;
  };
  const liens = [];
  if (position > 0) liens.push(lien(matiere.cours[position - 1], "precedent"));
  if (position < matiere.cours.length - 1) liens.push(lien(matiere.cours[position + 1], "suivant"));
  $("#navigation-cours").replaceChildren(...liens);
  $("#navigation-cours").hidden = liens.length === 0;
}

async function afficher() {
  const params = new URLSearchParams(location.search);
  const donnees = await chargerMatieres();
  const matiere = donnees.matieres.find((m) => m.id === params.get("matiere"));
  const position = matiere?.cours?.findIndex((ch) => ch.id === params.get("chapitre")) ?? -1;
  const article = $("#cours");
  if (position < 0) {
    article.innerHTML = "<h1>Cours introuvable</h1>";
    return;
  }
  const chapitre = matiere.cours[position];
  document.title = `${chapitre.nom} — ${matiere.nom}`;
  $("#retour-matiere").href = `matiere.html?matiere=${encodeURIComponent(matiere.id)}`;
  $("#retour-matiere").textContent = `← ${matiere.nom}`;

  const md = await fetch(`contenu/${chapitre.fichier}`).then((r) => r.text());
  article.innerHTML = versHtml(md);
  encadres(article);
  for (const table of article.querySelectorAll("table")) {
    const defile = document.createElement("div");
    defile.className = "defile";
    table.replaceWith(defile);
    defile.append(table);
  }
  sommaire(article);
  formules(article);
  formules($("#sommaire"));
  navigation(matiere, position);

  // Le contenu arrive après le chargement : on rejoue le saut vers l'ancre (#2-1-5-shannon),
  // une fois les figures chargées pour qu'elles ne décalent plus la page
  if (location.hash) {
    await Promise.all([...article.querySelectorAll("img")].map((img) => img.decode().catch(() => {})));
    document.getElementById(decodeURIComponent(location.hash.slice(1)))?.scrollIntoView();
  }
}

afficher().catch(() => {
  $("#cours").textContent = "Impossible de charger le cours. (En local, lance un petit serveur : voir README.)";
});
