//-----------------------------------------------------------------------------
// src/models/team.model.ts
//-----------------------------------------------------------------------------
import { ObjectID }           from 'bson'
import { ITeam, ITeammate }   from '../dao/team.dao'

/**
 * @class Team
 */
export default class Team implements ITeam {
  _id:          ObjectID
  name:         string
  description?: string      = ''
  members:      ITeammate[] = []
  
  constructor(name: string, description: string = '', members: ITeammate[] = []) {
    this._id          = new ObjectID()
    this.name         = name
    this.description  = description
    this.members      = members
  }
}