//-----------------------------------------------------------------------------
// tests/src/dao/teams-users.dao.test.ts
//-----------------------------------------------------------------------------
import '../../../src/config/config'

import { ObjectId }           from 'bson'

import MongoDAO               from '../../../src/config/mongo-dao'
import UserDAO, {
  IUser,
}                             from '../../../src/dao/user.dao'     
import TeamDAO, { 
  ITeam,
}                             from '../../../src/dao/team.dao'

import TeamsUsersDAO, { 
  ITeamsUsers 
}                             from '../../../src/dao/teams-users.dao'

import {
  userFactoryData,
  teamFactoryData,
  teamsUsersFactoryData,
}                             from '../../factories/factory.data'
import { 
  buildTestDataArray,       
}                             from '../../factories/factory.utils'


describe(`TeamsUsersDAO`, () => {
  let mongoClient:    MongoDAO
  const userData:       IUser[]       = buildTestDataArray(userFactoryData)
  const teamData:       ITeam[]       = buildTestDataArray(teamFactoryData)
  const teamsUsersData: ITeamsUsers[] = teamsUsersFactoryData

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
    await mongoClient.conn(`teams`).deleteMany({})
    await mongoClient.conn(`users`).deleteMany({})
    await mongoClient.conn('teams-users').deleteMany({})
    mongoClient.close()
  })

  describe(`CRUD Operations`, () => {
    beforeEach( async () => {
      await mongoClient.conn(`users`).insertMany(userData)
      await mongoClient.conn(`teams`).insertMany(teamData)
      await mongoClient.conn(`teams-users`).insertMany(teamsUsersData)
    })

    afterEach( async () => {
      await mongoClient.conn(`teams`).deleteMany({})
      await mongoClient.conn(`users`).deleteMany({})
      await mongoClient.conn(`teams-users`).deleteMany({})
    })

    describe(`Add a user to a team`, () => {
      it(`Returns error for an invalid teamId`, async () => {
        const badTeamId = `InvalidTeamId`
        const userId    = new ObjectId().toHexString()
        
        try {
          await TeamsUsersDAO.create(badTeamId, userId)
          expect(false).toBe(`Test should not make it here`)
        }
        catch(error) {
          expect(error.message).toMatch(/must be a Buffer or string of 12 bytes or a string of 24 hex characters/i)
        }
      })

      it(`Returns error for an invalid userId`, async () => {
        const badUserId = `InvalidTeamId`
        const teamId    = new ObjectId().toHexString()
        
        try {
          await TeamsUsersDAO.create(teamId, badUserId)
          expect(false).toBe(`Test should not make it here`)
        }
        catch(error) {
          expect(error.message).toMatch(/must be a Buffer or string of 12 bytes or a string of 24 hex characters/i)
        }
      })

      it(`Rejects a record w/ duplicate teamId and userId fields`, async () => {
        const dupTeamId: string  = <string>teamData[0]._id?.toHexString()
        const dupUserId: string  = <string>userData[0]._id?.toHexString()

        try {
          await TeamsUsersDAO.create(dupTeamId, dupUserId)
          expect(false).toBe(`Test should not make it here`)
        }
        catch(error) {
          expect(error.code).toBe(11000)
          expect(error.message).toMatch(/E11000 duplicate key error/i)
        }
      })

      it(`Adds the user to the team`, async () => {
        // Add a new user
        const user: IUser = {
          _id:        new ObjectId(),
          firstName:  `Ahmad`,
          lastName:   `Rashad`,
          email:      `ahmad@bills.com`
        }
        await mongoClient.conn(`users`).insertOne(user)

        // Verify create teams-users record.
        const teamId: string      = <string>teamData[0]._id?.toHexString()
        const userId: string      = <string>user._id?.toHexString()

        const result: ITeamsUsers = await TeamsUsersDAO.create(teamId, userId)

        expect(result.teamId.toHexString()).toBe(teamId)
        expect(result.userId.toHexString()).toBe(userId)

        // Verify teams-users record was saved in DB.
        const record = <ITeamsUsers>(await mongoClient.conn('teams-users').findOne({
          teamId: teamData[0]._id,
          userId: user._id
        }))

        expect(record._id).toEqual(result._id)
        expect(record.teamId).toEqual(teamData[0]._id)
        expect(record.userId).toEqual(user._id)
      })
    })

    describe(`Delete user from a team`, () => {
      it(`Returns an error for an invalid teamId`, async () => {
        const badTeamId: string = `InvalidTeamId`
        const userId:    string = new ObjectId().toHexString()

        try {
          await TeamsUsersDAO.delete(badTeamId, userId)
          expect(false).toBe(`Test should not reach here`)
        }
        catch(error) {
          expect(error.message).toMatch(/must be a Buffer or string of 12 bytes or a string of 24 hex characters/i)
        }
      })

      it(`Returns an error for an invalid userId`, async () => {
        const badUserId: string = `InvalidUserId`
        const teamId:    string = new ObjectId().toHexString()

        try {
          await TeamsUsersDAO.delete(teamId, badUserId)
          expect(false).toBe(`Test should not reach here`)
        }
        catch(error) {
          expect(error.message).toMatch(/must be a Buffer or string of 12 bytes or a string of 24 hex characters/i)
        }
      })

      it(`Returns false if the teams-users record is not found`, async () => {
        const teamId: string  = new ObjectId().toHexString()
        const userId: string  = new ObjectId().toHexString()

        const result: boolean = await TeamsUsersDAO.delete(teamId, userId)

        expect(result).toBe(false)

        // Verify user was not removed from the team
        const check: ITeamsUsers[] = await mongoClient.conn('teams-users').find({}).toArray()
        expect(check.length).toBe(teamsUsersData.length)
      })

      it(`Deletes a user from a team`, async () => {
        const teamId: string  = <string>teamData[0]._id?.toHexString()
        const userId: string  = <string>userData[0]._id?.toHexString()

        const result: boolean = await TeamsUsersDAO.delete(teamId, userId)

        expect(result).toBe(true)

        // Verify user was removed from the team
        const check: ITeamsUsers[] = await mongoClient.conn('teams-users').find({}).toArray()
        expect(check.length).toBe(teamsUsersData.length - 1)
      })
    })
  })
})
