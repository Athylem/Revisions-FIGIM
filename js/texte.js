// Affichage du texte des questions : **gras**, ~~barré~~ + formules KaTeX ($…$ et $$…$$)

const BALISES = { "**": "strong", "~~": "s" };

export function ecrire(el, texte) {
  el.replaceChildren();
  // split avec 2 groupes capturants : [texte, balise, contenu, texte, balise, contenu, …]
  const morceaux = texte.split(/(\*\*|~~)(.+?)\1/);
  for (let i = 0; i < morceaux.length; i += 3) {
    if (morceaux[i]) el.append(morceaux[i]);
    if (i + 2 < morceaux.length) {
      const balise = document.createElement(BALISES[morceaux[i + 1]]);
      balise.textContent = morceaux[i + 2];
      el.append(balise);
    }
  }
  formules(el);
}

export function formules(el) {
  window.renderMathInElement?.(el, {
    delimiters: [
      { left: "$$", right: "$$", display: true },
      { left: "$", right: "$", display: false },
    ],
    throwOnError: false,
  });
}
