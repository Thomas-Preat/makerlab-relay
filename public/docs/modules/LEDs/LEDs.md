---
title: LEDs
description: "Apprenez à connecter et à utiliser Des LEDs RGB"
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# LED adressable - Guide d'utilisation


***

<Tabs>
<TabItem value="Explication" label="Explication">

## 🔹 Introduction

L'utilisation de **LEDs adressables** comme les **WS2812** ou **Neopixel** permet d'afficher des effets lumineux avancés en utilisant un **Raspberry Pi Pico**. Grâce à la librairie **Neopixel**, la gestion des couleurs et des animations est simplifiée.

## 🧠 Installation  et Validation de la librairie Neopixel

Pour faciliter l'utilisation des LEDs, il est nécessaire d'installer la librairie **Neopixel** sur le **Raspberry Pi Pico**.

### Étapes d'installation
1. **Télécharger le fichier `neopixel.py` qui se trouve dans la partie `Librairie`**

2. **Transférer** le fichier sur le Pico

### Vérification de l'installation en important la librairie dans un script Python

Pour commencer à utiliser la bibliothèque, vous devez d'abord l'importer avec la ligne de code suivante :

```python
from neopixel import Neopixel
```

Cela importe la classe depuis la bibliothèque qui est utilisée pour contrôler la bande de LED. Mais pour l'utiliser, vous devez instancier un objet de cette classe avec la ligne de code suivante :

```python
pixels = Neopixel(10, 0, 0, "RGBW")
```

Cela crée une instance pour 10 LED sur la machine d'état 0 et la broche 0 en mode RGBW.

La classe `Neopixel` accepte 5 arguments, dont 3 sont obligatoires. Voici les arguments et leur signification dans le même ordre que celui accepté par la classe :

- **num_leds** : nombre de LED sur votre bande LED
- **state_machine** : identifiant de la machine d'état PIO utilisée
- **pin** : broche à laquelle est connectée la ligne de données de la bande LED
- **mode** : [par défaut : "RGB"] mode et ordre des bits représentant la valeur de couleur. Cela peut être n'importe quel ordre de RGB ou RGBW (les neopixels sont généralement en GRB)
- **delay** : [par défaut : 0.0001] délai utilisé pour le verrouillage des LED lors de l'envoi des données



Si aucune erreur ne s'affiche, la librairie est bien installée.


## 🔧 Matériel Requis

- Raspberry Pi Pico
- Ruban LED adressable Neopixel
- Alimentation externe 5V (recommandée pour plusieurs LED)
- Fils de connexion (Dupont)

## 🔌 Connexions

| Broche LED | Broche Pico |
|------------|------------|
| **VCC** (5V) | **VBUS** (5V) |
| **GND** | **GND** |
| **Data In** | **GP28** |

Le **signal Data** peut être connecté sur une autre broche GPIO si nécessaire.

## 💻 Code d'exemple (MicroPython) 

```python
import time
from neopixel import Neopixel

numpix = 30  # Nombre de LEDs
strip = Neopixel(numpix, 0, 28, "GRB")  # GP28 utilisé
strip.brightness(50)  # Réglage de la luminosité (1 à 255)
```

## ⚙️ Explication des Commandes  

| Fonction | Description |
|-----------------------------|-------------|
| `Neopixel(numpix, state_machine, pin, mode)` | Initialise une bande LED Neopixel. Paramètres : nombre de LEDs, numéro de machine d’état (0 à 3), pin de sortie, et l’ordre des couleurs (ex. "GRB"). |
| `strip.brightness(valeur)` | Définit la luminosité globale des LEDs. valeur est comprise entre 1 (très faible) et 255 (très lumineux). |
| `set_pixel(index, (r, g, b[, w]))`| Modifie la couleur d’un pixel donné, en tenant compte de la luminosité. |
| `set_pixel_line(p1, p2, (r, g, b[, w]))` | Applique une couleur à une série de pixels entre les indices p1 et p2. |
| `set_pixel_line_gradient(p1, p2, (r, g, b[, w]), (r, g, b[, w]))` | Applique un dégradé entre deux couleurs sur une série de LEDs. |
| `fill((r, g, b[, w]))` | Remplit toute la bande LED avec la même couleur. |
| `rotate_left(n)`	| Fait tourner les LEDs vers la gauche de n positions.|
| `rotate_right(n)`	| Fait tourner les LEDs vers la droite de n positions.|
| `colorHSV(h, s, v)` |	Convertit une couleur en format HSV vers RGB, utile pour les effets.|
| `show()` | Met à jour la bande LED avec les dernières couleurs définies. À appeler après modifications.|


## 📚 Conclusion


## 🔗 Références

</TabItem>
<TabItem value="Schéma" label="Schéma">

![alt text](@site/static/img/LEDs/montage_led_pico.png)

</TabItem>
<TabItem value = "Librairie" label="Librairie">

```python title="Librairie pour neopixel" showLineNumbers

import array, time
from machine import Pin
import rp2

# PIO state machine for RGB. Pulls 24 bits (rgb -> 3 * 8bit) automatically
@rp2.asm_pio(sideset_init=rp2.PIO.OUT_LOW, out_shiftdir=rp2.PIO.SHIFT_LEFT, autopull=True, pull_thresh=24)
def ws2812():
    T1 = 2
    T2 = 5
    T3 = 3
    wrap_target()
    label("bitloop")
    out(x, 1)               .side(0)    [T3 - 1]
    jmp(not_x, "do_zero")   .side(1)    [T1 - 1]
    jmp("bitloop")          .side(1)    [T2 - 1]
    label("do_zero")
    nop().side(0)                       [T2 - 1]
    wrap()

# PIO state machine for RGBW. Pulls 32 bits (rgbw -> 4 * 8bit) automatically
@rp2.asm_pio(sideset_init=rp2.PIO.OUT_LOW, out_shiftdir=rp2.PIO.SHIFT_LEFT, autopull=True, pull_thresh=32)
def sk6812():
    T1 = 2
    T2 = 5
    T3 = 3
    wrap_target()
    label("bitloop")
    out(x, 1)               .side(0)    [T3 - 1]
    jmp(not_x, "do_zero")   .side(1)    [T1 - 1]
    jmp("bitloop")          .side(1)    [T2 - 1]
    label("do_zero")
    nop()                   .side(0)    [T2 - 1]
    wrap()


# Delay here is the reset time. You need a pause to reset the LED strip back to the initial LED
# however, if you have quite a bit of processing to do before the next time you update the strip
# you could put in delay=0 (or a lower delay)
#
# Class supports different order of individual colors (GRB, RGB, WRGB, GWRB ...). In order to achieve
# this, we need to flip the indexes: in 'RGBW', 'R' is on index 0, but we need to shift it left by 3 * 8bits,
# so in it's inverse, 'WBGR', it has exactly right index. Since micropython doesn't have [::-1] and recursive rev()
# isn't too efficient we simply do that by XORing (operator ^) each index with 3 (0b11) to make this flip.
# When dealing with just 'RGB' (3 letter string), this means same but reduced by 1 after XOR!.
# Example: in 'GRBW' we want final form of 0bGGRRBBWW, meaning G with index 0 needs to be shifted 3 * 8bit ->
# 'G' on index 0: 0b00 ^ 0b11 -> 0b11 (3), just as we wanted.
# Same hold for every other index (and - 1 at the end for 3 letter strings).

class Neopixel:
    def __init__(self, num_leds, state_machine, pin, mode="RGB", delay=0.0001):
        self.pixels = array.array("I", [0 for _ in range(num_leds)])
        self.mode = set(mode)   # set for better performance
        if 'W' in self.mode:
            # RGBW uses different PIO state machine configuration
            self.sm = rp2.StateMachine(state_machine, sk6812, freq=8000000, sideset_base=Pin(pin))
            # dictionary of values required to shift bit into position (check class desc.)
            self.shift = {'R': (mode.index('R') ^ 3) * 8, 'G': (mode.index('G') ^ 3) * 8,
                          'B': (mode.index('B') ^ 3) * 8, 'W': (mode.index('W') ^ 3) * 8}
        else:
            self.sm = rp2.StateMachine(state_machine, ws2812, freq=8000000, sideset_base=Pin(pin))
            self.shift = {'R': ((mode.index('R') ^ 3) - 1) * 8, 'G': ((mode.index('G') ^ 3) - 1) * 8,
                          'B': ((mode.index('B') ^ 3) - 1) * 8, 'W': 0}
        self.sm.active(1)
        self.num_leds = num_leds
        self.delay = delay
        self.brightnessvalue = 255

    # Set the overal value to adjust brightness when updating leds
    def brightness(self, brightness=None):
        if brightness == None:
            return self.brightnessvalue
        else:
            if brightness < 1:
                brightness = 1
        if brightness > 255:
            brightness = 255
        self.brightnessvalue = brightness

    # Create a gradient with two RGB colors between "pixel1" and "pixel2" (inclusive)
    # Function accepts two (r, g, b) / (r, g, b, w) tuples
    def set_pixel_line_gradient(self, pixel1, pixel2, left_rgb_w, right_rgb_w):
        if pixel2 - pixel1 == 0:
            return
        right_pixel = max(pixel1, pixel2)
        left_pixel = min(pixel1, pixel2)

        for i in range(right_pixel - left_pixel + 1):
            fraction = i / (right_pixel - left_pixel)
            red = round((right_rgb_w[0] - left_rgb_w[0]) * fraction + left_rgb_w[0])
            green = round((right_rgb_w[1] - left_rgb_w[1]) * fraction + left_rgb_w[1])
            blue = round((right_rgb_w[2] - left_rgb_w[2]) * fraction + left_rgb_w[2])
            # if it's (r, g, b, w)
            if len(left_rgb_w) == 4 and 'W' in self.mode:
                white = round((right_rgb_w[3] - left_rgb_w[3]) * fraction + left_rgb_w[3])
                self.set_pixel(left_pixel + i, (red, green, blue, white))
            else:
                self.set_pixel(left_pixel + i, (red, green, blue))

    # Set an array of pixels starting from "pixel1" to "pixel2" (inclusive) to the desired color.
    # Function accepts (r, g, b) / (r, g, b, w) tuple
    def set_pixel_line(self, pixel1, pixel2, rgb_w):
        for i in range(pixel1, pixel2 + 1):
            self.set_pixel(i, rgb_w)

    # Set red, green and blue value of pixel on position <pixel_num>
    # Function accepts (r, g, b) / (r, g, b, w) tuple
    def set_pixel(self, pixel_num, rgb_w):
        pos = self.shift

        red = round(rgb_w[0] * (self.brightness() / 255))
        green = round(rgb_w[1] * (self.brightness() / 255))
        blue = round(rgb_w[2] * (self.brightness() / 255))
        white = 0
        # if it's (r, g, b, w)
        if len(rgb_w) == 4 and 'W' in self.mode:
            white = round(rgb_w[3] * (self.brightness() / 255))

        self.pixels[pixel_num] = white << pos['W'] | blue << pos['B'] | red << pos['R'] | green << pos['G']

    # Converts HSV color to rgb tuple and returns it
    # Function accepts integer values for <hue>, <saturation> and <value>
    # The logic is almost the same as in Adafruit NeoPixel library:
    # https://github.com/adafruit/Adafruit_NeoPixel so all the credits for that
    # go directly to them (license: https://github.com/adafruit/Adafruit_NeoPixel/blob/master/COPYING)
    def colorHSV(self, hue, sat, val):
        if hue >= 65536:
            hue %= 65536

        hue = (hue * 1530 + 32768) // 65536
        if hue < 510:
            b = 0
            if hue < 255:
                r = 255
                g = hue
            else:
                r = 510 - hue
                g = 255
        elif hue < 1020:
            r = 0
            if hue < 765:
                g = 255
                b = hue - 510
            else:
                g = 1020 - hue
                b = 255
        elif hue < 1530:
            g = 0
            if hue < 1275:
                r = hue - 1020
                b = 255
            else:
                r = 255
                b = 1530 - hue
        else:
            r = 255
            g = 0
            b = 0

        v1 = 1 + val
        s1 = 1 + sat
        s2 = 255 - sat

        r = ((((r * s1) >> 8) + s2) * v1) >> 8
        g = ((((g * s1) >> 8) + s2) * v1) >> 8
        b = ((((b * s1) >> 8) + s2) * v1) >> 8

        return r, g, b


    # Rotate <num_of_pixels> pixels to the left
    def rotate_left(self, num_of_pixels):
        if num_of_pixels == None:
            num_of_pixels = 1
        self.pixels = self.pixels[num_of_pixels:] + self.pixels[:num_of_pixels]

    # Rotate <num_of_pixels> pixels to the right
    def rotate_right(self, num_of_pixels):
        if num_of_pixels == None:
            num_of_pixels = 1
        num_of_pixels = -1 * num_of_pixels
        self.pixels = self.pixels[num_of_pixels:] + self.pixels[:num_of_pixels]

    # Update pixels
    def show(self):
        # If mode is RGB, we cut 8 bits of, otherwise we keep all 32
        cut = 8
        if 'W' in self.mode:
            cut = 0
        for i in range(self.num_leds):
            self.sm.put(self.pixels[i], cut)
        time.sleep(self.delay)

    # Set all pixels to given rgb values
    # Function accepts (r, g, b) / (r, g, b, w)
    def fill(self, rgb_w):
        for i in range(self.num_leds):
            self.set_pixel(i, rgb_w)
        time.sleep(self.delay)
        
```

</TabItem>
</Tabs>