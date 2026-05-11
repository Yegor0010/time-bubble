import { Pause, Play, RotateCcw, SkipForward } from 'lucide-react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { Button } from './ui/button';

interface CountdownTimerProps {
  seconds: number;
  canSkip?: boolean;
  onComplete: () => void;
}

export function CountDownTimer({
  seconds,
  canSkip,
  onComplete,
}: CountdownTimerProps) {
  const [secondsLeft, setSecondsLeft] = useState(seconds);
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const hasCompletedRef = useRef(false);
  const endTimeRef = useRef<Date | null>(null);
  const intervalRef = useRef<number | null>(null);

  const clearIntervalRef = useCallback(() => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const createInterval = useCallback(() => {
    intervalRef.current = window.setInterval(() => {
      const currentTime = Date.now();
      const remainingTime = Math.max(
        0,
        endTimeRef.current ? endTimeRef.current.getTime() - currentTime : 0
      );
      if (remainingTime <= 0) {
        clearIntervalRef();
        setSecondsLeft(0);
        hasCompletedRef.current = true;
        setIsActive(false);
        onComplete?.();
        return;
      }
      setSecondsLeft(remainingTime > 0 ? Math.ceil(remainingTime / 1000) : 0);
    }, 100);
  }, [clearIntervalRef]);

  const startTimer = () => {
    if (intervalRef.current !== null) return;
    setIsActive(true);
    setIsPaused(false);
    endTimeRef.current = new Date(Date.now() + secondsLeft * 1000);
    createInterval();
  };

  const pauseTimer = () => {
    clearIntervalRef();
    setIsPaused(true);
  };

  const resetTimer = () => {
    clearIntervalRef();
    setIsActive(false);
    setIsPaused(false);
    setSecondsLeft(seconds);
    hasCompletedRef.current = false;
  };

  const formatTime = (timeInSeconds: number) => {
    const minutes = Math.floor(timeInSeconds / 60)
      .toString()
      .padStart(2, '0');
    const secs = (timeInSeconds % 60).toString().padStart(2, '0');
    return `${minutes}:${secs}`;
  };

  useEffect(() => {
    resetTimer();
  }, [seconds]);

  useEffect(() => {
    return () => clearIntervalRef();
  }, [clearIntervalRef]);

  return (
    <div className="flex flex-1 flex-col items-center">
      <h1 className="mb-4 text-4xl font-bold">{formatTime(secondsLeft)}</h1>
      <div className="flex items-center gap-1">
        {isPaused && (
          <Button variant="outline" onClick={resetTimer}>
            <RotateCcw />
          </Button>
        )}
        {isActive && !isPaused && (
          <>
            {canSkip && (
              <Button onClick={onComplete}>
                <SkipForward />
              </Button>
            )}
            <Button onClick={pauseTimer}>
              <Pause />
            </Button>
          </>
        )}
        {(!isActive || isPaused) && (
          <Button onClick={startTimer}>
            <Play />
          </Button>
        )}
      </div>
    </div>
  );
}
