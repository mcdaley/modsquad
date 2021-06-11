//-----------------------------------------------------------------------------
// src/__tests__/dao/user.dao.test.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import { ObjectId }           from 'bson'

import UserFactory            from '../factories/user.factory'
import { 
  buildDataArray,
  buildList,
  createList,
}                             from '../factories/factory.utils'

import MongoDAO               from '../../config/mongo-dao'
import UserDAO, { 
  IUser 
}                             from '../../dao/user.dao'

import {
  userData,
  //* teamData,
  //* teamsUsersData,
  testData,
}                             from '../factories/factory.data'

// Export the mongoClient
export let mongoClient: MongoDAO


describe(`Fisher UserDAO Tests`, () => {
  /**
   * Connect to MongoDB before running tests
   */
   beforeAll( async () => {
    mongoClient = new MongoDAO()
    await mongoClient.connect()
  })

  /**
   * Remove the data from the test DB and Close the MongoDB connection 
   * after running the tests.
   */
  afterAll( async () => {
    await mongoClient.conn(`users`).deleteMany({})
    mongoClient.close()
  })

  /////////////////////////////////////////////////////////////////////////////
  // TODO: 06/10/2021
  //  - THINK THROUGH HOW THE TESTS WORK. IN THIS CASE, I WANT TO JUST "BUILD"
  //    THE USER AND THEN CALL THE UserDAO.create() AND VERIFY THE USER WAS
  //    CREATED.
  //
  //  - WHEN FETCHING A LIST OF USERS, I WANT TO CREATE THE LIST OF USERS
  //    AND THEN VERIFY THAT I CAN RETURN THEM.
  /////////////////////////////////////////////////////////////////////////////
  describe(`CRUD Operations`, () => {
    it(`Creates a new user`, async () => {
      //** const user = UserFactory.build({firstName: 'Ahmad', lastName: 'Rashad'})
      const user = await UserFactory.create()
      console.log(`[debug] Default user= `, user)
      expect(user.email).toBe('marv@bills.com')
    })

    it(`Builds a specified user`, () => {
      const coach = userData.andre_reed
      const user  = UserFactory.build(coach)

      expect(user.email).toBe(coach.email)
    })

    it(`Builds a list of users`, () => {
      const users = buildList(UserFactory, testData)
      console.log(`[debug] User list= `, users)

      expect(users.length).toBe(3)
    })

    it(`Builds a list of users from an object of users`, () => {
      const data  = buildDataArray<IUser>(userData)
      const users = buildList(UserFactory, data)
      console.log(`[debug] Users = `, users)

      expect(users.length).toBe(3)
    })

    it.only(`Builds a list from a Map of users`, () => {
      const data = new Map([
        ["marv",  "levy"],
        ["andre", "reed"],
        ["bruce", "smith"],
      ])
    })

    it(`Creates a list of users`, async () => {
      console.log(`[debug] environment=[${process.env.NODE_ENV}], db=[${process.env.MONGODB_URI}]`)
      const users = await createList(UserFactory, testData, 'users')
      console.log(`[debug] User list= `, users)

      expect(users.length).toBe(3)
    })
  })
})