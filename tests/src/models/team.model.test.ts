//-----------------------------------------------------------------------------
// tests/src/models/team.model.test.ts
//-----------------------------------------------------------------------------
import '../../../src/config/config'

import { ObjectId }         from 'bson'

import MongoDAO             from '../../../src/config/mongo-dao'
import TeamDAO,  { ITeam }  from '../../../src/dao/team.dao'
import { IUser }            from '../../../src/dao/user.dao'
import { ITeamsUsers }      from '../../../src/dao/teams-users.dao'

import Team                 from '../../../src/models/team.model'
import { ITList }           from '../../../src/models/active.model'

import {
  userFactoryData,
  teamFactoryData,
  teamsUsersFactoryData,
}                         from '../../factories/factory.data'
import {
  buildTestDataArray
}                         from '../../factories/factory.utils'


describe(`Team Model`, () => {
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
     * Team.message() => Test Function
     */
    describe(`Team.message()`, () => {
      it(`Returns the Team model message`, () => {
        const result: string = Team.message()
        expect(result).toMatch(/Team::message/i)
      })
    })

    /**
     * Team.findById()
     */
    describe(`Team.findById()`, () => {
      it(`Returns the team`, async () => {
        const team:   ITeam   = teamFactoryData.buffalo_bills
        const teamId: string  = (<ObjectId>team._id).toHexString()
        const result: ITeam   = await Team.findById(teamId)

        expect(result.name).toBe(team.name)
        expect(result.users?.length).toBe(5)
      })
    })

    /**
     * Team.find)()
     */
    describe(`Team.find()`, () => {
      it(`Returns a list of teams`, async () => {
        const result: ITList<ITeam> = await Team.find()

        expect(result.teams.length).toBe(2)
        expect(result.totalCount).toBe(2)
      })
    })

    /**
     * Team.addUser()
     */
    describe(`Team.addUser()`, () => {
      it(`Adds a user to a team`, async () => {
        const userId: string  = userFactoryData.marv_levy._id.toHexString()
        const teamId: string  = teamFactoryData.greenbay_packers._id.toHexString()
        const iTeam:  ITeam   = await Team.findById(teamId)

        const team:   Team        = new Team(iTeam)
        const result: ITeamsUsers = await team.addUser(userId)

        // Verify user was added in the DB
        let response = await mongoClient.conn(`teams-users`).find({
          teamId: teamFactoryData.greenbay_packers._id
        }).toArray()

        expect(response.length).toBe(3)
      })
    })

    describe(`Team.removeUser()`, () => {
      it(`Removes a user from a team`, async () => {
        const userId: string  = userFactoryData.marv_levy._id.toHexString()
        const teamId: string  = teamFactoryData.buffalo_bills._id.toHexString()
        const iTeam:  ITeam   = await Team.findById(teamId)

        const team:   Team    = new Team(iTeam)
        const result: boolean = await team.removeUser(userId)

        expect(result).toBe(true)

        // Verify user was added in the DB
        let response = await mongoClient.conn(`teams-users`).find({
          teamId: teamFactoryData.buffalo_bills._id
        }).toArray()

        expect(response.length).toBe(4)
      })
    })

    /**
     * Team.getUsers()
     */
    describe(`Team.getUsers()`, () => {
      it(`Returns all the users assigned to a team`, async () => {
        const teamId: string  = teamFactoryData.buffalo_bills._id.toHexString()
        const iTeam:  ITeam   = await Team.findById(teamId)

        const team:   Team    = new Team(iTeam)
        const users:  IUser[] = await team.getUsers()

        expect(users.length).toBe(5)
      })

      it(`Returns an empty array for a team w/o users`, async () => {
        const iTeam: ITeam = await TeamDAO.create({
          _id:          new ObjectId(),
          name:         `Oakland Raiders`,
          description:  `Relocated to Las Vegas`,
        })

        ///////////////////////////////////////////////////////////////////////
        // TODO: 06/17/2021
        //  - Override the Team.findById(id: string) w/ 
        //    Team.findByIf(id: ObjectId), so I don't have to always convert
        //    between <string> and <ObjectId>
        ///////////////////////////////////////////////////////////////////////
        const team:  Team     = new Team(iTeam)
        const users: IUser[]  = await team.getUsers()

        expect(users).toEqual([])
      })
    })
  })
})