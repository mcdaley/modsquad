//-----------------------------------------------------------------------------
// src/config/mongodb-dao.ts
//-----------------------------------------------------------------------------
import { Collection, MongoClient }    from 'mongodb'

import logger                         from './winston'
import OrganizationDAO                from '../dao/organization.dao'
import UserDAO                        from '../dao/user.dao'

/**
 * MongoDAO manages the connection to the MongoDB for the app. First, it
 * connects to the MongoDB specified in the .env file and then it links 
 * all of the DAO objects to the client.
 */
class MongoDAO {
  private client: MongoClient

  constructor() {
    logger.info(`Connecting to DB: %s`, process.env.MONGODB_URI)

    this.client = new MongoClient(<string>process.env.MONGODB_URI, {
      useNewUrlParser:    true,
      useUnifiedTopology: true,
    })
  }

  public connect(): Promise<boolean> {
    return new Promise( async (resolve, reject) => {
      try {
        await this.client.connect()
        logger.info(`Success, Connected to DB`)

        await this.injectDb()

        resolve(true)
      }
      catch(error) {
        logger.error(`Failed to connect to MongoDB, error= %o`, error)
        reject(false)
      }
    })
  }

  /**
   * Link all of the DAOs to the MongoDB client connection, so that they can
   * run CRUD queries. Need to add the call to the DAO's injectDB() method
   * for all of the defined DAOs.
   * 
   * @returns {Promise<boolean>}
   */
  public injectDb(): Promise<boolean> {
    return new Promise( async (resolve, reject) => {
      logger.info(`Linking DAOs to mongoDB connection`)
      try {
        // Link to all of the DAOs
        await OrganizationDAO.injectDB(this.client)
        await UserDAO.injectDB(this.client)

        resolve(true)
      }
      catch(error) {
        reject(error)
      }
    })
  }

  /**
   * Return a MongoDB collection that is used for Jest unit testing.
   * @param   {String} collection 
   * @returns {Collection}
   */
  public conn(collection: string): Collection {
    return this.client.db().collection(collection)
  }

  /**
   * Close the MongoDB connections
   */
  public close() {
    logger.info(`Close connection to DB: %s`, process.env.MONGODB_URI)
    this.client.close()
  }
}

// Export MongoDAO
export default MongoDAO

