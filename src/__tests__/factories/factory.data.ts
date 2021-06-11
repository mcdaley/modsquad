//-----------------------------------------------------------------------------
// src/__tests__/factories/factory.data.ts
//-----------------------------------------------------------------------------
import { ObjectId }   from 'bson'

import { IUser }      from '../../dao/user.dao'

// User data
export const userData = {
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
export const teamData = {
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
    teamId:       teamData.buffalo_bills._id,
    userId:       userData.andre_reed._id
  },
]

// Test user data stored as an array.
export const testData: IUser[] = [
  {
    _id:        new ObjectId(),
    firstName:  'Marv',
    lastName:   'Levy',
    email:      'marv@bills.com',
  },
  {
    _id:        new ObjectId(),
    firstName:  'Andre',
    lastName:   'Reed',
    email:      'andre@bills.com'
  },
  {
    _id:        new ObjectId(),
    firstName:  'Bruce',
    lastName:   'Smith',
    email:      'bruce@bills.com'
  },
]
