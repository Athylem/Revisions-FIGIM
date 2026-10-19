// Affichage du texte des questions : **gras** + formules KaTeX ($…$ et $$…$$)

export function ecrire(el, texte) {
  el.replaceChildren();
  for (const [i, morceau] of texte.split(/\*\*(.+?)\*\*/).entries()) {
    if (!morceau) continue;
    if (i % 2) {
      const fort = document.createElement("strong");
      fort.textContent = morceau;
      el.append(fort);
    } else {
      el.append(morceau);
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
