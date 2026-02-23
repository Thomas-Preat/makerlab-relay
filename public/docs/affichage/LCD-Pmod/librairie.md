```python title="Librairie pour LCD - lcd.py" showLineNumbers
import machine
import utime

# Envoie une commande au LCD
def lcd_command(rs, e, data_pins, cmd):
    rs.value(0)  # Mode commande
    for i in range(8):
        data_pins[i].value((cmd >> i) & 1)
    e.value(1)
    utime.sleep_us(1)
    e.value(0)
    utime.sleep_ms(2)  # Temps d'exécution

# Envoie un caractère au LCD
def lcd_write_char(rs, e, data_pins, char):
    rs.value(1)  # Mode données
    for i in range(8):
        data_pins[i].value((ord(char) >> i) & 1)
    e.value(1)
    utime.sleep_us(1)
    e.value(0)
    utime.sleep_ms(2)

# Initialise le LCD
def lcd_init(rs, e, data_pins):
    lcd_command(rs, e, data_pins, 0x38)  # Mode 8 bits, 2 lignes, 5x8
    lcd_command(rs, e, data_pins, 0x0C)  # Affichage activé, curseur désactivé
    lcd_command(rs, e, data_pins, 0x06)  # Incrémentation du curseur
    lcd_command(rs, e, data_pins, 0x01)  # Effacer l'écran
    utime.sleep_ms(5)

# Positionne le curseur
def lcd_set_cursor(rs, e, data_pins, row, col):
    pos = 0x80 + col if row == 0 else 0xC0 + col
    lcd_command(rs, e, data_pins, pos)

# Écrit un texte sur le LCD
def lcd_write_string(rs, e, data_pins, text):
    for char in text:
        lcd_write_char(rs, e, data_pins, char)
```