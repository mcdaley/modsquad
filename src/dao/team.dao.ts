//-----------------------------------------------------------------------------
// src/dao/team.dao.ts
//-----------------------------------------------------------------------------
import { MongoClient, Collection, Cursor }    from 'mongodb'
import { ObjectID }                           from 'bson'
import logger                                 from '../config/winston'

import { IUser }                              from './user.dao'

/**
 * @interface ITeammates
 */
export interface ITeammate {
  userId: ObjectID
}

/**
 * @interface ITeam
 */
export interface ITeam {
  _id?:           ObjectID,
  name:           string,
  description?:   string,
  members:        ITeammate[],
  users?:         IUser[],
}

/**
 * @interface ITeamList
 */
export interface ITeamList {
  teams:      ITeam[],
  totalCount: number,
}

/**
 * @class TeamDAO
 */
export default class TeamDAO {
  public static teams: Collection

  /**
   * Link the DB connection to the organizations collection
   * @method injectDB
   * @param  {MongoClient} conn - connectoin to the MongoDB
   */
   public static async injectDB(conn: MongoClient) {
    if (this.teams) {
      return
    }
    try {
      this.teams = await conn.db().collection(`teams`)
      logger.info(
        `Connected to the [teams] collection`
      )
    } 
    catch (error) {
      logger.error(`
        Failed to connect to TeamDAO: error= %o`, error
      )
      throw(error)
    }
  }

  /**
   * Create a new team w/ optional teammates. The method assumes that the
   * userIDs for the teammates have been validated before calling the create
   * method.
   * 
   * @method  create
   * @param   {ITeam} team - The team to create, assume valid users.
   * @return  {Promise<ITeam>} - The ITeam object inserted into the DB
   */
  public static create(team: ITeam): Promise<ITeam> {
    logger.debug(`TeamDAO::create(), team= %o`, team)

    return new Promise( async (resolve, reject) => {
      try {
        const  result = await this.teams.insertOne(team)
        const  data   = result.ops[0]

        logger.debug(`Success, created a new team = %o`, data)
        resolve(data)
      }
      catch(error) {
        logger.error(`Failed to create the team, error= %o`, error)
        reject(error)
      }
    })
  }

  /**
   * @method  find
   * @param   {Object} query 
   * @param   {Object} options 
   * @returns {Promise<ITeamList>} Returns a list of teams
   */
  public static find(query = {}, options = {}): Promise<ITeamList> {
    logger.debug(`TeamDAO::find()`)

    ///////////////////////////////////////////////////////////////////////////
    // NOTE: 04/19/2021
    // Only get the first 20 documents for development
    ///////////////////////////////////////////////////////////////////////////
    const page:         number = 0
    const docsPerPage:  number = 20

    return new Promise( async (resolve, reject) => {
      try {
        const count:   number   = await this.teams.countDocuments(query)
        const cursor:  Cursor   = await this.teams.find(query, options)
        const result:  ITeam[]  = await cursor.limit(docsPerPage).skip(page * docsPerPage).toArray()
        logger.info(`Fetched [%d] of [%d] teams`, result.length, count)

        const teamList: ITeamList = {
          teams:  result,
          totalCount: count,
        }

        resolve(teamList)
      }
      catch(error) {
        logger.error(`Failed to fetch teams, error= %o`, error)
        reject(error)
      }
    })
  }

  /*********
   [
      {
        '$lookup': {
          'from':         'users', 
          'localField':   'members.userId', 
          'foreignField': '_id', 
          'as': 'teammates'
        }
      }
    ]
   *********/
  public static findTeams(): Promise<ITeam[]> {
    logger.debug(`TeamDAO.findTeams()`)

    return new Promise( async (resolve, reject) => {
      const pipeline = [
        {
          '$lookup': {
            'from':         'users', 
            'localField':   'members.userId', 
            'foreignField': '_id', 
            'as':           'users'
          }
        }
      ]

      try {
        //* const cursor:  Cursor   = await this.teams.find({}, {})
        //* const result:  ITeam[]  = await cursor.limit(20).skip(0).toArray()
        const result: ITeam[] = await this.teams.aggregate(pipeline).toArray()
        logger.debug(`Fetched Teams= %o`, result)

        resolve(result)
      }
      catch(error) {
        logger.error(`Failed to fetch teams, error= %o`, error)
        reject(error)
      }
    })
  }

} // end of class TeamDAO
