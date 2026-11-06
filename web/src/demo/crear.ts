// Arma el asistente guiado de demo-clinica para que corra entero en el navegador.

import { createAgenda } from './motor/agenda.ts'
import { createScripted } from './motor/scripted.ts'
import { addDays, addMinutes, nowLocal, weekday } from './motor/time.ts'
import type { Clinic } from './motor/tipos.ts'
import clinicaJson from './motor/clinica.json'
import { memoryDb, pickBusy } from './memoria.ts'

export const clinica = clinicaJson as unknown as Clinic

export function crearAsistente() {
  // Bloques de 30 minutos del próximo mes; parte de ellos quedan tomados por otros "pacientes"
  const hoy = nowLocal().slice(0, 10)
  const bloques: { inicio: string; fin: string; profesional: string }[] = []
  for (let i = 0; i <= clinica.dias_maximos_agenda; i++) {
    const dia = addDays(hoy, i)
    for (const [a, b] of clinica.horario[String(weekday(dia))] ?? []) {
      for (let t = `${dia}T${a}`; t < `${dia}T${b}`; t = addMinutes(t, 30)) {
        for (const p of clinica.profesionales) bloques.push({ inicio: t, fin: addMinutes(t, 30), profesional: p.id })
      }
    }
  }
  const db = memoryDb(pickBusy(bloques))
  const agenda = createAgenda(clinica, db)
  return createScripted({ clinic: clinica, agenda, db })
}
