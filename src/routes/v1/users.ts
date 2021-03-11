//-----------------------------------------------------------------------------
// glitch/src/routes/v1/users.ts
//-----------------------------------------------------------------------------
import { Router, Request, Response }  from 'express'
import logger                         from '../../config/winston'

const router = Router()

/**
 * @route GET /users
 */
router.get(`/v1/users`, (req: Request, res: Response) => {
  logger.info(`GET /api/v1/users`)
  res.status(200).send({message: 'Dude, it worked'})
})

// Export the router
export default router
