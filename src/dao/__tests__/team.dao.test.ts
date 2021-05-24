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

    describe(`Find Teams`, () => {
      it.only(`Returns a list of teams`, async () => {
        const result: ITeam[] = await TeamDAO.findTeams()

        expect(result.length).toBe(1)
        //* expect(result[0].users.length).toBe(2)
      })
    })
  })
})
