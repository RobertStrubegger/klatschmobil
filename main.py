"""

Fahrzeug mit Klatsch-Steuerung

Knopf A (Doppel-Klatsch) startet die Fahrt - Knopf B (Doppel-Klatsch) stoppt die Fahrt

Einfach-Klatsch erzeugt eine Richtungsänderung um 90° nach rechts. Kurs und Richtungsänderung wird per Kompass gemessen und durch Geschwindigkeitssteuerung der Motoren nachgeregelt

Das Display soll Geschwindigkeit der Motoren und Abweichung vom Kurs anzeigen

Stösst das Fahrzeug gegen ein Hindernis stoppt die Fahrt

"""
# Richtungswechsel bei Klatschen

def on_sound_loud():
    global Klatsch
    Klatsch += 1
input.on_sound(DetectedSound.LOUD, on_sound_loud)

# Starte beide Motoren

def on_button_pressed_a():
    global Kurs, MoLiGesch, MoReGesch
    basic.pause(1000)
    Kurs = input.compass_heading()
    MoLiGesch = 3
    MoReGesch = 3
input.on_button_pressed(Button.A, on_button_pressed_a)

# Stoppe beide Motoren

def on_button_pressed_b():
    global MoLiGesch, MoReGesch
    MoLiGesch = 0
    MoReGesch = 0
input.on_button_pressed(Button.B, on_button_pressed_b)

# Stopp bei Hindernis

def on_gesture_three_g():
    global MoLiGesch, MoReGesch
    MoLiGesch = 0
    pins.digital_write_pin(DigitalPin.P0, 0)
    MoReGesch = 0
    pins.digital_write_pin(DigitalPin.P1, 0)
input.on_gesture(Gesture.THREE_G, on_gesture_three_g)

MoLiPause = 0
MoRePause = 0
Klatsch = 0
MoReGesch = 0
MoLiGesch = 0
Kurs = 0
basic.show_leds("""
    . . # . .
    . # # # .
    . . # . .
    # # . # #
    # # . # #
    """)
Kurs = input.compass_heading()
basic.pause(2000)
basic.clear_screen()
MoLiGesch = 0
MoReGesch = 0

def on_forever():
    global MoLiGesch, MoReGesch, Kurs, Klatsch, MoRePause, MoLiPause
    # Klatschbefehle ausführen
    if Klatsch > 1:
        # Wenn beide Motoren still stehen wechsle auf volle Fahrt
        # sonst stoppe beide Motoren
        # 
        if MoLiGesch == 0 and MoReGesch == 0:
            # Motorgeschwindigkeiten (gleich für links und rechts)
            # 3: Volle Kraft voraus
            # 2: Etwas langsamer (zur Kurskorrektur)
            # 1: Halbe Kraft voraus für Kurvenfahrt
            # 0: Motor steht
            MoLiGesch = 3
            MoReGesch = 3
        else:
            MoLiGesch = 0
            MoReGesch = 0
    elif Klatsch == 1:
        Kurs += 90
    Klatsch = 0
    # Fahrtrichtungskorrektur +90° und kleine nach links oder rechts
    if 45 < abs(Kurs - input.compass_heading()):
        pass
    elif False:
        pass
    else:
        pass
    # Wenn Zielgeschwindigkeit beider Motoren gleich 0 dann stoppe beide Motoren und warte auf Befehle (per Knopf A oder Doppelklatsch)
    # 
    # ansonsten
    # 
    # Berechne wievielter Puls für linken und rechten Motor eine Pause sein soll
    # 
    # Führe 9 Pulse aus
    if MoLiGesch == 0 and MoReGesch == 0:
        pins.digital_write_pin(DigitalPin.P0, 0)
        pins.digital_write_pin(DigitalPin.P1, 0)
        basic.pause(800)
    else:
        # Berechne der wievielte Puls eine Pause sein soll
        # Geschwindigkeit = 3 => der 10.Puls (damit nie eine Pause => Volle Fahrt
        # Geschwindigkeit = 2 => der 7. Puls (damit etwas langsamer)
        # Geschwindigkeit = 1 => der 4. Puls (halbe Fahrt) - ist zu prüfen !!!!!
        # Geschwindigkeit = 0 => der 1. Puls (daher jeder Puls eine Pause) => Stillstand
        # 
        MoRePause = MoReGesch * 3 + 1
        MoLiPause = MoReGesch * 3 + 1
        for Puls in range(9):
            pins.digital_write_pin(DigitalPin.P0, 1)
            pins.digital_write_pin(DigitalPin.P1, 1)
            # Wenn die Puls-Nummer (0 ... 8) durch den Pause-Puls ohne Rest teilen lässt ist eine Pause (Abschaltung) für 100ms durchzuführen.
            # Beide Motoren können unterschiedliche Geschwindigkeiten  haben
            if Puls % MoLiPause == 0:
                pins.digital_write_pin(DigitalPin.P0, 0)
            if Puls % MoRePause == 0:
                pins.digital_write_pin(DigitalPin.P1, 0)
            basic.pause(100)
basic.forever(on_forever)
