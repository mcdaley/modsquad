//-----------------------------------------------------------------------------
// src/dao/user.dao.ts
//-----------------------------------------------------------------------------
import { 
  MongoClient, 
  Collection, 
}                         from 'mongodb'
import { ObjectId }       from 'bson'

import logger             from '../config/winston'

/**
 * @interface IUser
 */
export interface IUser {
  _id?:         ObjectId,
  firstName:    string,
  lastName:     string,
  email:        string,
}

/**
 * @interface IUpdateUser
 */
export interface IUpdateUser { 
  firstName?:   string,
  lastName?:    string,
  email?:       string,
}

/**
 * @class UserDAO
 */
export default class UserDAO {
  public static users: Collection

  /**
   * Link the DB connection to the users collection
   * @method injectDB
   * @param  {MongoClient} conn
   */
  public static async injectDB(conn: MongoClient) {
    if (this.users) {
      return
    }
    try {
      this.users = await conn.db().collection(`users`)
      logger.info(`Connected to the [users] collection`)
    } 
    catch (error) {
      logger.error(`
        Failed to connect to UserDAO: error= %o`, error
      )
      throw(error)
    }
  }

  /**
   * @method  create
   * @param   {IUser} user 
   * @returns Promise<IUser>
   */
  public static create(user: IUser): Promise<IUser> {
    logger.debug(`UserDAO.create(), user = %o`, user)

    return new Promise( async (resolve, reject) => {
      try {
        const  result       = await this.users.insertOne(user)
        const  insertedId   = result.insertedId
        const  insertedUser = <IUser>(await this.users.findOne({_id: insertedId}))

        logger.debug(`Success, created a new user = %o`, insertedUser)
        resolve(insertedUser)
      }
      catch(error) {
        logger.error(`Failed to create user, error= %o`, error)
        reject(error)
      }
    })
  }

} // end of UserDAO