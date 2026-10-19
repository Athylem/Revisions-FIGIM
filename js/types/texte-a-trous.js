// Texte à trous : on tape la réponse, comparée aux réponses acceptées (casse, ponctuation finale
// et contractions courantes ignorées)

const CONTRACTIONS = [
  [/\bcan't\b/g, "cannot"], [/\bwon't\b/g, "will not"], [/\bshan't\b/g, "shall not"],
  [/n't\b/g, " not"], [/'m\b/g, " am"], [/'re\b/g, " are"], [/'ve\b/g, " have"], [/'ll\b/g, " will"],
];

function normaliser(texte) {
  let t = texte.toLowerCase().replace(/[’‘`]/g, "'").replace(/[.!?,;]+$/, "").replace(/\s+/g, " ").trim();
  for (const [motif, remplacement] of CONTRACTIONS) t = t.replace(motif, remplacement);
  return t;
}

// 's et 'd sont ambigus (is/has, had/would) : on accepte les deux formes développées
function variantes(reponse) {
  const base = normaliser(reponse);
  const formes = new Set([base]);
  for (const [abr, longues] of [["'s", ["is", "has"]], ["'d", ["had", "would"]]]) {
    for (const f of [...formes]) {
      if (f.includes(abr)) for (const l of longues) formes.add(f.replaceAll(abr, " " + l));
    }
  }
  return formes;
}

export function estCorrect(saisie, reponses) {
  const saisies = variantes(saisie);
  return reponses.some((r) => [...variantes(r)].some((forme) => saisies.has(forme)));
}

export function afficher(question, zone, repondre) {
  const form = document.createElement("form");
  form.className = "saisie";
  const champ = document.createElement("input");
  champ.autocomplete = "off";
  champ.autocapitalize = "off";
  champ.spellcheck = false;
  champ.placeholder = "Ta réponse";
  const bouton = document.createElement("button");
  bouton.textContent = "Valider";
  form.append(champ, bouton);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (!champ.value.trim() || champ.disabled) return;
    const correct = estCorrect(champ.value, question.reponse);
    champ.disabled = bouton.disabled = true;
    champ.classList.add(correct ? "bon" : "faux");
    if (!correct) {
      const attendu = document.createElement("p");
      attendu.className = "solution";
      attendu.textContent = `Réponse attendue : ${question.reponse[0]}`;
      zone.append(attendu);
    }
    repondre(correct);
  });

  zone.append(form);
  champ.focus();
}
