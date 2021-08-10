//-----------------------------------------------------------------------------
// tests/src/dao/organization.dao.test.ts
//-----------------------------------------------------------------------------
import '../../../src/config/config'

import { ObjectId }           from 'bson'

import MongoDAO               from '../../../src/config/mongo-dao'
import OrganizationDAO, { 
  IOrganization 
}                             from '../../../src/dao/organization.dao'

describe(`OrganizationDAO`, () => {
  let mongoClient: MongoDAO

  let organizations = [
    {
      _id:        new ObjectId(),
      name:       `GLOW Corporation`,
      billingId:  `ACME001`,
    },
    {
      _id:        new ObjectId(),
      name:       `WWE`,
      billingId:  `WWE001`,
    },
  ]

  /**
   * Connect to MongoDB before running tests
   */
   beforeAll( async () => {
    mongoClient = new MongoDAO()
    await mongoClient.connect()
  })

  /**
   * Remove the data from the test DB and Close the MongoDB connection 
   * after running the tests.
   */
  afterAll( async () => {
    await mongoClient.conn(`organizations`).deleteMany({})
    mongoClient.close()
  })

  describe(`CRUD Operations`, () => {
    beforeEach( async () => {
      const ORGS = await mongoClient.conn(`organizations`).insertMany(organizations)
    })

    afterEach( async () => {
      await mongoClient.conn(`organizations`).deleteMany({})
    })

    ///////////////////////////////////////////////////////////////////////////
    // TESTCASES: 05/20/2010
    //  [x] 1.) Save an organization
    //  2.) Reject invalid organization -> need to add schema on DB
    ///////////////////////////////////////////////////////////////////////////
    describe(`Create Organization`, () => {
      it(`Rejects an organization w/ a duplicate billingId`, async () => {
        try {
          let dupOrg: IOrganization = {
            name:       `JUNK Corp`,
            billingId:   organizations[0].billingId,
          }
          const result = await OrganizationDAO.create(dupOrg)
        }
        catch(error) {
          expect(error.code).toBe(11000)
          expect(error.message).toMatch(/E11000 duplicate key error/i)
        }
      })

      it(`Creates a new Organization`, async () => {
        // Verify DAO returns the created organization
        let org: IOrganization = {
          name:       `Acme Corporation`,
          billingId:  `FAKE123`,
        }
        let response  = await OrganizationDAO.create(org)
        
        expect(response.name).toBe(org.name)
        expect(response.billingId).toBe(org.billingId)

        // Verify DAO is saved to the DB
        let conn   = mongoClient.conn(`organizations`)
        let result = await conn.find({name: org.name}).toArray()

        expect(result.length).toBe(1)
        expect(result[0].name).toBe(org.name)
      })
    })

    describe(`Fetch a list of organizations`, () => {
      it(`Returns a list of organizations`, async () => {
        const result = await OrganizationDAO.find()
        expect(result.organizations.length).toBe(2)
        expect(result.totalCount).toBe(2)
      })
    })

    ///////////////////////////////////////////////////////////////////////////
    // TESTCASES: 05/21/2021
    // 1.) ID NOT FOUND
    // 2.) INVALID ID
    // 3.) SUCCESS
    ///////////////////////////////////////////////////////////////////////////
    describe(`Find organization by ID`, () => {
      it(`Returns null for ID that is not found`, async () => {
        const orgId   = new ObjectId().toHexString()
        const result  = await OrganizationDAO.findById(orgId)
        expect(result).toBe(undefined)
      })

      it(`Returns error for an invalid organization ID`, async () => {
        const orgId = `INVALIDORGID123456789`
        try {
          const result  = await OrganizationDAO.findById(orgId) 
        }
        catch(error) {
          expect(error.message).toMatch(
            /must be a Buffer or string of 12 bytes or a string of 24 hex characters/i
          )
        }
      })

      it(`Returns the organization for a valid ID`, async () => {
        const orgId   = organizations[0]._id.toHexString()
        const result  = await OrganizationDAO.findById(orgId)
        
        expect(result.name).toBe(organizations[0].name)
        expect(result.billingId).toBe(organizations[0].billingId)
      })
    })
  })
})