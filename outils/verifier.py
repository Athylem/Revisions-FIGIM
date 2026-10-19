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
TYPES = {"qcm", "vrai-faux"}

erreurs = []
ids_vus = {}


def verifier_question(q, fichier):
    ou = f"{fichier.name} / {q.get('id', '?')}"
    for champ in ("id", "type", "difficulte", "enonce", "reponse", "explication"):
        if champ not in q:
            erreurs.append(f"{ou} : champ « {champ} » manquant")
    if q.get("id") in ids_vus:
        erreurs.append(f"{ou} : id déjà utilisé dans {ids_vus[q['id']]}")
    ids_vus[q.get("id")] = fichier.name
    if q.get("type") not in TYPES:
        erreurs.append(f"{ou} : type inconnu « {q.get('type')} »")
    if q.get("difficulte") not in (1, 2, 3):
        erreurs.append(f"{ou} : difficulte doit valoir 1, 2 ou 3")
    if q.get("type") == "qcm":
        choix = q.get("choix", [])
        if len(choix) < 2 or not isinstance(q.get("reponse"), int) or not 0 <= q["reponse"] < len(choix):
            erreurs.append(f"{ou} : choix / reponse incohérents")
    if q.get("type") == "vrai-faux" and not isinstance(q.get("reponse"), bool):
        erreurs.append(f"{ou} : reponse doit valoir true ou false")


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
