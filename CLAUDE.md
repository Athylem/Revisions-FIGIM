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
- Fait : étape 1 (accueil, pseudo, 22 matières, encart prochains DS) ; étape 2 (moteur, bilan + revoir erreurs).
- Types (js/types/) : qcm, vrai-faux, texte-a-trous, numerique (tolérance relative, unité), carte (auto-évaluation 1 / ½ / 0), probleme (étapes qcm/numerique/carte/vrai-faux, note partielle).
- Chaque banque a un `genre` : "cours" (fichiers ch*) ou "exercices" (fichiers ex*, exercices type DS). Types choisis par matière selon le format de son DS.
- Générateurs Python : écrire les formules LaTeX en chaînes r"..." (sinon , 	… deviennent des caractères de contrôle ; le vérificateur les détecte).
- Banques : Maths, Mise en forme, Polymères, Alliages non ferreux, Anglais (converti depuis ~/Projets/english-tenses-quiz/data.js). 522 questions.
- Après tout ajout de questions : `python outils/verifier.py` (valide + met à jour les chapitres dans matieres.json).
- À faire : étape 3 (classement Supabase), autres matières (sources dans le vault `Cours/2A FIGIM/`, surtout des PDF d'annales).
