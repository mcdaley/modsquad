//-----------------------------------------------------------------------------
// tests/src/dao/team.dao.test.ts
//-----------------------------------------------------------------------------
import '../../../src/config/config'

import { ObjectId }           from 'bson'

import MongoDAO               from '../../../src/config/mongo-dao'
import {
  IUser,
}                             from '../../../src/dao/user.dao'
import { ITList }             from '../../../src/models/active.model' 
import TeamDAO, { 
  ITeam,
  ITeammate,
  ITeamList,
  IUserTeams,
}                             from '../../../src/dao/team.dao'
import { ITeamsUsers }        from '../../../src/dao/teams-users.dao'

import {
  userFactoryData,
  teamFactoryData,
  teamsUsersFactoryData,
}                             from '../../factories/factory.data'
import {
  buildTestDataArray,
}                             from '../../factories/factory.utils'

describe(`TeamDAO`, () => {
  // DB connection and test data
  let   mongoClient:    MongoDAO
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
    await mongoClient.conn(`teams-users`).deleteMany({})
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

    /**
     * TeamDAO.create()
     */
    describe(`Create Team`, () => {
      it(`Creates and returns a valid team w/ teammates`, async () => {
        const team: ITeam = {
          name:         `Oakland Raiders`,
          description:  `The silver and black`,
          members:      [],
        }
        const result: ITeam = await TeamDAO.create(team)

        expect(result.name).toMatch(/Oakland Raiders/i)
        expect(result.description).toMatch(/The silver and black/i)
      })
    })

    /**
     * TeamDAO.find()
     */
    describe(`Fetch List of Teams`, () => {
      it(`Returns a list of teams`, async () => {
        const result: ITList<ITeam> = await TeamDAO.find()

        expect(result.teams.length).toBe(2)
        expect(result.totalCount).toBe(2)
      })
    })

    /**
     * TeamDAO.findById()
     */
    describe(`Find Team by ID`, () => {
      it(`Returns an error for an invalid ObjectId`, async () => {
        const badTeamId = `BadTeamId`
        try {
          await TeamDAO.findById(badTeamId)
          expect(false).toBe(`It should never make it here`)
        }
        catch(error) {
          expect(error.message).toMatch(
            /must be a Buffer or string of 12 bytes or a string of 24 hex characters/i
          )
        }
      })

      it(`Returns null if the team is not found`, async () => {
        const teamId = new ObjectId().toHexString()
        const result = await TeamDAO.findById(teamId)

        expect(result).toBeNull()
      })

      it(`Returns the team and a list of expanded users`, async () => {
        const team    = teamFactoryData.greenbay_packers
        const teamId  = <string>team._id?.toHexString()
        const result  = <ITeam>(await TeamDAO.findById(teamId))

        expect(result.name).toBe(team.name)
        expect(result.description).toBe(team.description)
        expect((<IUser[]>result.users).length).toBe(2)
        expect(<IUser[]>result.users).toEqual([
          userFactoryData.james_lofton, 
          userFactoryData.don_beebe
        ])
      })
    })

    /**
     * TeamDAO.findUserTeams()
     */
    describe(`Find teams user is assigned`, () => {
      it(`Returns a list of expanded teams`, async () => {
        const userId: string      = <string>userFactoryData.don_beebe._id?.toHexString()
        const result: IUserTeams  = <IUserTeams>(await TeamDAO.findUserTeams(userId))

        expect(result.teams.length).toBe(2)
        expect(result.teams).toEqual([teamFactoryData.buffalo_bills, teamFactoryData.greenbay_packers])
      })
    })

    ///////////////////////////////////////////////////////////////////////////
    // LEGACY TESTS FOR members[]
    ///////////////////////////////////////////////////////////////////////////
      describe(`Find Team by ID version 2`, () => {
        it(`Returns an error for an invalid ObjectId`, async () => {
          const teamId = `BadTeamId`
          try {
            await TeamDAO.findById_v2(teamId)
          }
          catch(error) {
            expect(error.message).toMatch(
              /must be a Buffer or string of 12 bytes or a string of 24 hex characters/i
            )
          }
        })
        
        it(`Returns null if the team is not found`, async () => {
          const teamId = new ObjectId().toHexString()
          const result = await TeamDAO.findById_v2(teamId)

          expect(result).toBeNull()
        })

        it(`Returns the team and its expanded users`, async () => {
          const team    = teamData[0]
          const teamId  = <string>team._id?.toHexString()
          const result  = <ITeam>(await TeamDAO.findById_v2(teamId))

          expect(result.name).toBe(team.name)
          expect(result.description).toBe(team.description)
          expect(result.members).toEqual([])
        })
      })
    /****************************************************************
      describe(`Add Member to the Team`, () => {
        it(`Returns null if the team is not found`, async () => {
          const teamId: string = (new ObjectId()).toHexString()
          const userId: string  = (new ObjectId()).toHexString()
          const result: ITeam   = await TeamDAO.addMember(teamId, userId)

          expect(result).toBeNull()
        })

        it(`Returns an error for an invalid team ObjectId`, async () => {
          const teamId: string = `BadTeamId`
          const userId: string = (new ObjectId()).toHexString()

          try {
            await TeamDAO.addMember(teamId, userId)
          }
          catch(error) {
            expect(error.message).toMatch(
              /must be a Buffer or string of 12 bytes or a string of 24 hex characters/i
            )
          }
        })

        it(`Returns an error for an invalid User ID`, async () => {
          const teamId: string  = <string>teamData[0]._id?.toHexString()
          const userId: string  = `BadUserId`

          try {
            await TeamDAO.addMember(teamId, userId)
          }
          catch(error) {
            expect(error.message).toMatch(
              /must be a Buffer or string of 12 bytes or a string of 24 hex characters/i
            )
          }
        })

        it.only(`Adds a user to the team`, async () => {
          const teamId: string  = <string>teamData[0]._id?.toHexString()
          const userId: string  = <string>userData[0]._id?.toHexString()
          const result: ITeam   = await TeamDAO.addMember(teamId, userId)

          if(result.members) {
            expect(result.members.length).toBe(1)
            expect(result.members[0]).toEqual({userId: <ObjectId>userData[0]._id})
          }
          else {
            expect(false).toBe(`Test should not get here`)
          }
        })
      })
    ****************************************************************/
    /****************************************************************
      describe(`Remove a Member from a Team`, () => {
        it(`Returns an error for an invalid Team ID`, async () => {
          const teamId: string = `BadTeamId`
          const userId: string = <string>userData[0]._id?.toHexString()

          try {
            await TeamDAO.removeMember(teamId, userId)
          }
          catch(error) {
            expect(error.message).toMatch(
              /must be a single String of 12 bytes or a string of 24 hex characters/i
            )
          }
        })

        it(`Returns an error for an invalid User ID`, async () => {
          const teamId: string = <string>teamData[0]._id?.toHexString()
          const userId: string = `BadUserId`

          try {
            await TeamDAO.removeMember(teamId, userId)
          }
          catch(error) {
            expect(error.message).toMatch(
              /must be a single String of 12 bytes or a string of 24 hex characters/i
            )
          }
        })

        it(`Returns null if the team is not found`, async () => {
          const teamId: string = (new ObjectId()).toHexString()
          const userId: string  = <string>userData[0]._id?.toHexString()

          const result: ITeam   = await TeamDAO.removeMember(teamId, userId)
          expect(result).toBeNull()
        })

        it(`Does nothing if the team members are null`, async () => {
          const teamId: string  = <string>teamData[0]._id?.toHexString()
          const userId: string  = <string>userData[0]._id?.toHexString()
          
          const result: ITeam   = await TeamDAO.removeMember(teamId, userId)
          expect(result.members).toBe(null)
        })

        it(`Removes the team members`, async () => {
          const teamId:   string  = <string>teamData[0]._id?.toHexString()
          const userId_1: string  = <string>userData[0]._id?.toHexString()
          const userId_2: string  = <string>userData[1]._id?.toHexString()

          await TeamDAO.addMember(teamId, userId_1)
          await TeamDAO.addMember(teamId, userId_2)
          
          const result: ITeam = await TeamDAO.removeMember(teamId, userId_1)
          expect(result.members).toEqual([{userId:  <ObjectId>userData[1]._id}])
        })
      })
    ****************************************************************/
    ///////////////////////////////////////////////////////////////////////////
    // TODO: 05/24/2021
    // Search is a prototype method to figure out how to use the 
    // aggregation pipeline to build the find() functionality.
    ///////////////////////////////////////////////////////////////////////////
    describe(`Search`, () => {
      it(`Returns a list of teams`, async () => {
        const result: ITeamList = await TeamDAO.search()

        expect(result.totalCount).toBe(2)
        expect(result.teams.length).toBe(2)
      })
    })
  })
})
