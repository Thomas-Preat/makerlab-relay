# Écran LCD Pmod Digilent (16x2) - Guide d'utilisation

Bienvenue sur la documentation du LCD

## 🔹 Introduction
L'écran **LCD Pmod Digilent (16x2)** est un afficheur compatible avec les microcontrôleurs et fonctionne en mode **8 bits** pour afficher des caractères sur **2 lignes de 16 colonnes**.

## 🧠 Fonctionnement de l'écran
L'écran fonctionne avec un **contrôleur HD44780**, permettant une communication en mode **8 bits**. Voici les modes possibles :

- **Mode 8 bits** : Transmission rapide mais requiert plus de connexions.
- **Mode 4 bits** : Moins de fils requis, mais vitesse réduite.

## 🔧 Matériel Requis
- **Raspberry Pi Pico** (avec MicroPython installé)
- **Écran LCD PmodCLP Digilent (16x2)**
- **Fils de connexion**
- **Breadboard** (facultatif)

## 🔌 Schéma de Connexion (Mode 8 bits)

| **Broche LCD** | **Pico** | **Fonction** |
|---------------|---------|-------------|
| **VCC**  | **3V3** | Alimentation |
| **GND**  | **GND** | Masse |
| **RS**   | **GP17** | Sélection registre |
| **E**    | **GP16** | Activation |
| **D0**   | **GP28** | Données bit 0 |
| **D1**   | **GP27** | Données bit 1 |
| **D2**   | **GP26** | Données bit 2 |
| **D3**   | **GP22** | Données bit 3 |
| **D4**   | **GP21** | Données bit 4 |
| **D5**   | **GP20** | Données bit 5 |
| **D6**   | **GP19** | Données bit 6 |
| **D7**   | **GP18** | Données bit 7 |

:::tip
**Attention** : L'écran fonctionne en **3.3V** uniquement !
:::

## 💻 Code d'exemple (Raspberry Pi Pico - Mode 8 bits)

```python
import machine
import utime
import lcd  # Librairie LCD

# Configuration des broches
t_rs = machine.Pin(17, machine.Pin.OUT)
t_e = machine.Pin(16, machine.Pin.OUT)
t_data = [
    machine.Pin(28, machine.Pin.OUT),
    machine.Pin(27, machine.Pin.OUT),
    machine.Pin(26, machine.Pin.OUT),
    machine.Pin(22, machine.Pin.OUT),
    machine.Pin(21, machine.Pin.OUT),
    machine.Pin(20, machine.Pin.OUT),
    machine.Pin(19, machine.Pin.OUT),
    machine.Pin(18, machine.Pin.OUT)
]

lcd.lcd_init(t_rs, t_e, t_data)

lcd.lcd_set_cursor(t_rs, t_e, t_data, 0, 0)
lcd.lcd_write_string(t_rs, t_e, t_data, "Hello, PmodCLP!")

lcd.lcd_set_cursor(t_rs, t_e, t_data, 1, 0)
lcd.lcd_write_string(t_rs, t_e, t_data, "LCD Connecte!")

while True:
    utime.sleep(1)
```