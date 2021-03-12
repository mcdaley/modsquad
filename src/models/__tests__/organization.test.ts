//-----------------------------------------------------------------------------
// glitch/src/models/__tests__/organization.test.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import mongoose                         from 'mongoose'
import Organization, { IOrganization }  from '../organization'

describe(`Organization model`, () => {
  const mongoDB: string = process.env.MONGODB_URI || ''

  beforeAll( async () => {
    await mongoose.connect(mongoDB, {
      useNewUrlParser:    true, 
      useUnifiedTopology: true
    })
  })

  afterAll( async () => {
    mongoose.connection.close()
  })

  describe(`Validations`, () => {
    it(`Requires a name`, () => {
      let org = new Organization()

      expect(org.validate).toThrow()
    })
  })

  describe(`CRUD Operations`, () => {
    beforeEach( async () => {
      await Organization.deleteMany({})
    })

    it(`Saves an organization`, async () => {
      expect.assertions(3)

      const org: IOrganization = new Organization({
        name:       `Fake Company`,
        billingId:  `abcdef`,
      })
      
      const spy     = jest.spyOn(org, `save`)
      const result  = await org.save()

      expect(spy).toHaveBeenCalled()
      expect(result).toMatchObject({
        name:       expect.any(String),
        billingId:  expect.any(String),
      })
      expect(result.name).toBe(`Fake Company`)
    })
  })
})