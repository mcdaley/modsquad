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

  /**
   * Find a team w/ its ID and then join the userIds for the members w/
   * the "users" collection to return all the member details.
   * 
   * @method  findById
   * @param   {string}  teamId 
   * @returns {Promise<ITeam>}
   */
  public static findById(teamId: string): Promise<ITeam> {
    logger.debug(`TeamDAO.findById()`)

    return new Promise( async (resolve, reject) => {
      try {
        const pipeline = [
          {
            '$match': {
              '_id': new ObjectID(teamId)
            }
          }, 
          {
            '$lookup': {
              'from':         'users', 
              'localField':   'members.userId', 
              'foreignField': '_id', 
              'as':           'members'
            }
          }
        ]

        const result: ITeam = await this.teams.aggregate(pipeline).next()

        if(result) {
          logger.info(`Fetched team w/ id=[%s], team= %o`, teamId, result)
        }
        else {
          logger.info(`Team w/ id=[%s] not found`, teamId)
        }
        
        resolve(result)
      }
      catch(error) {
        logger.error(`Failed to fetch team w/ id=[%s], error= %o`, teamId, error)
        reject(error)
      }
    })
  }
  
  /**
   * TEST METHOD TO LEARN HOW TO WORK WITH THE AGGREGATE PIPELINE AND
   * '$lookup'
   */
  public static search(query= {}, options = {}): Promise<ITeamList> {
    logger.debug(`TeamDAO.search()`)

    return new Promise( async (resolve, reject) => {
      ///////////////////////////////////////////////////////////////////////////
      // NOTE: 04/19/2021
      // Only get the first 20 documents for development
      ///////////////////////////////////////////////////////////////////////////
      const page:         number = 0
      const teamsPerPage: number = 20
      const pipeline = [
        {
          '$limit': teamsPerPage
        },
        {
          '$skip':  page * teamsPerPage
        },
        {
          '$lookup': {
            'from':         'users', 
            'localField':   'members.userId', 
            'foreignField': '_id', 
            'as':           'users',
          }
        },
        {
          '$project': {
            'name':         1,
            'description':  1,
            'users':        1,
          }
        }
      ]

      try {
        const count:  number  = await this.teams.countDocuments(query)
        const result: ITeam[] = await this.teams.aggregate(pipeline).toArray()
        logger.debug(`Fetched Teams= %o`, result)

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

} // end of class TeamDAO
