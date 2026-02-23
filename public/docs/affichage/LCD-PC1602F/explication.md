# Écran LCD 16x2 (PC1602F) - Guide d'utilisation

Bienvenue sur la documentation du LCD

## 🔹 Introduction
L'écran **LCD 16x2** est un afficheur très utilisé en électronique. Il permet d'afficher **16 caractères sur 2 lignes** et peut être piloté en mode parallèle ou via un module **I2C** pour simplifier le câblage.

## 🧠 Fonctionnement de l'écran
Le module **LCD PC1602F** est un afficheur **alphanumérique** pouvant afficher **2 lignes de 16 caractères**. Il fonctionne sur la base du **contrôleur Hitachi HD44780**, qui permet une communication en mode **4 bits ou 8 bits**. Ici, nous utilisons le mode **8 bits** pour une transmission complète des données.

- **Mode 8 bits** : Utilise 8 lignes de données pour envoyer les caractères (plus rapide, mais plus de connexions requises).  
- **Mode 4 bits** : Utilise seulement 4 lignes de données (plus lent, mais réduit le nombre de fils nécessaires).

## 🔧 Matériel Requis
- Écran LCD 16x2 (PC1602F)
- Microcontrôleur (Raspberry Pi Pico, Arduino, ESP32...)
- Potentiomètre (pour régler le contraste)
- Module I2C (optionnel)
- Câbles de connexion

## 💻 Code d'exemple (MicroPython)
Voici un exemple pour contrôler l'écran LCD 16x2 avec un Raspberry Pi Pico :

```python
import machine
import utime
import lcd  # Importe la librairie lcd.py

# Configuration des broches en mode 8 bits
rs_pin = machine.Pin(4)
e_pin  = machine.Pin(5)
data_pins = [machine.Pin(i) for i in range(6, 14)]

lcd.lcd_init(rs_pin, e_pin, data_pins)
lcd.lcd_set_cursor(rs_pin, e_pin, data_pins, 0, 0)
lcd.lcd_write_string(rs_pin, e_pin, data_pins, "Hello, world!")
lcd.lcd_set_cursor(rs_pin, e_pin, data_pins, 1, 0)
lcd.lcd_write_string(rs_pin, e_pin, data_pins, "LCD connecte!")

while True:
    utime.sleep(1)
```
## ⚙️ Explication des Commandes

| Fonction                                         | Description                                |
| ------------------------------------------------ | ------------------------------------------ |
| `lcd.lcd_command(rs, e, data_pins, cmd)`         | Envoie une commande au LCD                 |
| `lcd.lcd_clear(rs, e, data_pins)`                | Efface l'écran LCD                         |
| `lcd.lcd_set_cursor(rs, e, data_pins, row, col)` | Positionne le curseur                      |
| `lcd.lcd_write_string(rs, e, data_pins, string)` | Affiche une chaîne de caractères           |
| `lcd.lcd_init(rs, e, data_pins)`                 | Initialise le LCD et prépare à l'affichage |

## 📚 Conclusion

Avec ce code et la librairie, vous pouvez facilement piloter un écran LCD 16x2 avec un Raspberry Pi Pico. Modifiez les pins selon votre projet.