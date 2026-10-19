"""Vérifie les banques de questions et met à jour la liste des chapitres dans matieres.json.

À lancer après chaque ajout ou modification de questions :
    python outils/verifier.py

Pour chaque matière, les chapitres sont les fichiers contenu/<id-matiere>/*.json,
dans l'ordre alphabétique (d'où les préfixes ch1-, ch2-…).
"""
import json
import sys
from pathlib import Path

sys.stdout.reconfigure(encoding="utf-8")

RACINE = Path(__file__).resolve().parent.parent
CONTENU = RACINE / "contenu"
TYPES = {"qcm", "vrai-faux", "texte-a-trous", "numerique", "carte", "probleme", "redaction"}
CONTROLE = "\f\t\b\v\a\r"  # caractères de contrôle interdits dans les textes
TYPES_ETAPE = {"qcm", "vrai-faux", "numerique", "carte", "redaction"}

erreurs = []
ids_vus = {}


def verifier_reponse(q, ou):
    """Contrôles propres à chaque type (questions et étapes de problème)."""
    t = q.get("type")
    if t in ("qcm", "redaction"):
        choix = q.get("choix", [])
        if len(choix) < 2 or not isinstance(q.get("reponse"), int) or not 0 <= q["reponse"] < len(choix):
            erreurs.append(f"{ou} : choix / reponse incohérents")
    elif t == "vrai-faux" and not isinstance(q.get("reponse"), bool):
        erreurs.append(f"{ou} : reponse doit valoir true ou false")
    elif t == "texte-a-trous" and not (isinstance(q.get("reponse"), list) and q["reponse"]):
        erreurs.append(f"{ou} : reponse doit être une liste de réponses acceptées")
    elif t == "numerique" and (isinstance(q.get("reponse"), bool) or not isinstance(q.get("reponse"), (int, float))):
        erreurs.append(f"{ou} : reponse doit être un nombre")
    elif t == "carte" and not isinstance(q.get("reponse"), str):
        erreurs.append(f"{ou} : reponse doit être un texte")


def textes(valeur):
    """Toutes les chaînes contenues dans une question (récursif)."""
    if isinstance(valeur, str):
        yield valeur
    elif isinstance(valeur, list):
        for v in valeur:
            yield from textes(v)
    elif isinstance(valeur, dict):
        for v in valeur.values():
            yield from textes(v)


def verifier_question(q, fichier):
    ou = f"{fichier.name} / {q.get('id', '?')}"
    # \frac, \times, \bar… écrits sans r'' dans un générateur Python deviennent \f, \t, \b
    if any(c in t for t in textes(q) for c in CONTROLE):
        erreurs.append(f"{ou} : caractère de contrôle (formule LaTeX mal échappée ?)")
    obligatoires = ("id", "type", "difficulte", "enonce") + (("etapes",) if q.get("type") == "probleme" else ("reponse",))
    for champ in obligatoires:
        if champ not in q:
            erreurs.append(f"{ou} : champ « {champ} » manquant")
    if q.get("id") in ids_vus:
        erreurs.append(f"{ou} : id déjà utilisé dans {ids_vus[q['id']]}")
    ids_vus[q.get("id")] = fichier.name
    if q.get("type") not in TYPES:
        erreurs.append(f"{ou} : type inconnu « {q.get('type')} »")
    if q.get("difficulte") not in (1, 2, 3):
        erreurs.append(f"{ou} : difficulte doit valoir 1, 2 ou 3")
    if q.get("type") == "probleme":
        for i, e in enumerate(q.get("etapes", []), 1):
            if e.get("type") not in TYPES_ETAPE or "enonce" not in e or "reponse" not in e:
                erreurs.append(f"{ou} étape {i} : type, enonce ou reponse manquant/invalide")
            verifier_reponse(e, f"{ou} étape {i}")
    else:
        verifier_reponse(q, ou)


chemin_matieres = CONTENU / "matieres.json"
donnees = json.loads(chemin_matieres.read_text(encoding="utf-8"))

total = 0
for matiere in donnees["matieres"]:
    chapitres = []
    for fichier in sorted((CONTENU / matiere["id"]).glob("*.json")):
        banque = json.loads(fichier.read_text(encoding="utf-8"))
        for q in banque["questions"]:
            verifier_question(q, fichier)
        chapitres.append({
            "id": fichier.stem,
            "nom": banque["chapitre"],
            "genre": banque.get("genre", "cours"),
            "fichier": f"{matiere['id']}/{fichier.name}",
            "questions": len(banque["questions"]),
        })
    matiere["chapitres"] = chapitres
    n = sum(c["questions"] for c in chapitres)
    total += n
    if n:
        print(f"{matiere['nom']} : {n} questions ({len(chapitres)} chapitres)")

if erreurs:
    print("\n".join(["", "ERREURS :"] + erreurs))
    sys.exit(1)

chemin_matieres.write_text(json.dumps(donnees, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"OK — {total} questions, matieres.json mis à jour")
