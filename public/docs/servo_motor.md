---
title: Servo moteur
description: "Apprenez à connecter et à utiliser un servo moteur"
sidebar_position: 1
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Servo Moteur S03N STD - Guide d'utilisation

***

<Tabs>
<TabItem value="Explication" label="Explication">

## 🔹 Introduction

Cette documentation explique comment contrôler un servo moteur **S03N STD de GWServo** avec un Raspberry Pi Pico en utilisant MicroPython.

Nous allons voir comment :
- Câbler le servo moteur sur le Raspberry Pi Pico
- Écrire un script en MicroPython
- Résoudre les problèmes liés aux angles
- Exécuter le script

## 🧠 Fonctionnement du Servo Moteur

Un servo moteur est un moteur électrique contrôlé par un signal PWM. En envoyant un signal de largeur d'impulsion variable, il est possible de positionner l'axe du moteur à un angle précis.

- **Signal PWM** : permet de contrôler l'angle du servo
- **Alimentation externe recommandée** pour plusieurs servos

## 🔧 Matériel requis

- Raspberry Pi Pico
- Servo moteur **S03N STD de GWServo**
- Alimentation externe 5V (recommandée pour plusieurs servos)
- Fils de connexion (Dupont)

## 🔌Connexion

| **Broche Servo** | **Broche Raspberry Pi Pico** |
|-----------------|----------------------------|
| **VCC (rouge)** | **3V3(OUT)** |
| **GND (noir/marron)** | **GND** |
| **Signal (orange/blanc)** | **GP0** |

:::tip
*Utiliser une alimentation externe si plusieurs servos sont branchés pour éviter les chutes de tension.*
:::

## 💻 Code d'exemple (MicroPython)

Création du fichier script :

```python
from servo_motor import ServoMotor
import time

# Initialisation du servo sur le pin 0
servo = ServoMotor(pin_number=0)

# Test des angles de -90 à 90 degrés
print("Test des positions fixes")
for angle in [-90, -45, 0, 45, 90]:
    servo.set_angle(angle)
    print(f"Angle actuel: {servo.get_angle()}°")
    time.sleep(1)

# Test balayage
print("Test du balayage")
servo.sweep(start=-90, end=90, step=10, delay=0.1)

# Désactiver le servo
print("Désactivation du servo")
servo.detach()

```

:::caution

Problème d'angle bloqué à 180°

Le **S03N STD de GWServo** a une plage d'angles limitée par défaut. Si le servo semble bloqué à 180° :
- Vérifier les valeurs de `pulse_width_min` et `pulse_width_max`.
- Tester différents cycles de service pour voir la réaction du servo.
- Ce modèle peut avoir une amplitude réelle de 120° au lieu de 180°.

:::

## ⚙️ Explication des Commandes

| Fonction | Description |
|-----------------------------|-------------|
| `lcd_command(rs, e, data_pins, cmd)` | Envoie une commande au LCD (ex : initialisation, effacement, réglage du curseur). |
| `lcd_write_char(rs, e, data_pins, char)` | Affiche un **caractère unique** sur l'écran LCD. |
| `lcd_write_string(rs, e, data_pins, text)` | Affiche une **chaîne de caractères** sur l'écran. |
| `lcd_init(rs, e, data_pins)` | Initialise l'écran LCD et le prépare à l'affichage. |
| `lcd_set_cursor(rs, e, data_pins, row, col)` | Positionne le curseur à une ligne et colonne donnée. |


## 📚 Conclusion

Vous avez maintenant un script fonctionnel pour contrôler un servo moteur **S03N STD de GWServo** avec un Raspberry Pi Pico.

## 🔗 Références

- Documentation ServoMotor pour MicroPython : https://randomnerdtutorials.com/raspberry-pi-pico-servo-motor-micropython/
- Fiche technique S03N STD : https://www.pololu.com/product/519/faqs

</TabItem>
<TabItem value="Schéma" label="Schéma">

![Schéma Figma du montage](@site/static/img/Servo_motor/montage_servo_pico.png)

</TabItem>
<TabItem value = "Librairie" label="Librairie">

```python title="Librairie pour Servo moteur" showLineNumbers
from machine import Pin, PWM
import time

class ServoMotor:
    def __init__(self, pin_number, min_pulse=600, max_pulse=2400, frequency=50):
        self.pwm = PWM(Pin(pin_number))
        self.pwm.freq(frequency)
        self.min_pulse = min_pulse
        self.max_pulse = max_pulse
        self.angle = 0
    
    def set_angle(self, angle):
        if angle < -90:
            angle = -90
        elif angle > 90:
            angle = 90
        
        pulse_width = self._map(angle, -90, 90, self.min_pulse, self.max_pulse)
        self.pwm.duty_u16(int(pulse_width * 65535 / 20000))
        self.angle = angle
    
    def get_angle(self):
        return self.angle
    
    def calibrate(self, min_pulse, max_pulse):
        self.min_pulse = min_pulse
        self.max_pulse = max_pulse
    
    def sweep(self, start=-90, end=90, step=5, delay=0.05):
        for angle in range(start, end + step, step):
            self.set_angle(angle)
            time.sleep(delay)
        for angle in range(end, start - step, -step):
            self.set_angle(angle)
            time.sleep(delay)
    
    def detach(self):
        self.pwm.deinit()
    
    def _map(self, value, from_low, from_high, to_low, to_high):
        return to_low + (to_high - to_low) * (value - from_low) / (from_high - from_low)
```

</TabItem>
</Tabs>