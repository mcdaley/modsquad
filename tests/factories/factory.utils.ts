//-----------------------------------------------------------------------------
// tests/factories/factory.utils.ts
//-----------------------------------------------------------------------------
import '../../src/config/config'

/**
 * Reformat the key/value test data into an array of test data that can
 * be inserted into the MongoDB.
 * @function  buildTestDataArray
 * @param     testData 
 * @returns   {T[]} An array of the data w/ the keys removed.
 */
 export function buildTestDataArray<T>(testData: any): T[] {
  const   data: T[] = <T[]>Object.values(testData)
  return  data
}

