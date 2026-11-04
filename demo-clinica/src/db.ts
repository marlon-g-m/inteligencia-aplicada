import { DatabaseSync } from 'node:sqlite'
import { mkdirSync } from 'node:fs'
import { dirname } from 'node:path'

export interface Appointment {
  id: number
  servicio: string
  profesional: string
  inicio: string // "YYYY-MM-DDTHH:mm" hora de Santiago
  fin: string
  paciente: string
  contacto: string // "wa:56912345678" o "web:<id>"
  estado: 'confirmada' | 'cancelada'
  creada: string
}

export interface Conversation {
  contacto: string
  mensajes: string // JSON de BetaMessageParam[] (se guarda completo: incluye bloques de razonamiento)
  estado: 'bot' | 'humano'
  motivo_derivacion: string | null
  actualizada: number // epoch ms
  mensajes_hoy: number
  dia: string
}

export type DB = ReturnType<typeof openDb>

export function openDb(path: string) {
  if (path !== ':memory:') mkdirSync(dirname(path), { recursive: true })
  const db = new DatabaseSync(path)
  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS citas (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      servicio TEXT NOT NULL,
      profesional TEXT NOT NULL,
      inicio TEXT NOT NULL,
      fin TEXT NOT NULL,
      paciente TEXT NOT NULL,
      contacto TEXT NOT NULL,
      estado TEXT NOT NULL DEFAULT 'confirmada',
      creada TEXT NOT NULL
    );
    CREATE INDEX IF NOT EXISTS citas_prof ON citas (profesional, inicio);
    CREATE INDEX IF NOT EXISTS citas_contacto ON citas (contacto);
    CREATE TABLE IF NOT EXISTS conversaciones (
      contacto TEXT PRIMARY KEY,
      mensajes TEXT NOT NULL DEFAULT '[]',
      estado TEXT NOT NULL DEFAULT 'bot',
      motivo_derivacion TEXT,
      actualizada INTEGER NOT NULL,
      mensajes_hoy INTEGER NOT NULL DEFAULT 0,
      dia TEXT NOT NULL DEFAULT ''
    );
    CREATE TABLE IF NOT EXISTS guion_estado (
      contacto TEXT PRIMARY KEY,
      estado TEXT NOT NULL,
      actualizada INTEGER NOT NULL
    );
    CREATE TABLE IF NOT EXISTS mensajes_procesados (
      id TEXT PRIMARY KEY,
      recibido INTEGER NOT NULL
    );
  `)

  const q = {
    citasActivasProfesional: db.prepare(
      `SELECT * FROM citas WHERE profesional = ? AND estado = 'confirmada' AND inicio < ? AND fin > ?`,
    ),
    citasDelDia: db.prepare(`SELECT * FROM citas WHERE estado = 'confirmada' AND inicio >= ? AND inicio < ?`),
    insertarCita: db.prepare(
      `INSERT INTO citas (servicio, profesional, inicio, fin, paciente, contacto, creada) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    ),
    citasContacto: db.prepare(
      `SELECT * FROM citas WHERE contacto = ? AND estado = 'confirmada' AND inicio >= ? ORDER BY inicio`,
    ),
    cancelarCita: db.prepare(`UPDATE citas SET estado = 'cancelada' WHERE id = ? AND contacto = ? AND estado = 'confirmada'`),
    proximasCitas: db.prepare(`SELECT * FROM citas WHERE estado = 'confirmada' AND inicio >= ? ORDER BY inicio LIMIT 200`),
    getConv: db.prepare(`SELECT * FROM conversaciones WHERE contacto = ?`),
    upsertConv: db.prepare(`
      INSERT INTO conversaciones (contacto, mensajes, estado, motivo_derivacion, actualizada, mensajes_hoy, dia)
      VALUES (?, ?, ?, ?, ?, ?, ?)
      ON CONFLICT(contacto) DO UPDATE SET mensajes = excluded.mensajes, estado = excluded.estado,
        motivo_derivacion = excluded.motivo_derivacion, actualizada = excluded.actualizada,
        mensajes_hoy = excluded.mensajes_hoy, dia = excluded.dia`),
    derivadas: db.prepare(`SELECT contacto, motivo_derivacion, actualizada FROM conversaciones WHERE estado = 'humano' ORDER BY actualizada DESC`),
    volverABot: db.prepare(`UPDATE conversaciones SET estado = 'bot', motivo_derivacion = NULL, mensajes = '[]' WHERE contacto = ?`),
    getGuion: db.prepare(`SELECT estado, actualizada FROM guion_estado WHERE contacto = ?`),
    setGuion: db.prepare(`INSERT INTO guion_estado (contacto, estado, actualizada) VALUES (?, ?, ?)
      ON CONFLICT(contacto) DO UPDATE SET estado = excluded.estado, actualizada = excluded.actualizada`),
    marcarProcesado: db.prepare(`INSERT OR IGNORE INTO mensajes_procesados (id, recibido) VALUES (?, ?)`),
    limpiarProcesados: db.prepare(`DELETE FROM mensajes_procesados WHERE recibido < ?`),
  }

  return {
    raw: db,
    overlapping(profesional: string, inicio: string, fin: string) {
      return q.citasActivasProfesional.all(profesional, fin, inicio) as unknown as Appointment[]
    },
    appointmentsBetween(desde: string, hasta: string) {
      return q.citasDelDia.all(desde, hasta) as unknown as Appointment[]
    },
    /** Inserta la cita solo si el bloque sigue libre (en una transacción, para evitar dobles reservas). */
    bookIfFree(a: Omit<Appointment, 'id' | 'estado' | 'creada'>, creada: string): number | null {
      db.exec('BEGIN IMMEDIATE')
      try {
        if (this.overlapping(a.profesional, a.inicio, a.fin).length > 0) {
          db.exec('ROLLBACK')
          return null
        }
        const r = q.insertarCita.run(a.servicio, a.profesional, a.inicio, a.fin, a.paciente, a.contacto, creada)
        db.exec('COMMIT')
        return Number(r.lastInsertRowid)
      } catch (e) {
        db.exec('ROLLBACK')
        throw e
      }
    },
    upcomingFor(contacto: string, desde: string) {
      return q.citasContacto.all(contacto, desde) as unknown as Appointment[]
    },
    cancel(id: number, contacto: string): boolean {
      return Number(q.cancelarCita.run(id, contacto).changes) > 0
    },
    upcoming(desde: string) {
      return q.proximasCitas.all(desde) as unknown as Appointment[]
    },
    getConversation(contacto: string) {
      return (q.getConv.get(contacto) as unknown as Conversation | undefined) ?? null
    },
    saveConversation(c: Conversation) {
      q.upsertConv.run(c.contacto, c.mensajes, c.estado, c.motivo_derivacion, c.actualizada, c.mensajes_hoy, c.dia)
    },
    handoffs() {
      return q.derivadas.all() as unknown as Pick<Conversation, 'contacto' | 'motivo_derivacion' | 'actualizada'>[]
    },
    returnToBot(contacto: string) {
      q.volverABot.run(contacto)
    },
    getScriptState(contacto: string) {
      const r = q.getGuion.get(contacto) as { estado: string; actualizada: number } | undefined
      return r ? { estado: JSON.parse(r.estado) as unknown, actualizada: r.actualizada } : null
    },
    saveScriptState(contacto: string, estado: unknown, actualizada = Date.now()) {
      q.setGuion.run(contacto, JSON.stringify(estado), actualizada)
    },
    /** Devuelve true la primera vez que ve un id de mensaje (WhatsApp puede reenviar el mismo webhook). */
    firstTimeSeen(id: string): boolean {
      const now = Date.now()
      q.limpiarProcesados.run(now - 7 * 24 * 3600 * 1000)
      return Number(q.marcarProcesado.run(id, now).changes) > 0
    },
  }
}
