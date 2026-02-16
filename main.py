import tkinter as tk
from tkinter import messagebox, filedialog
from datetime import date
import json
import os
from PIL import Image, ImageTk

# ---------- CONFIG ----------

IMAGE_DIR = "images/materiel"
FICHIER_EMPRUNTS = "emprunts.json"
FICHIER_INVENTAIRE = "inventaire.json"
TAILLE_IMAGE = (350, 350)

# ---------- CACHE IMAGES ----------

image_cache = {}

def charger_image(nom_fichier):
    if nom_fichier in image_cache:
        return image_cache[nom_fichier]

    chemin = os.path.join(IMAGE_DIR, nom_fichier)
    if not os.path.exists(chemin):
        chemin = os.path.join(IMAGE_DIR, "default.png")

    img = Image.open(chemin).resize(TAILLE_IMAGE)
    photo = ImageTk.PhotoImage(img)
    image_cache[nom_fichier] = photo
    return photo

# ---------- MODELES ----------

class Materiel:
    def __init__(self, reference, nom, image="default.png"):
        self.reference = reference
        self.nom = nom
        self.image = image
        self.disponible = True

# ---------- DONNEES ----------

inventaire = []

# ---------- PERSISTENCE ----------

def charger_emprunts():
    if not os.path.exists(FICHIER_EMPRUNTS):
        return []
    with open(FICHIER_EMPRUNTS, "r", encoding="utf-8") as f:
        return json.load(f)

def sauvegarder_emprunts(data):
    with open(FICHIER_EMPRUNTS, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

def charger_inventaire():
    if not os.path.exists(FICHIER_INVENTAIRE):
        return []

    with open(FICHIER_INVENTAIRE, "r", encoding="utf-8") as f:
        data = json.load(f)

    inventaire.clear()
    for item in data:
        m = Materiel(
            item["reference"],
            item["nom"],
            item.get("image", "default.png")
        )
        m.disponible = item.get("disponible", True)
        inventaire.append(m)


def sauvegarder_inventaire():
    data = []
    for m in inventaire:
        data.append({
            "reference": m.reference,
            "nom": m.nom,
            "image": m.image,
            "disponible": m.disponible
        })

    with open(FICHIER_INVENTAIRE, "w", encoding="utf-8") as f:
        json.dump(data, f, indent=2, ensure_ascii=False)

# ---------- LOGIQUE ----------

charger_inventaire()

def rafraichir_materiel():
    listbox_materiel.delete(0, tk.END)
    for m in inventaire:
        statut = "OK" if m.disponible else "EMPRUNTE"
        listbox_materiel.insert(tk.END, f"{m.reference} - {m.nom} [{statut}]")

def rafraichir_emprunts():
    listbox_emprunts.delete(0, tk.END)
    for e in charger_emprunts():
        if e["statut"] == "en_cours":
            refs = ", ".join(e["materiels"])
            listbox_emprunts.insert(
                tk.END,
                f'{e["prenom"]} {e["nom"]} | {refs} | {e["date"]}'
            )

def afficher_image(event=None):
    selection = listbox_materiel.curselection()
    if not selection:
        return
    index = selection[0]
    ref = listbox_materiel.get(index).split(" - ")[0]
    for m in inventaire:
        if m.reference == ref:
            img = charger_image(m.image)
            label_image.config(image=img)
            label_image.image = img
            label_info.config(text=f"{m.nom}\nReference : {m.reference}")
            break

def ajouter_materiel():
    ref = entry_ref.get()
    nom = entry_nom_mat.get()
    if not ref or not nom:
        messagebox.showerror("Erreur", "Champs obligatoires")
        return

    inventaire.append(Materiel(ref, nom))
    entry_ref.delete(0, tk.END)
    entry_nom_mat.delete(0, tk.END)
    rafraichir_materiel()
    sauvegarder_inventaire()


def choisir_image():
    selection = listbox_materiel.curselection()
    if not selection:
        messagebox.showerror("Erreur", "Selectionne un materiel")
        return

    index = selection[0]
    ref = listbox_materiel.get(index).split(" - ")[0]

    chemin = filedialog.askopenfilename(
        filetypes=[("Images", "*.png *.jpg *.jpeg")]
    )
    if not chemin:
        return

    ext = os.path.splitext(chemin)[1]
    dest = os.path.join(IMAGE_DIR, ref + ext)
    os.makedirs(IMAGE_DIR, exist_ok=True)

    with open(chemin, "rb") as src, open(dest, "wb") as dst:
        dst.write(src.read())

    for m in inventaire:
        if m.reference == ref:
            m.image = ref + ext
            image_cache.clear()
            afficher_image()
            break
    sauvegarder_inventaire()


def creer_emprunt():
    nom = entry_nom.get()
    prenom = entry_prenom.get()
    justification = entry_justification.get()
    prof = entry_prof.get()
    selection = listbox_materiel.curselection()

    if not all([nom, prenom, justification, prof]):
        messagebox.showerror("Erreur", "Tous les champs requis")
        return

    if not selection:
        messagebox.showerror("Erreur", "Aucun materiel selectionne")
        return

    refs = []
    for idx in selection:
        ref = listbox_materiel.get(idx).split(" - ")[0]
        refs.append(ref)
        for m in inventaire:
            if m.reference == ref:
                m.disponible = False

    data = charger_emprunts()
    data.append({
        "nom": nom,
        "prenom": prenom,
        "date": str(date.today()),
        "justification": justification,
        "prof": prof,
        "materiels": refs,
        "statut": "en_cours"
    })
    sauvegarder_emprunts(data)
    sauvegarder_inventaire()

    rafraichir_materiel()
    rafraichir_emprunts()
    


def retour_materiel():
    selection = listbox_emprunts.curselection()
    if not selection:
        messagebox.showerror("Erreur", "Selectionne un emprunt")
        return

    idx = selection[0]
    data = charger_emprunts()
    en_cours = [e for e in data if e["statut"] == "en_cours"]
    emprunt = en_cours[idx]
    emprunt["statut"] = "termine"

    for ref in emprunt["materiels"]:
        for m in inventaire:
            if m.reference == ref:
                m.disponible = True

    sauvegarder_emprunts(data)
    sauvegarder_inventaire()

    rafraichir_materiel()
    rafraichir_emprunts()


# ---------- INTERFACE ----------

root = tk.Tk()
root.title("Gestion du materiel")
root.state("zoomed")

# --- Frames
frame_gauche = tk.Frame(root)
frame_gauche.pack(side="left", fill="y", padx=10)

frame_droite = tk.Frame(root)
frame_droite.pack(side="right", fill="both", expand=True, padx=10)

frame_bas = tk.Frame(root)
frame_bas.pack(side="bottom", fill="x")

# --- Liste materiel
tk.Label(frame_gauche, text="Inventaire").pack()
listbox_materiel = tk.Listbox(frame_gauche, height=25)
listbox_materiel.pack(fill="y")
listbox_materiel.bind("<<ListboxSelect>>", afficher_image)

tk.Button(frame_gauche, text="Ajouter image", command=choisir_image).pack(pady=5)

# --- Ajout materiel
entry_ref = tk.Entry(frame_gauche)
entry_nom_mat = tk.Entry(frame_gauche)
tk.Label(frame_gauche, text="Reference").pack()
entry_ref.pack()
tk.Label(frame_gauche, text="Nom").pack()
entry_nom_mat.pack()
tk.Button(frame_gauche, text="Ajouter materiel", command=ajouter_materiel).pack(pady=5)

# --- Zone image
label_image = tk.Label(frame_droite)
label_image.pack(pady=10)

label_info = tk.Label(frame_droite, font=("Arial", 14))
label_info.pack()

# --- Emprunts
tk.Label(frame_bas, text="Nouvel emprunt").grid(row=0, column=0, columnspan=2)

entry_nom = tk.Entry(frame_bas)
entry_prenom = tk.Entry(frame_bas)
entry_justification = tk.Entry(frame_bas)
entry_prof = tk.Entry(frame_bas)

labels = ["Nom", "Prenom", "Justification", "Prof"]
entries = [entry_nom, entry_prenom, entry_justification, entry_prof]

for i in range(4):
    tk.Label(frame_bas, text=labels[i]).grid(row=i+1, column=0)
    entries[i].grid(row=i+1, column=1)

tk.Button(frame_bas, text="Creer emprunt", command=creer_emprunt).grid(row=5, column=0, columnspan=2)

# --- Retours
tk.Label(frame_bas, text="Emprunts en cours").grid(row=0, column=3)
listbox_emprunts = tk.Listbox(frame_bas, height=6)
listbox_emprunts.grid(row=1, column=3, rowspan=4)
tk.Button(frame_bas, text="Confirmer retour", command=retour_materiel).grid(row=5, column=3)

rafraichir_materiel()
rafraichir_emprunts()
root.mainloop()
