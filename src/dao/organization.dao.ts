//-----------------------------------------------------------------------------
// src/dao/organization.dao.ts
//-----------------------------------------------------------------------------
import { 
  MongoClient, 
  Collection, 
  FindCursor, 
}                       from 'mongodb'
import { ObjectId }     from 'bson'
import logger           from '../config/winston'

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
   * @returns {Promise<IOrganization>}
   */
  public static create(organization: IOrganization): Promise<IOrganization> {
    logger.debug(`Create a new organization = %o`, organization)

    return new Promise( async (resolve, reject) => {
      try {
        const  result     = await this.organizations.insertOne(organization)
        const  insertedId = result.insertedId
        const  org        = <IOrganization>(await this.organizations.findOne({_id: insertedId}))

        logger.debug(`Success, created a new organization = %o`, organization)
        resolve(org)
      }
      catch(error) {
        logger.error(`Failed to create organization, error= %o`, error)
        reject(error)
      }
    })
  }

  /**
   * @method  find
   * @param   {Object} query 
   * @param   {Object} options 
   * @returns {Promise<IOrganizationList>}
   */
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
        const cursor:  FindCursor       = await this.organizations.find(query, options)
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

  /**
   * @method  findById
   * @param   {String} organizationId 
   * @returns {Promise<IOrganization>}
   */
  public static findById(organizationId: string) : Promise<IOrganization> {
    logger.debug(`Get organization w/ id=[%s]`, organizationId)

    return new Promise( async (resolve, reject) => {
      try {
        const query   = { _id: new ObjectId(organizationId) }
        const options = {}
        const result: IOrganization = <IOrganization>(await this.organizations.findOne(query, options))
        
        if(result) {
          logger.info(
            `Fetched organization w/ id=[%s], organization= %o`, 
            organizationId, result
          )
        }
        else {
          logger.info(`Organization w/ id=[%s] not found`, organizationId)
        }
        resolve(result)
      }
      catch(error) {
        logger.error(
          `Failed to fetch organization w/ id=[%s], error= %o`, 
          organizationId, error
        )
        reject(error)
      }
    })
  }
} // end of OrganizationDAO