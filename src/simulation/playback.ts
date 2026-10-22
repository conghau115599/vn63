/** Presentation pace only; every tick still processes seven civil dates through the monthly engine. */
export const WEEK_SECONDS = 1;
export const PLAYBACK_SPEEDS = [1, 2, 4, 8, 12, 16] as const;
export const weekDelay = (speed: number) => (WEEK_SECONDS * 1000) / speed;
