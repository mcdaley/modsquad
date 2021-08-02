//-----------------------------------------------------------------------------
// db/seed-modsquad-dev.js
//-----------------------------------------------------------------------------
const { MongoClient }   = require('mongodb')
const { ObjectId }      = require('bson')

process.env.MONGODB_URI = 'mongodb://localhost:27017/ModSquad-Dev'

/**
 * Define the development seed data
 */
let userData = [
  {
    _id:        new ObjectId(),
    firstName:  'Andre',
    lastName:   'Reed',
    email:      'andre@bills.com',
  },
  {
    _id:        new ObjectId(),
    firstName:  'Bobby',
    lastName:   'Chandler',
    email:      'bobby@bills.com'
  },
  {
    _id:        new ObjectId(),
    firstName:  'Don',
    lastName:   'Beebe',
    email:      'don@bills.com',
  },
  {
    _id:        new ObjectId(),
    firstName:  'James',
    lastName:   'Lofton',
    email:      'james@bills.com',
  },
]

let teamData = [
  {
    _id:          new ObjectId(),
    name:         'Buffalo Bills',
    description:  'AFC East Champions',
    members:      [],
  },
  {
    _id:          new ObjectId(),
    name:         'Green Bay Packers',
    description:  'Cheese Heads',
    members:      [],
  },
]

let teamsUsersData = [
  {
    _id:          new ObjectId(),
    teamId:       teamData[0]._id,
    userId:       userData[0]._id,
  },
  {
    _id:          new ObjectId(),
    teamId:       teamData[0]._id,
    userId:       userData[1]._id,
  },
  {
    _id:          new ObjectId(),
    teamId:       teamData[0]._id,
    userId:       userData[2]._id,
  },
  {
    _id:          new ObjectId(),
    teamId:       teamData[0]._id,
    userId:       userData[3]._id,
  },
  {
    _id:          new ObjectId(),
    teamId:       teamData[1]._id,
    userId:       userData[2]._id,
  },
  {
    _id:          new ObjectId(),
    teamId:       teamData[1]._id,
    userId:       userData[3]._id,
  },
]

/**
 * @function connecToMongoDB
 * @returns  Promise<MongoClient>
 */
const connectToMongoDB = () => {
  return new Promise( async (resolve, reject) => {
    const dbUri  = process.env.MONGODB_URI
    try {
      const client = MongoClient.connect(dbUri, {
        useNewUrlParser:    true,
        useUnifiedTopology: true,
      })
      console.log(`[info] Connected to MongoDB=[${dbUri}]`)
      resolve(client)
    }
    catch(error) {
      console.log(
        `[error] Failed to connect to MongoDB=[${dbUril}], error= `, error
      )
      reject(error)
    }
  })
}

/**
 * @function  seedDB
 * @param     {*} mongoClient 
 * @returns   {Promise}
 */
const seedDB = (mongoClient) => {
  return new Promise( async (resolve, reject) => {
    try {
      console.log(`[info] Seed the users collection`)
      const users = await mongoClient.db().collection('users').insertMany(userData)
      console.log(`[info] Inserted [${users.ops.length}] users`)

      console.log(`[info] Seed the teams collection`)
      const teams = await mongoClient.db().collection('teams').insertMany(teamData)
      console.log(`[info] Inserted [${teams.ops.length}] teams`)

      console.log(`[info] Seed the teams-users join collection`)
      const teamsUsers = await mongoClient.db().collection('teams-users').insertMany(teamsUsersData)
      console.log(`[info] Inserted [${teamsUsers.ops.length}] teams-users`)

      console.log(`[info] Success, seeded the DB`)
      resolve(true)
    }
    catch(error) {
      console.log(`[error] Failed to seed the DB, error= `, error)
      //* reject(error)
      process.exit(-1)
    }
  })
}

/**
 * 
 */
const run = async () => {
  const mongoClient = await connectToMongoDB()
  const result      = await seedDB(mongoClient)

  console.log(`[info] Close the mongoDB connection`)
  mongoClient.close()
}

/**
 * main()
 */
run()

