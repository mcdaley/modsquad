//-----------------------------------------------------------------------------
// src/dao/organization.dao.ts
//-----------------------------------------------------------------------------
import { MongoClient, Collection, Cursor }    from 'mongodb'
import { ObjectId }                           from 'bson'
import logger                                 from '../config/winston'

/**
 * @interface IOrganization
 */
export interface IOrganization {
  _id?:       ObjectId,
  name:       string,
  billingId:  string,
}

/**
 * @interface IOrganizationList
 */
export interface IOrganizationList {
  organizations:  IOrganization[],
  totalCount:     number,
}

/**
 * @interface IUpdateOrganization
 */
export interface IUpdateOrganization { 
  name?:      string,
  billingId?: string,
}

/**
 * @class OrganizationDAO
 */
export default class OrganizationDAO {
  public static organizations: Collection

  /**
   * Link the DB connection to the organizations collection
   * @method injectDB
   * @param  {MongoClient} conn - 
   */
   public static async injectDB(conn: MongoClient) {
    if (this.organizations) {
      return
    }
    try {
      this.organizations = await conn.db().collection(`organizations`)
      logger.info(
        `Connected to the [organizations] collection`
      )
    } 
    catch (error) {
      logger.error(`
        Failed to connect to OrganizationDAO: error= %o`, error
      )
      throw(error)
    }
  }

  /**
   * Create a new organization and return it to the caller.
   * @method  create
   * @param   {IOrganization} organization 
   * @returns Promise<IOrganization>
   */
  public static create(organization: IOrganization): Promise<IOrganization> {
    logger.debug(`Create a new organization = %o`, organization)

    return new Promise( async (resolve, reject) => {
      try {
        const  result = await this.organizations.insertOne(organization)
        const  org    = result.ops[0]

        logger.debug(`Success, created a new organization = %o`, organization)
        resolve(org)
      }
      catch(error) {
        logger.error(`Failed to create organization, error= %o`, error)
        reject(error)
      }
    })
  }

  public static find(query = {}, options = {}): Promise<IOrganizationList> {
    logger.debug(`Fetch a list of organizations`)

    ///////////////////////////////////////////////////////////////////////////
    // NOTE: 04/19/2021
    // Only get the first 20 documents for development
    ///////////////////////////////////////////////////////////////////////////
    const page:         number = 0
    const docsPerPage:  number = 20

    return new Promise( async (resolve, reject) => {
      try {
        const count:   number           = await this.organizations.countDocuments(query)
        const cursor:  Cursor           = await this.organizations.find(query, options)
        const result:  IOrganization[]  = await cursor.limit(docsPerPage).skip(page * docsPerPage).toArray()
        logger.info(`Fetched [%d] of [%d] documents`, result.length, count)

        const organizationList: IOrganizationList = {
          organizations:  result,
          totalCount:     count,
        }

        resolve(organizationList)
      }
      catch(error) {
        logger.error(`Failed to fetch organizations, error= %o`, error)
        reject(error)
      }
    })
  }
} // end of OrganizationDAO