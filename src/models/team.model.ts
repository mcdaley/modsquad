//-----------------------------------------------------------------------------
// src/models/team.model.ts
//-----------------------------------------------------------------------------
import { ObjectId }           from 'bson'
import { ITeam, ITeammate }   from '../dao/team.dao'

/**
 * @class Team
 */
export default class Team implements ITeam {
  _id:          ObjectId
  name:         string
  description?: string      = ''
  members:      ITeammate[] = []
  
  constructor(name: string, description: string = '', members: ITeammate[] = []) {
    this._id          = new ObjectId()
    this.name         = name
    this.description  = description
    this.members      = members
  }
}