//-----------------------------------------------------------------------------
// src/__tests__/factories/glitch-data.js
//-----------------------------------------------------------------------------
import { ObjectId }   from 'bson'

/****************************************************************************** 
  let mongoClient: MongoDAO

  beforeAll( async () => {
    mongoClient = await MongoDAO.connect()
  })

  afterAll( () => {
    mongoClient.close()
  })

  describe(`Run some tests`, () => {
    let collections = [`users`, `teams`, `teams-users`]
    let factory     = FactoryGirl.build(collections)

    beforeEach( async () => {
      //---------------------------------------------------
      // mongoClient.conn(`users`).insertMany(userData)
      //---------------------------------------------------

      await FactoryGirl.insert(collections)
    })

    afterEach( async () => {
      await FactoryGirl.delete(collections)
    })

    //-----------------------------------------------------
    // TODO:
    // Need to be able to compare the results of the tests
    // with the data in the Factory.
    //
    //  expect(result.teams).toEqual(teamData)
    //-----------------------------------------------------
  })

*******************************************************************************/

export default class GlitchData {
  // User Data
  public static users = [
    {
      _id:        new ObjectId(),
      firstName:  `Andre`,
      lastName:   `Reed`,
      email:      `andre@bills.com`
    },
    {
      _id:        new ObjectId(),
      firstName:  `Bobby`,
      lastName:   `Chandler`,
      email:      `bobby@bills.com`
    },
    {
      _id:        new ObjectId(),
      firstName:  `James`,
      lastName:   `Lofton`,
      email:      `james@bills.com`
    },
    {
      _id:        new ObjectId(),
      firstName:  `Don`,
      lastName:   `Beebe`,
      email:      `don@bills.com`
    },
  ]

  // Teams Data
  public static teams = [
    {
      _id:          new ObjectId(),
      name:         `Buffalo Bills`,
      description:  `AFC East Champions`,
      members:      [],
    },
    {
      _id:          new ObjectId(),
      name:         'Green Bay Packers',
      description:  'Cheese Heads',
      members:      [],
    },
  ]

  // Teams-Users Join Data
  public static teamsUsers = [
    {
      _id:          new ObjectId(),           // Buffalo Bills - Andre Reed
      teamId:       this.teams[0]._id,
      userId:       this.users[0]._id,
    },
    {
      _id:          new ObjectId(),           // Buffalo Bills - Bobby Chandler
      teamId:       this.teams[0]._id,
      userId:       this.users[1]._id,
    },
    {
      _id:          new ObjectId(),           // Buffalo Bills - James Lofton
      teamId:       this.teams[0]._id,
      userId:       this.users[2]._id,
    },
    {
      _id:          new ObjectId(),           // Buffalo Bills - Don Beebe
      teamId:       this.teams[0]._id,
      userId:       this.users[3]._id,
    },
    {
      _id:          new ObjectId(),           // Green Bay Packers - James Lofton - 
      teamId:       this.teams[1]._id,
      userId:       this.users[2]._id,
    },
    {
      _id:          new ObjectId(),           // Green Bay Packers - Don Beebe
      teamId:       this.teams[1]._id,
      userId:       this.users[3]._id,
    },
  ]
}
