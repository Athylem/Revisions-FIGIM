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
- Types (js/types/) : qcm, vrai-faux, texte-a-trous, numerique (tolérance relative, unité), carte (auto-évaluation 1 / ½ / 0), probleme (étapes qcm/numerique/carte/vrai-faux, note partielle ; ses étapes qcm s'affichent en rédaction), redaction (on écrit sa réponse, puis « Voir les propositions » → QCM corrigé, puis corrigé détaillé `modele`). Les questions à rédiger (ex-cartes) sont toutes en redaction ; propositions dans le scratchpad (redac_*.py, appliquées par commun.ecrire).
- Types ajoutés pour l'économie d'entreprise : classer (`categories` + `elements` [{texte, reponse: indice}], on range chaque élément puis on corrige) et tableau (`colonnes` + `lignes` [{libelle, valeurs, aide, donne, total, ecart}] ou {titre}, toutes les cases remplies puis corrigées d'un coup, exact par défaut). Les deux marchent aussi comme étapes de probleme.
- Champ facultatif `donnees` sur une question : annexes (CR en liste, bilan…) affichées au-dessus des réponses pendant toutes les étapes (js/donnees.js).
- Chaque banque a un `genre` : "ds" (fichiers ds*, sujets complets type DS, affichés en premier), "cours" (fichiers ch*) ou "exercices" (fichiers ex*, exercices type DS). Types choisis par matière selon le format de son DS.
- Le texte des questions ne gère que **gras** et ~~barré~~ (pas d'italique à une étoile).
- Principe : chaque matière s'évalue à sa façon, pas forcément en quiz. Une matière peut avoir sa propre page (`"page"` dans matieres.json, l'accueil y renvoie ; `"etat"` = texte de la carte).
- Économie d'entreprise = `atelier-eco.html` + `js/eco/` : 5 ateliers où l'on construit sa copie comme au DS (SIG, CAF, bilan fonctionnel, immobilisations, bilan & CR). Document de départ à gauche, copie à droite, phases successives : placement (on clique la ligne dans le document de départ, puis le bloc ; étiquettes seulement pour ce qui n'est pas dans le document : ordre de la cascade, journal), grilles de calcul (vérifier / recommencer / correction), choix. Numéros de compte affichés partout (document de départ, étiquettes placées, libellés des grilles : « Charges de personnel (641 + 645) ») car on apprend les SIG par numéros. Cas générés au hasard dans le navigateur (cas.js, chiffres ronds, sans calculatrice) ou cas des TD (vérifiés contre les corrigés). Seules les questions de cours (ch*) restent en quiz.
- Générateurs Python : écrire les formules LaTeX en chaînes r"..." (sinon , 	… deviennent des caractères de contrôle ; le vérificateur les détecte).
- Banques : Maths, Mise en forme, Polymères, Alliages non ferreux et ferreux, Thermodynamique, Transformation de phase, Méthodes d analyse, TP Métallurgie, Fonderie, Qualité, Anglais (converti depuis ~/Projets/english-tenses-quiz/data.js), Économie d'entreprise (id `analyse-financiere`, questions de cours générées par `python outils/gen_af.py contenu/analyse-financiere` ; les exercices sont dans les ateliers). 1000 questions.
- Navigation : accueil → `matiere.html?matiere=<id>` (page de la matière : section **Cours** + section **S'entraîner**, une carte par genre de quiz → `jouer.html?matiere=<id>&genre=<genre>` qui ne coche que ces chapitres, ou la page dédiée). Une matière est ouverte dès qu'elle a des questions ou des cours.
- Cours : `cours.html?matiere=<id>&chapitre=<id>` affiche `contenu/<id>/cours/<chapitre>.md` (marked + KaTeX, encadrés Obsidian `> [!tip] Titre`, sommaire, précédent/suivant). Ces .md sont **générés** depuis les notes du vault par `python outils/gen_cours.py` (liste des chapitres publiés dans `COURS` en tête du script, avec la note résumé de chaque chapitre → `cours/resumes/`, onglet « Résumé » = `&vue=resume` ; figures copiées dans `cours/img/`, liens [[…]] vers un chapitre publié → lien avec ancre, sinon texte). Ne pas éditer les .md à la main : corriger la note du vault puis relancer gen_cours.py + verifier.py (qui inscrit `"cours"` dans matieres.json). Publié : Automatique ch1-ch2 + leurs résumés (notes « Résumé ChN - … » du vault).
- Après tout ajout de questions : `python outils/verifier.py` (valide + met à jour les chapitres dans matieres.json).
- À faire : étape 3 (classement Supabase), autres matières (sources dans le vault `Cours/2A FIGIM/`, surtout des PDF d'annales).
