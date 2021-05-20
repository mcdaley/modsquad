//-----------------------------------------------------------------------------
// glitch/src/routes/v1/organizations.ts
//-----------------------------------------------------------------------------
import { Router, Request, Response }  from 'express'
import OrganizationDAO, 
{ 
  IOrganization,
  IOrganizationList,
}                                     from '../../dao/organization.dao'
import logger                         from '../../config/winston'

// Organizations router
const router = Router()

/**
 * @route POST /api/v1/organizations
 */
router.post(`/v1/organizations`, async (req: Request, res: Response) => {
  logger.info(`POST /api/v1/organizations, body= %o`, req.body)
  
  const { name, billingId } = req.body
  try {
    const org: IOrganization = ({
      name:       name,
      billingId:  billingId,
    })

    const result = await OrganizationDAO.create(org)
    res.status(201).send({organization: result})
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
    const orgs: IOrganizationList = await OrganizationDAO.find()
    res.status(200).send(orgs)
  }
  catch(error) {
    logger.error(`Failed to get list of organizations, error= %o`, error)
    res.status(400).send({message: `Oops something went wrong`})
  }
})

// Export the organization routes
export default router