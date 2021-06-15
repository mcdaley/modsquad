//-----------------------------------------------------------------------------
// src/__tests__/factories/factory.data.ts
//-----------------------------------------------------------------------------
import { ObjectId }             from 'bson'

import { buildTestDataArray }   from './factory.utils'
import { IUser }                from '../../dao/user.dao'
import { ITeam }                from '../../dao/team.dao'
import { ITeamsUsers } from 'src/dao/teams-users.dao'

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
  bobby_chandler: {
    _id:        new ObjectId(),
    firstName:  'Bobby',
    lastName:   'Chandler',
    email:      'bobby@bills.com',
  },
  james_lofton: {
    _id:        new ObjectId(),
    firstName:  'James',
    lastName:   'Lofton',
    email:      'james@bills.com'
  },
  don_beebe: {
    _id:        new ObjectId(),
    firstName:  'Don',
    lastName:   'Beebe',
    email:      'don@bills.com'
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
    name:         `Green Bay Packers`,
    description:  `Cheese Heads`,
  },
}

// Teams-Users join data
export const teamsUsersFactoryData: ITeamsUsers[] = [
  {  
    _id:          new ObjectId(),
    teamId:       teamFactoryData.buffalo_bills._id,
    userId:       userFactoryData.marv_levy._id
  },
  {  
    _id:          new ObjectId(),
    teamId:       teamFactoryData.buffalo_bills._id,
    userId:       userFactoryData.andre_reed._id
  },
  {  
    _id:          new ObjectId(),
    teamId:       teamFactoryData.buffalo_bills._id,
    userId:       userFactoryData.bobby_chandler._id
  },
  {  
    _id:          new ObjectId(),
    teamId:       teamFactoryData.buffalo_bills._id,
    userId:       userFactoryData.james_lofton._id
  },
  {  
    _id:          new ObjectId(),
    teamId:       teamFactoryData.buffalo_bills._id,
    userId:       userFactoryData.don_beebe._id
  },
  {  
    _id:          new ObjectId(),
    teamId:       teamFactoryData.greenbay_packers._id,
    userId:       userFactoryData.james_lofton._id
  },
  {  
    _id:          new ObjectId(),
    teamId:       teamFactoryData.greenbay_packers._id,
    userId:       userFactoryData.don_beebe._id
  },
]
