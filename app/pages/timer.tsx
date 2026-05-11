import battleMarch from '~/assets/audio/freesound_community-battle-march-action-loop-6935.mp3';
import victorySound from '~/assets/audio/freesound_community-medieval-fanfare-6826.mp3';
import { CountDownTimer } from '~/components/countdown-timer';
import { useIntervalsStore } from '~/stores/intervals-store';
import { useUserStore } from '~/stores/user-store';
import { useEffect, useRef, useState } from 'react';
import useSound from 'use-sound';

export function Timer() {
  const user = useUserStore((state) => state.user);
  const changeSettings = useUserStore((state) => state.changeSettings);
  const loadUser = useUserStore((state) => state.loadUser);
  const addInterval = useIntervalsStore((state) => state.addInterval);
  const {
    focusTime = 25 * 60,
    breakTime = 5 * 60,
    isOnline = false,
  } = user.settings || {};

  const totalIntervals = useIntervalsStore((state) => state.getCount());

  const isOnBrake = useRef(false);
  const [duration, setDuration] = useState(focusTime);

  useEffect(() => {
    loadUser();
  }, []);

  const handleFocusTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newFocusTime = Number(e.target.value);
    changeSettings({ focusTime: newFocusTime });
    if (!isOnBrake.current) {
      setDuration(newFocusTime);
    }
  };

  const handleBreakTimeChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newBreakTime = Number(e.target.value);
    changeSettings({ breakTime: newBreakTime });
    if (isOnBrake.current) {
      setDuration(newBreakTime);
    }
  };

  const handleOnlineModeToggle = () => {
    changeSettings({ isOnline: !isOnline });
  };

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

        <div className="flex flex-col gap-4 w-full max-w-xs">
          <div className="flex flex-col gap-2">
            <label htmlFor="focusTime" className="text-sm font-medium">
              Focus Time
            </label>
            <select
              id="focusTime"
              value={focusTime}
              onChange={handleFocusTimeChange}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={15 * 60}>15 minutes</option>
              <option value={20 * 60}>20 minutes</option>
              <option value={25 * 60}>25 minutes</option>
              <option value={30 * 60}>30 minutes</option>
              <option value={45 * 60}>45 minutes</option>
              <option value={60 * 60}>60 minutes</option>
            </select>
          </div>

          <div className="flex flex-col gap-2">
            <label htmlFor="breakTime" className="text-sm font-medium">
              Break Time
            </label>
            <select
              id="breakTime"
              value={breakTime}
              onChange={handleBreakTimeChange}
              className="rounded-lg border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
              <option value={3 * 60}>3 minutes</option>
              <option value={5 * 60}>5 minutes</option>
              <option value={10 * 60}>10 minutes</option>

              <div className="flex items-center justify-between gap-2">
                <label htmlFor="onlineMode" className="text-sm font-medium">
                  Online Mode
                </label>
                <button
                  id="onlineMode"
                  onClick={handleOnlineModeToggle}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
                    isOnline ? 'bg-primary' : 'bg-muted'
                  }`}
                  role="switch"
                  aria-checked={isOnline}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      isOnline ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              <option value={15 * 60}>15 minutes</option>
              <option value={20 * 60}>20 minutes</option>
            </select>
          </div>
        </div>

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
