// Numérique : on tape un nombre, accepté à ±tolerance (relative, 2 % par défaut)
// Saisies acceptées : 2040 · 2 040 · 0,138 · 1.4e7 · 1,4×10^7 · 1,4·10^-8

export function lireNombre(texte) {
  const t = texte
    .replace(/\s/g, "")
    .replace(/,/g, ".")
    .replace(/[×x*·]10\^?/i, "e")
    .replace(/^10\^/, "1e")
    .replace(/[−–]/g, "-");
  return /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i.test(t) ? Number(t) : NaN;
}

export function estCorrect(saisie, question) {
  const valeur = lireNombre(saisie);
  if (Number.isNaN(valeur)) return null;
  const tolerance = question.tolerance ?? 0.02;
  return Math.abs(valeur - question.reponse) <= Math.abs(question.reponse) * tolerance + 1e-12;
}

export function formater(question) {
  const n = question.reponse;
  const texte = Math.abs(n) >= 1e5 || (Math.abs(n) < 1e-3 && n !== 0)
    ? n.toExponential(2).replace(".", ",").replace(/e\+?(-?)(\d+)/, "×10^$1$2")
    : String(Number(n.toPrecision(4))).replace(".", ",");
  return question.unite ? `${texte} ${question.unite}` : texte;
}

export function afficher(question, zone, repondre) {
  const form = document.createElement("form");
  form.className = "saisie";
  const champ = document.createElement("input");
  champ.inputMode = "decimal";
  champ.autocomplete = "off";
  champ.placeholder = "Résultat";
  const unite = document.createElement("span");
  unite.className = "unite";
  unite.textContent = question.unite ?? "";
  const bouton = document.createElement("button");
  bouton.textContent = "Valider";
  const aide = document.createElement("p");
  aide.className = "discret aide";
  form.append(champ, unite, bouton);

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    if (champ.disabled) return;
    const correct = estCorrect(champ.value, question);
    if (correct === null) {
      aide.textContent = "Nombre non reconnu (ex. 0,138 · 2040 · 1,4e7 · 1,4×10^7)";
      return;
    }
    aide.remove();
    champ.disabled = bouton.disabled = true;
    champ.classList.add(correct ? "bon" : "faux");
    if (!correct) {
      const attendu = document.createElement("p");
      attendu.className = "solution";
      attendu.textContent = `Réponse attendue : ${formater(question)}`;
      zone.append(attendu);
    }
    repondre(correct);
  });

  zone.append(form, aide);
  champ.focus();
}
