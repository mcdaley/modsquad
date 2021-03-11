//-----------------------------------------------------------------------------
// glitch/src/index.ts
//-----------------------------------------------------------------------------
import './config/config'

import express    from 'express'
import bodyParser from 'body-parser'
import cors       from 'cors'

import logger     from './config/winston'
import users      from './routes/v1/users'

/**
 * main()
 */
const app = express()

app.use(express.json())

app.use(cors({
  origin:         true,
  allowedHeaders: ['Origin', 'X-Requested-With', 'Content-Type', 'Accept'],
}))

app.use(`/api`, users)

// Start the server
const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
  logger.info(`Glitch app running on port ${PORT}`)
})

// Export the app
export { app }