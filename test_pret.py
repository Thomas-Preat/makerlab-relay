import tkinter as tk
from tkinter import messagebox
from datetime import date
import json
import os

FICHIER_EMPRUNTS = "emprunts.json"

# ---------- MODELES ----------

class Materiel:
    def __init__(self, reference, nom):
        self.reference = reference
        self.nom = nom
        self.disponible = True

# ---------- STOCKAGE ----------

inventaire = []

# ---------- PERSISTENCE ----------

def charger_emprunts():
    if not os.path.exists(FICHIER_EMPRUNTS):
        return []
    with open(FICHIER_EMPRUNTS, "r", encoding="utf-8") as f:
        return json.load(f)

def sauvegarder_emprunts(emprunts):
    with open(FICHIER_EMPRUNTS, "w", encoding="utf-8") as f:
        json.dump(emprunts, f, indent=2, ensure_ascii=False)

# ---------- METIER ----------

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

def rafraichir_materiel():
    listbox_materiel.delete(0, tk.END)
    for m in inventaire:
        if m.disponible:
            listbox_materiel.insert(tk.END, f"{m.reference} - {m.nom}")

def creer_emprunt():
    nom = entry_nom.get()
    prenom = entry_prenom.get()
    justification = entry_justification.get()
    prof = entry_prof.get()
    selection = listbox_materiel.curselection()

    if not all([nom, prenom, justification, prof]):
        messagebox.showerror("Erreur", "Tous les champs sont obligatoires")
        return

    if not selection:
        messagebox.showerror("Erreur", "Aucun materiel selectionne")
        return

    materiels = []
    for index in selection:
        ref = listbox_materiel.get(index).split(" - ")[0]
        materiels.append(ref)
        for m in inventaire:
            if m.reference == ref:
                m.disponible = False

    emprunts = charger_emprunts()
    emprunts.append({
        "nom": nom,
        "prenom": prenom,
        "date": str(date.today()),
        "justification": justification,
        "prof": prof,
        "materiels": materiels,
        "statut": "en_cours"
    })
    sauvegarder_emprunts(emprunts)

    rafraichir_materiel()
    rafraichir_emprunts()
    messagebox.showinfo("OK", "Emprunt cree")

def rafraichir_emprunts():
    listbox_emprunts.delete(0, tk.END)
    for e in charger_emprunts():
        if e["statut"] == "en_cours":
            refs = ", ".join(e["materiels"])
            listbox_emprunts.insert(
                tk.END,
                f'{e["prenom"]} {e["nom"]} | {refs} | {e["date"]}'
            )

def retour_materiel():
    selection = listbox_emprunts.curselection()
    if not selection:
        messagebox.showerror("Erreur", "Aucun emprunt selectionne")
        return

    index = selection[0]
    emprunts = charger_emprunts()
    emprunt = [e for e in emprunts if e["statut"] == "en_cours"][index]

    emprunt["statut"] = "termine"

    for ref in emprunt["materiels"]:
        for m in inventaire:
            if m.reference == ref:
                m.disponible = True

    sauvegarder_emprunts(emprunts)
    rafraichir_materiel()
    rafraichir_emprunts()
    messagebox.showinfo("OK", "Materiel retourne")

# ---------- INTERFACE ----------

root = tk.Tk()
root.title("Gestion des emprunts")

# --- Ajout materiel
frame_mat = tk.LabelFrame(root, text="Materiel")
frame_mat.pack(fill="x", padx=10, pady=5)

entry_ref = tk.Entry(frame_mat)
entry_nom_mat = tk.Entry(frame_mat)
tk.Label(frame_mat, text="Reference").grid(row=0, column=0)
entry_ref.grid(row=0, column=1)
tk.Label(frame_mat, text="Nom").grid(row=1, column=0)
entry_nom_mat.grid(row=1, column=1)
tk.Button(frame_mat, text="Ajouter", command=ajouter_materiel).grid(row=2, column=0, columnspan=2)

# --- Materiel dispo
listbox_materiel = tk.Listbox(root, selectmode=tk.MULTIPLE, height=5)
listbox_materiel.pack(fill="x", padx=10)

# --- Emprunt
frame_emp = tk.LabelFrame(root, text="Nouvel emprunt")
frame_emp.pack(fill="x", padx=10, pady=5)

entry_nom = tk.Entry(frame_emp)
entry_prenom = tk.Entry(frame_emp)
entry_justification = tk.Entry(frame_emp)
entry_prof = tk.Entry(frame_emp)

labels = ["Nom", "Prenom", "Justification", "Prof"]
entries = [entry_nom, entry_prenom, entry_justification, entry_prof]

for i in range(4):
    tk.Label(frame_emp, text=labels[i]).grid(row=i, column=0)
    entries[i].grid(row=i, column=1)

tk.Button(frame_emp, text="Creer emprunt", command=creer_emprunt).grid(row=4, column=0, columnspan=2)

# --- Emprunts en cours
frame_retour = tk.LabelFrame(root, text="Emprunts en cours")
frame_retour.pack(fill="both", padx=10, pady=5)

listbox_emprunts = tk.Listbox(frame_retour, height=6)
listbox_emprunts.pack(fill="both")

tk.Button(frame_retour, text="Confirmer retour", command=retour_materiel).pack(pady=5)

rafraichir_emprunts()
root.mainloop()
