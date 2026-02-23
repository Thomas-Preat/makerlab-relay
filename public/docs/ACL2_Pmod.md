# Accéléromètre 2 Pmod

## Description
Apprenez à connecter et à utiliser un accéléromètre.

---

## 🔹 Introduction

Les capteurs inertiels sont utilisés pour détecter le mouvement linéaire d’un objet. Il existe deux types de capteurs inertiels : les accéléromètres qui détectent l’accélération linéaire et les gyroscopes qui détectent le mouvement de rotation. Les accéléromètres et gyroscopes sont largement utilisés dans plusieurs applications, notamment l’aérospatiale, l’armée, l’automobile, les téléphones mobiles et l’électronique grand public. Par exemple, dans les téléphones mobiles, des capteurs de gyroscope et d’accéléromètre sont utilisés pour la rotation de l’écran.

> ⚠ Test de BlockQuote ⚠

## 🧠 Fonctionnement de l'ADXL362 

ADXL362 est un petit accéléromètre à 3 axes qui présente une plage dynamique de +/-16g avec une résolution de 13 bits, une bande passante maximale de 3200Hz et un taux de transfert de données maximal de 3200 fois par seconde. C’est un capteur d’accéléromètre numérique et produit des valeurs numériques d’accélération dans trois axes. Le capteur délivre des données formatées en 16 bits accessible via les interfaces SPI ou I2C. Ce capteur est ultra-faible puissance et consomme seulement 23 uA en mode mesure et 0,1 uA en mode veille.

## 🔧 Matériel Requis

- Module PmodACL2
- Raspberry Pi Pico
- Câbles de connexion

## 🔌 Connexions


| Broche ACL | Broche Raspberry Pi Pico |
|------------|--------------------------|
| CS         | CS                       |
| MOSI       | GP19                     |
| MISO       | GP16                     |
| SCLK       | GP18                     |
| GND        | GND                      |
| VCC        | 3V3(OUT)                 |

## 💻 Code d'exemple (MicroPython)

```python
from adafruit_adx162 import ADXL362  # On importe notre librairie
import time

accel = ADXL362(sck=18, mosi=19, miso=16, cs=17)  # Adapte à tes broches

while True:
    x, y, z = accel.read_acceleration()
    print("X:", x, "Y:", y, "Z:", z)
    time.sleep(0.5)
```

## ⚙️ Explication des Commandes  

| Fonction | Description |
|-----------------------------|-------------|
| `ADXL362(sck, mosi, miso, cs, spi_id=0 )` | Initialisation du capteur ADXL345 en SPI avec choix des pins SPI. |
| `read_acceleration()` | Lit les valeurs d'accélération sur les axes X, Y, Z et les retourne sous forme de tuple (x, y, z). |
| `adxl.set_range(4)` | Permet de modifier la plage dynamique (par défaut à 16). Valeur possible : 2, 4, 8 et 16 |

## 📚 Conclusion

Les accéléromètres sont des capteurs très utiles pour les projets étudiants. Faciles à utiliser et peu coûteux, ils permettent d’ajouter de l’interaction à un système. Ils sont parfaits pour mesurer des mouvements, détecter des chocs ou encore stabiliser un objet dans des petits projets électroniques ou robotiques.

## 🔗 Références

datasheet du PmodACL2 : https://digilent.com/reference/pmod/pmodacl2/start?srsltid=AfmBOoqz5BbxqBLblBd3OTDHwM0oboKxD4Dmg36rt_SeREvYIv1813Oi

</TabItem>
<TabItem value="Schéma" label="Schéma">

![Schéma Figma du montage](@site/static/img/ACL/ACL_pico.png)

</TabItem>
<TabItem value = "Librairie" label="Librairie">

```python title="Librairie pour ACL2" showLineNumbers
import machine
import time

class ADXL362:
    def __init__(self, sck, mosi, miso, cs, spi_id=0):
        self.cs = machine.Pin(cs, machine.Pin.OUT)
        self.spi = machine.SPI(spi_id, baudrate=5000000, polarity=0, phase=0,
                               sck=machine.Pin(sck), mosi=machine.Pin(mosi), miso=machine.Pin(miso))

        self.cs.value(1)
        self.init_adxl362()

    def write_register(self, reg, value):
        self.cs.value(0)
        self.spi.write(bytearray([0x0A, reg, value]))  # 0x0A = Write Register
        self.cs.value(1)

    def read_register(self, reg, length=1):
        self.cs.value(0)
        self.spi.write(bytearray([0x0B, reg]))  # 0x0B = Read Register
        result = self.spi.read(length)
        self.cs.value(1)
        return result

    def read_acceleration(self):
        data = self.read_register(0x0E, 6)  # Adresse de base pour X, Y, Z (ACL2)

        def to_signed(val):
            return val - 65536 if val & 0x8000 else val

        x = to_signed(data[1] << 8 | data[0])
        y = to_signed(data[3] << 8 | data[2])
        z = to_signed(data[5] << 8 | data[4])

        return x, y, z


    def init_adxl362(self):
        # Soft reset
        self.write_register(0x1F, 0x52)
        time.sleep(0.01)

        # Mode mesure : mise sous tension + active
        self.write_register(0x20, 0x02)  # Mesure mode: normal
        self.write_register(0x2D, 0x02)  # Mise en mode mesure
        time.sleep(0.1)
```
</TabItem>
</Tabs>