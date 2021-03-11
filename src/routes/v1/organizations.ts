//-----------------------------------------------------------------------------
// glitch/src/routes/v1/organizations.ts
//-----------------------------------------------------------------------------
import { Router, Request, Response }      from 'express'
import Organization, { IOrganization }    from '../../models/organization'
import logger                             from '../../config/winston'

const router = Router()

/**
 * @route POST /api/v1/organizations
 */
router.post(`/v1/organizations`, async (req: Request, res: Response) => {
  logger.info(`POST /api/v1/organizations`)
  const { name, billingId } = req.body
  
  try {
    const org: IOrganization = new Organization({
      name:       name,
      billingId:  billingId,
    })

    const result = await org.save()
    res.status(201).send({name: name, billingId: billingId})
  }
  catch(error) {
    logger.error(`Failed to create the organization [%s], error= %o`, name, error)
    res.status(400).send({ message: `Oops, something went wrong`})
  }
})

/**
 * @route GET /api/v1/organizations
 */
router.get(`/v1/organizations`, async (req: Request, res: Response) => {
  logger.info(`GET /api/v1/organizations`)

  try {
    const orgs: Array<IOrganization> = await Organization.find({})
    res.status(200).send(orgs)
  }
  catch(error) {
    logger.error(`Failed to get list of organizations, error= %o`, error)
    res.status(400).send({message: `Oops something went wrong`})
  }
})

// Export the organizations routes
export default router