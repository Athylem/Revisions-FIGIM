# Contexte projet — Révisions FIGIM

## Description
Site d'entraînement aux cours de FIGIM 2A (QCM, questions de cours, exercices) avec classement entre amis. Plan complet : note `Projets/Revisions-FIGIM.md` du vault Obsidian (`~/Documents/obsidian_vault`).

## Contraintes clés
- 100 % statique, sans build, hébergé sur GitHub Pages ; JS en modules ES.
- Données chargées en `fetch` → tester avec `python -m http.server`.
- Connexion par pseudo seul (`localStorage`, clé `figim.pseudo`), pas de mot de passe.
- Classement prévu sur Supabase (étape 3).
- Contenu séparé du code : `contenu/matieres.json` + une banque JSON par chapitre. Chaque question a un `id` stable, ne jamais le changer une fois publiée.
- Sources des questions : notes du vault dans `Cours/` (dont `Cours/2A FIGIM/` = annales de toutes les matières).

## État avancement
- Fait : étape 1 (accueil, pseudo, 22 matières groupées, encart prochains DS).
- À faire : étape 2 (moteur de quiz + banque Maths).
