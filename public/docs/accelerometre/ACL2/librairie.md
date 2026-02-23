# Librairie
---

```python title="Librairie pour ACL2" showLineNumbers
# Librairie ACL2
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