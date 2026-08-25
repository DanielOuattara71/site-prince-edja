import { useEffect, useState } from 'react'

const TIME_ZONE = 'Africa/Abidjan'

function formatNow(): string {
  return new Intl.DateTimeFormat('fr-FR', {
    timeZone: TIME_ZONE,
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date())
}

export function useLocalTime(): string {
  const [time, setTime] = useState(formatNow)

  useEffect(() => {
    const id = setInterval(() => setTime(formatNow()), 30_000)
    return () => clearInterval(id)
  }, [])

  return time
}
