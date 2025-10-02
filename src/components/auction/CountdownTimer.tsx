'use client'

import { useEffect, useState } from 'react'

interface CountdownTimerProps {
  endTime: number // Unix timestamp in seconds
  onExpire?: () => void
}

export function CountdownTimer({ endTime, onExpire }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)

    const calculateTimeLeft = () => {
      const now = Math.floor(Date.now() / 1000)
      const remaining = endTime - now
      return remaining > 0 ? remaining : 0
    }

    // Calcular tiempo inicial
    setTimeLeft(calculateTimeLeft())

    // Actualizar cada segundo
    const interval = setInterval(() => {
      const remaining = calculateTimeLeft()
      setTimeLeft(remaining)

      if (remaining === 0 && onExpire) {
        onExpire()
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [endTime, onExpire])

  const formatTime = (seconds: number) => {
    const days = Math.floor(seconds / 86400)
    const hours = Math.floor((seconds % 86400) / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (days > 0) {
      return `${days}d ${hours}h ${minutes}m ${secs}s`
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m ${secs}s`
    }
    if (minutes > 0) {
      return `${minutes}m ${secs}s`
    }
    return `${secs}s`
  }

  // Mostrar loading mientras se monta el componente
  if (!mounted || timeLeft === null) {
    return (
      <div className="text-center">
        <p className="text-sm text-gray-500 mb-1">Time Remaining</p>
        <p className="text-3xl font-mono font-bold text-gray-900">Loading...</p>
      </div>
    )
  }

  if (timeLeft === 0) {
    return (
      <div className="text-center">
        <p className="text-2xl font-bold text-red-600">Auction Ended</p>
      </div>
    )
  }

  return (
    <div className="text-center">
      <p className="text-sm text-gray-500 mb-1">Time Remaining</p>
      <p className="text-3xl font-mono font-bold text-gray-900">
        {formatTime(timeLeft)}
      </p>
    </div>
  )
}
