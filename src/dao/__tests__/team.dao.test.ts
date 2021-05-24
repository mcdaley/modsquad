//-----------------------------------------------------------------------------
// src/dao/__tests__/team.dao.test.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import { ObjectID }           from 'bson'

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
      return {userId: <ObjectID>user._id}
    })

    return teammates
  }

  // User data
  const userData: IUser[] = [
    {
      _id:        new ObjectID(),
      firstName:  `Andre`,
      lastName:   `Reed`,
      email:      `andre@bills.com`
    },
    {
      _id:        new ObjectID(),
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
      it(`Returns an error for an invalid ObjectID`, async () => {
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
        const teamId = new ObjectID().toHexString()
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

    describe(`Search`, () => {
      it(`Returns a list of teams`, async () => {
        const result: ITeamList = await TeamDAO.search()

        expect(result.totalCount).toBe(1)
        expect(result.teams.length).toBe(1)
      })
    })
  })
})
