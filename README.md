# Révisions FIGIM

Site d'entraînement aux cours de FIGIM 2A (Mines Nancy) : QCM, questions de cours, exercices, avec classement entre potes.

En ligne : https://athylem.github.io/Revisions-FIGIM/

## Tester en local

Le site charge ses données en `fetch`, ce qui ne marche pas en ouvrant `index.html` directement. Il faut lancer un petit serveur :

```
python -m http.server 8000
```

puis ouvrir http://localhost:8000

## Organisation

- `contenu/matieres.json` : liste des matières, dates de DS (`"ds": "2026-11-20"`), chapitres
- `contenu/<matiere>/` : banques de questions ; `contenu/<matiere>/cours/` : chapitres de cours (générés depuis le vault par `outils/gen_cours.py`)
- `js/` : code du site, `css/` : apparence

Aucun build : publier = `git push` sur `main` (GitHub Pages).
