"""Génère les banques « Économie d'entreprise / analyse financière » du site Révisions FIGIM.
Sources : vault Cours/ECONOMIE D'ENTREPRISE (cours Leroyer PCG 2025, cas BELLESSENCE, VITAMINES,
VALIANT, NOÉ, VELORAMA, PITAIN FLAM) + format du DS 2023-2024 (papier, sans calculatrice,
dossiers avec compte de résultat « en liste »).
Usage : python gen_af.py <dossier contenu/analyse-financiere>
"""
import json, random, sys
from pathlib import Path

SORTIE = Path(sys.argv[1])
SORTIE.mkdir(parents=True, exist_ok=True)
SRC = "Cours/ECONOMIE D'ENTREPRISE"


def fm(n):
    return f"{n:,}".replace(",", " ")


def ecrire(nom, chapitre, genre, questions):
    ids = [q["id"] for q in questions]
    assert len(ids) == len(set(ids)), nom
    (SORTIE / nom).write_text(json.dumps({"chapitre": chapitre, "genre": genre, "questions": questions},
                                         ensure_ascii=False, indent=1) + "\n", encoding="utf-8")
    print(nom, len(questions))


def qcm(id, enonce, choix, expl, d=1, rep=0, **kw):
    return {"id": id, "type": "qcm", "difficulte": d, "enonce": enonce, "choix": choix, "reponse": rep,
            "explication": expl, "source": SRC, **kw}


def vf(id, enonce, rep, expl, d=1):
    return {"id": id, "type": "vrai-faux", "difficulte": d, "enonce": enonce, "reponse": rep,
            "explication": expl, "source": SRC}


def red(id, enonce, choix, modele, expl="", d=2):
    return {"id": id, "type": "redaction", "difficulte": d, "enonce": enonce, "choix": choix, "reponse": 0,
            "modele": modele, "explication": expl, "source": SRC}


def num(enonce, rep, expl="", tol=0, unite=None):
    e = {"type": "numerique", "enonce": enonce, "reponse": rep, "tolerance": tol, "explication": expl}
    if unite:
        e["unite"] = unite
    return e


def L(libelle, *valeurs, aide=None, donne=False, total=False, ecart=None):
    l = {"libelle": libelle, "valeurs": list(valeurs)}
    if aide: l["aide"] = aide
    if donne: l["donne"] = True
    if total: l["total"] = True
    if ecart is not None: l["ecart"] = ecart
    return l


def T(titre):
    return {"titre": titre}


def tab(enonce, colonnes, lignes, titreLignes="", expl=""):
    return {"type": "tableau", "enonce": enonce, "colonnes": colonnes, "titreLignes": titreLignes,
            "lignes": lignes, "explication": expl}


def classer_etape(enonce, categories, elements, expl=""):
    return {"type": "classer", "enonce": enonce, "categories": categories,
            "elements": [{"texte": t, "reponse": r, **({"explication": e} if e else {})} for t, r, e in elements],
            "explication": expl}


# =====================================================================================
# 1. QUESTIONS DE COURS
# =====================================================================================
ch1 = [
    qcm("af-c1-01", "Le bilan est :", ["Une photographie du patrimoine à une date donnée", "Le film de l'activité sur l'exercice", "La liste des charges et produits de l'année", "Le tableau des flux de trésorerie"],
        "Bilan = **photo** du patrimoine (date donnée) ; compte de résultat = **film** de l'activité sur l'exercice."),
    qcm("af-c1-02", "À l'actif du bilan, les postes sont classés par :", ["Liquidité croissante", "Exigibilité croissante", "Montant décroissant", "Ordre alphabétique des comptes"],
        "Actif : liquidité croissante (immobilisations en haut, trésorerie en bas). Passif : exigibilité croissante."),
    qcm("af-c1-03", "Les capitaux propres comprennent :", ["Capital, réserves, report à nouveau, résultat de l'exercice (et subventions d'investissement)", "Capital, réserves et emprunts à plus d'un an", "Capital, réserves, résultat et cumul des amortissements", "Capital uniquement"],
        "Question tombée au test 2011 : le résultat de l'exercice fait partie des capitaux propres ; les amortissements non (ils sont à l'actif en déduction)."),
    vf("af-c1-04", "Un résultat écrit entre parenthèses ou précédé d'un signe « − » au passif représente une perte.", True, "Convention de présentation du bilan."),
    qcm("af-c1-05", "Une **charge** est :", ["Une consommation (emploi définitif) qui appauvrit l'entreprise", "Une dette envers un fournisseur", "Un bien durable inscrit à l'actif", "Une ressource créée par l'activité"],
        "Charges (classe 6) = consommations ; produits (classe 7) = ressources créées par l'activité (ventes…)."),
    qcm("af-c1-06", "Variation de stock de **marchandises** (ou de MP) inscrite en charges :", ["SI − SF", "SF − SI", "SI + SF", "(SI + SF) / 2"],
        "Consommation = Achats + (SI − SF). Si SF > SI, la variation est négative : on a stocké, on a moins consommé."),
    qcm("af-c1-07", "Production stockée (variation de stock de **produits finis**) inscrite en produits :", ["SF − SI", "SI − SF", "SI + SF", "SF"],
        "Sens inverse des achats : production stockée = SF − SI. Positive : on a fabriqué plus que vendu."),
    qcm("af-c1-08", "Stock de PF : SI = 3 000, SF = 2 800. La production (dé)stockée vaut :", ["−200 (déstockage)", "+200", "−5 800", "2 800"],
        "SF − SI = 2 800 − 3 000 = −200 (cas VITAMINES)."),
    qcm("af-c1-09", "Stock de matières premières : SI = 2 000, SF = 2 500. La variation de stock (en charges) vaut :", ["−500", "+500", "4 500", "2 500"],
        "SI − SF = 2 000 − 2 500 = −500 (cas VITAMINES) : on a stocké, la consommation est inférieure aux achats."),
    qcm("af-c1-10", "Les comptes de classe 1 à 5 :", ["Sont des comptes de bilan, cumulés d'un exercice à l'autre", "Sont des comptes de gestion remis à zéro chaque année", "Sont des comptes de charges", "N'apparaissent pas dans les états financiers"],
        "Classes 1-5 = comptes de **situation** (bilan, mémoire 🐘) ; classes 6-7 = comptes de **gestion** (CR, remis à zéro 🐟)."),
    qcm("af-c1-11", "Un emprunt auprès d'un établissement de crédit est enregistré en classe :", ["1 (capitaux stables), au passif en dettes", "2 (immobilisations)", "5 (comptes financiers)", "4 (tiers)"],
        "Compte 164 : classe 1. Au bilan : poste « Dettes » (code D) dans les classements des cas BELLESSENCE/VITAMINES."),
    qcm("af-c1-12", "Les intérêts versés sur un emprunt sont :", ["Une charge financière", "Une charge d'exploitation", "Une charge exceptionnelle", "Une diminution de la dette au bilan"],
        "Compte 661 : charge financière (CF). Le remboursement du capital, lui, n'est pas une charge."),
    qcm("af-c1-13", "Un découvert bancaire (concours bancaires courants) apparaît :", ["Au passif, en dettes", "À l'actif, en trésorerie", "En charges financières", "Il se compense avec le solde positif d'une autre banque"],
        "Cas VITAMINES : banque SG positive à l'actif (4 300), découvert BNP au passif (2 000) ; on ne compense pas."),
    qcm("af-c1-14", "Les trois documents de synthèse (comptes annuels) sont :", ["Bilan, compte de résultat, annexe", "Bilan, journal, grand livre", "Compte de résultat, balance, annexe", "Bilan, tableau de financement, SIG"],
        "Art. L123-12 C. com. : ensemble indissociable bilan + CR + annexe."),
    vf("af-c1-15", "Le bilan est toujours équilibré : total actif = total passif.", True, "À tout emploi correspond une ressource."),
    qcm("af-c1-16", "Dans le compte de résultat, un **bénéfice** s'inscrit :", ["Du côté des charges, pour équilibrer", "Du côté des produits", "Au bas de l'actif", "Il n'apparaît pas dans le CR"],
        "Produits > charges ⇒ le résultat (bénéfice) équilibre côté charges ; une perte s'inscrit côté produits."),
    qcm("af-c1-17", "Le fonds de commerce est :", ["Une immobilisation incorporelle non amortissable", "Une immobilisation corporelle amortissable", "Une charge exceptionnelle", "Un actif circulant"],
        "Durée de vie illimitée : non amortissable (comme les terrains et les actions)."),
    qcm("af-c1-18", "Production de l'exercice =", ["Production vendue + production stockée + production immobilisée", "Ventes de marchandises + production vendue", "Production vendue − consommations", "Chiffre d'affaires"],
        "La production immobilisée = ce que l'entreprise produit pour elle-même (ex. construction d'un bâtiment)."),
]

ch2 = [
    qcm("af-c2-01", "Le coût d'acquisition d'une immobilisation comprend :", ["Prix net (après remises) + frais directement attribuables (transport, installation, douane)", "Prix TTC + frais de formation du personnel", "Prix HT uniquement", "Prix HT + TVA récupérable"],
        "Les frais de formation ne peuvent pas être incorporés ; la TVA récupérable va en 4456."),
    qcm("af-c2-02", "Taux d'amortissement linéaire pour une durée de 5 ans :", ["20 %", "25 %", "35 %", "5 %"], "1/n = 1/5 = 20 %."),
    qcm("af-c2-03", "En linéaire, le prorata temporis démarre :", ["À la date de mise en service (par défaut la date d'acquisition)", "Au 1er janvier de l'année d'acquisition", "Au 1er jour du mois d'acquisition", "À la date de paiement"],
        "Le dégressif, lui, démarre au 1er jour du mois d'acquisition (prorata en mois)."),
    qcm("af-c2-04", "Convention de calcul du prorata :", ["Année de 360 jours (12 mois de 30 jours)", "Année de 365 jours", "Nombre de jours ouvrés", "Nombre de mois seulement"], "12 × 30 = 360."),
    qcm("af-c2-05", "Mise en service le 15.03.N, clôture le 31.12 : prorata de la 1re année ?", ["285/360", "270/360", "290/360", "9/12"], "15 jours de mars + 9 mois × 30 = 285."),
    qcm("af-c2-06", "Mise en service le 15.08, clôture le 31.12 : prorata ?", ["135/360", "150/360", "120/360", "4/12"], "15 + 4 × 30 = 135 (cas VALIANT)."),
    qcm("af-c2-07", "Coefficient dégressif pour une durée de 5 ans :", ["1,75", "1,25", "2,25", "2"], "3-4 ans : 1,25 ; 5-6 ans : 1,75 ; plus de 6 ans : 2,25."),
    qcm("af-c2-08", "En dégressif, à partir de la 2e année, la dotation se calcule sur :", ["La VNC de début d'année", "La valeur d'origine", "La valeur résiduelle", "Le cumul des amortissements"],
        "Dotation = VNC début × taux dégressif ; on bascule en linéaire quand 1/(années restantes) > taux dégressif."),
    qcm("af-c2-09", "La dotation aux amortissements est :", ["Une charge calculée, non décaissée (compte 681)", "Une charge décaissée", "Un produit", "Une dette"],
        "Pas de flux de trésorerie : c'est pourquoi on la rajoute dans la CAF additive."),
    qcm("af-c2-10", "Le compte d'amortissement du matériel industriel (215) est :", ["2815", "6815", "6811", "215"], "On intercale un 8 après le 2 : 2815. La dotation va en 681(1)."),
    qcm("af-c2-11", "VNC d'une immobilisation =", ["Valeur brute − amortissements cumulés", "Valeur brute − dotation de l'année", "Prix de cession − valeur brute", "Valeur brute × taux"], "3e colonne de l'actif."),
    qcm("af-c2-12", "PCG 2025 : le produit de cession d'une immobilisation **corporelle** va dans le compte :", ["757, en produits d'exploitation", "775, en produits exceptionnels", "767, en produits financiers", "707, en ventes"],
        "Réforme 2025 : 675/775 supprimés ; corporelles/incorporelles → 657/757 (exploitation) ; financières → 667/767 (financier)."),
    qcm("af-c2-13", "La valeur comptable d'une immobilisation **corporelle** cédée va en :", ["657, charges d'exploitation", "675, charges exceptionnelles", "667, charges financières", "681"], "PCG 2025."),
    qcm("af-c2-14", "PCG 2025 : la cession de **titres de participation** est enregistrée en :", ["667 / 767 (résultat financier)", "657 / 757 (exploitation)", "675 / 775 (exceptionnel)", "Elle n'est pas enregistrée"], "Cas VELORAMA N : 767 = 30 ; 667 = 26."),
    qcm("af-c2-15", "Lors d'une cession, avant de calculer la VNC, il faut :", ["Passer la dotation complémentaire du 1er janvier à la date de cession", "Annuler toutes les dotations déjà passées", "Recalculer le prix de cession TTC", "Rien de particulier"], "Sinon la VNC est fausse (cas VALIANT : 6 250 de dotation complémentaire)."),
    qcm("af-c2-16", "Prix de cession HT 25 000, VNC 34 375. Résultat de cession :", ["Moins-value de 9 375", "Plus-value de 9 375", "Moins-value de 34 375", "Plus-value de 25 000"], "757 − 657 = 25 000 − 34 375 = −9 375 (VALIANT)."),
    qcm("af-c2-17", "Écriture de sortie de l'immobilisation cédée :", ["Débit 657 (VNC) + débit 28 (cumul) / crédit 2 (valeur brute)", "Débit 2 / crédit 657 + crédit 28", "Débit 512 / crédit 757", "Débit 681 / crédit 28"], "On solde le compte d'immobilisation et ses amortissements."),
    vf("af-c2-18", "Un terrain s'amortit sur sa durée d'utilisation.", False, "Durée de vie illimitée : pas d'amortissement (sauf mines, carrières)."),
    vf("af-c2-19", "En dégressif, l'année d'acquisition compte pour une année entière : il n'y a pas d'annuité complémentaire en fin de plan.", True, "n annuités en dégressif (n + 1 en linéaire avec prorata)."),
    qcm("af-c2-20", "Une dotation aux amortissements augmente. Conséquence :", ["Le résultat et l'IS diminuent, sans effet sur la trésorerie", "La trésorerie diminue", "Le résultat augmente", "La CAF diminue"], "Charge calculée : résultat ↓, impôt ↓, CAF inchangée (hors effet IS)."),
]

ch3 = [
    qcm("af-c3-01", "Ordre des soldes intermédiaires de gestion :", ["MC → Production → VA → EBE → RE → RCAI → R. exceptionnel → RN", "VA → MC → EBE → RE → RN", "EBE → VA → RE → RCAI → RN", "Production → MC → EBE → VA → RN"], "Cascade du plus « économique » au plus global."),
    qcm("af-c3-02", "Marge commerciale =", ["Ventes de marchandises − (achats de marchandises + variation de stock de marchandises)", "Chiffre d'affaires − achats", "Ventes de marchandises − achats de MP", "Production − consommations"], "Ne concerne que le négoce (revente en l'état)."),
    qcm("af-c3-03", "Valeur ajoutée =", ["MC + Production − Consommations en provenance des tiers", "MC + Production − Charges de personnel", "EBE + charges de personnel", "CA − achats de marchandises"], "Richesse créée par l'entreprise au-delà de ce qu'elle achète aux tiers."),
    qcm("af-c3-04", "EBE =", ["VA + subventions d'exploitation − impôts et taxes − charges de personnel", "VA − dotations aux amortissements", "RE + dotations", "VA − charges financières"], "Avant amortissements, financement, exceptionnel et IS."),
    qcm("af-c3-05", "Résultat d'exploitation (PCG 2025) =", ["EBE + reprises + autres produits (75, 757) − dotations − autres charges (65, 657)", "EBE − charges financières", "VA − charges de personnel", "EBE + résultat exceptionnel"], "Depuis 2025, les cessions d'immos corporelles/incorporelles sont dans le RE."),
    qcm("af-c3-06", "Le chiffre d'affaires comprend :", ["Ventes de marchandises + production vendue (biens et services)", "Production de l'exercice + ventes", "Production vendue + stockée + immobilisée", "Tous les produits d'exploitation"], "Pas de production stockée ni immobilisée dans le CA."),
    qcm("af-c3-07", "Les consommations en provenance des tiers comprennent :", ["Achats de MP ± variation de stock de MP + autres achats et charges externes", "Achats de marchandises + MP", "Charges de personnel + impôts", "Dotations + charges financières"], "Énergie, téléphone, publicité, sous-traitance, loyers… = charges externes (61/62)."),
    qcm("af-c3-08", "Pourquoi l'EBE est-il une mesure « objective » de la performance ?", ["Il est indépendant des choix d'investissement (amortissements), de financement (intérêts) et fiscaux", "Il tient compte de toutes les charges", "Il est toujours positif", "Il est calculé après impôt"], "C'est aussi le point de départ de la CAF ; proche de l'EBITDA."),
    qcm("af-c3-09", "Si l'EBE est négatif, on parle :", ["D'insuffisance brute d'exploitation (IBE)", "De perte d'exploitation", "De capacité d'autofinancement négative", "De besoin en fonds de roulement"], "EBE < 0 = IBE."),
    qcm("af-c3-10", "Les intérêts d'emprunt interviennent dans :", ["Le résultat financier (donc le RCAI)", "L'EBE", "La VA", "Le résultat exceptionnel"], "RCAI = RE + résultat financier."),
    qcm("af-c3-11", "Depuis le PCG 2025, le résultat exceptionnel contient :", ["Uniquement les événements majeurs et inhabituels (sinistre, changement de méthode, corrections d'erreurs…)", "Toutes les cessions d'immobilisations", "Les amendes et toutes les opérations rares", "Les intérêts"], "Les cessions sont sorties de l'exceptionnel."),
    qcm("af-c3-12", "La CAF est :", ["Une ressource interne potentielle : produits encaissables − charges décaissables", "Le solde de trésorerie de fin d'année", "Le résultat net", "L'EBE après impôt"], "Ce n'est pas un flux de trésorerie : décalages d'encaissement."),
    qcm("af-c3-13", "Méthode **additive** : CAF =", ["RN + dotations − reprises + VNC des actifs cédés − produits de cession − QP subventions virée au résultat", "EBE + dotations − reprises", "RN − dotations + reprises", "RN + dividendes"], "On neutralise les éléments calculés et les cessions."),
    qcm("af-c3-14", "Méthode **soustractive** : la CAF part de :", ["L'EBE", "Le résultat net", "La valeur ajoutée", "Le chiffre d'affaires"], "EBE + autres produits encaissables − autres charges décaissables ± financier ± exceptionnel − participation − IS."),
    qcm("af-c3-15", "Lequel de ces éléments est **exclu** du calcul de la CAF ?", ["Le produit de cession d'une immobilisation (757)", "Les intérêts d'emprunt (66)", "L'impôt sur les bénéfices", "Les autres produits de gestion courante (75)"], "Exclus : 68x, 78x, 747, 657/667, 757/767."),
    qcm("af-c3-16", "Autofinancement =", ["CAF − dividendes versés", "CAF + dividendes", "RN − dividendes", "EBE − IS"], "Autofinancement de maintien (renouvellement) ou d'expansion."),
    qcm("af-c3-17", "Taux de valeur ajoutée (VA / CA) élevé :", ["Entreprise très intégrée (fait elle-même sa production)", "Entreprise qui sous-traite beaucoup", "Entreprise de négoce pur", "Entreprise très endettée"], "Taux de VA = degré d'intégration."),
    qcm("af-c3-18", "Charges de personnel / VA = 80 % :", ["Le personnel absorbe l'essentiel de la richesse créée : peu de marge pour investir et rembourser", "La VA est trop faible pour payer le personnel", "C'est le niveau idéal", "Le personnel est sous-payé"], "Au-delà de 70-75 %, il reste peu (VELORAMA, PITAIN FLAM)."),
    vf("af-c3-19", "Les SIG permettent de juger l'équilibre financier de l'entreprise.", False, "QCM du test 2011 : les SIG analysent l'**activité et les résultats** ; l'équilibre financier se juge avec le bilan fonctionnel (FRNG, BFR, TN)."),
    vf("af-c3-20", "La CAF soustractive et la CAF additive donnent toujours le même montant.", True, "Toujours calculer les deux en DS pour se vérifier."),
    qcm("af-c3-21", "Le résultat net d'une année est gonflé par une indemnité exceptionnelle. Pour juger la performance durable, on regarde surtout :", ["L'EBE et le résultat d'exploitation", "Le résultat net", "Le résultat exceptionnel", "L'IS"], "Corrigés VELORAMA / PITAIN FLAM : « la hausse durable se lit surtout sur l'EBE »."),
]

ch4 = [
    qcm("af-c4-01", "Le bilan fonctionnel est établi :", ["En valeurs brutes, à partir du bilan avant répartition", "En valeurs nettes, après répartition", "En valeurs de marché", "À partir du compte de résultat"], "Les amortissements et dépréciations sont remis en ressources stables."),
    qcm("af-c4-02", "Dans le bilan fonctionnel, les amortissements et dépréciations sont classés :", ["En ressources stables", "En emplois stables", "En passif circulant", "Ils disparaissent"], "D'où un total du bilan fonctionnel supérieur au total comptable."),
    qcm("af-c4-03", "Les concours bancaires courants sont classés en :", ["Trésorerie passive", "Ressources stables", "Passif circulant d'exploitation", "Emplois stables"], "TN = trésorerie active − trésorerie passive."),
    qcm("af-c4-04", "Les dettes sur immobilisations sont classées en :", ["Passif circulant hors exploitation", "Passif circulant d'exploitation", "Ressources stables", "Trésorerie passive"], "Comme l'IS à payer : BFR hors exploitation."),
    qcm("af-c4-05", "FRNG (par le haut) =", ["Ressources stables − emplois stables", "Actif circulant − dettes fournisseurs", "Trésorerie active − trésorerie passive", "Capitaux propres − immobilisations nettes"], "Par le bas : FRNG = BFR + TN."),
    qcm("af-c4-06", "BFR =", ["Actif circulant hors trésorerie − passif circulant hors trésorerie", "Stocks − fournisseurs", "Ressources stables − emplois stables", "Disponibilités − découverts"], "BFRE (exploitation) + BFRHE (hors exploitation)."),
    qcm("af-c4-07", "Relation fondamentale :", ["TN = FRNG − BFR", "TN = BFR − FRNG", "FRNG = TN − BFR", "BFR = FRNG + TN"], "À vérifier systématiquement en DS."),
    qcm("af-c4-08", "Un FRNG positif signifie :", ["Les emplois stables sont entièrement financés par des ressources stables (équilibre minimum)", "La trésorerie est forcément positive", "Le BFR est négatif", "L'entreprise est rentable"], "C'est le « matelas de sécurité »."),
    qcm("af-c4-09", "BFR = 168 000 ; FRNG = 220 000. La trésorerie nette vaut :", ["+52 000", "−52 000", "388 000", "1,31"], "TN = FRNG − BFR (cas NOÉ, année N)."),
    qcm("af-c4-10", "Un BFR négatif est typique :", ["De la grande distribution (clients au comptant, fournisseurs à crédit)", "De l'industrie lourde", "D'une entreprise de BTP sans acomptes", "D'une entreprise très endettée"], "Aussi abonnements, assurances, activités avec acomptes clients."),
    qcm("af-c4-11", "BFR > 0, FRNG > BFR, TN > 0 (faible) :", ["Équilibre sain, idéal pour une entreprise industrielle", "Équilibre dangereux", "Crise de gestion", "Insuffisance de fonds de roulement"], "Situation 1."),
    qcm("af-c4-12", "BFR > 0, FRNG très inférieur au BFR, TN fortement négative :", ["Équilibre dangereux : risque de cessation de paiement si la banque refuse les découverts", "Équilibre sain", "Situation normale de la grande distribution", "Excédent de trésorerie à placer"], "Solutions : ↑ FR (capital, réserves, emprunt LT) et ↓ BFR (stocks, délais clients/fournisseurs)."),
    qcm("af-c4-13", "FRNG ≫ BFR, grosse TN positive :", ["Sain, mais il faut placer l'excédent (VMP, titres, investissements)", "Dangereux", "Crise de gestion", "Insuffisance de fonds de roulement"], "« Argent qui dort »."),
    qcm("af-c4-14", "Crise de gestion :", ["Le BFR croît plus vite que le FRNG et le CA → trésorerie négative ; il faut gérer stocks et délais", "Le FRNG se détériore brutalement par un investissement financé sur trésorerie", "Le BFR devient négatif", "La CAF devient négative"], "L'erreur financière, elle, est une détérioration du FRNG (restructurer par des crédits spécifiques)."),
    qcm("af-c4-15", "Durée du crédit clients =", ["Créances clients TTC / CA TTC × 360", "Créances clients HT / CA HT × 365", "Clients / achats × 360", "CA / clients"], "TTC sur TTC ; année de 360 jours."),
    qcm("af-c4-16", "Durée du crédit fournisseurs =", ["Dettes fournisseurs TTC / achats TTC × 360", "Fournisseurs / CA × 360", "Fournisseurs HT / achats HT × 365", "Achats / fournisseurs"], "Plus le délai fournisseurs est long, plus le BFR diminue."),
    qcm("af-c4-17", "Durée moyenne de stockage des marchandises =", ["Stock moyen / coût d'achat des marchandises vendues × 360", "Stock final / CA × 360", "Coût d'achat / stock moyen", "Stock moyen / ventes TTC × 360"], "Stock moyen = (SI + SF)/2 ; = 360 / coefficient de rotation."),
    qcm("af-c4-18", "Plus la durée du crédit clients est longue, plus la trésorerie de l'entreprise :", ["Est impactée négativement", "Bénéficie d'une souplesse", "Est inchangée", "Augmente"], "QCM du test 2011 : le BFR augmente, la TN baisse."),
    qcm("af-c4-19", "BFR en jours de CA =", ["BFR / CA HT × 360", "BFR × CA / 360", "CA / BFR", "BFR / CA TTC × 365"], "Permet de comparer d'une année à l'autre malgré la croissance."),
    qcm("af-c4-20", "BFR normatif : pour chaque poste, jours de CA =", ["Temps d'écoulement × coefficient de structure (flux de référence / CA HT)", "Poste / CA × 360", "Temps d'écoulement / coefficient", "Poste × 360"], "Emplois en +, ressources en − ; BFRE prévisionnel = total × CA prévu / 360."),
    qcm("af-c4-21", "Les réserves constituent :", ["Un élément des ressources stables", "Une créance sur les actionnaires", "De la trésorerie", "Un passif circulant"], "QCM du test 2011."),
    qcm("af-c4-22", "Autonomie financière (CP / dettes financières) < 1 :", ["Les banques financent plus que les associés : la capacité d'emprunt est limitée", "La liquidité est insuffisante", "Le FRNG est négatif", "L'entreprise est en perte"], "VELORAMA N : 494 / 500 = 0,99."),
]

ch5 = [
    red("af-c5-01", "Qu'est-ce que l'EBE ? Comment le calcule-t-on ? En quoi renseigne-t-il utilement sur la performance de l'entreprise ? (question du DS 2013)",
        ["Solde intermédiaire de gestion = VA + subventions d'exploitation − impôts et taxes − charges de personnel ; mesure la performance de l'exploitation indépendamment des choix d'investissement, de financement et fiscaux",
         "Résultat de l'exercice avant impôt ; mesure la rentabilité pour les associés",
         "VA − dotations aux amortissements ; mesure l'usure des équipements",
         "Produits encaissables − charges décaissables ; mesure la trésorerie disponible"],
        "**EBE (excédent brut d'exploitation)** = VA + subventions d'exploitation − impôts, taxes et versements assimilés − charges de personnel.\nC'est la ressource dégagée par l'exploitation **avant** dotations, charges financières, éléments exceptionnels et IS : performance « objective » du métier, comparable entre entreprises aux politiques d'investissement et de financement différentes. Point de départ de la CAF ; suivi par les banquiers (capacité à rembourser). Négatif : IBE."),
    red("af-c5-02", "Qu'est-ce que la capacité d'autofinancement ? Donnez les deux méthodes de calcul.",
        ["Ressource interne potentielle (produits encaissables − charges décaissables) ; soustractive depuis l'EBE, additive depuis le RN en neutralisant dotations, reprises et cessions",
         "Trésorerie de fin d'exercice ; elle se lit directement au bilan",
         "Résultat net après distribution des dividendes",
         "EBE − dotations aux amortissements ; une seule méthode"],
        "**CAF** = ressource interne potentielle dégagée par l'activité (produits encaissables − charges décaissables), qui sert à investir, rembourser et distribuer.\n• Soustractive : EBE + autres produits encaissables − autres charges décaissables + produits financiers − charges financières + produits exceptionnels − charges exceptionnelles − participation − IS.\n• Additive : RN + dotations − reprises + VNC des actifs cédés − produits de cession − QP des subventions d'investissement.\nLes deux donnent le même montant. Autofinancement = CAF − dividendes."),
    red("af-c5-03", "Qu'est-ce que le fonds de roulement net global ? Comment le calcule-t-on et comment l'interpréter ?",
        ["Ressources stables − emplois stables (= BFR + TN) ; positif, il montre que les investissements sont financés par des ressources stables et qu'il reste un matelas pour financer le BFR",
         "Actif circulant − dettes fournisseurs ; il mesure les stocks",
         "Disponibilités − découverts ; il mesure la trésorerie",
         "Capitaux propres − dettes ; il mesure l'endettement"],
        "**FRNG** = ressources stables (CP + amortissements et dépréciations + provisions + emprunts) − emplois stables (immobilisations brutes). Par le bas : BFR + TN.\nPositif : règle de l'équilibre financier minimum respectée, « matelas de sécurité » qui finance le cycle d'exploitation. Négatif : des immobilisations sont financées par du court terme (risqué pour une industrielle)."),
    red("af-c5-04", "Qu'est-ce que le besoin en fonds de roulement ? D'où vient-il ?",
        ["Besoin de financement né des décalages du cycle d'exploitation : stocks + créances − dettes d'exploitation (hors trésorerie)",
         "Le montant des emprunts nécessaires pour investir",
         "La différence entre CA et charges",
         "Le solde du compte banque"],
        "**BFR** = actif circulant hors trésorerie − passif circulant hors trésorerie (BFRE + BFRHE). Il vient du décalage entre décaissements (achats, stockage, production) et encaissements (règlements clients) : argent « gelé » dans le cycle. Il augmente avec l'activité, les stocks et le crédit clients ; il diminue avec le crédit fournisseurs."),
    red("af-c5-05", "Que se passe-t-il pour la trésorerie quand le BFR augmente plus vite que le FRNG ? Quelles solutions ?",
        ["La trésorerie nette baisse (TN = FRNG − BFR) et peut devenir négative ; il faut réduire le BFR (stocks, délais clients/fournisseurs) ou augmenter le FRNG (capital, réserves, emprunt LT)",
         "La trésorerie augmente car le BFR est une ressource",
         "Rien, la trésorerie ne dépend que du résultat",
         "Le FRNG diminue automatiquement"],
        "TN = FRNG − BFR : si le BFR croît plus vite, la TN se dégrade → **crise de gestion**, dépendance aux découverts (agios, risque de cessation de paiement).\nSolutions : ↓ BFR (mieux gérer les stocks, réduire le délai clients, escomptes, allonger le crédit fournisseurs) ; ↑ FRNG (augmentation de capital, mise en réserve des bénéfices, emprunt à long terme si peu endetté)."),
    red("af-c5-06", "Pourquoi retraite-t-on le bilan comptable en bilan fonctionnel ? Citez les principaux retraitements.",
        ["Pour classer les postes par fonction (investissement, financement, exploitation, trésorerie) ; valeurs brutes, amortissements et provisions en ressources stables, découverts en trésorerie passive",
         "Pour calculer l'impôt sur les sociétés",
         "Pour passer en valeurs de marché",
         "Pour présenter le bilan après répartition du résultat"],
        "Le bilan comptable (logique juridique, liquidité/exigibilité) est réorganisé selon les **fonctions** : investissement (emplois stables), financement (ressources stables), exploitation (actif et passif circulants), trésorerie.\nRetraitements : actif en **valeurs brutes** ; amortissements, dépréciations et provisions → **ressources stables** ; concours bancaires courants (et dettes financières CT) → **trésorerie passive** ; distinction exploitation / hors exploitation."),
    red("af-c5-07", "Quels changements le PCG 2025 apporte-t-il au compte de résultat ?",
        ["Le résultat exceptionnel est limité aux événements majeurs et inhabituels ; les cessions d'immobilisations corporelles/incorporelles passent en exploitation (657/757), les financières en financier (667/767)",
         "Les dotations aux amortissements passent en résultat financier",
         "Le résultat exceptionnel inclut désormais toutes les cessions",
         "Rien ne change pour le CR"],
        "Réforme au 1er janvier 2025 : nouvelle définition du **résultat exceptionnel** (événements majeurs et inhabituels, changements de méthode, amortissements dérogatoires, corrections d'erreurs) ; suppression des transferts de charges ; comptes **675/775 supprimés** → **657/757** (exploitation) et **667/767** (financier)."),
    red("af-c5-08", "Qu'est-ce que l'amortissement ? Quel est son double effet ?",
        ["Constatation de la perte de valeur irréversible d'une immobilisation (usure, obsolescence) ; c'est une charge (681) qui réduit le résultat et une diminution de l'actif (28)",
         "Le remboursement d'un emprunt ; il réduit la dette",
         "Une provision pour risque ; elle augmente le passif",
         "Une sortie de trésorerie annuelle"],
        "Amortissement = répartition systématique du montant amortissable d'un actif selon son utilisation (perte de valeur irréversible).\nDouble effet : **charge** de l'exercice (681, diminue le résultat et l'IS, sans décaissement) et **diminution de la valeur de l'actif** (28, actif soustractif ; VNC = VB − cumul)."),
    red("af-c5-09", "À quoi servent les SIG ? Pour qui ?",
        ["Décomposer le résultat en étapes pour isoler la performance commerciale, productive, économique et financière ; utiles aux dirigeants, banquiers, associés, analystes",
         "Juger l'équilibre financier du bilan",
         "Calculer le BFR",
         "Calculer l'impôt sur les sociétés"],
        "Le résultat net mélange activité, financement, exceptionnel et fiscalité. Les **SIG** le décomposent (MC, production, VA, EBE, RE, RCAI, R. exceptionnel, RN) pour voir où la performance se crée ou se dégrade, comparer dans le temps (N-1/N, % du CA) et avec le secteur, et calculer CAF et ratios.\nUtilisateurs : dirigeants, banquiers (EBE, CAF → capacité de remboursement), associés, analystes."),
    red("af-c5-10", "Commentez : CA +10 %, EBE +42 %, RN +230 %, mais résultat exceptionnel positif en N et charges de personnel = 75 % de la VA.",
        ["Activité et performance opérationnelle en nette progression (EBE) ; le RN est gonflé par un élément exceptionnel non reconductible ; structure de coûts lourde (personnel) qui laisse peu de marge",
         "L'entreprise est en difficulté car l'exceptionnel est positif",
         "La hausse du RN est entièrement durable",
         "Le personnel est trop peu payé"],
        "Méthode de commentaire (corrigés VELORAMA/PITAIN FLAM) : 1) constater (« vend plus et vend mieux ») ; 2) expliquer avec les chiffres (VA et EBE progressent plus vite que le CA car les charges de personnel augmentent moins vite) ; 3) nuancer (exceptionnel non reconductible : la hausse durable se lit sur l'EBE ; personnel = ¾ de la VA, peu de marge de sécurité)."),
]

ecrire("ch1-bilan-compte-de-resultat.json", "Bilan, compte de résultat, stocks, PCG", "cours", ch1)
ecrire("ch2-immobilisations.json", "Immobilisations : acquisition, amortissement, cession", "cours", ch2)
ecrire("ch3-sig-caf.json", "SIG, CAF et ratios d'activité", "cours", ch3)
ecrire("ch4-equilibre-financier.json", "Bilan fonctionnel, FRNG, BFR, TN", "cours", ch4)
ecrire("ch5-questions-a-rediger.json", "Questions de cours à rédiger (comme au DS)", "cours", ch5)

# =====================================================================================
# 2. EXERCICES : CLASSER
# =====================================================================================
CODES = ["AI", "AC", "CP", "D", "CE", "CF", "CEx", "PE", "PF", "PEx"]
AI, AC, CP, D, CE, CF, CEX, PE, PF, PEX = range(10)
postes = [  # (libellé, code, explication si piège)
    ("Matériel de manutention", AI, ""), ("Brevet", AI, "Immobilisation incorporelle."), ("Créances clients", AC, ""),
    ("Charges sociales", CE, ""), ("Dettes fournisseurs de biens et services", D, ""), ("Autres achats et charges externes", CE, ""),
    ("Terrain", AI, ""), ("Impôts et taxes", CE, ""), ("Matériel informatique", AI, ""), ("Mobilier", AI, ""),
    ("Emprunt auprès des établissements de crédit", D, "Compte 164 (classe 1) mais c'est une **dette**."),
    ("Stock de produits finis (31.12)", AC, "Le stock final est au bilan ; seule la variation va au CR."),
    ("Créances sur l'État", AC, ""), ("Dettes envers le personnel", D, ""), ("Caisse", AC, ""), ("Achats de matières premières", CE, ""),
    ("Dettes fournisseurs d'immobilisations", D, ""), ("Capital social", CP, ""), ("Dettes fiscales", D, ""),
    ("Production vendue (ventes de produits finis)", PE, ""), ("Production stockée", PE, "Variation de stock de PF : produit d'exploitation."),
    ("Prestations de services", PE, ""), ("Constructions", AI, ""), ("Variation de stock de matières premières", CE, "Variation SI − SF des achats : charge d'exploitation (même négative)."),
    ("Marque", AI, ""), ("Services extérieurs", CE, ""), ("Matériel de transport", AI, ""), ("Salaires", CE, ""),
    ("Intérêts versés sur l'emprunt", CF, ""), ("Banque (solde débiteur)", AC, ""), ("Fonds de commerce", AI, ""),
    ("Amendes et pénalités fiscales", CEX, "Classées en exceptionnel dans le corrigé VITAMINES."),
    ("Valeurs comptables des immobilisations corporelles cédées (657)", CE, "PCG 2025 : exploitation (plus en exceptionnel)."),
    ("Produits des cessions d'immobilisations corporelles (757)", PE, "PCG 2025 : exploitation."),
    ("Concours bancaires courants (découvert)", D, "Au passif ; ne se compense pas avec une banque positive."),
    ("Achats de marchandises", CE, ""), ("Ventes de marchandises", PE, ""), ("Dotations aux amortissements sur matériels", CE, ""),
    ("Intérêts reçus (placements)", PF, ""), ("Résultat de l'exercice (bénéfice)", CP, ""), ("Réserves", CP, ""),
    ("Report à nouveau", CP, ""), ("Subventions d'exploitation reçues", PE, ""), ("Stock de marchandises (31.12)", AC, ""),
    ("Produits des cessions de titres de participation (767)", PF, "PCG 2025 : immobilisation **financière** → financier."),
    ("Indemnité reçue suite à un sinistre majeur", PEX, "Événement majeur et inhabituel : reste en exceptionnel."),
    ("Escomptes accordés aux clients", CF, "Compte 665 : charge financière."),
    ("Immobilisations financières (titres de participation)", AI, ""),
]
random.seed(11)
melange = postes[:]
random.shuffle(melange)
ex1 = []
for i in range(0, len(melange), 8):
    lot = melange[i:i + 8]
    if len(lot) < 5:
        continue
    ex1.append({"id": f"af-x1-{i // 8 + 1:02d}", "type": "classer", "difficulte": 2,
                "enonce": "Classez chaque information avec les codes du cours : **Bilan** AI (actif immobilisé), AC (actif circulant), CP (capitaux propres), D (dettes) ; **CR** CE/CF/CEx (charges d'exploitation, financières, exceptionnelles), PE/PF/PEx (produits).",
                "categories": CODES,
                "elements": [{"texte": t, "reponse": r, **({"explication": e} if e else {})} for t, r, e in lot],
                "explication": "Méthode des cas BELLESSENCE et VITAMINES. Classes 1-5 au bilan, 6-7 au CR ; PCG 2025 pour les cessions.",
                "source": SRC + " (cas BELLESSENCE, VITAMINES)"})

CAT_SIG = ["Marge commerciale", "Production", "Consommations (VA)", "Entre VA et EBE", "Entre EBE et RE", "Résultat financier", "Résultat exceptionnel", "Après RCAI (IS, participation)"]
lignes_sig = [
    ("Ventes de marchandises (707)", 0, ""), ("Variation de stock de marchandises (6037)", 0, "Coût d'achat des marchandises vendues = 607 + 6037."),
    ("Production stockée (713)", 1, ""), ("Production immobilisée (72)", 1, ""), ("Prestations de services (706)", 1, "Production vendue de services."),
    ("Variation de stock de matières premières (6031)", 2, ""), ("Frais de publicité", 2, "Autre charge externe → consommation."),
    ("Frais d'énergie", 2, ""), ("Sous-traitance / locations / honoraires (61/62)", 2, ""),
    ("Subventions d'exploitation (74)", 3, ""), ("Impôts et taxes (63)", 3, ""), ("Charges sociales (645)", 3, ""),
    ("Dotations aux amortissements (681)", 4, ""), ("Reprises sur dépréciations (781)", 4, ""),
    ("Produits de cession d'un véhicule (757)", 4, "PCG 2025 : exploitation."), ("Valeur comptable d'une machine cédée (657)", 4, "PCG 2025."),
    ("Autres charges de gestion courante (65)", 4, ""), ("Quote-part de subvention d'investissement virée au résultat (747)", 4, ""),
    ("Intérêts d'emprunt (66)", 5, ""), ("Produits de cession de titres de participation (767)", 5, "Immobilisation financière."),
    ("Dotations financières aux provisions (686)", 5, ""), ("Perte due à un sinistre majeur non assuré (67)", 6, ""),
    ("Impôt sur les bénéfices (695)", 7, ""), ("Participation des salariés (691)", 7, ""),
    ("Achats de matières premières (601)", 2, ""), ("Achats de marchandises (607)", 0, ""),
]
random.seed(12)
random.shuffle(lignes_sig)
ex2 = []
for i in range(0, len(lignes_sig), 8):
    lot = lignes_sig[i:i + 8]
    ex2.append({"id": f"af-x2-{i // 8 + 1:02d}", "type": "classer", "difficulte": 2,
                "enonce": "Dans le tableau des SIG, **où intervient** chaque ligne du compte de résultat ?",
                "categories": CAT_SIG,
                "elements": [{"texte": t, "reponse": r, **({"explication": e} if e else {})} for t, r, e in lot],
                "explication": "MC → Production → VA (− consommations) → EBE (+ subventions − impôts − personnel) → RE (± reprises, dotations, autres, cessions 657/757) → financier → exceptionnel → IS/participation.",
                "source": SRC})
CAF2 = ["Inclus dans la CAF", "Exclu de la CAF"]
lignes_caf = [
    ("Dotations aux amortissements (681)", 1, "Charge calculée."), ("Reprises sur provisions (781)", 1, "Produit calculé."),
    ("Produits de cession d'immobilisations (757)", 1, "Opération de cession."), ("Valeur comptable des immobilisations cédées (657)", 1, ""),
    ("Quote-part des subventions d'investissement virée au résultat (747)", 1, ""), ("Intérêts d'emprunt (66)", 0, "Décaissé."),
    ("Impôt sur les bénéfices", 0, ""), ("Autres produits de gestion courante (75)", 0, ""), ("Charges exceptionnelles (67)", 0, "Décaissées."),
    ("Dotations financières (686)", 1, ""), ("Produits financiers : intérêts reçus (76)", 0, ""), ("Produits de cession de titres (767)", 1, ""),
    ("Participation des salariés", 0, ""), ("Subvention d'exploitation (74)", 0, "Déjà dans l'EBE."),
]
ex2.append({"id": "af-x2-10", "type": "classer", "difficulte": 2, "enonce": "Pour chaque élément : est-il **pris en compte** dans la CAF ou **exclu** ?",
            "categories": CAF2, "elements": [{"texte": t, "reponse": r, **({"explication": e} if e else {})} for t, r, e in lignes_caf],
            "explication": "Exclus : éléments calculés (68x, 78x, 747) et cessions (657/667, 757/767).", "source": SRC})

CAT_BF = ["Emplois stables", "Ressources stables", "Actif circ. exploitation", "Actif circ. hors expl.", "Passif circ. exploitation", "Passif circ. hors expl.", "Trésorerie active", "Trésorerie passive"]
lignes_bf = [
    ("Immobilisations corporelles (valeur brute)", 0, ""), ("Amortissements des immobilisations", 1, "Retirés de l'actif et ajoutés aux ressources stables."),
    ("Dépréciations des créances clients", 1, "Même traitement que les amortissements."), ("Capital", 1, ""), ("Résultat de l'exercice", 1, "Bilan avant répartition."),
    ("Subventions d'investissement", 1, ""), ("Provisions pour risques et charges", 1, ""), ("Emprunts bancaires (> 1 an)", 1, ""),
    ("Stocks de marchandises", 2, ""), ("Clients (valeur brute)", 2, ""), ("Charges constatées d'avance", 2, ""),
    ("Créances diverses (hors exploitation)", 3, ""), ("Fournisseurs", 4, ""), ("Dettes fiscales et sociales", 4, ""),
    ("Dettes sur immobilisations", 5, "Hors exploitation."), ("Impôt sur les bénéfices à payer", 5, "Hors exploitation."),
    ("Disponibilités (banque, caisse)", 6, ""), ("Valeurs mobilières de placement", 6, ""), ("Concours bancaires courants", 7, ""),
    ("Part à moins d'un an de l'emprunt (si isolée, cas NOÉ)", 7, "Dans le corrigé NOÉ, l'emprunt à moins d'un an est en trésorerie passive."),
    ("Immobilisations financières (valeur brute)", 0, ""), ("Réserves", 1, ""),
]
random.seed(13)
random.shuffle(lignes_bf)
ex3 = []
for i in range(0, len(lignes_bf), 8):
    lot = lignes_bf[i:i + 8]
    ex3.append({"id": f"af-x3-{i // 8 + 1:02d}", "type": "classer", "difficulte": 2,
                "enonce": "Où se place chaque poste dans le **bilan fonctionnel** ?",
                "categories": CAT_BF, "elements": [{"texte": t, "reponse": r, **({"explication": e} if e else {})} for t, r, e in lot],
                "explication": "Valeurs brutes ; amortissements, dépréciations, provisions → ressources stables ; découverts → trésorerie passive ; dettes sur immos et IS → hors exploitation.",
                "source": SRC + " (cas VELORAMA, PITAIN FLAM)"})

ecrire("ex1-classer-bilan-cr.json", "Classer : bilan ou CR, quel bloc (AI, AC, CP, D, CE…)", "exercices", ex1)
ecrire("ex2-classer-sig-caf.json", "Classer : place dans les SIG, dans ou hors CAF", "exercices", ex2)
ecrire("ex3-classer-bilan-fonctionnel.json", "Classer : postes du bilan fonctionnel", "exercices", ex3)

# =====================================================================================
# 3. EXERCICES : CALCULS EXPRESS (variations de stocks, amortissements, cession)
# =====================================================================================
rnd = random.Random(21)
ex4 = []
for k in range(8):
    si, sf = rnd.choice(range(10, 60, 5)) * 100, rnd.choice(range(10, 60, 5)) * 100
    achats = rnd.choice(range(40, 120, 5)) * 1000
    sipf, sfpf = rnd.choice(range(20, 60, 5)) * 100, rnd.choice(range(20, 60, 5)) * 100
    ex4.append({"id": f"af-x4-{k + 1:02d}", "type": "tableau", "difficulte": 1,
                "enonce": f"Achats de matières premières : {fm(achats)} €. Stock de MP : SI = {fm(si)} €, SF = {fm(sf)} €. Stock de produits finis : SI = {fm(sipf)} €, SF = {fm(sfpf)} €.",
                "colonnes": ["€"], "lignes": [
                    L("Variation de stock de MP (en charges)", si - sf, aide=f"SI − SF = {si} − {sf}"),
                    L("Consommation de MP", achats + si - sf, aide="Achats + (SI − SF)"),
                    L("Production stockée (en produits)", sfpf - sipf, aide=f"SF − SI = {sfpf} − {sipf} (sens inverse !)")],
                "explication": "Achats : SI − SF. Produits finis : SF − SI.", "source": SRC})
ecrire("ex4-variations-de-stocks.json", "Calculs express : variations de stocks", "exercices", ex4)


def jours_fin(jour, mois):  # de la mise en service au 31.12 (convention 30/360 du cours)
    return (12 - mois) * 30 + 15 if jour == 15 else (13 - mois) * 30


MOIS = ["", "janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"]


def amortissement_lineaire(rnd, id, nom):
    annuite = rnd.choice([2400, 4800, 6000, 7200, 9600, 12000, 24000])
    n = rnd.choice([4, 5, 8, 10])
    vb = annuite * n
    jour, mois = rnd.choice([1, 15]), rnd.choice(range(2, 12))
    j1 = jours_fin(jour, mois)
    d1 = annuite * j1 // 360
    assert annuite * j1 % 360 == 0
    ces_mois = rnd.choice(range(2, 12))
    ces_annee = rnd.choice(range(2, min(n, 5)))  # N+ces_annee
    jc = (ces_mois - 1) * 30
    dc = annuite * jc // 360
    lignes, cumul = [], 0
    for a in range(ces_annee + 1):
        dot = d1 if a == 0 else (dc if a == ces_annee else annuite)
        cumul += dot
        lignes.append(L(f"N{'+' + str(a) if a else ''}" + (f" (jusqu'au 01.{ces_mois:02d})" if a == ces_annee else ""), vb, dot, cumul, vb - cumul,
                        aide=f"{vb} × 1/{n} × {j1 if a == 0 else (jc if a == ces_annee else 360)}/360" + (" (prorata depuis la mise en service)" if a == 0 else " (dotation complémentaire jusqu'à la cession)" if a == ces_annee else "")))
    for l in lignes:
        l["valeurs"][0] = vb
    prix = rnd.choice(range(2, 9)) * vb // 10
    vnc = vb - cumul
    tva = prix // 5
    date_ms = f"{jour:02d}.{mois:02d}.N"
    return {"id": id, "type": "probleme", "difficulte": 3,
            "enonce": f"**{nom}** (clôture au 31.12, TVA 20 %, PCG 2025). Matériel industriel acquis {fm(vb)} € HT, **mis en service le {date_ms}**, amorti en **linéaire sur {n} ans**. Il est **cédé le 01.{ces_mois:02d}.N+{ces_annee}** pour {fm(prix)} € HT (chèque).",
            "etapes": [
                num("Taux d'amortissement linéaire (en %) :", 100 / n, f"1/{n}", unite="%"),
                num(f"Prorata temporis de la 1re année (nombre de jours sur 360) :", j1, f"Du {date_ms} au 31.12 : {j1} jours (mois de 30 jours).", unite="jours"),
                tab("Plan d'amortissement jusqu'à la date de cession :", ["Base", "Dotation", "Cumul", "VNC fin"], lignes, "Exercice",
                    "Dotation = VB × 1/n × jours/360 ; cumul = Σ dotations ; VNC = VB − cumul."),
                num("Valeur comptable de l'immobilisation cédée (compte 657) :", vnc, f"{vb} − {cumul}", unite="€"),
                num("Résultat de cession (positif = plus-value, négatif = moins-value) :", prix - vnc, f"757 − 657 = {prix} − {vnc}", unite="€"),
                classer_etape(f"Écritures du 01.{ces_mois:02d}.N+{ces_annee} : chaque montant est-il au **débit** ou au **crédit** ?", ["Débit", "Crédit"], [
                    (f"512 Banque {fm(prix + tva)} €", 0, "Encaissement TTC."),
                    (f"757 Produits des cessions {fm(prix)} €", 1, "Produit HT."),
                    (f"44571 TVA collectée {fm(tva)} €", 1, ""),
                    (f"681 Dotation complémentaire {fm(dc)} €", 0, "Charge."),
                    (f"2815 Amortissement (dotation complémentaire) {fm(dc)} €", 1, ""),
                    (f"657 Valeur comptable cédée {fm(vnc)} €", 0, ""),
                    (f"2815 Amortissements cumulés {fm(cumul)} €", 0, "On solde le compte d'amortissement."),
                    (f"215 Matériel industriel {fm(vb)} €", 1, "On sort la valeur brute."),
                ])],
            "explication": "Méthode VALIANT : frise, dotations, dotation complémentaire, VNC (657), résultat = 757 − 657, puis 3 écritures (cession, complément, sortie).",
            "source": SRC + " (cas VALIANT)"}


ex5 = [amortissement_lineaire(rnd, f"af-x5-{k + 1:02d}", f"Variante {k + 1}") for k in range(8)]
# Le cas VALIANT lui-même
ex5.insert(0, {"id": "af-x5-valiant", "type": "probleme", "difficulte": 3,
               "enonce": "**Cas VALIANT** (PCG 2025, clôture 31.12, TVA 20 %). Matériel industriel 100 000 € HT acquis le 07.08.N-3, **mis en service le 15.08.N-3**, linéaire **4 ans**. Cédé le **01.04.N** pour 25 000 € HT.",
               "etapes": [
                   tab("Dotations aux amortissements :", ["Dotation", "Cumul"], [
                       L("N-3 (15.08 → 31.12)", 9375, 9375, aide="100 000 × 1/4 × 135/360"),
                       L("N-2", 25000, 34375, aide="100 000 × 1/4"),
                       L("N-1", 25000, 59375),
                       L("N (01.01 → 01.04)", 6250, 65625, aide="100 000 × 1/4 × 90/360")], "Exercice"),
                   num("VNC à la date de cession (657) :", 34375, "100 000 − 65 625", unite="€"),
                   num("Résultat de cession :", -9375, "25 000 − 34 375 : moins-value (« vente à perte »).", unite="€")],
               "explication": "Prorata depuis la **mise en service** (15.08), pas l'acquisition (07.08).", "source": SRC + " (cas VALIANT)"})
# Dégressif
deg = []
for k, (vb, n, mois) in enumerate([(120000, 5, 2), (80000, 4, 4), (200000, 10, 7)]):
    coef = 1.25 if n <= 4 else 1.75 if n <= 6 else 2.25
    t = round(100 / n * coef, 2)
    lignes, vnc = [], vb
    restant = n
    lin = False
    for a in range(n):
        tl = 100 / restant
        if not lin and tl > t:
            lin = True
            dot_lin = vnc / restant
        if lin:
            dot = dot_lin
        else:
            dot = vnc * t / 100 * ((13 - mois) / 12 if a == 0 else 1)
        dot = round(dot, 2)
        lignes.append(L(f"N{'+' + str(a) if a else ''}", round(vnc, 2), dot, round(vnc - dot, 2), ecart=1,
                        aide=("VO × taux × " + f"{13 - mois}/12" if a == 0 else ("VNC restante / années restantes (bascule en linéaire)" if lin else "VNC début × taux"))))
        vnc -= dot
        restant -= 1
    deg.append({"id": f"af-x5-deg{k + 1}", "type": "probleme", "difficulte": 3,
                "enonce": f"Matériel industriel neuf {fm(vb)} € HT acquis le 15.{mois:02d}.N, amortissement **dégressif** sur {n} ans. (Calculatrice utile ; écart de 1 € toléré.)",
                "etapes": [num("Taux dégressif (en %) :", t, f"1/{n} × {coef}", unite="%"),
                           num("Prorata de la 1re année (en mois) :", 13 - mois, "Du 1er jour du mois d'acquisition au 31.12.", unite="mois"),
                           tab("Plan d'amortissement dégressif :", ["VNC début", "Dotation", "VNC fin"], lignes, "Exercice",
                               "Bascule en linéaire dès que 1/(années restantes) > taux dégressif.")],
                "explication": "Coefficients : 1,25 (3-4 ans), 1,75 (5-6 ans), 2,25 (> 6 ans).", "source": SRC})
ecrire("ex5-amortissements-cessions.json", "Amortissement linéaire + cession (VALIANT et variantes), dégressif", "exercices", ex5 + deg)

# =====================================================================================
# 4. CAS DES TD : TABLEAUX À REMPLIR (SIG, CAF, BILAN FONCTIONNEL)
# =====================================================================================

def cr_vers_sig(c):
    """c : dict des comptes → dict des soldes"""
    s = {}
    s["CA"] = c["707"] + c["701"] + c["706"]
    s["cout"] = c["607"] + c["6037"]
    s["MC"] = c["707"] - s["cout"]
    s["prod"] = c["701"] + c["706"] + c["713"] + c["72"]
    s["conso"] = c["601"] + c["6031"] + c["61/62"]
    s["VA"] = s["MC"] + s["prod"] - s["conso"]
    s["perso"] = c["641"] + c["645"]
    s["EBE"] = s["VA"] + c["74"] - c["63"] - s["perso"]
    s["plus"] = c["781"] + c["75"] + c["747"] + c["757"]
    s["moins"] = c["681"] + c["65"] + c["657"]
    s["RE"] = s["EBE"] + s["plus"] - s["moins"]
    s["RF"] = c["76"] + c["786"] + c["767"] - c["66"] - c["686"] - c["667"]
    s["RCAI"] = s["RE"] + s["RF"]
    s["REX"] = c["77"] - c["67"]
    s["RN"] = s["RCAI"] + s["REX"] - c["691"] - c["695"]
    s["CAF"] = s["EBE"] + c["75"] - c["65"] + c["76"] - c["66"] + c["77"] - c["67"] - c["691"] - c["695"]
    caf_add = s["RN"] + c["681"] + c["686"] - c["781"] - c["786"] + c["657"] + c["667"] - c["757"] - c["767"] - c["747"]
    assert caf_add == s["CAF"], (caf_add, s["CAF"])
    return s


LIBELLES = [  # compte, libellé, côté
    ("707", "Ventes de marchandises", "P"), ("701", "Production vendue — biens", "P"), ("706", "Production vendue — services", "P"),
    ("713", "Production stockée (SF − SI)", "P"), ("72", "Production immobilisée", "P"), ("74", "Subventions d'exploitation", "P"),
    ("747", "Quote-part des subventions d'investissement virée au résultat", "P"), ("781", "Reprises sur amortissements, dépréciations et provisions", "P"),
    ("75", "Autres produits de gestion courante", "P"), ("757", "Produits des cessions d'immobilisations corporelles", "P"),
    ("76", "Produits financiers (intérêts reçus)", "PF"), ("767", "Produits des cessions d'immobilisations financières", "PF"), ("786", "Reprises financières", "PF"),
    ("77", "Produits exceptionnels", "PX"),
    ("607", "Achats de marchandises", "C"), ("6037", "Variation des stocks de marchandises (SI − SF)", "C"), ("601", "Achats de matières premières", "C"),
    ("6031", "Variation des stocks de matières premières (SI − SF)", "C"), ("61/62", "Autres achats et charges externes", "C"),
    ("63", "Impôts, taxes et versements assimilés", "C"), ("641", "Salaires et traitements", "C"), ("645", "Charges sociales", "C"),
    ("681", "Dotations aux amortissements, dépréciations et provisions", "C"), ("65", "Autres charges de gestion courante", "C"),
    ("657", "Valeurs comptables des immobilisations corporelles cédées", "C"),
    ("66", "Charges d'intérêts", "CF"), ("667", "Valeurs comptables des immobilisations financières cédées", "CF"), ("686", "Dotations financières", "CF"),
    ("67", "Charges exceptionnelles", "CX"), ("691", "Participation des salariés", "CI"), ("695", "Impôt sur les bénéfices", "CI"),
]


def annexe_cr(comptes_par_col, colonnes, titre, detail_externes=None):
    """CR « en liste » comme au DS : produits puis charges, avec sous-totaux."""
    lignes = []
    blocs = [("PRODUITS D'EXPLOITATION", "P"), ("PRODUITS FINANCIERS", "PF"), ("PRODUITS EXCEPTIONNELS", "PX"),
             ("CHARGES D'EXPLOITATION", "C"), ("CHARGES FINANCIÈRES", "CF"), ("CHARGES EXCEPTIONNELLES", "CX"), ("IMPÔT ET PARTICIPATION", "CI")]
    for titre_bloc, cote in blocs:
        lignes.append(titre_bloc)
        for compte, lib, c in LIBELLES:
            if c != cote:
                continue
            if compte == "61/62" and detail_externes:
                for lib2, vals in detail_externes:
                    lignes.append([lib2, *vals])
                continue
            vals = [cc[compte] for cc in comptes_par_col]
            if all(v == 0 for v in vals):
                continue
            lignes.append([f"{lib} ({compte})", *vals])
    tp = [sum(cc[k] for k, _, c in LIBELLES if c in ("P", "PF", "PX")) for cc in comptes_par_col]
    tc = [sum(cc[k] for k, _, c in LIBELLES if c in ("C", "CF", "CX", "CI")) for cc in comptes_par_col]
    lignes += [["**Total des produits**", *tp], ["**Total des charges**", *tc], ["**Résultat net de l'exercice**", *[p - c for p, c in zip(tp, tc)]]]
    return {"titre": titre, "colonnes": colonnes, "lignes": lignes}


def lignes_sig(ss, avec_pv=False):
    v = lambda k: [s[k] for s in ss]
    return [
        L("Ventes de marchandises", *v_(ss, lambda s, c: c["707"]), aide="707"),
        L("− Coût d'achat des marchandises vendues", *v("cout"), aide="Achats de marchandises + variation de stock (SI − SF)"),
        L("= Marge commerciale", *v("MC"), total=True),
        L("Production de l'exercice", *v("prod"), aide="Production vendue (biens + services) + production stockée + production immobilisée"),
        L("− Consommations en provenance des tiers", *v("conso"), aide="Achats de MP + variation de stock de MP + autres achats et charges externes"),
        L("= Valeur ajoutée", *v("VA"), total=True, aide="MC + production − consommations"),
        L("+ Subventions d'exploitation − impôts et taxes − charges de personnel", *[s["EBE"] - s["VA"] for s in ss], aide="74 − 63 − (641 + 645) : saisir le montant net (souvent négatif)"),
        L("= Excédent brut d'exploitation", *v("EBE"), total=True),
        L("+ Reprises et autres produits (781, 75, 747, 757)", *v("plus")),
        L("− Dotations et autres charges (681, 65, 657)", *v("moins")),
        L("= Résultat d'exploitation", *v("RE"), total=True),
        L("± Résultat financier", *v("RF"), aide="(76 + 786 + 767) − (66 + 686 + 667)"),
        L("= Résultat courant avant impôts", *v("RCAI"), total=True),
        L("± Résultat exceptionnel", *v("REX"), aide="77 − 67"),
        L("= Résultat net", *v("RN"), total=True, aide="RCAI + R. exceptionnel − participation − IS ; vérifier : total produits − total charges"),
    ]


def v_(ss, f):
    return [f(s, s["_c"]) for s in ss]


def lignes_caf_soustr(ss):
    g = lambda f: [f(s["_c"]) for s in ss]
    return [
        L("Excédent brut d'exploitation", *[s["EBE"] for s in ss]),
        L("+ Autres produits (75) − autres charges (65)", *g(lambda c: c["75"] - c["65"]), aide="Sans 757 ni 657"),
        L("+ Produits financiers encaissables (76) − charges d'intérêts (66)", *g(lambda c: c["76"] - c["66"]), aide="Sans 767/667, 786/686"),
        L("+ Produits exceptionnels (77) − charges exceptionnelles (67)", *g(lambda c: c["77"] - c["67"])),
        L("− Participation − impôt sur les bénéfices", *g(lambda c: -(c["691"] + c["695"]))),
        L("= Capacité d'autofinancement", *[s["CAF"] for s in ss], total=True),
    ]


def lignes_caf_add(ss):
    g = lambda f: [f(s["_c"]) for s in ss]
    return [
        L("Résultat net", *[s["RN"] for s in ss]),
        L("+ Dotations (681 + 686)", *g(lambda c: c["681"] + c["686"])),
        L("− Reprises (781 + 786)", *g(lambda c: -(c["781"] + c["786"])), aide="Saisir avec le signe −"),
        L("+ Valeurs comptables des actifs cédés (657 + 667)", *g(lambda c: c["657"] + c["667"])),
        L("− Produits des cessions (757 + 767)", *g(lambda c: -(c["757"] + c["767"])), aide="Saisir avec le signe −"),
        L("− Quote-part des subventions d'investissement (747)", *g(lambda c: -c["747"]), aide="Saisir avec le signe −"),
        L("= Capacité d'autofinancement", *[s["CAF"] for s in ss], total=True),
    ]


def comptes(**kw):
    c = {k: 0 for k, _, _ in LIBELLES}
    c.update({k.replace("_", "/") if k == "61_62" else k.lstrip("c"): v for k, v in kw.items()})
    return c


def C(d):
    c = {k: 0 for k, _, _ in LIBELLES}
    c.update(d)
    return c


velo = [C({"707": 1150, "701": 620, "706": 180, "713": -15, "72": 25, "74": 10, "747": 6, "781": 12, "75": 3, "757": 20,
           "607": 780, "6037": 15, "601": 240, "6031": -5, "61/62": 290, "63": 38, "641": 360, "645": 150, "681": 85, "65": 5, "657": 12,
           "76": 4, "66": 22, "67": 6, "695": 4}),
        C({"707": 1240, "701": 700, "706": 210, "713": 20, "72": 0, "74": 0, "747": 6, "781": 18, "75": 4, "757": 0,
           "607": 830, "6037": -10, "601": 275, "6031": 8, "61/62": 320, "63": 42, "641": 395, "645": 165, "681": 95, "65": 6, "657": 0,
           "76": 3, "767": 30, "66": 25, "667": 26, "686": 5, "77": 8, "695": 14})]
pitain = [C({"707": 165, "701": 1390, "706": 880, "713": 12, "72": 20, "74": 8, "747": 5, "781": 10, "75": 2, "757": 24,
             "607": 100, "6037": 3, "601": 720, "6031": -6, "61/62": 530, "63": 48, "641": 640, "645": 262, "681": 125, "65": 6, "657": 15,
             "76": 2, "66": 27, "67": 9, "695": 10}),
          C({"707": 180, "701": 1535, "706": 930, "713": -8, "72": 0, "74": 0, "747": 5, "781": 14, "75": 3, "757": 0,
             "607": 108, "6037": -2, "601": 765, "6031": 5, "61/62": 548, "63": 52, "641": 675, "645": 275, "681": 138, "65": 7, "657": 0,
             "76": 2, "767": 22, "66": 31, "667": 18, "686": 4, "77": 6, "695": 16})]
noe = [C({"707": 1800000, "701": 3001000, "706": 40000, "713": 16000, "74": 20000, "75": 14000,
          "607": 1200000, "6037": -120000, "601": 1600000, "6031": -50000, "61/62": 224000, "63": 100000, "641": 900000, "645": 400000,
          "681": 178000, "65": 108000, "76": 10000, "66": 20000, "77": 12000, "67": 18000, "691": 4000, "695": 32000}),
       C({"707": 1700000, "701": 3198000, "706": 44000, "713": -2000, "781": 2000, "75": 16000,
          "607": 900000, "6037": 80000, "601": 1640000, "6031": 4000, "61/62": 248200, "63": 104000, "641": 930000, "645": 420000,
          "681": 200000, "65": 120000, "76": 11000, "66": 16000, "77": 20000, "67": 34000, "691": 3600, "695": 30000})]

attendus = {"VELORAMA": (13, 43, 72, 115), "PITAIN FLAM": (29, 49, 130, 168), "NOÉ": (299000, 259200, 477000, 457200)}
ex6 = []
for nom, cc, unite, cols, fic in [("VELORAMA", velo, "k€", ["N-1", "N"], "AF Cas VELORAMA (SUJET)"),
                                  ("PITAIN FLAM", pitain, "k€", ["N-1", "N"], "AF Cas PITAIN FLAM"),
                                  ("NOÉ", noe, "€", ["N", "N+1"], "AF Cas NOE (SUJET)")]:
    ss = []
    for c in cc:
        s = cr_vers_sig(c)
        s["_c"] = c
        ss.append(s)
    a = attendus[nom]
    assert (ss[0]["RN"], ss[1]["RN"], ss[0]["CAF"], ss[1]["CAF"]) == a, (nom, ss[0]["RN"], ss[1]["RN"], ss[0]["CAF"], ss[1]["CAF"])
    ext = None
    if nom == "NOÉ":
        ext = [("Frais d'énergie", [1000, 1000]), ("Frais de téléphone", [3000, 3200]), ("Frais de publicité", [20000, 24000]),
               ("Autres achats et charges externes", [200000, 220000])]
    annexe = annexe_cr(cc, cols, f"Compte de résultat (en {unite})", ext)
    ca = [s["CA"] for s in ss]
    ex6.append({"id": f"af-x6-{nom.split()[0].lower().replace('é', 'e')}", "type": "probleme", "difficulte": 3,
                "enonce": f"**Cas {nom}** (PCG 2025, montants en {unite}). À partir du compte de résultat ci-dessous, présentez les SIG puis la CAF par les deux méthodes. Les saisies négatives se tapent avec un « - ».",
                "donnees": [annexe],
                "etapes": [
                    num(f"Chiffre d'affaires de {cols[1]} :", ca[1], "707 + 701 + 706 (sans production stockée ni immobilisée)", unite=unite),
                    tab("Tableau des soldes intermédiaires de gestion :", cols, lignes_sig(ss), f"SIG ({unite})"),
                    tab("CAF — méthode soustractive (à partir de l'EBE) :", cols, lignes_caf_soustr(ss), f"CAF ({unite})"),
                    tab("CAF — méthode additive (à partir du résultat net), pour vérifier :", cols, lignes_caf_add(ss), f"CAF ({unite})"),
                ],
                "explication": "Les deux méthodes donnent la même CAF. Piège PCG 2025 : 757/657 en exploitation, 767/667 en financier.",
                "source": f"{SRC}/0 - RAW/Cas pratiques ({fic})"})


def bilan_fonctionnel(nom, cols, unite, actif, passif, fonct, attendu, fic):
    """actif/passif : lignes d'annexe ; fonct : dict de listes par agrégat."""
    f = fonct
    tot_e = [a + b + c + d for a, b, c, d in zip(f["ES"], f["ACE"], f["ACHE"], f["TA"])]
    tot_r = [a + b + c + d for a, b, c, d in zip(f["RS"], f["PCE"], f["PCHE"], f["TP"])]
    assert tot_e == tot_r, (nom, tot_e, tot_r)
    frng = [r - e for r, e in zip(f["RS"], f["ES"])]
    bfre = [a - p for a, p in zip(f["ACE"], f["PCE"])]
    bfrhe = [a - p for a, p in zip(f["ACHE"], f["PCHE"])]
    bfr = [a + b for a, b in zip(bfre, bfrhe)]
    tn = [a - p for a, p in zip(f["TA"], f["TP"])]
    assert all(t == fr - b for t, fr, b in zip(tn, frng, bfr))
    assert (frng, bfr, tn) == attendu, (nom, frng, bfr, tn)
    return {"id": f"af-x7-{nom.split()[0].lower().replace('é', 'e')}", "type": "probleme", "difficulte": 3,
            "enonce": f"**Cas {nom}** : bilans au 31 décembre (avant répartition, en {unite}). Établissez les bilans fonctionnels condensés, puis FRNG, BFR et TN.",
            "donnees": [{"titre": "Actif", "colonnes": [f"Brut {c}" if i % 3 == 0 else (f"A&D {c}" if i % 3 == 1 else f"Net {c}") for c in cols for i in range(3)] if actif and len(actif[1]) > 3 else cols, "lignes": actif},
                        {"titre": "Passif", "colonnes": cols, "lignes": passif}],
            "etapes": [
                tab("Bilan fonctionnel condensé (valeurs brutes) :", cols, [
                    T("Emplois"),
                    L("Emplois stables (immobilisations brutes)", *f["ES"]),
                    L("Actif circulant d'exploitation (brut)", *f["ACE"], aide="Stocks + clients bruts + autres créances d'exploitation (+ CCA)"),
                    L("Actif circulant hors exploitation", *f["ACHE"]),
                    L("Trésorerie active", *f["TA"]),
                    L("Total des emplois", *tot_e, total=True),
                    T("Ressources"),
                    L("Ressources stables", *f["RS"], aide="Capitaux propres + amortissements et dépréciations + provisions + emprunts (> 1 an)"),
                    L("Passif circulant d'exploitation", *f["PCE"], aide="Fournisseurs + dettes fiscales et sociales"),
                    L("Passif circulant hors exploitation", *f["PCHE"], aide="Dettes sur immobilisations, IS à payer"),
                    L("Trésorerie passive", *f["TP"], aide="Concours bancaires courants (+ dettes financières à moins d'un an si isolées)"),
                    L("Total des ressources", *tot_r, total=True)], f"Bilan fonctionnel ({unite})"),
                tab("Indicateurs de l'équilibre financier :", cols, [
                    L("FRNG", *frng, aide="Ressources stables − emplois stables"),
                    L("BFR d'exploitation", *bfre, aide="ACE − PCE"),
                    L("BFR hors exploitation", *bfrhe, aide="ACHE − PCHE"),
                    L("BFR global", *bfr),
                    L("Trésorerie nette", *tn, aide="TA − TP ; vérifier TN = FRNG − BFR")], f"({unite})"),
            ],
            "explication": "Total du bilan fonctionnel > total comptable : on a remis les amortissements à l'actif (brut) et au passif (ressources stables).",
            "source": f"{SRC}/0 - RAW/Cas pratiques ({fic})"}


ex7 = [
    bilan_fonctionnel("VELORAMA", ["N-1", "N"], "k€",
                      [["Immobilisations incorporelles", 80, 0, 80, 80, 0, 80], ["Immobilisations corporelles", 820, 380, 440, 1000, 455, 545],
                       ["Immobilisations financières", 90, 0, 90, 64, 5, 59], ["Stocks de marchandises", 210, 0, 210, 220, 0, 220],
                       ["Stocks de matières premières", 45, 0, 45, 37, 0, 37], ["Stocks de produits finis", 60, 0, 60, 80, 0, 80],
                       ["Clients", 260, 15, 245, 300, 17, 283], ["Autres créances d'exploitation", 30, 0, 30, 34, 0, 34],
                       ["Créances diverses (hors exploitation)", 10, 0, 10, 6, 0, 6], ["Disponibilités", 105, 0, 105, 107, 0, 107],
                       ["Charges constatées d'avance", 8, 0, 8, 9, 0, 9], ["**Total actif**", None, None, 1323, None, None, 1460]],
                      [["Capital", 300, 300], ["Réserve légale", 20, 21], ["Autres réserves", 95, 95], ["Report à nouveau", 5, 5],
                       ["Résultat de l'exercice", 13, 43], ["Subventions d'investissement", 36, 30], ["**Capitaux propres**", 469, 494],
                       ["Provisions pour risques et charges", 25, 25], ["Emprunts bancaires", 420, 500], ["Concours bancaires courants", 55, 40],
                       ["Fournisseurs", 240, 255], ["Dettes fiscales et sociales", 110, 120], ["Dettes sur immobilisations", 0, 20],
                       ["Autres dettes (impôt sur les bénéfices)", 4, 6], ["**Total passif**", 1323, 1460]],
                      {"ES": [990, 1144], "ACE": [613, 680], "ACHE": [10, 6], "TA": [105, 107],
                       "RS": [1309, 1496], "PCE": [350, 375], "PCHE": [4, 26], "TP": [55, 40]},
                      ([319, 352], [269, 285], [50, 67]), "AF Cas VELORAMA (SUJET)"),
    bilan_fonctionnel("PITAIN FLAM", ["N-1", "N"], "k€",
                      [["Immobilisations incorporelles", 160, 0, 160, 160, 0, 160], ["Immobilisations corporelles", 1350, 690, 660, 1560, 812, 748],
                       ["Immobilisations financières", 70, 0, 70, 52, 4, 48], ["Stocks de marchandises", 30, 0, 30, 32, 0, 32],
                       ["Stocks de matières premières", 55, 0, 55, 50, 0, 50], ["Stocks de produits finis", 48, 0, 48, 40, 0, 40],
                       ["Clients", 260, 8, 252, 310, 10, 300], ["Autres créances d'exploitation", 40, 0, 40, 44, 0, 44],
                       ["Créances diverses (hors exploitation)", 12, 0, 12, 8, 0, 8], ["Disponibilités", 161, 0, 161, 191, 0, 191],
                       ["Charges constatées d'avance", 10, 0, 10, 12, 0, 12], ["**Total actif**", None, None, 1498, None, None, 1633]],
                      [["Capital", 400, 400], ["Réserve légale", 30, 32], ["Autres réserves", 40, 40], ["Report à nouveau", 6, 9],
                       ["Résultat de l'exercice", 29, 49], ["Subventions d'investissement", 40, 35], ["**Capitaux propres**", 545, 565],
                       ["Provisions pour risques et charges", 30, 30], ["Emprunts bancaires", 470, 550], ["Concours bancaires courants", 60, 45],
                       ["Fournisseurs", 230, 238], ["Dettes fiscales et sociales", 160, 172], ["Dettes sur immobilisations", 0, 25],
                       ["Autres dettes (impôt sur les bénéfices)", 3, 8], ["**Total passif**", 1498, 1633]],
                      {"ES": [1580, 1772], "ACE": [443, 488], "ACHE": [12, 8], "TA": [161, 191],
                       "RS": [1743, 1971], "PCE": [390, 410], "PCHE": [3, 33], "TP": [60, 45]},
                      ([163, 199], [62, 53], [101, 146]), "AF Cas PITAIN FLAM"),
    bilan_fonctionnel("NOÉ", ["N", "N+1"], "€",
                      [["Marques", 500000, 0, 500000, 500000, 0, 500000], ["Terrains", 600000, 0, 600000, 600000, 0, 600000],
                       ["Matériel de production", 500000, 175000, 325000, 500000, 375000, 125000], ["Immobilisations financières", 307000, 0, 307000, 307000, 0, 307000],
                       ["Stock de marchandises", 220000, 0, 220000, 140000, 0, 140000], ["Stock de matières premières", 80000, 0, 80000, 76000, 0, 76000],
                       ["Stock de produits finis", 40000, 0, 40000, 38000, 0, 38000], ["Créances clients normales TTC", 180000, 0, 180000, 200000, 0, 200000],
                       ["Créances clients douteuses HT", 15000, 3000, 12000, 15000, 1000, 14000], ["Banque (disponibilités)", 252000, 0, 252000, 269800, 0, 269800],
                       ["**Total actif**", None, None, 2516000, None, None, 2269800]],
                      [["Capital social", 1000000, 1000000], ["Réserves", 42000, 50000], ["Report à nouveau", 8000, 14000], ["Résultat net", 299000, 259200],
                       ["Emprunt bancaire — dont à plus d'un an", 600000, 510000], ["Emprunt bancaire — dont à moins d'un an", 200000, 130000],
                       ["Dettes fournisseurs", 345000, 290600], ["Dettes envers les organismes sociaux", 12000, 14000], ["Dettes fiscales", 10000, 2000],
                       ["**Total passif**", 2516000, 2269800]],
                      {"ES": [1907000, 1907000], "ACE": [535000, 469000], "ACHE": [0, 0], "TA": [252000, 269800],
                       "RS": [2127000, 2209200], "PCE": [367000, 306600], "PCHE": [0, 0], "TP": [200000, 130000]},
                      ([220000, 302200], [168000, 162400], [52000, 139800]), "AF Cas NOE (SUJET) — l'emprunt à moins d'un an est classé en trésorerie passive"),
]
for q in ex7:  # colonnes de l'actif : Brut / A&D / Net par année
    cols = ["N-1", "N"] if "N-1" in q["enonce"] or "VELORAMA" in q["enonce"] or "PITAIN" in q["enonce"] else ["N", "N+1"]
    q["donnees"][0]["colonnes"] = [f"{t} {c}" for c in cols for t in ("Brut", "A&D", "Net")]
ex7[2]["etapes"].append({"type": "qcm", "enonce": "Comment qualifier l'équilibre financier de NOÉ (N et N+1) ?",
                          "choix": ["Sain : FRNG > BFR > 0, trésorerie nette positive et en hausse", "Dangereux : la trésorerie est négative",
                                    "Insuffisance de fonds de roulement", "BFR négatif typique de la grande distribution"],
                          "reponse": 0, "explication": "Situation 1 (équilibre idéal d'une industrielle) qui évolue vers la 2 (TN plus importante, à placer)."})
ecrire("ex6-cas-td-sig-caf.json", "Cas des TD : SIG + CAF (VELORAMA, PITAIN FLAM, NOÉ)", "exercices", ex6)
ecrire("ex7-cas-td-bilan-fonctionnel.json", "Cas des TD : bilan fonctionnel, FRNG, BFR, TN", "exercices", ex7)

# BELLESSENCE / VITAMINES en tableau (bilan + CR)
bell = {"id": "af-x8-bellessence", "type": "probleme", "difficulte": 3,
        "enonce": "**Cas BELLESSENCE** (entreprise industrielle, pas de marchandises ; stocks au 01.01.N nuls ; au 31.12.N : MP 14 000, PF 3 000). Données au 31.12.N en € :\nMatériel de manutention 12 000 · Brevet 30 000 · Clients 2 500 · Charges sociales 22 000 · Fournisseurs 4 000 · Autres achats et charges externes 13 000 · Terrain 80 000 · Impôts et taxes 5 000 · Matériel informatique 10 000 · Mobilier 6 000 · Emprunt 150 000 · Créances État 1 500 · Dettes personnel 3 000 · Caisse 500 · Achats de MP 75 000 · Fournisseurs d'immobilisations 8 000 · Capital 220 000 · Dettes fiscales 2 500 · Production vendue 200 000 · Prestations de services 4 000 · Constructions 165 000 · Marque 20 000 · Services extérieurs 22 000 · Matériel de transport 42 000 · Salaires 50 000 · Intérêts d'emprunt 1 500 · Banque 13 500 · Matériel de conditionnement 20 000.",
        "etapes": [
            tab("Variations de stocks :", ["€"], [L("Variation de stock de MP (SI − SF)", -14000), L("Production stockée (SF − SI)", 3000)]),
            tab("Compte de résultat :", ["€"], [
                L("Charges d'exploitation", 173000, aide="75 000 − 14 000 + 13 000 + 22 000 + 5 000 + 50 000 + 22 000"),
                L("Charges financières", 1500), L("Total des charges", 174500, total=True),
                L("Produits d'exploitation", 207000, aide="200 000 + 3 000 + 4 000"), L("Résultat (bénéfice +, perte −)", 32500, total=True)]),
            tab("Bilan :", ["€"], [
                L("Actif immobilisé", 385000, aide="30 000 + 20 000 + 80 000 + 165 000 + 12 000 + 20 000 + 42 000 + 10 000 + 6 000"),
                L("Actif circulant", 35000, aide="14 000 + 3 000 + 2 500 + 1 500 + 13 500 + 500"),
                L("Capitaux propres", 252500, aide="Capital 220 000 + résultat 32 500"),
                L("Dettes", 167500, aide="150 000 + 4 000 + 8 000 + 3 000 + 2 500"),
                L("Total du bilan", 420000, total=True)])],
        "explication": "Le résultat calculé au CR se reporte dans les capitaux propres et équilibre le bilan.", "source": SRC + " (cas BELLESSENCE)"}
vita = {"id": "af-x8-vitamines", "type": "probleme", "difficulte": 3,
        "enonce": "**Cas VITAMINES** (PCG 2025). Stocks SI → SF : marchandises 1 000 → 400 ; MP 2 000 → 2 500 ; PF 3 000 → 2 800. Données au 31.12.N en € :\nMarque 25 000 · Créances État 3 000 · Intérêts d'emprunt 1 800 · Fonds de commerce 30 000 · Amendes et pénalités fiscales 1 200 · Fournisseurs d'immobilisations 5 000 · Valeurs comptables des immos cédées (657) 2 000 · Services extérieurs 4 000 · Constructions 400 000 · Salaires 85 000 · Mobilier (brut) 2 200 · Fournisseurs 4 500 · Clients 13 000 · Banque SG 4 300 · Concours bancaires BNP 2 000 · Dettes fiscales 2 700 · Capital 500 000 · Dettes personnel 2 000 · Emprunt 300 000 · Achats de marchandises 50 000 · Produits de cession (757) 3 000 · Prestations de services 45 000 · Achats de MP 140 000 · Matériel de production (brut) 130 000 · Autres achats et charges externes 3 500 · Terrain 150 000 · Impôts et taxes 1 900 · Amortissements 33 000 · Matériel informatique (brut) 14 000 · Charges sociales 40 000 · Ventes de marchandises 110 000 · Caisse 300 · Matériel de transport (brut) 70 000 · Dotations aux amortissements 15 000 · Production vendue 185 000.",
        "etapes": [
            tab("Variations de stocks :", ["€"], [L("Marchandises (SI − SF)", 600), L("Matières premières (SI − SF)", -500), L("Production (dé)stockée (SF − SI)", -200)]),
            tab("Compte de résultat :", ["€"], [
                L("Charges d'exploitation", 341500, aide="50 000 + 600 + 140 000 − 500 + 3 500 + 4 000 + 1 900 + 85 000 + 40 000 + 2 000 (657) + 15 000"),
                L("Charges financières", 1800), L("Charges exceptionnelles", 1200, aide="Amendes"),
                L("Total des charges", 344500, total=True),
                L("Produits d'exploitation", 342800, aide="110 000 + 185 000 − 200 + 45 000 + 3 000 (757)"),
                L("Résultat (bénéfice +, perte −)", -1700, total=True)]),
            tab("Bilan :", ["€"], [
                L("Actif immobilisé net", 788200, aide="30 000 + 25 000 + 150 000 + 400 000 + 130 000 + 70 000 + 14 000 + 2 200 − 33 000"),
                L("Actif circulant", 26300, aide="400 + 2 500 + 2 800 + 13 000 + 3 000 + 4 300 + 300"),
                L("Capitaux propres", 498300, aide="500 000 − 1 700"),
                L("Dettes", 316200, aide="300 000 + 4 500 + 5 000 + 2 000 + 2 700 + 2 000 (découvert BNP)"),
                L("Total du bilan", 814500, total=True)])],
        "explication": "Pièges : 657/757 en exploitation (PCG 2025) ; les deux banques ne se compensent pas ; perte de 1 700.", "source": SRC + " (cas VITAMINES)"}
ecrire("ex8-cas-td-bilan-cr.json", "Cas des TD : bilan et compte de résultat (BELLESSENCE, VITAMINES)", "exercices", [bell, vita])

# =====================================================================================
# 5. SUJETS TYPE DS (sans calculatrice) : dossiers générés, chiffres ronds
# =====================================================================================
NOMS = ["BLE", "ORGE", "SEIGLE", "AVOINE", "MAÏS", "ÉPEAUTRE", "SARRASIN", "MILLET"]


def dossier_sig(rnd, k):
    """CR « en liste » façon DS 2024 (cas BLE), en k€, chiffres ronds. Année N seule."""
    while True:
        ca = rnd.choice([1000, 1200, 1500, 2000])
        vm = rnd.choice(range(2, 6)) * ca // 10
        pv = ca - vm
        pv_serv = rnd.choice([0, 50, 100])
        c = C({"707": vm, "701": pv - pv_serv, "706": pv_serv, "713": rnd.choice([-20, -10, 0, 10, 20, 30]), "72": rnd.choice([0, 0, 20]),
               "74": rnd.choice([0, 10, 20]), "781": rnd.choice([0, 5, 10]), "75": rnd.choice([0, 5, 10]),
               "607": vm * rnd.choice([5, 6, 7]) // 10 // 5 * 5, "6037": rnd.choice([-10, -5, 5, 10]),
               "601": pv * rnd.choice([3, 4]) // 10 // 10 * 10, "6031": rnd.choice([-50, -20, 10, 20]),
               "63": rnd.choice([20, 25, 30, 40]), "641": rnd.choice(range(100, 300, 20)), "681": rnd.choice([20, 30, 40, 50]),
               "65": rnd.choice([0, 5]), "66": rnd.choice([10, 15, 20]), "76": rnd.choice([0, 5]), "686": rnd.choice([0, 0, 5]),
               "691": rnd.choice([0, 5])})
        ext = [("Frais d'énergie", rnd.choice([40, 60, 80, 100])), ("Frais de téléphone", rnd.choice([10, 20])),
               ("Frais de publicité", rnd.choice([30, 50, 80])), ("Autres achats et charges externes", rnd.choice([40, 50, 70]))]
        c["61/62"] = sum(v for _, v in ext)
        cession = rnd.random() < 0.6
        if cession:
            c["757"] = rnd.choice([10, 15, 20, 30])
            c["657"] = rnd.choice([5, 8, 12, 20, 25])
        c["77"] = rnd.choice([0, 0, 5, 10])
        c["67"] = rnd.choice([0, 2, 5])
        # Charges de personnel déduites d'un EBE réaliste (8 à 15 % du CA, multiple de 5)
        s = cr_vers_sig(c)
        ebe_cible = ca * rnd.choice([8, 10, 12, 15]) // 100 // 5 * 5
        perso = s["VA"] + c["74"] - c["63"] - ebe_cible
        c["641"] = perso * 2 // 3 // 10 * 10
        c["645"] = perso - c["641"]
        if c["641"] <= 0:
            continue
        s = cr_vers_sig(c)
        if s["RCAI"] + s["REX"] - c["691"] <= 20:
            continue
        c["695"] = (s["RCAI"] + s["REX"] - c["691"]) // 4 // 5 * 5
        s = cr_vers_sig(c)
        s["_c"] = c
        break
    nom = NOMS[k % len(NOMS)]
    annexe = annexe_cr([c], ["au 31.12.N"], f"Comptes de résultat (en liste), en k€", [(l, [v]) for l, v in ext])
    pv_cession = c["757"] - c["657"]
    etapes = [
        tab("Présentez le tableau des soldes intermédiaires de gestion :", ["N"], lignes_sig([s]), "SIG (k€)"),
        tab("Calculez la CAF par la méthode soustractive :", ["N"], lignes_caf_soustr([s]), "CAF (k€)"),
        tab("Vérifiez par la méthode additive :", ["N"], lignes_caf_add([s]), "CAF (k€)"),
        num("Chiffre d'affaires :", s["CA"], "707 + 701 + 706", unite="k€"),
        num("Taux de marge d'EBE (EBE / CA, en %, à 1 décimale) :", round(100 * s["EBE"] / s["CA"], 1), f"{s['EBE']} / {s['CA']} × 100", tol=0.002, unite="%"),
    ]
    if cession:
        etapes.append({"type": "qcm", "enonce": f"La société a cédé un matériel (757 = {c['757']} ; 657 = {c['657']}). Où apparaît le résultat de cession ({pv_cession:+d} k€) depuis le PCG 2025 ?",
                       "choix": ["Dans le résultat d'exploitation", "Dans le résultat exceptionnel", "Dans le résultat financier", "Il n'apparaît pas dans les SIG"],
                       "reponse": 0, "explication": "657/757 = exploitation ; et la cession est exclue de la CAF."})
    etapes.append({"type": "redaction", "enonce": "Rédigez en 2-3 phrases ce que mesure l'EBE et pourquoi on calcule la CAF.",
                   "choix": ["EBE : performance de l'exploitation avant amortissements, financement et IS ; CAF : ressource interne pour investir, rembourser, distribuer",
                             "EBE : résultat après impôt ; CAF : trésorerie au bilan",
                             "EBE : bénéfice distribuable ; CAF : montant des emprunts",
                             "EBE : valeur des stocks ; CAF : capital social"],
                   "reponse": 0, "modele": "L'EBE mesure la performance du métier, indépendamment des politiques d'investissement (dotations), de financement (intérêts) et fiscale. La CAF est la ressource interne potentielle (produits encaissables − charges décaissables) qui permet de financer les investissements, rembourser les emprunts et verser des dividendes."})
    return {"id": f"af-ds1-{k + 1:02d}", "type": "probleme", "difficulte": 3,
            "enonce": f"**Dossier ANALYSE FINANCIÈRE (analyse de l'activité) — Cas {nom}** · (sans calculatrice)\nLa société {nom} met à votre disposition son compte de résultat de l'année N (en k€). Négatifs : tapez « - ».",
            "donnees": [annexe], "etapes": etapes,
            "explication": "Format du DS 2023-2024 (dossier 4, cas BLE) : CR en liste → SIG → CAF. Vérifier RN = total produits − total charges.",
            "source": "Cours/2A FIGIM/Analyse Financière - I.Leroyer/Partiel 2024 (format) + cours SIG CAF"}


def dossier_bf(rnd, k):
    """Bilan comptable → bilan fonctionnel → FRNG/BFR/TN → situation. k€, chiffres ronds, une année."""
    while True:
        incorp = rnd.choice([0, 50, 100])
        corp_b = rnd.choice(range(400, 1000, 100))
        corp_a = rnd.choice(range(2, 6)) * corp_b // 10
        fin = rnd.choice([0, 20, 50])
        st = rnd.choice(range(60, 200, 20))
        cli_b = rnd.choice(range(100, 300, 20))
        cli_d = rnd.choice([0, 10, 20])
        autres = rnd.choice([0, 10, 20])
        diverses = rnd.choice([0, 5, 10])
        dispo = rnd.choice([10, 20, 40, 80, 150])
        capital = rnd.choice([200, 300, 400])
        reserves = rnd.choice([20, 50, 80])
        resultat = rnd.choice([20, 30, 40, 50])
        prov = rnd.choice([0, 10, 20])
        fourn = rnd.choice(range(80, 220, 20))
        fisc = rnd.choice([30, 40, 60])
        dimmo = rnd.choice([0, 0, 10, 20])
        cbc = rnd.choice([0, 0, 20, 50, 100])
        actif_net = incorp + corp_b - corp_a + fin + st + cli_b - cli_d + autres + diverses + dispo
        emprunt = actif_net - (capital + reserves + resultat + prov + fourn + fisc + dimmo + cbc)
        if emprunt < 50 or emprunt % 10:
            continue
        ES = incorp + corp_b + fin
        RS = capital + reserves + resultat + corp_a + cli_d + prov + emprunt
        ACE, ACHE, TA = st + cli_b + autres, diverses, dispo
        PCE, PCHE, TP = fourn + fisc, dimmo, cbc
        frng, bfr, tn = RS - ES, ACE + ACHE - PCE - PCHE, TA - TP
        if frng <= -200:
            continue
        break
    if frng > 0 and bfr > 0 and tn >= 0:
        sit = 0
    elif frng > 0 and bfr > 0 and tn < 0:
        sit = 1
    elif frng > 0 and bfr <= 0:
        sit = 2
    else:
        sit = 3
    choix = ["Équilibre sain : le FRNG finance tout le BFR, trésorerie positive",
             "FRNG positif mais insuffisant : trésorerie négative, dépendance aux découverts",
             "BFR négatif : le cycle d'exploitation dégage de la trésorerie (type grande distribution)",
             "FRNG négatif (insuffisance) : des immobilisations sont financées par du court terme"]
    nom = NOMS[(k + 3) % len(NOMS)]
    actif = [["Immobilisations incorporelles", incorp, 0, incorp], ["Immobilisations corporelles", corp_b, corp_a, corp_b - corp_a],
             ["Immobilisations financières", fin, 0, fin], ["Stocks", st, 0, st], ["Clients", cli_b, cli_d, cli_b - cli_d],
             ["Autres créances d'exploitation", autres, 0, autres], ["Créances diverses (hors exploitation)", diverses, 0, diverses],
             ["Disponibilités", dispo, 0, dispo], ["**Total actif**", None, None, actif_net]]
    actif = [l for l in actif if l[1] != 0 or l[0].startswith("**")]
    passif = [["Capital", capital], ["Réserves", reserves], ["Résultat de l'exercice", resultat], ["Provisions pour risques et charges", prov],
              ["Emprunts bancaires (> 1 an)", emprunt], ["Fournisseurs", fourn], ["Dettes fiscales et sociales", fisc],
              ["Dettes sur immobilisations", dimmo], ["Concours bancaires courants", cbc], ["**Total passif**", actif_net]]
    passif = [l for l in passif if l[1] != 0]
    return {"id": f"af-ds2-{k + 1:02d}", "type": "probleme", "difficulte": 3,
            "enonce": f"**Dossier ANALYSE FINANCIÈRE (équilibre financier) — Cas {nom}** · (sans calculatrice)\nBilan au 31.12.N avant répartition, en k€.",
            "donnees": [{"titre": "Actif", "colonnes": ["Brut", "A&D", "Net"], "lignes": actif}, {"titre": "Passif", "colonnes": ["N"], "lignes": passif}],
            "etapes": [
                classer_etape("Classez les postes du bilan dans le bilan fonctionnel :", CAT_BF, [
                    ("Amortissements des immobilisations corporelles", 1, "Ressources stables."),
                    *([("Dépréciations des clients", 1, "Ressources stables.")] if cli_d else []),
                    ("Clients (brut)", 2, ""), ("Emprunts bancaires (> 1 an)", 1, ""),
                    *([("Dettes sur immobilisations", 5, "Hors exploitation.")] if dimmo else []),
                    *([("Concours bancaires courants", 7, "")] if cbc else []),
                    *([("Créances diverses", 3, "")] if diverses else []),
                    ("Dettes fiscales et sociales", 4, ""), ("Disponibilités", 6, "")]),
                tab("Bilan fonctionnel condensé :", ["N"], [
                    L("Emplois stables (brut)", ES, aide="Immobilisations brutes"),
                    L("Actif circulant d'exploitation (brut)", ACE, aide="Stocks + clients bruts + autres créances d'exploitation"),
                    L("Actif circulant hors exploitation", ACHE), L("Trésorerie active", TA),
                    L("Ressources stables", RS, aide="CP + amortissements et dépréciations + provisions + emprunts"),
                    L("Passif circulant d'exploitation", PCE), L("Passif circulant hors exploitation", PCHE), L("Trésorerie passive", TP),
                    L("Total (emplois = ressources)", ES + ACE + ACHE + TA, total=True)], "k€"),
                tab("FRNG, BFR, TN :", ["N"], [L("FRNG", frng, aide="RS − ES"), L("BFR", bfr, aide="(ACE + ACHE) − (PCE + PCHE)"),
                                               L("Trésorerie nette", tn, aide="TA − TP = FRNG − BFR")], "k€"),
                {"type": "qcm", "enonce": "Caractérisez l'équilibre financier :", "choix": choix, "reponse": sit,
                 "explication": f"FRNG = {frng}, BFR = {bfr}, TN = {tn}."},
            ],
            "explication": "Total fonctionnel = total comptable + amortissements et dépréciations.", "source": SRC + " (Ch4)"}


def dossier_bilan_cr(rnd, k):
    """Classer + bilan + CR (format BELLESSENCE), chiffres ronds."""
    while True:
        d = {"Terrain": (rnd.choice([50, 80, 100]), AI), "Constructions": (rnd.choice([100, 150, 200]), AI), "Matériel industriel": (rnd.choice([40, 60, 80]), AI),
             "Brevet": (rnd.choice([10, 20, 30]), AI), "Stock de matières premières (31.12)": (rnd.choice([10, 15, 20]), AC), "Clients": (rnd.choice([10, 20, 30]), AC),
             "Banque": (rnd.choice([5, 10, 25]), AC), "Capital social": (None, CP), "Emprunt auprès des établissements de crédit": (rnd.choice([100, 120, 150]), D),
             "Fournisseurs": (rnd.choice([10, 15, 20]), D), "Dettes fiscales et sociales": (rnd.choice([5, 10]), D),
             "Achats de matières premières": (rnd.choice([60, 80, 100]), CE), "Salaires et charges sociales": (rnd.choice([40, 50, 60]), CE),
             "Autres achats et charges externes": (rnd.choice([10, 20]), CE), "Dotations aux amortissements": (rnd.choice([10, 15, 20]), CE),
             "Intérêts d'emprunt": (rnd.choice([2, 5]), CF), "Production vendue": (rnd.choice([200, 250, 300]), PE),
             "Produits des cessions d'immobilisations corporelles (757)": (rnd.choice([0, 10]), PE),
             "Valeurs comptables des immobilisations cédées (657)": (rnd.choice([0, 6]), CE)}
        si_mp = rnd.choice([5, 10, 20])
        var = si_mp - d["Stock de matières premières (31.12)"][0]
        charges = sum(v for v, c in d.values() if v and c in (CE, CF, CEX)) + var
        produits = sum(v for v, c in d.values() if v and c in (PE, PF, PEX))
        res = produits - charges
        actif = sum(v for v, c in d.values() if v and c in (AI, AC))
        cap = actif - res - sum(v for v, c in d.values() if v and c == D)
        if cap > 0 and res != 0 and cap % 10 == 0:
            break
    d["Capital social"] = (cap, CP)
    d = {k2: v for k2, v in d.items() if v[0]}
    nom = NOMS[(k + 5) % len(NOMS)]
    liste = " · ".join(f"{k2} {v}" for k2, (v, c) in d.items())
    return {"id": f"af-ds3-{k + 1:02d}", "type": "probleme", "difficulte": 2,
            "enonce": f"**Dossier COMPTABILITÉ — Cas {nom}** · (sans calculatrice) (k€, PCG 2025)\nStock de MP au 01.01.N : {si_mp} ; au 31.12.N : {d['Stock de matières premières (31.12)'][0]}.\nDonnées au 31.12.N : {liste}.",
            "etapes": [
                classer_etape("Classez chaque information :", CODES, [(k2, c, "") for k2, (v, c) in d.items()]),
                num("Variation de stock de matières premières (en charges) :", var, "SI − SF", unite="k€"),
                tab("Totaux :", ["k€"], [L("Total des charges", charges, aide="Charges d'exploitation (avec la variation de stock) + charges financières"),
                                          L("Total des produits", produits), L("Résultat (bénéfice +, perte −)", res, total=True),
                                          L("Total du bilan", actif, total=True, aide="Actif immobilisé + actif circulant = capitaux propres (avec le résultat) + dettes")])],
            "explication": "Le résultat du CR se reporte en capitaux propres et équilibre le bilan.", "source": SRC + " (format BELLESSENCE)"}


def dossier_immo(rnd, k):
    q = amortissement_lineaire(rnd, f"af-ds4-{k + 1:02d}", f"Dossier IMMOBILISATIONS — Cas {NOMS[(k + 1) % len(NOMS)]}")
    q["enonce"] += " (Sans calculatrice.)"
    return q


rds = random.Random(2026)
ds1 = [dossier_sig(rds, k) for k in range(8)]
ds2 = [dossier_bf(rds, k) for k in range(6)]
ds3 = [dossier_bilan_cr(rds, k) for k in range(5)]
ds4 = [dossier_immo(rds, k) for k in range(5)]
ecrire("ds1-dossier-sig-caf.json", "Dossier type DS : CR en liste → SIG → CAF (sans calculatrice)", "ds", ds1)
ecrire("ds2-dossier-equilibre.json", "Dossier type DS : bilan → bilan fonctionnel → FRNG, BFR, TN", "ds", ds2)
ecrire("ds3-dossier-bilan-cr.json", "Dossier type DS : classer, bilan et compte de résultat", "ds", ds3)
ecrire("ds4-dossier-immobilisations.json", "Dossier type DS : amortissement, cession, écritures", "ds", ds4)
