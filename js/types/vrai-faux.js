// Vrai / faux : juger une affirmation

export function afficher(question, zone, repondre) {
  const liste = document.createElement("div");
  liste.className = "choix deux";

  const boutons = [true, false].map((valeur) => {
    const bouton = document.createElement("button");
    bouton.className = "choix-bouton";
    bouton.textContent = valeur ? "Vrai" : "Faux";
    bouton.addEventListener("click", () => {
      const correct = valeur === question.reponse;
      boutons.forEach((b, i) => {
        b.disabled = true;
        if ([true, false][i] === question.reponse) b.classList.add("bon");
      });
      if (!correct) bouton.classList.add("faux");
      repondre(correct);
    });
    return bouton;
  });

  liste.append(...boutons);
  zone.append(liste);
}
