//-----------------------------------------------------------------------------
// src/__tests__/config/db.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import MongoDAO   from '../../config/mongo-dao'
import GlitchData from '../factories/glitch-data'

/**
 * @class DB
 */
export default class DB {
  public static mongoClient: MongoDAO

  public static async connect() {
    this.mongoClient = new MongoDAO()
    await this.mongoClient.connect()
  }

  public static close() {
    this.mongoClient.close()
  }

  public static seed(collections: string[]) {

  }
}
