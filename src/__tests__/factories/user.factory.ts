//-----------------------------------------------------------------------------
// src/__tests__/factories/user.factory.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import { Factory }      from 'fishery'
import { ObjectId }     from 'bson'

import MongoDAO         from '../../config/mongo-dao'
import { mongoClient }  from '../dao/user.dao.test'
import UserDAO, { 
  IUser 
}                       from '../../dao/user.dao'

import { buildList }    from './factory.utils'


interface UserTransientParams {
  mongoClient: MongoDAO
}

/**
 * Builds an array of objects
 * @param factory 
 * @param data 
 * @returns 
 */
/*********
export function buildList<T>(factory: Factory<T>, data: T[]): T[] {
  let list: T[] = []
  data.forEach( (obj: T) => list.push(obj))

  return list
}
**********/

/**
 * Writes an array of objects to the specfied collection in the BD.
 * @param factory 
 * @param data 
 * @param collectionName 
 */
export function createList<T>(factory: Factory<T>, data: T[], collectionName: string): Promise<T[]> {
  return new Promise( async (resolve, reject) => {
    try {
      const list: T[] = buildList(factory, data)
      const result    = await mongoClient.conn(collectionName).insertMany(list)
      console.log(`[debug] createList(), result= `, result)

      resolve(result.ops)
    }
    catch(error) {
      console.log(`[error] Failed to create the list of data in mongoDB, error= `, error)
      reject(error)
    }
  })
}

export default Factory.define<IUser, UserTransientParams>( ({ transientParams, onCreate }) => {
  console.log(`[debug] env=${process.env.NODE_ENV}, db=${process.env.MONGODB_URI}`)
  const { mongoClient } = transientParams

  onCreate( (user) => {
    console.log(`[debug] UserFactory.onCreate(), user= `, user)
    //** return UserDAO.create(user)
    return new Promise( async (resolve, reject) => {
      const result = await mongoClient?.conn('users').insertOne(user)
      resolve(user)
    })
  })

  return {
    _id:        new ObjectId(),
    firstName:  'Marv',
    lastName:   'Levy',
    email:      'marv@bills.com'
  }
})