# Module Accéléromètre - Guide d'utilisation

## 🔹 Introduction

Les capteurs inertiels sont utilisés pour détecter le mouvement linéaire d’un objet. Il existe deux types de capteurs inertiels : les accéléromètres qui détectent l’accélération linéaire et les gyroscopes qui détectent le mouvement de rotation. Les accéléromètres et gyroscopes sont largement utilisés dans plusieurs applications, notamment l’aérospatiale, l’armée, l’automobile, les téléphones mobiles et l’électronique grand public. Par exemple, dans les téléphones mobiles, des capteurs de gyroscope et d’accéléromètre sont utilisés pour la rotation de l’écran.

## 🧠 Fonctionnement de l'ADXL345 

ADXL345 est un petit accéléromètre à 3 axes qui présente une plage dynamique de +/-16g avec une résolution de 13 bits, une bande passante maximale de 3200Hz et un taux de transfert de données maximal de 3200 fois par seconde. C’est un capteur d’accéléromètre numérique et produit des valeurs numériques d’accélération dans trois axes. Le capteur délivre des données formatées en 16 bits accessible via les interfaces SPI ou I2C. Ce capteur est ultra-faible puissance et consomme seulement 23 uA en mode mesure et 0,1 uA en mode veille.

## 🔧 Matériel Requis

- Module PmodACL **PB200-097**
- Raspberry Pi Pico
- Câbles de connexion

## 🔌 Connexions

| **Broche ACL** | **Broche Raspberry Pi Pico** |
|-----------------|----------------------------|
| **CS** | **CS** |
| **MOSI** | **GPO19** |
| **MISO** | **GPO16** |
| **SCLK** | **GPO18** |
| **GND** | **GND** |
| **VCC** | **3V3(OUT)** |

## 📚 Conclusion

Les accéléromètres sont des capteurs très utiles pour les projets étudiants. Faciles à utiliser et peu coûteux, ils permettent d’ajouter de l’interaction à un système. Ils sont parfaits pour mesurer des mouvements, détecter des chocs ou encore stabiliser un objet dans des petits projets électroniques ou robotiques.

## 🔗 Références

datasheet du PmodACL PB-200-097 : https://digilent.com/reference/pmod/pmodacl/start?srsltid=AfmBOooreOl3tvH_3JmRVrW3j8XUf0EjFsXIGipcw4yWUIxBhbT3YwWA