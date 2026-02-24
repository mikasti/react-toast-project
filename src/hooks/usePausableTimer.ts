import { useEffect, useState, useRef, useCallback } from 'react';
import { TOAST_SHOWING_DURATION_MS } from '../common/constants.ts';

interface UsePausableTimerOptions {
    duration?: number;
    timestamp?: number;
    onExpire: () => void;
}

export const usePausableTimer = (
    { duration = TOAST_SHOWING_DURATION_MS, timestamp, onExpire }: UsePausableTimerOptions) => {
    const [isPaused, setIsPaused] = useState(false);

    const startTimeRef = useRef(0);
    const elapsedTimeRef = useRef(0);
    const prevTimestampRef = useRef(timestamp);
    const timerRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);

    useEffect(() => {
        //Reset time if duplicated toast
        if (prevTimestampRef.current !== timestamp) {
            prevTimestampRef.current = timestamp;
            elapsedTimeRef.current = 0;
        }

        if (isPaused) {
            clearTimeout(timerRef.current);
            return;
        }

        const remainingTime = duration - elapsedTimeRef.current;

        if (remainingTime <= 0) {
            onExpire();
            return;
        }

        startTimeRef.current = Date.now();
        timerRef.current = setTimeout(onExpire, remainingTime);

        return () => clearTimeout(timerRef.current);
    }, [isPaused, duration, onExpire, timestamp]);

    const pauseTimer = useCallback(() => {
        elapsedTimeRef.current += Date.now() - startTimeRef.current;
        setIsPaused(true);
    }, []);

    const resumeTimer = useCallback(() => {
        setIsPaused(false);
    }, []);

    return { pauseTimer, resumeTimer };
};