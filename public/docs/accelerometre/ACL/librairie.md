```python title="Librairie pour ACL" showLineNumbers
import machine
import time

class ADXL345:
    def __init__(self, sck, mosi, miso, cs, spi_id=0):
        """
        Initialisation du capteur ADXL345 en SPI avec choix des pins SPI.

        :param sck: Pin SCK (horloge SPI)
        :param mosi: Pin MOSI (Master Out Slave In)
        :param miso: Pin MISO (Master In Slave Out)
        :param cs: Pin CS (Chip Select)
        :param spi_id: Numéro du SPI (par défaut 0)
        """
        self.cs = machine.Pin(cs, machine.Pin.OUT)
        self.spi = machine.SPI(spi_id, baudrate=5000000, polarity=1, phase=1,
                               sck=machine.Pin(sck), mosi=machine.Pin(mosi), miso=machine.Pin(miso))

        self.init_adxl345()  # Initialisation de base en mode mesure

    def write_register(self, register, value):
        self.cs.value(0)
        self.spi.write(bytearray([register, value]))
        self.cs.value(1)

    def read_register(self, reg, length=1):
        reg = 0x80 | reg
        if length > 1:
            reg |= 0x40

        self.cs.value(0)
        self.spi.write(bytes([reg]))
        result = self.spi.read(length)
        self.cs.value(1)

        return result

    def init_adxl345(self):
        """Initialisation de base en mode mesure"""
        self.write_register(0x2D, 0x08)  # Active le mode mesure
        time.sleep(0.1)

    def set_range(self, range_g):
        """
        Permet de définir la plage de mesure (2g, 4g, 8g ou 16g)
        
        :param range_g: Sensibilité en g
        """
        RANGE_CONFIG = {
            2: 0x00,
            4: 0x01,
            8: 0x02,
            16: 0x03
        }

        if range_g not in RANGE_CONFIG:
            raise ValueError("Plage invalide : choisir parmi 2, 4, 8 ou 16g")

        self.write_register(0x31, RANGE_CONFIG[range_g])  # Configurer la plage choisie

    def read_acceleration(self):
        data = self.read_register(0x32, 6)

        x = int.from_bytes(data[0:2], 'little')
        y = int.from_bytes(data[2:4], 'little')
        z = int.from_bytes(data[4:6], 'little')

        if x & (1 << 15):
            x -= 1 << 16
        if y & (1 << 15):
            y -= 1 << 16
        if z & (1 << 15):
            z -= 1 << 16

        return x, y, z