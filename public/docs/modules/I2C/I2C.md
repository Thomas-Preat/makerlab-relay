---
title: Module I2C
description: "Apprenez à connecter et à utiliser un module I2C avec un LCD"
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Module I2C - Guide d'utilisation

***

<Tabs>
<TabItem value="Explication" label="Explication">

## 🔹 Introduction

L'interface **I2C (Inter-Integrated Circuit)** est un protocole de communication série permettant de connecter plusieurs périphériques avec seulement **deux fils** :
- **SDA (Serial Data)** : ligne de données
- **SCL (Serial Clock)** : ligne d'horloge

L'utilisation d'un **module I2C** pour un écran **LCD 1602 ou 2004** permet de simplifier les connexions et de libérer les broches du **Raspberry Pi Pico**.

## 🧠 Fonctionnement de l'I2C

L'I2C fonctionne sur un principe **maître-esclave**, où le **Raspberry Pi Pico** joue le rôle de **maître** et l'écran LCD via son module I2C est un **esclave**. Chaque périphérique possède une **adresse unique** permettant au maître de communiquer avec lui.

Le module I2C pour LCD contient un **expandeur de port** (généralement un **PCF8574**) qui convertit les signaux I2C en signaux compatibles avec l'écran LCD.

## 🔧 Matériel Requis

- Module **I2C pour LCD** (PCF8574)
- Écran **LCD 16x2 ou 20x4**
- Raspberry Pi Pico
- Câbles de connexion

## 🔌 Connexions

Le module **I2C** est équipé de **4 broches** :

| Broche | Description |
|--------|------------|
| **GND** | Masse, connectée au GND du Raspberry Pi Pico et de l'alimentation externe |
| **VCC** | Alimentation entre **4.5V et 6V** (**VBUS du Pico**) |
| **SDA** | Ligne de données I2C |
| **SCL** | Ligne d'horloge I2C |

## 🔍 Détection de l'adresse I2C

Avant de coder, il faut **vérifier l'adresse** de l'écran LCD sur le bus I2C.

```python
import machine

sda = machine.Pin(0)
scl = machine.Pin(1)
i2c = machine.I2C(0,sda=sda,scl=scl, freq=400000)
print(i2c.scan())
```

Si le module est correctement connecté, cette commande affichera une **valeur numérique** comme `37` ou `26`.

## 💻 Code d'exemple (MicroPython)

Voici un code simple pour tester les fonctionnalités de base de votre écran LCD via I2C :

```python
import utime
from machine import I2C, Pin
from lcd_api import LcdApi
from pico_i2c_lcd import I2cLcd


I2C_ADRESSE     = 39 #Adresse à changer (voir Détection de l'adresse I2C)
I2C_NUM_LIGNE = 2
I2C_NUM_COLONNE = 16

# Déclaration des pins d'utilisation
i2c = I2C(0, sda=machine.Pin(0), scl=machine.Pin(1), freq=400000)
lcd = I2cLcd(i2c, I2C_ADRESSE, I2C_NUM_LIGNE, I2C_NUM_COLONNE)

# Implémentation de la fonction pour afficher
def salutation():
    lcd.backlight_on()
    lcd.move_to(6,0)
    lcd.putstr("Test")
    lcd.move_to(3,1)
    lcd.putstr("sur le LCD")
    utime.sleep(2)
    lcd.clear()
    lcd.backlight_off()
    lcd.move_to(4,0)
    lcd.putstr("Mode nuit")
    utime.sleep(2)
    lcd.clear()

# Appelle de la fonction
salutation()    

```

## ⚙️ Explication des Commandes  

| Fonction | Description |  
|---------------------------|-----------------------------------------------------------|  
| `lcd.putstr("text")` | Affiche une chaîne de caractères sur l'écran LCD |  
| `lcd.clear()` | Efface l'écran |  
| `lcd.backlight_on()` | Active le rétroéclairage |  
| `lcd.backlight_off()` | Désactive le rétroéclairage |  
| `lcd.move_to(x, y)` | Déplace le curseur à une position spécifique |  


## 📚 Conclusion

L'utilisation d'un **module I2C** simplifie grandement la connexion d'un écran **LCD** avec un **Raspberry Pi Pico** en réduisant le nombre de broches utilisées. L'I2C est un protocole puissant permettant d'ajouter plusieurs périphériques sur un même bus.

## 🔗 Références

- **Datasheet PCF8574** : https://www.alldatasheet.fr/datasheet-pdf/view/78282/POWERTIP/PC1602F.html
- **Documentation MicroPython I2C** : https://www.handsontec.com/dataspecs/module/I2C_1602_LCD.pdf

</TabItem>
<TabItem value="Schéma" label="Schéma">

Le module **LCD** est équipé de **16 broches** :  
Pour que la connectivité entre le **LCD** et le **I2C** fonctionne, il faut décaler le module **I2C** de 2 PINs vers la gauche, comme ceci :  

![Schéma Figma du montage](@site/static/img/I2C_LCD/Schema-Figma.png)  

On va donc brancher la PIN **Vcc** du **I2C** dans le **VBUS** du pico ainsi que le **GND** dans un des **GND**. Pour ce qui est des PIN **SDA** et **SCL** du module **I2C**, vous avez l'embarras du choix car il en existe plusieurs sur le pico comme le montre cette image :  

![Schéma Figma du montage](@site/static/img/I2C_LCD/Info-Pin-Pico.png)  


</TabItem>
<TabItem value = "Librairie" label="Librairie">

Cliquez sur le bouton ci-dessous pour télécharger le dossier compressé :

[![Télécharger le dossier](https://img.shields.io/badge/Télécharger%20le%20dossier-blue)](/script/LCD_I2C.zip)

:::tip

N'oubliez pas d'uploader les fichiers **lcd_api.py** et **pico_i2c_lcd.py** sur le pico si vous lancez le script **example1.py**.

:::

</TabItem>
</Tabs>