//-----------------------------------------------------------------------------
// glitch/src/config/mongoose.ts
//-----------------------------------------------------------------------------
import './config'

import mongoose from 'mongoose'
import logger   from './winston'

export default (db: string) => {
  mongoose.Promise = global.Promise
  mongoose.set('useFindAndModify', false)
  mongoose.set('useCreateIndex',   true)

  const connect = () => {
    mongoose 
      .connect(db, {
        useNewUrlParser:    true, 
        useUnifiedTopology: true
      })
      .then( () => {
        logger.info(`Connected to DB = ${db}`)
      })
      .catch( (error) => {
        logger.error(`Error connecting to database [${db}], error= %o`, error)
        return process.exit(1)
      })
  }
  connect()
}
