#!/usr/bin/env node
//-----------------------------------------------------------------------------
// db/create-user-indexes.js
//-----------------------------------------------------------------------------

const { MongoClient }  = require('mongodb')

process.env.MONGODB_URI = 'mongodb://localhost:27017/ModSquad-Dev'

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
 * Build a single field index on a collection.
 * @function buildSingleFieldIndex
 * @param {*} collection 
 * @param {*} field 
 */
const buildSingleFieldIndex = (client, collectionName, index, options = {}) => {
  return new Promise( async (resolve, reject) => {
    try {
      const collection = client.db().collection(collectionName)
      const result      = await collection.createIndex(index, options)
      console.log(`[info] Created index on [${collectionName}]`)
      resolve(true)
    }
    catch(error) {
      console.log(
        `[error] Failed to created index on [${collectionName}], error= `, error
      )
      reject(error)
    }
  })
}

const run = async () => {
  console.log(`[info] Build indexes on the [users] collection`)
  const client  = await connectToMongoDB()
  const options = {unique: true}
  const result  = await buildSingleFieldIndex(client, `users`, {email: 1}, options)
}

/**
 * main
 */
run()


