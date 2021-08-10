//-----------------------------------------------------------------------------
// src/dao/team.dao.ts
//-----------------------------------------------------------------------------
import { 
  MongoClient, 
  Collection, 
  FindCursor, 
  Document,
  Filter,
  UpdateFilter,
  FindOneAndUpdateOptions,
}                       from 'mongodb'
import { ObjectId }     from 'bson'
import logger           from '../config/winston'

import { IUser }        from './user.dao'
import { ITList }       from '../models/active.model'

/**
 * @interface ITeammates
 */
export interface ITeammate {
  userId: ObjectId
}

/**
 * @interface ITeam
 */
export interface ITeam extends Document{
  _id?:           ObjectId,
  name:           string,
  description?:   string,
  members?:       ITeammate[],
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
 * @interface IUserTeams
 */
 export interface IUserTeams extends IUser {
  teams:  ITeam[]
}

/**
 * @class TeamDAO
 */
export default class TeamDAO {
  public static teams: Collection
  public static users: Collection

  /**
   * Link the DB connection to the organizations collection
   * @method injectDB
   * @param  {MongoClient} conn - connectoin to the MongoDB
   */
   public static async injectDB(conn: MongoClient) {
    if (this.teams && this.users) {
      return
    }
    try {
      this.teams = await conn.db().collection(`teams`)
      this.users = await conn.db().collection('users')

      logger.info(
        `Connected to the [teams] and [users] collections`
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
   * @param   {ITeam} team      - The team to create, assume valid users.
   * @return  {Promise<ITeam>}  - The ITeam object inserted into the DB
   */
  public static create(team: ITeam): Promise<ITeam> {
    logger.debug(`TeamDAO::create(), team= %o`, team)

    return new Promise( async (resolve, reject) => {
      try {
        const  result       = await this.teams.insertOne(team)
        const  insertedId   = result.insertedId
        const  insertedTeam = <ITeam>(await this.teams.findOne({_id: insertedId}))

        logger.debug(`Success, created a new team = %o`, insertedTeam)
        resolve(insertedTeam)
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
  public static find(query = {}, options = {}): Promise<ITList<ITeam>> {
    logger.debug(`TeamDAO::find()`)

    ///////////////////////////////////////////////////////////////////////////
    // NOTE: 04/19/2021
    // Only get the first 20 documents for development
    ///////////////////////////////////////////////////////////////////////////
    const page:         number = 0
    const docsPerPage:  number = 20

    return new Promise( async (resolve, reject) => {
      try {
        const count:   number     = await this.teams.countDocuments(query)
        const cursor:  FindCursor = await this.teams.find(query, options)
        const result:  ITeam[]    = await cursor.limit(docsPerPage).skip(page * docsPerPage).toArray()
        logger.info(`Fetched [%d] of [%d] teams`, result.length, count)

        const teamList: ITList<ITeam> = {
          teams:      result,
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
   * Returns the team details including all of the users assigned to the 
   * team by joining the teams collection with the teams-users and users 
   * collections.
   * 
   * NOTE: the $lookup works on an matching an array w/ a single field,
   * so in the second $lookup, I can match on the teams.users[] with
   * users._id
   * 
   * @method  findById
   * @param   {string} teamId 
   * @returns {Promise<ITeam>}
   */
  public static findById(teamId: string): Promise<ITeam | null> {
    logger.debug(`TeamDAO.findById(%s)`, teamId)

    return new Promise( async (resolve, reject) => {
      try {
        // Define pipeline
        const id       = new ObjectId(teamId)
        const pipeline = [
          {
            '$match': {
              '_id': id
            }
          }, 
          {
            '$lookup': {
              'from':         'teams-users', 
              'localField':   '_id', 
              'foreignField': 'teamId', 
              'as':           'users'
            }
          }, 
          {
            '$lookup': {
              'from':         'users', 
              'localField':   'users.userId', 
              'foreignField': '_id', 
              'as':           'users'
            }
          }
        ]

        // Run query
        const result: ITeam | null = await this.teams.aggregate(pipeline).next()

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
   * Returns the user and all the teams that the user is assigned by 
   * joining the users collection with the teams-users and teams
   * collections.
   * 
   * @method  findUserTeams
   * @param   {string} userId 
   * @returns {Promise<IUserTeam>}
   */
   public static findUserTeams(userId: string): Promise<IUserTeams | null> {
    logger.debug(`TeamDAO.findTeams(%s)`, userId)

    return new Promise( async (resolve, reject) => {
      try {
        // Define pipeline
        const id        = new ObjectId(userId)
        const pipeline  = [
          {
            $match: {
              _id: id
            }
          }, 
          {
            $lookup: {
              from:           'teams-users', 
              localField:     '_id', 
              foreignField:   'userId', 
              as:             'teams'
            }
          }, 
          {
            $lookup: {
              from:         'teams', 
              localField:   'teams.teamId', 
              foreignField: '_id', 
              as:           'teams'
            }
          },
        ]

        // Run query
        const result: IUserTeams | null = await this.users.aggregate(pipeline).next()

        if(result) {
          logger.info(`Fetched teams for user w/ id=[%s], team= %o`,userId, result)
        }
        else {
          logger.info(`User w/ id=[%s] not found`, userId)
        }
        
        resolve(result)
      }
      catch(error) {
        logger.error(`Failed to find teams for userId=[%s], error= %o`, userId, error)
        reject(error)
      }
    })
  }

  /////////////////////////////////////////////////////////////////////////////
  // TODO: 06/09/2021
  //
  // BELOW IS LEGACY CODE WHERE I ASSIGNED USERS TO A TEAM USING A MEMBERS
  // ARRAY.
  /////////////////////////////////////////////////////////////////////////////

  /**
   * Find a team w/ its ID and then join the userIds for the members w/
   * the "users" collection to return all the member details. This version
   * stores all of the teammates in a members array in the collection.
   * 
   * @method  findById_v2
   * @param   {string}  teamId 
   * @returns {Promise<ITeam>}
   */
  public static findById_v2(teamId: string): Promise<ITeam | null > {
    logger.debug(`TeamDAO.findById(%s)`, teamId)

    return new Promise( async (resolve, reject) => {
      try {
        const pipeline = [
          {
            '$match': {
              '_id': new ObjectId(teamId)
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

        const result: ITeam | null = await this.teams.aggregate(pipeline).next()

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
   * Add a user to a team. The caller needs to ensure the User ID exists
   * and is for a valid user in the organization as the method does not
   * do that validation.
   * 
   * @method  addMember
   * @param   {string} teamId
   * @param   {string} userId 
   * @param   {Promise<ITeam>} - The user just added to the team.
   */
/**********************************************************
  public static addMember(teamId: string, userId: string): Promise<ITeam> {
    logger.debug(`TeamDAO.addMember()`)

    const options : FindOneAndUpdateOptions = {
      upsert:           false,
      returnDocument:   "after",
    }

    ///////////////////////////////////////////////////////////////////////////
    // TODO: 08/09/2021
    // UNABLE TO GET THIS WORKING WITH THE 4.1 VERSION OF THE MONGODB 
    // DRIVER. I CAN UPDATE A FIELD WITH $set BUT I CANNOT ADD A MEMBER 
    // TO THE ARRAY.
    ///////////////////////////////////////////////////////////////////////////
    return new Promise( async (resolve, reject) => {
      try {
        const filter : Filter<Document> = {_id: new ObjectId(teamId)}
        //* const update : UpdateFilter<Document> = {
        //*   $set: {
        //*     name: `Miami Dolphins`,
        //*   }
        //* }
        const update : UpdateFilter<ITeam> = {
          $addToSet : {
            members: { userId: new ObjectId(userId) }
          }
        }

        const result = await this.teams.findOneAndUpdate( 
          filter, 
          update,
          options
        )
        logger.info(`Added user id=[%s] to team=[%s], result= %o`, userId, teamId, result)
        resolve(<ITeam>result.value)
      }
      catch(error) {
        logger.error(
          `Failed to add user id=[%s] to team=[%s], error= %o`, 
          userId, teamId, error
        )
        reject(error)
      }
    })
  }
***********************************************************/
  /**
   * Removes a user from the team and returns the updated team.
   * @method  removeMember
   * @param   {string} teamId 
   * @param   {string} userId 
   * @returns Promise<ITeam>
   */
/***********************************************************
  public static removeMember(teamId: string, userId: string): Promise<ITeam> {
    logger.debug(`TeamDAO.removeMember()`)

    const options    = {
      upsert:           false,
      returnOriginal:   false,
    }

    return new Promise( async (resolve, reject) => {
      try {
        const bsonUserId  = new ObjectId(userId)
        const result      = await this.teams.findOneAndUpdate( 
          {_id: new ObjectId(teamId)}, 
          [
            { 
              $set: {
                members: { 
                  $filter: {
                    input: "$members", 
                    as:    "member", 
                    cond:  {
                      $ne: ["$$member.userId", bsonUserId]
                    }
                  } 
                }
              }
            }
          ],
          options
        )
        logger.info(`Removed user id=[%s] to team=[%s], result= %o`, userId, teamId, result)
        resolve(result.value)
      }
      catch(error) {
        logger.error(
          `Failed to remove user id=[%s] to team=[%s], error= %o`, 
          userId, teamId, error
        )
        reject(error)
      }
    })
  }
***********************************************************/  
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
