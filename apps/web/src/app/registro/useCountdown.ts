import { useEffect, useState } from "react";

function secondsLeft(until: number | null): number {
  return until == null ? 0 : Math.max(0, Math.ceil((until - Date.now()) / 1000));
}

/**
 * Segundos que faltan hasta `until` (timestamp en ms), actualizados cada segundo.
 * Devuelve 0 si no hay espera o ya pasó.
 */
export function useCountdown(until: number | null): number {
  const [remaining, setRemaining] = useState(() => secondsLeft(until));

  useEffect(() => {
    setRemaining(secondsLeft(until));
    if (until == null) return;
    const timer = setInterval(() => {
      const left = secondsLeft(until);
      setRemaining(left);
      if (left === 0) clearInterval(timer);
    }, 1000);
    return () => clearInterval(timer);
  }, [until]);

  return remaining;
}
