//-----------------------------------------------------------------------------
// src/models/team.model.ts
//-----------------------------------------------------------------------------
import { ObjectId }           from 'bson'

import ActiveModel, {
  ITList,
}                             from './active.model'
import TeamDAO, { 
  ITeam, 
  ITeamList,  
}                             from '../dao/team.dao'
import TeamsUsersDAO, {
  ITeamsUsers,
}                             from '../dao/teams-users.dao'

import { IUser }              from '../dao/user.dao'

/**
 * @class Team
 */
//** export default class Team extends ActiveModel<ITeam> {
export default class Team {
  public _id?:         ObjectId
  public name:         string
  public description:  string
  
  constructor(params: ITeam) {
    //** super()
    this._id          = params._id || new ObjectId()
    this.name         = params.name
    this.description  = params.description || ''
  }

  /////////////////////////////////////////////////////////////////////////////
  // TODO: 06/17/2021
  //  - Test method to verify that I can override the base class static
  //    method.
  /////////////////////////////////////////////////////////////////////////////
  public static message(): string {
    return `[debug] Team::message() called`
  }

  public static findById(teamId: string): Promise<ITeam> {
    return new Promise( async (resolve, reject) => {
      try {
        const result: ITeam = await TeamDAO.findById(teamId)
        resolve(result)
      }
      catch(error) {
        reject(error)
      }
    })
  }

  public static find(): Promise<ITList<ITeam>> {
    return new Promise( async (resolve, reject) => {
      try {
        const result: ITList<ITeam> = await TeamDAO.find()
        resolve(result)
      }
      catch(error) {
        reject(error)
      }
    })
  }

  /**
   * @method  save
   * @returns {Promise<ITeam}
   */
  public save(): Promise<ITeam> {
    return new Promise( async (resolve, reject) => {
      try {
        const team:   ITeam = {
          _id:          this._id, 
          name:         this.name, 
          description:  this.description
        }
        const result: ITeam = await TeamDAO.create(team)

        resolve(result)
      }
      catch(error) {
        reject(error)
      }
    })
  }

  /**
   * Returns all of the users assigned to a team.
   * @returns <Promise<IUser[]>
   */
  public getUsers(): Promise<IUser[]> {
    return new Promise( async (resolve, reject) => {
      try {
        const team:  ITeam    = await TeamDAO.findById(<string>this._id?.toHexString())
        const users: IUser[]  = <IUser[]>team.users

        resolve(users)
      }
      catch(error) {
        reject(error)
      }
    })
  }

  /**
   * Adds a user to a team.
   * 
   * POST /api/v1/teams/:teamId/users/:userId
   * 
   * Controller needs to validate the team and the user in middleware
   * 
   * let team   = await Team.find(teamId)     // If addUser is static then test for Id in middleware
   * let user   = await Team.find(userId)     // Middleware
   * let result = await team.addUser(userId)  // or if static, Team.addUser(teamId, userId)
   * 
   * @param   {string} userId 
   * @returns {Promise<ITeamsUsers>}
   */
  public addUser(userId: string): Promise<ITeamsUsers> {
    return new Promise( async (resolve, reject) => {
      try {
        const teamId = <string>this._id?.toHexString()
        const result = await TeamsUsersDAO.create(teamId, userId)

        resolve(result)
      }
      catch(error) {
        reject(error)
      }
    })
  }

  /**
   * Removes a user from a team.
   * @param   {string} userId 
   * @returns {Promise<boolean>}
   */
  public removeUser(userId: string): Promise<boolean> {
    return new Promise( async (resolve, reject) => {
      try {
        const teamId  = <string>this._id?.toHexString()
        const result  = TeamsUsersDAO.delete(teamId, userId)

        resolve(result)
      }
      catch(error) {
        reject(error)
      }
    })
  }
}