//-----------------------------------------------------------------------------
// src/dao/__tests__/team.dao.test.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import { ObjectId }           from 'bson'

import MongoDAO               from '../../config/mongo-dao'
import UserDAO, {
  IUser,
}                             from '../user.dao'     
import TeamDAO, { 
  ITeam,
  ITeammate,
  ITeamList,
}                             from '../team.dao'

describe(`TeamDAO`, () => {
  let mongoClient: MongoDAO

  // Returns an array of userIds. i.e. teammates
  const getTeammates = (members: IUser[]): ITeammate[] => {
    const teammates: ITeammate[] = members.map( (user): ITeammate => {
      return {userId: <ObjectId>user._id}
    })

    return teammates
  }

  // User data
  const userData: IUser[] = [
    {
      _id:        new ObjectId(),
      firstName:  `Andre`,
      lastName:   `Reed`,
      email:      `andre@bills.com`
    },
    {
      _id:        new ObjectId(),
      firstName:  `James`,
      lastName:   `Lofton`,
      email:      `james@bills.com`
    },
  ]

  // Team data
  const teamData: ITeam[] = [
    {
      name:         `Buffalo Bills`,
      description:  `AFC East Champions`,
      members:      getTeammates(userData)
    }
  ]

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
    mongoClient.close()
  })

  describe(`CRUD Operations`, () => {
    beforeEach( async () => {
      await mongoClient.conn(`users`).insertMany(userData)
      await mongoClient.conn(`teams`).insertMany(teamData)
    })

    afterEach( async () => {
      await mongoClient.conn(`teams`).deleteMany({})
      await mongoClient.conn(`users`).deleteMany({})
    })

    describe(`Create Team`, () => {
      it(`Creates and returns a valid team w/ teammates`, async () => {
        const team: ITeam = {
          name:         `Oakland Raiders`,
          description:  `Or Las Vegas Raiders`,
          members:      getTeammates(userData),
        }
        const result: ITeam = await TeamDAO.create(team)

        expect(result.name).toMatch(/Oakland Raiders/i)
        expect(result.description).toMatch(/Or Las Vegas Raiders/i)
        expect((<ITeammate[]>result.members).length).toBe(2)
      })
    })

    describe(`Fetch List of Teams`, () => {
      it(`Returns a list of teams`, async () => {
        const result: ITeamList = await TeamDAO.find()

        expect(result.teams.length).toBe(1)
        expect(result.totalCount).toBe(1)
      })
    })

    describe(`Find Team by ID`, () => {
      it(`Returns an error for an invalid ObjectId`, async () => {
        const teamId = `BadTeamId`
        try {
          await TeamDAO.findById(teamId)
        }
        catch(error) {
          expect(error.message).toMatch(
            /must be a single String of 12 bytes or a string of 24 hex characters/i
          )
        }
      })
      
      it(`Returns null if the team is not found`, async () => {
        const teamId = new ObjectId().toHexString()
        const result = await TeamDAO.findById(teamId)

        expect(result).toBeNull()
      })

      it(`Returns the team and its expanded users`, async () => {
        const team    = teamData[0]
        const teamId  = <string>team._id?.toHexString()
        const result  = await TeamDAO.findById(teamId)

        expect(result.name).toBe(team.name)
        expect(result.description).toBe(team.description)
        expect(result.members.length).toBe(2)
        expect(result.members).toEqual(userData)
      })
    })

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
            /must be a single String of 12 bytes or a string of 24 hex characters/i
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
            /must be a single String of 12 bytes or a string of 24 hex characters/i
          )
        }
      })

      it(`Adds a user to the team`, async () => {
        const teamId: string  = <string>teamData[0]._id?.toHexString()
        const userId: string  = (new ObjectId()).toHexString()
        const result: ITeam   = await TeamDAO.addMember(teamId, userId)

        expect(result.members.length).toBe(3)

        const users = [...teamData[0].members, {userId: new ObjectId(userId)}]
        expect(result.members).toEqual(users)
      })
    })

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

      it(`Removes a user from the team`, async () => {
        const teamId: string  = <string>teamData[0]._id?.toHexString()
        const userId: string  = <string>userData[0]._id?.toHexString()
        
        const result: ITeam   = await TeamDAO.removeMember(teamId, userId)
        expect(result.members.length).toBe(1)
      })
    })

    ///////////////////////////////////////////////////////////////////////////
    // TODO: 05/24/2021
    // Search is a prototype method to figure out how to use the 
    // aggregation pipeline to build the find() functionality.
    ///////////////////////////////////////////////////////////////////////////
    describe(`Search`, () => {
      it(`Returns a list of teams`, async () => {
        const result: ITeamList = await TeamDAO.search()

        expect(result.totalCount).toBe(1)
        expect(result.teams.length).toBe(1)
      })
    })
  })
})
