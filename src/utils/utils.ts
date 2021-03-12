//-----------------------------------------------------------------------------
// glitch/src/utils/utils.ts
//-----------------------------------------------------------------------------

/**
 * Example function to verify that jest is setup and running.
 * @param   a - array of numbers to add
 * @returns Sum of numbers
 */
export const sum = (...a: number[]) => {
  return a.reduce((acc, val) => acc + val, 0)
};