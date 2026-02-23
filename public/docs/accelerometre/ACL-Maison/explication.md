# Module Accéléromètre - Guide d'utilisation

## 🔹 Introduction

Les capteurs inertiels sont utilisés pour détecter le mouvement linéaire d’un objet. Il existe deux types de capteurs inertiels : les accéléromètres qui détectent l’accélération linéaire et les gyroscopes qui détectent le mouvement de rotation. Les accéléromètres et gyroscopes sont largement utilisés dans plusieurs applications, notamment l’aérospatiale, l’armée, l’automobile, les téléphones mobiles et l’électronique grand public. Par exemple, dans les téléphones mobiles, des capteurs de gyroscope et d’accéléromètre sont utilisés pour la rotation de l’écran.

## 🧠 Fonctionnement de l'ACL Analogique 

ACL Analogique est un petit accéléromètre à 3 axes qui présente une plage dynamique. Il produit des valeurs numériques d’accélération dans trois axes. Il ne peut afficher que 2 axes en même temps car sur la partie avec les 4 Pins il possède un VCC, GND, AXE Z et un AXE sélectionné en fonction du positionnement du petit module noir sur les autres pins.

## 🔧 Matériel Requis

- Module ACL **Analogique**
- Raspberry Pi Pico
- Câbles de connexion

## 🔌 Connexions

| **Broche ACL** | **Broche Raspberry Pi Pico** |
|-----------------|----------------------------|
| **AXE X** | **GPO26** |
| **AXE Y** | **GPO27** |
| **GND** | **GND** |
| **VCC** | **3V3(OUT)** |

## 💻 Code d'exemple (MicroPython)

```python
from machine import ADC, Pin
import time

# Initialisation des ADC (GPIO 26, 27)
adc_x = ADC(Pin(26))
adc_y = ADC(Pin(27))

def read_axis(adc):
    raw = adc.read_u16()  # Valeur brute de 0 à 65535
    # Mapping vers -180 à 180
    mapped = ((raw / 65535) * 700) - 180  
    return int(mapped)

while True:
    x = read_axis(adc_x)
    y = read_axis(adc_y)
    z = read_axis(adc_z)

    print("X:", x, "Y:", y, "Z:", z)
    time.sleep(1)
```
## ⚙️ Explication des Commandes

| Fonction         | Description                                                                               |
| ---------------- | ----------------------------------------------------------------------------------------- |
| `read_axis(adc)` | Permet de lire les valeurs récupérées sur les Pins ADC et de les mapper entre -180 et 180 |

## 📚 Conclusion

Les accéléromètres sont des capteurs très utiles pour les projets étudiants. Faciles à utiliser et peu coûteux, ils permettent d’ajouter de l’interaction à un système. Ils sont parfaits pour mesurer des mouvements, détecter des chocs ou encore stabiliser un objet dans des petits projets électroniques ou robotiques.
