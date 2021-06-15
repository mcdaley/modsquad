//-----------------------------------------------------------------------------
// src/dao/__tests__/user.dao.test.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import MongoDAO               from '../../config/mongo-dao'
import UserDAO, {
  IUser,
}                             from '../user.dao'

import { userFactoryData }    from '../../spec/factories/factory.data'
import { 
  buildTestDataArray, 
}                             from '../../spec/factories/factory.utils'


describe(`UserDAO`, () => {
  // DB connection and test data
  let mongoClient:  MongoDAO
  let userData:     IUser[]   = buildTestDataArray<IUser>(userFactoryData)
  
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
      await mongoClient.conn(`users`).insertMany(userData)
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
          let dupEmail: IUser = {
            firstName:    `Eric`,
            lastName:     `Moulds`,
            email:        userFactoryData.andre_reed.email
          }
          
          const result = await UserDAO.create(dupEmail)
        }
        catch(error) {
          expect(error.code).toBe(11000)
          expect(error.message).toMatch(/E11000 duplicate key error/i)
        }
      })

      it(`Creates a new user`, async () => {
        let user: IUser = {
          firstName:  `Lou`,
          lastName:   `Saban`,
          email:      `lou@bills.com`
        }

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