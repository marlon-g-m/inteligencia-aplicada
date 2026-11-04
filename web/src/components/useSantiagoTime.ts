import { useEffect, useState } from 'react'

const fmt = new Intl.DateTimeFormat('es-CL', {
  timeZone: 'America/Santiago',
  hour: '2-digit',
  minute: '2-digit',
  hour12: false,
})

/** Hora actual de Santiago en formato HH:MM, actualizada cada segundo. */
export function useSantiagoTime() {
  const [time, setTime] = useState(() => fmt.format(new Date()))
  useEffect(() => {
    const id = setInterval(() => setTime(fmt.format(new Date())), 1000)
    return () => clearInterval(id)
  }, [])
  return time
}
