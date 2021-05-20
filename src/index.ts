//-----------------------------------------------------------------------------
// glitch/src/index.ts
//-----------------------------------------------------------------------------
import './config/config'

import express, { Application }   from 'express'
import cors                       from 'cors'
import { Server }                 from 'node:http'

import logger                     from './config/winston'
import MongoDAO                   from './config/mongo-dao'
import users                      from './routes/v1/users'
import organizations              from './routes/v1/organizations'

/**
 * main()
 */
const app: Application  = express()

app.use(express.json())

app.use(cors({
  origin:         true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
}))

// Routes
app.use(`/api`, users)
app.use(`/api`, organizations)

let   server:      Server
const mongoClient: MongoDAO = new MongoDAO()
mongoClient.connect()
  .then( () => {
    // Start the server after connecting to the DB
    const PORT: number | string | undefined = process.env.PORT
    server = app.listen(PORT, () => {
      logger.info(`Glitch app running on port ${PORT}`)
    })
  })
  .catch( (error) => {
    // Exit the app if cannot connect to DB
    logger.error(`Failed to connect to MongoDB`)
    logger.error(`Exiting the app...`)
    process.exit(-1)
  })

// Export the app
export { app }