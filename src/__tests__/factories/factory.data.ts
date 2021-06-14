//-----------------------------------------------------------------------------
// src/__tests__/factories/factory.data.ts
//-----------------------------------------------------------------------------
import { ObjectId }             from 'bson'

import { buildTestDataArray }   from './factory.utils'
import { IUser }                from '../../dao/user.dao'
import { ITeam }                from '../../dao/team.dao'

// User data formatted as an object
export const userFactoryData = {
  marv_levy: {
    _id:        new ObjectId(),
    firstName:  'Marv',
    lastName:   'Levy',
    email:      'marv@bills.com',
  },
  andre_reed: {
    _id:        new ObjectId(),
    firstName:  'Andre',
    lastName:   'Reed',
    email:      'andre@bills.com'
  },
  bruce_smith: {
    _id:        new ObjectId(),
    firstName:  'Bruce',
    lastName:   'Smith',
    email:      'bruce@bills.com'
  },
}

// Teams data
export const teamFactoryData = {
  buffalo_bills: {
    _id:          new ObjectId(),
    name:         `Buffalo Bills`,
    description:  `AFC East Champions`,
  },
  greenbay_packers: {
    _id:          new ObjectId(),
    name:         `Green Bay Packerts`,
    description:  `Cheese Heads`,
  },
}

// Teams-Users join data
export const teamsUsersData = [
  {  
    _id:          new ObjectId(),
    teamId:       teamFactoryData.buffalo_bills._id,
    userId:       userFactoryData.andre_reed._id
  },
]
