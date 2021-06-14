//-----------------------------------------------------------------------------
// src/__tests__/factories/factory.utils.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import { Factory }      from 'fishery'

///////////////////////////////////////////////////////////////////////////////
// TODO: 06/11/2021
//  - NEED TO FIND A CLEANER WAY OF DOING THIS.
///////////////////////////////////////////////////////////////////////////////
import { mongoClient }  from '../../dao/__tests__/user.dao.test'

/**
 * Builds an array of testing data using a Factory and an array of data. The
 * function allows the tester to create an array of specified user data.
 *  
 * @param   {Factory<T>}  factory - Factory to create an object of <T>
 * @param   {T[]}         data    - Array of data w/ type of <T>
 * @returns {T[]} An array of data of T[]
 */
 export function buildList<T>(factory: Factory<T>, data: T[]): T[] {
  let list: T[] = []
  data.forEach( (obj: T) => list.push(obj))

  return list
}


/**
 * Writes an array of objects of type <T> to the specfied collection in the 
 * DB. The fishery factory does not support inserting an array of data into
 * a collection.
 * 
 * @param   {Factory<T>}   factory 
 * @param   {T[]}          data 
 * @param   {string}       collectionName - Collection to insert the data
 * @returns {Promise<T[]>} Returns a copy of the data inserted into the DB.
 */
export function createList<T>(factory: Factory<T>, data: T[], collectionName: string): Promise<T[]> {
  return new Promise( async (resolve, reject) => {
    try {
      const list: T[] = buildList(factory, data)
      const result    = await mongoClient.conn(collectionName).insertMany(list)
      //* console.log(`[debug] createList(), result= `, result)

      resolve(result.ops)
    }
    catch(error) {
      console.log(`[error] Failed to create the list of data in mongoDB, error= `, error)
      reject(error)
    }
  })
}

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
