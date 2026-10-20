/** Presentation pace only; every tick still commits one Gregorian month. */
export const YEAR_SECONDS = 72;
export const PLAYBACK_SPEEDS = [1, 2, 4, 8, 12, 16] as const;
export const monthDelay = (speed: number) => (YEAR_SECONDS * 1000) / 12 / speed;
