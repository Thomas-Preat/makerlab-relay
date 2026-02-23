---
title: Clavier Matriciel
description: "Apprenez à connecter et à utiliser un clavier matriciel"
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Module Clavier Matriciel - Guide d'utilisation

***

<Tabs>
<TabItem value="Explication" label="Explication">

## 🔹 Introduction

Le **clavier matriciel Pmod KYPD** est un module 16 touches (4x4) utilisé pour saisir des entrées numériques ou alphanumériques. Il fonctionne en scannant les lignes et colonnes pour identifier la touche pressée.

Il est souvent utilisé dans les projets embarqués comme les systèmes de sécurité, les interfaces utilisateur ou les menus de navigation.

## 🧠 Fonctionnement du Clavier Matriciel

Le clavier est organisé en **4 lignes** et **4 colonnes**. Lorsqu'une touche est pressée, elle connecte une ligne à une colonne. Le microcontrôleur active une ligne à la fois et lit les colonnes pour détecter quelle touche est enfoncée. Ce processus s'appelle le **balayage matriciel** (keypad scanning).


## 🔧 Matériel Requis

- Clavier matriciel Pmod KYPD
- Raspberry Pi Pico
- Fils de connexion Dupont
- Optionnel : breadboard


## 🔌 Connexions

| **Broche KYPD** | **Fonction** | **Broche Raspberry Pi Pico** |
|-----------------|--------------|-------------------------------|
| ROW1            | Ligne 0      | GP2                           |
| ROW2            | Ligne 1      | GP3                           |
| ROW3            | Ligne 2      | GP4                           |
| ROW4            | Ligne 3      | GP5                           |
| COL1            | Colonne 0    | GP6                           |
| COL2            | Colonne 1    | GP7                           |
| COL3            | Colonne 2    | GP8                           |
| COL4            | Colonne 3    | GP9                           |
| VCC             | Alimentation | 3V3                           |
| GND             | Masse        | GND                           |

:::info

Certaines versions du module ont un connecteur pour les lignes, et un autre pour les colonnes. Assurez-vous d’alimenter le module via l’un des VCC et GND.

:::


## 💻 Code d'exemple (MicroPython)

```python
from machine import Pin
import time

# Définir les pins pour lignes et colonnes
rows = [Pin(i, Pin.OUT) for i in (2, 3, 4, 5)]
cols = [Pin(i, Pin.IN, Pin.PULL_UP) for i in (9, 8, 7, 6)]

keys = [
    ['1','2','3','A'],
    ['4','5','6','B'],
    ['7','8','9','C'],
    ['0','F','E','D']
]

def scan_keypad():
    for row_idx, row_pin in enumerate(rows):
        row_pin.low()
        for col_idx, col_pin in enumerate(cols):
            if col_pin.value() == 0:
                row_pin.high()
                return keys[row_idx][col_idx]
        row_pin.high()
    return None

while True:
    key = scan_keypad()
    if key:
        print("Touche appuyée:", key)
        time.sleep(0.3)
```

## ⚙️ Explication des Commandes  

|Fonction | Description|
|-----------------------------|-------------|
| `Pin(i, Pin.OUT)` | Définit une broche en sortie (lignes activées une à une)|
| `Pin(i, Pin.IN, Pin.PULL_UP)` | Définit une broche en entrée avec pull-up (colonnes à lire)|
| `scan_keypad()` | Scanne les lignes et détecte une touche en fonction des colonnes activées|
| `key` | Contient la touche actuellement pressée|

## 📚 Conclusion

Le Pmod KYPD est un module simple et pratique pour ajouter de l’interaction à vos projets embarqués. Grâce à une organisation en matrice, il réduit le nombre de broches nécessaires tout en permettant la saisie de 16 touches.

## 🔗 Références

Pmod KYPD : https://digilent.com/reference/pmod/pmodkypd/start?srsltid=AfmBOoow3ruhCgQTPSi_H2as7A0O_vryA9a0LiWcgCpkTEG2p0UWlOs_
</TabItem>
<TabItem value="Schéma" label="Schéma">

![alt text](@site/static/img/KYPD/Matriciel.png)

</TabItem>

</Tabs>

