import battleMarch from '~/assets/audio/freesound_community-battle-march-action-loop-6935.mp3';
import victorySound from '~/assets/audio/freesound_community-medieval-fanfare-6826.mp3';
import { CountDownTimer } from '~/components/countdown-timer';
import { useIntervalsStore } from '~/stores/intervals-store';
import { useUserStore } from '~/stores/user-store';
import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';

export function Timer() {
  const user = useUserStore((state) => state.user);
  const loadUser = useUserStore((state) => state.loadUser);
  const addInterval = useIntervalsStore((state) => state.addInterval);
  const {
    focusTime = 25 * 60,
    breakTime = 5 * 60,
  } = user.settings || {};

  const totalIntervals = useIntervalsStore((state) => state.getCount());

  const isOnBrake = useRef(false);
  const [duration, setDuration] = useState(focusTime);

  useEffect(() => {
    loadUser();
  }, []);

  useEffect(() => {
    // Update duration when settings change
    if (!isOnBrake.current) {
      setDuration(focusTime);
    } else {
      setDuration(breakTime);
    }
  }, [focusTime, breakTime]);

  const [playVictory] = useSound(victorySound, { volume: 0.7 });
  const [playBackToWork] = useSound(battleMarch, { volume: 0.5 });

  console.log('render Timer', focusTime);

  const handleComplete = () => {
    if (isOnBrake.current) {
      playBackToWork();
      setDuration(focusTime);
    } else {
      playVictory();
      setDuration(breakTime);
      addInterval({
        id: Date.now(),
        isRunning: false,
        isOnBreak: false,
        durationSeconds: focusTime,
        userId: user.id,
        startDate: new Date(Date.now() - focusTime * 1000),
        endDate: new Date(),
      });
    }
    isOnBrake.current = !isOnBrake.current;
  };

  return (
    <main className="flex min-h-screen items-center justify-center">
      <div className="flex flex-1 flex-col items-center gap-6">
        {isOnBrake.current && <p>You're on break!</p>}

        <CountDownTimer
          seconds={duration}
          canSkip={isOnBrake.current}
          onComplete={handleComplete}
        ></CountDownTimer>
        <p>Total focus time: {totalIntervals}</p>
      </div>
    </main>
  );
}
