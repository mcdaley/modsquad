//-----------------------------------------------------------------------------
// src/index.ts
//-----------------------------------------------------------------------------
import './config/config'

import express, { Application }   from 'express'
import cors                       from 'cors'
import { Server }                 from 'node:http'

import logger                     from './config/winston'
import MongoDAO                   from './config/mongo-dao'
import users                      from './routes/v1/user.routes'
import organizations              from './routes/v1/organization.routes'

/**
 * Shutdown the express server.
 */
 function handleShutdownGracefully() {
  server.close(() => {
    logger.info(`Shutting down the express server`)
    mongoClient.close()
    
    logger.info(`Exiting ${process.env.APP_NAME}...`)
    process.exit(0)
  });
}

/**
 * main()
 */
const app: Application  = express()

app.use(express.json())

// Cors
app.use(cors({
  origin:         true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
}))

// Routes
app.use(`/api`, users)
app.use(`/api`, organizations)

// Server and MongoDB
let   server:      Server
const mongoClient: MongoDAO = new MongoDAO()
mongoClient.connect()
  .then( () => {
    // Start the server after connecting to the DB
    const PORT: number | string | undefined = process.env.PORT
    server = app.listen(PORT, () => {
      logger.info(`ModSquad app running on port ${PORT}`)
    })
  })
  .catch( (error) => {
    // Exit the app if cannot connect to DB
    logger.error(`Failed to connect to MongoDB`)
    logger.error(`Exiting the app...`)
    process.exit(-1)
  })

// Gracefully shutdown the express server
process.on("SIGINT",  handleShutdownGracefully)
process.on("SIGTERM", handleShutdownGracefully)
process.on("SIGHUP",  handleShutdownGracefully)

// Export the app
export { app }