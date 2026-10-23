"""Copie les cours rédigés dans le vault Obsidian vers le site (section « Cours »).

    python outils/gen_cours.py

Pour chaque matière de COURS, chaque note est convertie en Markdown standard dans
contenu/<id-matiere>/cours/<id-chapitre>.md, et les figures qu'elle utilise sont copiées
dans contenu/<id-matiere>/cours/img/. Puis lancer outils/verifier.py, qui inscrit les
chapitres de cours dans matieres.json.

Ce que la conversion change par rapport à la note Obsidian :
- en-tête YAML, ligne de navigation (↩ …) et encadrés [!info] « Source(s) » retirés
  (ils parlent du vault, pas du cours) ;
- ![[figure.jpg]] → ![](contenu/<matiere>/cours/img/figure.jpg) ;
- [[Note#Titre|texte]] → lien vers le chapitre publié (cours.html?…#ancre), sinon simple texte.
"""
import re
import shutil
import sys
import unicodedata
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

RACINE = Path(__file__).resolve().parent.parent
CONTENU = RACINE / "contenu"
VAULT = Path.home() / "Documents" / "obsidian_vault"

# Matière du site → dossier du vault et chapitres publiés (id sur le site, note source), dans l'ordre
COURS = {
    "automatique": {
        "dossier": "Cours/Automatique",
        "chapitres": [
            ("ch1-signaux-systemes", "Ch1 - Signaux et systèmes"),
            ("ch2-modelisation-signaux", "Ch2 - Modélisation des signaux"),
        ],
    },
}

IMAGES = (".jpg", ".jpeg", ".png", ".gif", ".svg", ".webp")


def ancre(titre):
    """Même règle que js/cours.js : sans accents, minuscules, tout le reste devient « - »."""
    sans_accents = unicodedata.normalize("NFD", titre).encode("ascii", "ignore").decode()
    return re.sub(r"[^a-z0-9]+", "-", sans_accents.lower()).strip("-")


def convertir(texte, id_matiere, notes_publiees, figures, manquantes):
    texte = re.sub(r"\A---\n.*?\n---\n", "", texte, flags=re.S)
    texte = re.sub(r"^↩.*\n", "", texte, flags=re.M)
    # Encadré « Source(s) » : la ligne [!info] et toutes les lignes > qui suivent
    texte = re.sub(r"^> \[!info\] Sources?\n(?:>.*\n)*\n?", "", texte, flags=re.M)

    def figure(m):
        nom = m.group(1).split("|")[0].strip()
        if nom not in figures:
            manquantes.append(nom)
            return ""
        return f"![](contenu/{id_matiere}/cours/img/{nom})"

    texte = re.sub(r"!\[\[([^\]]+)\]\]", figure, texte)

    def lien(m):
        cible, _, libelle = m.group(1).partition("|")
        note, _, titre = cible.partition("#")
        libelle = libelle or titre or note
        if note in notes_publiees:
            url = f"cours.html?matiere={id_matiere}&chapitre={notes_publiees[note]}"
            return f"[{libelle}]({url}{'#' + ancre(titre) if titre else ''})"
        return libelle

    texte = re.sub(r"\[\[([^\]]+)\]\]", lien, texte)
    return texte.strip() + "\n"


for id_matiere, cours in COURS.items():
    source = VAULT / cours["dossier"]
    sortie = CONTENU / id_matiere / "cours"
    if sortie.exists():
        shutil.rmtree(sortie)
    (sortie / "img").mkdir(parents=True)

    # Les figures peuvent être n'importe où sous le dossier du cours (pages web du prof…)
    figures = {f.name: f for f in source.rglob("*") if f.suffix.lower() in IMAGES}
    notes_publiees = {note: id_ch for id_ch, note in cours["chapitres"]}

    for id_ch, note in cours["chapitres"]:
        manquantes = []
        md = convertir((source / f"{note}.md").read_text(encoding="utf-8"), id_matiere, notes_publiees, figures, manquantes)
        (sortie / f"{id_ch}.md").write_text(md, encoding="utf-8")
        utilisees = re.findall(rf"contenu/{id_matiere}/cours/img/([^)]+)\)", md)
        for nom in utilisees:
            shutil.copy2(figures[nom], sortie / "img" / nom)
        print(f"{id_matiere}/{id_ch} : {len(utilisees)} figures")
        for nom in manquantes:
            print(f"  ⚠ figure introuvable : {nom}")

print("OK — lancer maintenant python outils/verifier.py")
