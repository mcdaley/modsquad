//-----------------------------------------------------------------------------
// glitch/src/index.ts
//-----------------------------------------------------------------------------
import './config/config'

import express, { Application }    from 'express'
import cors       from 'cors'

import logger     from './config/winston'
//* import mongoose   from './config/mongoose'
import connect    from './config/mongoose'
import users      from './routes/v1/users'

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

// Connect to mongodb
const mongodb: string | any = process.env.MONGODB_URI
connect(mongodb)

// Start the server
const PORT: number | string = process.env.PORT || 3000
app.listen(PORT, () => {
  logger.info(`Glitch app running on port ${PORT}`)
})

// Export the app
export { app }