// Outils communs du quiz : chargement des banques, tirage, score

export function melanger(tableau) {
  const t = [...tableau];
  for (let i = t.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [t[i], t[j]] = [t[j], t[i]];
  }
  return t;
}

export async function chargerMatieres() {
  const reponse = await fetch("contenu/matieres.json");
  return reponse.json();
}

// Charge les chapitres choisis et renvoie toutes leurs questions (avec le nom du chapitre)
export async function chargerQuestions(chapitres) {
  const banques = await Promise.all(
    chapitres.map((ch) => fetch(`contenu/${ch.fichier}`).then((r) => r.json()))
  );
  return banques.flatMap((b) => b.questions.map((q) => ({ ...q, chapitre: b.chapitre })));
}

// Bonne réponse : 10 points × difficulté, +10 % par bonne réponse d'affilée (max +50 %).
// Carte auto-évaluée : moitié moins (on ne peut pas vérifier). Problème et tableau : ×2
// (plusieurs étapes ou cases). Classement : ×1,5 (plusieurs éléments).
const COEF_TYPE = { carte: 0.5, probleme: 2, tableau: 2, classer: 1.5 };

export function points(question, serie) {
  const coef = COEF_TYPE[question.type] ?? 1;
  return Math.round(10 * question.difficulte * coef * (1 + 0.1 * Math.min(serie, 5)));
}
