import { useEffect, useState } from "react";

export type Countdown = {
  days: string;
  hours: string;
  minutes: string;
  seconds: string;
};

const pad = (value: number) => String(value).padStart(2, "0");

export function calculateCountdown(target: Date, now = new Date()): Countdown {
  const remainingSeconds = Math.max(0, Math.floor((target.getTime() - now.getTime()) / 1000));
  const days = Math.floor(remainingSeconds / 86_400);
  const hours = Math.floor((remainingSeconds % 86_400) / 3_600);
  const minutes = Math.floor((remainingSeconds % 3_600) / 60);
  const seconds = remainingSeconds % 60;

  return { days: pad(days), hours: pad(hours), minutes: pad(minutes), seconds: pad(seconds) };
}

export function useCountdown(target: Date): Countdown {
  const [countdown, setCountdown] = useState(() => calculateCountdown(target));

  useEffect(() => {
    const update = () => setCountdown(calculateCountdown(target));
    update();
    const interval = window.setInterval(update, 1_000);
    return () => window.clearInterval(interval);
  }, [target]);

  return countdown;
}
