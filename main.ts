// Richtungswechsel bei Klatschen
input.onSound(DetectedSound.Loud, function () {
    Klatsch += 1
})
// Starte beide Motoren
input.onButtonPressed(Button.A, function () {
    basic.pause(1000)
    Kurs = input.compassHeading()
    InFahrt = 1
    MoLiGesch = 3
    MoReGesch = 3
})
input.onButtonPressed(Button.AB, function () {
    Klatsch += 1
})
// Stoppe beide Motoren
input.onButtonPressed(Button.B, function () {
    Kurs = input.compassHeading()
    InFahrt = 0
    MoLiGesch = 0
    MoReGesch = 0
})
// Stopp bei Hindernis
input.onGesture(Gesture.ThreeG, function () {
    InFahrt = 0
    MoLiGesch = 0
    pins.digitalWritePin(DigitalPin.P0, 0)
    MoReGesch = 0
    pins.digitalWritePin(DigitalPin.P1, 0)
})
/**
 * Fahrzeug mit Klatsch-Steuerung
 * 
 * Knopf A (Doppel-Klatsch) startet die Fahrt - Knopf B (Doppel-Klatsch) stoppt die Fahrt
 * 
 * Einfach-Klatsch erzeugt eine Richtungsänderung um 90° nach rechts. Kurs und Richtungsänderung wird per Kompass gemessen und durch Geschwindigkeitssteuerung der Motoren nachgeregelt
 * 
 * Das Display soll Geschwindigkeit der Motoren und Abweichung vom Kurs anzeigen
 * 
 * Stösst das Fahrzeug gegen ein Hindernis stoppt die Fahrt
 */
let MoLiPause = 0
let MoRePause = 0
let KursAbweichung = 0
let Klatsch = 0
let MoReGesch = 0
let MoLiGesch = 0
let InFahrt = 0
let Kurs = 0
basic.showLeds(`
    . . # . .
    . # # # .
    . . # . .
    . # . # .
    . # . # .
    `)
Kurs = input.compassHeading()
basic.pause(2000)
InFahrt = 0
MoLiGesch = 0
MoReGesch = 0
basic.forever(function () {
    // Klatschbefehle ausführen
    if (Klatsch > 1) {
        // Wenn beide Motoren still stehen wechsle auf volle Fahrt
        // sonst stoppe beide Motoren
        // 
        if (InFahrt == 0) {
            // Motorgeschwindigkeiten (gleich für links und rechts)
            // 3: Volle Kraft voraus
            // 2: Etwas langsamer (zur Kurskorrektur)
            // 1: Halbe Kraft voraus für Kurvenfahrt
            // 0: Motor steht
            MoLiGesch = 3
            MoReGesch = 3
            InFahrt = 1
        } else {
            MoLiGesch = 0
            MoReGesch = 0
            InFahrt = 0
        }
    } else if (Klatsch == 1) {
        Kurs += 90
        if (Kurs > 360) {
            Kurs += -360
        }
    }
    Klatsch = 0
    KursAbweichung = Kurs - input.compassHeading()
    if (KursAbweichung > 180) {
        KursAbweichung += -360
    }
    if (KursAbweichung < -180) {
        KursAbweichung += 360
    }
    // Fahrtrichtungskorrektur +90° und kleine nach links oder rechts
    if (45 < Math.abs(KursAbweichung)) {
        if (KursAbweichung < 0) {
            MoLiGesch = 1
            MoReGesch = 3
        } else {
            MoLiGesch = 3
            MoReGesch = 1
        }
    } else if (10 < Math.abs(KursAbweichung)) {
        if (KursAbweichung < 0) {
            MoLiGesch = 2
            MoReGesch = 3
        } else {
            MoLiGesch = 3
            MoReGesch = 2
        }
    } else if (2 > Math.abs(KursAbweichung)) {
        MoLiGesch = 3
        MoReGesch = 3
    }
    // Wenn Zielgeschwindigkeit beider Motoren gleich 0 dann stoppe beide Motoren und warte auf Befehle (per Knopf A oder Doppelklatsch)
    // 
    // ansonsten
    // 
    // Berechne wievielter Puls für linken und rechten Motor eine Pause sein soll
    // 
    // Führe 9 Pulse aus
    if (InFahrt == 1) {
        for (let Index = 0; Index <= 4; Index++) {
            led.unplot(0, Index)
            led.unplot(4, Index)
        }
        for (let Index = 0; Index <= MoLiGesch; Index++) {
            led.plot(0, 5 - Index)
        }
        for (let Index = 0; Index <= MoReGesch; Index++) {
            led.plot(4, 5 - Index)
        }
        // Berechne der wievielte Puls eine Pause sein soll
        // Geschwindigkeit = 3 => der 10.Puls (damit nie eine Pause => Volle Fahrt
        // Geschwindigkeit = 2 => der 7. Puls (damit etwas langsamer)
        // Geschwindigkeit = 1 => der 4. Puls (halbe Fahrt) - ist zu prüfen !!!!!
        // Geschwindigkeit = 0 => der 1. Puls (daher jeder Puls eine Pause) => Stillstand
        // 
        MoRePause = MoReGesch * 3 + 1
        MoLiPause = MoLiGesch * 3 + 1
        for (let Puls = 0; Puls <= 8; Puls++) {
            pins.digitalWritePin(DigitalPin.P0, 1)
            pins.digitalWritePin(DigitalPin.P1, 1)
            // Wenn die Puls-Nummer (0 ... 8) durch den Pause-Puls ohne Rest teilen lässt ist eine Pause (Abschaltung) für 100ms durchzuführen.
            // Beide Motoren können unterschiedliche Geschwindigkeiten  haben
            if ((Puls + 1) % MoLiPause == 0) {
                pins.digitalWritePin(DigitalPin.P0, 0)
            }
            if ((Puls + 1) % MoRePause == 0) {
                pins.digitalWritePin(DigitalPin.P1, 0)
            }
            basic.pause(100)
        }
    } else {
        pins.digitalWritePin(DigitalPin.P0, 0)
        pins.digitalWritePin(DigitalPin.P1, 0)
        for (let Index = 0; Index <= MoReGesch; Index++) {
            led.unplot(0, 4 - Index)
            led.unplot(4, 4 - Index)
        }
        basic.pause(800)
    }
})
