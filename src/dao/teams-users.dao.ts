//-----------------------------------------------------------------------------
// src/dao/teams-users.dao.ts
//-----------------------------------------------------------------------------
import { MongoClient, Collection, Cursor }    from 'mongodb'
import { ObjectID }                           from 'bson'
import logger                                 from '../config/winston'

export interface ITeamsUsers {
  _id?:     ObjectID,
  teamId:   ObjectID,
  userId:   ObjectID,
}

/**
 * Collection that performs a many-to-many join on the Users and Teams
 * collections.
 * 
 * @class TeamsUsers
 */
export default class TeamsUsersDAO {
  public static teamsUsers: Collection

  /**
   * Link the DB connection to the teams-users collection
   * 
   * @method injectDB
   * @param  {MongoClient} conn - connection to the MongoDB
   */
   public static async injectDB(conn: MongoClient) {
    if (this.teamsUsers) {
      return
    }
    try {
      this.teamsUsers = await conn.db().collection(`teams-users`)
      logger.info(
        `Connected to the [teams-users] collection`
      )
    } 
    catch (error) {
      logger.error(`
        Failed to connect to TeamsUsersDAO: error= %o`, error
      )
      throw(error)
    }
  }

  /**
   * Add a user to a project team by adding a record to the TeamsUsers join 
   * collection that performs a many-to-many link between the Teams and Users
   * collections.
   * 
   * @method  create
   * @param   {string} teamId
   * @param   {string} userId 
   * @returns {Promise<ITeamsUsers>}
   */
  public static create(teamId: string, userId: string): Promise<ITeamsUsers> {
    logger.info(`TeamsUsersDAO::create(%s, %s)`, teamId, userId)

    return new Promise( async (resolve, reject) => {
      try {
        let teamUser: ITeamsUsers = {
          teamId: new ObjectID(teamId),
          userId: new ObjectID(userId)
        }

        const result  = await this.teamsUsers.insertOne(teamUser)
        const record  = result.ops[0]

        logger.debug(`Success, added a new user=[%s] to team=[%s]`, userId, teamId)
        resolve(record)

      }
      catch(error) {
        logger.error(
          `Failed to add user=[%s] to team=[%s], error= %o`, 
          userId, teamId, error
        )
        reject(error)
      }
    })
  }

  /**
   * Removes a user from a project team.
   * 
   * @method  delete
   * @param   {string} teamId 
   * @param   {string} userId 
   * @returns {Promise<boolean>}
   */
  public static delete(teamId: string, userId: string): Promise<boolean> {
    logger.info(`TeamsUsersDAO.delete(%s, %s)`, teamId, userId)

    return new Promise( async (resolve, reject) => {
      try {
        let teamUser: ITeamsUsers = {
          teamId: new ObjectID(teamId),
          userId: new ObjectID(userId)
        }

        const result = await this.teamsUsers.deleteOne(teamUser)
        if(result.deletedCount === 1) {
          logger.info(`Deleted userId=[%s] from teamId=[%s]`, userId, teamId)
          resolve(true)
        }
        else {
          logger.warn(
            `UserId=[%s] and teamId=[%s] not found in teams-users collection`, 
            userId, teamId
          )
          resolve(false)
        }
      }
      catch(error) {
        logger.error(
          `Failed to delete userId=[%s] from teamId=[%s], error= %o`, 
          teamId, userId, error
        )
        reject(error)
      }
    })
  }

} // end of class TeamsUsersDAO