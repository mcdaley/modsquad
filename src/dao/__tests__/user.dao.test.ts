//-----------------------------------------------------------------------------
// src/dao/__tests__/user.dao.test.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import { ObjectId }           from 'bson'

import MongoDAO               from '../../config/mongo-dao'
import UserDAO, {
  IUser,
}                             from '../user.dao'

import userFactory            from '../../__tests__/factories/user.factory'
import { 
  buildTestDataArray, 
  createList 
}                             from '../../__tests__/factories/factory.utils'
import { userFactoryData }    from '../../__tests__/factories/factory.data'

///////////////////////////////////////////////////////////////////////////////
// TODO: 06/11/2021
// - NEED TO FIX THIS AS IT MAKES EVERYTHING COMPLICATED.
///////////////////////////////////////////////////////////////////////////////
// Export the mongoClient
export let mongoClient:  MongoDAO

describe(`UserDAO`, () => {
  // User test data
  let userData: IUser[]   = buildTestDataArray<IUser>(userFactoryData)
  
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

  describe(`CRUD Operations`, () => {
    beforeEach( async () => {
      //* await mongoClient.conn(`users`).insertMany(userData)
      await createList(userFactory, userData, 'users')
    })

    afterEach( async () => {
      await mongoClient.conn(`users`).deleteMany({})
    })

    ///////////////////////////////////////////////////////////////////////////
    // TestCases: 05/19/2021
    //  [x] 1.) Create a valid user
    //  [x] 2.) Cannot create user w/ duplicate email
    //  3.) Test required fields -> define collection schema
    ///////////////////////////////////////////////////////////////////////////
    describe(`Create User`, () => {
      it(`Rejects a user w/ a duplicate email`, async () => {
        try {
          let dupEmail: IUser = userFactory.build({
            email: userFactoryData.andre_reed.email,
          })
          const result = await UserDAO.create(dupEmail)
        }
        catch(error) {
          expect(error.code).toBe(11000)
          expect(error.message).toMatch(/E11000 duplicate key error/i)
        }
      })

      it(`Creates a new user`, async () => {
        let user: IUser = userFactory.build({
          firstName:  `Chuck`,
          lastName:   `Knox`,
          email:      `chuck@bills.com`
        })

        const response = await UserDAO.create(user)

        expect(response.firstName).toBe(user.firstName)
        expect(response.email).toBe(user.email)

        // Verify DAO is saved to the DB
        let conn   = mongoClient.conn(`users`)
        let result = await conn.find({email: user.email}).toArray()

        expect(result.length).toBe(1)
        expect(result[0].email).toBe(user.email)
      })
    })
  })
})