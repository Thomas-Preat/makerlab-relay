from datetime import date
import json

# ---------- MODELES ----------


class Materiel:
    def __init__(self, reference, nom):
        self.reference = reference
        self.nom = nom
        self.disponible = True

    def __str__(self):
        statut = "disponible" if self.disponible else "emprunte"
        return f"{self.reference} - {self.nom} ({statut})"


class Emprunt:
    def __init__(self, nom, prenom, justification, materiels, prof):
        self.nom = nom
        self.prenom = prenom
        self.date = date.today()
        self.justification = justification
        self.materiels = materiels
        self.prof = prof
        self.date_rendu = None

    def __str__(self):
        refs = ", ".join([m.reference for m in self.materiels])
        return (
            f"Emprunt par {self.prenom} {self.nom}\n"
            f"Date : {self.date}\n"
            f"Prof autorisant : {self.prof}\n"
            f"Justification : {self.justification}\n"
            f"Materiel : {refs}"
        )


# ---------- STOCKAGE ----------

inventaire = []
emprunts = []

# ---------- FONCTIONS ----------


def ajouter_materiel():
    reference = input("Reference du materiel : ")
    nom = input("Nom du materiel : ")

    inventaire.append(Materiel(reference, nom))
    sauvegarder_materiels_json(inventaire)
    print("Materiel ajoute\n")


def afficher_materiel_disponible():
    print("\nMateriel disponible :")
    for m in inventaire:
        if m.disponible:
            print(m)
    print()


def creer_emprunt():
    nom = input("Nom de l etudiant : ")
    prenom = input("Prenom de l etudiant : ")
    justification = input("Justification de l emprunt : ")
    prof = input("Nom du prof autorisant : ")

    afficher_materiel_disponible()

    refs = input("References du materiel (separees par des virgules) : ")
    refs = [r.strip() for r in refs.split(",")]

    materiels_empruntes = []

    for ref in refs:
        trouve = False
        for m in inventaire:
            if m.reference == ref and m.disponible:
                materiels_empruntes.append(m)
                m.disponible = False
                trouve = True
                break
        if not trouve:
            print(f"Materiel {ref} indisponible ou inexistant")

    if materiels_empruntes:
        emprunt = Emprunt(nom, prenom, justification, materiels_empruntes, prof)
        emprunts.append(emprunt)
        sauvegarder_emprunts_json(emprunts)
        print("\nEmprunt cree :")
        print(emprunt)
    else:
        print("Aucun materiel valide selectionne")

    print()


def sauvegarder_emprunts_json(liste_emprunts):
    data = []
    for emprunt in liste_emprunts:
        data.append(
            {
                "nom": emprunt.nom,
                "prenom": emprunt.prenom,
                "date": emprunt.date.isoformat(),
                "justification": emprunt.justification,
                "prof": emprunt.prof,
                "materiels": [m.reference for m in emprunt.materiels],
                "date_rendu": emprunt.date_rendu,
            }
        )

    with open("emprunts.json", "w", encoding="utf-8") as fichier:
        json.dump(data, fichier, ensure_ascii=True, indent=2)


def sauvegarder_materiels_json(liste_materiels):
    data = []
    for materiel in liste_materiels:
        data.append(
            {
                "reference": materiel.reference,
                "nom": materiel.nom,
                "disponible": materiel.disponible,
            }
        )

    with open("materiels.json", "w", encoding="utf-8") as fichier:
        json.dump(data, fichier, ensure_ascii=True, indent=2)


def afficher_contenu_json(chemin="materiels.json", afficher=False):
    try:
        with open(chemin, encoding="utf-8") as fichier:
            data = json.load(fichier)
    except FileNotFoundError:
        print(f"Fichier {chemin} introuvable")
        return
    except json.JSONDecodeError:
        print(f"Fichier {chemin} invalide")
        return

    if afficher:
        print(json.dumps(data, ensure_ascii=True, indent=2))
    return data


def charger_materiels_json(chemin="materiels.json"):
    data = afficher_contenu_json(chemin)
    if not data:
        return []

    liste = []
    for item in data:
        reference = item.get("reference", "")
        nom = item.get("nom", "")
        disponible = item.get("disponible", True)
        if isinstance(disponible, str):
            dispo = disponible.strip().lower() in {"true", "1", "yes", "oui"}
        else:
            dispo = bool(disponible)

        materiel = Materiel(reference, nom)
        materiel.disponible = dispo
        liste.append(materiel)

    return liste


def charger_emprunts_json(chemin="emprunts.json"):
    data = afficher_contenu_json(chemin)
    return data or []


def menu():
    options = [
        "Ajouter du materiel",
        "Voir le materiel disponible",
        "Creer un emprunt",
        "Voir les emprunts",
        "Rendre un emprunt",
    ]
    while True:
        [print(f"{i + 1} - {option}") for i, option in enumerate(options)]

        choix = input("Choix : ")

        if choix == "1":
            ajouter_materiel()
        elif choix == "2":
            afficher_materiel_disponible()
        elif choix == "3":
            creer_emprunt()
        elif choix == "4":
            # voir_emprunt()
            print("--à faire--")
        elif choix == "5":
            # rendre_emprunt()
            print("--à faire--")
        elif choix == str(len(options)):
            break
        else:
            print("Choix invalide\n")


# ---------- LANCEMENT ----------
if __name__ == "__main__":
    inventaire = charger_materiels_json()
    emprunts = charger_emprunts_json()

    menu()
