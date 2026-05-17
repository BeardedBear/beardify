/**
 * Pause execution for a given number of milliseconds.
 * @param ms - Duration in milliseconds
 */
export const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));
