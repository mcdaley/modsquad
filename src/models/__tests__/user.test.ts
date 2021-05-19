//-----------------------------------------------------------------------------
// glitch/src/models/__tests__/user.test.ts
//-----------------------------------------------------------------------------
import '../../config/config'

import mongoose         from 'mongoose'
import User, { IUser }  from '../user'

describe(`User model`, () => {
  
  const mongoDB: string = process.env.MONGODB_URI || ''

  beforeAll( async () => {
    await mongoose.connect(mongoDB, {
      useNewUrlParser:    true, 
      useUnifiedTopology: true
    })
  })

  afterAll( async () => {
    await mongoose.connection.close()
  })
  
  describe(`Validations`, () => {
    describe(`First Name`, () => {
      it(`Requires a first name`, () => {
        let user = new User()
  
        expect(user.validate).toThrow()
      })
    })
    
    describe(`Last Name`, () => {
      it(`Requires a last name`, async () => {
        try {
          await User.validate({lastName: undefined}, ['lastName'])
        }
        catch(err) {
          expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
          expect(err.errors[`lastName`].message).toMatch(/is required/i)
        }
      })

      /////////////////////////////////////////////////////////////////////////
      // TODO: 03/12/2021
      // DUMMY TEST TO VERIFY THAT I CAN TEST THE LENGTH.
      /////////////////////////////////////////////////////////////////////////
      it(`Must be at least 2 characters`, async () => {
        try {
          await User.validate({lastName: `Z`}, ['lastName'])
        }
        catch(err) {
          expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
          expect(Object.keys(err.errors)).toContain('lastName')
          expect(err.errors[`lastName`].message).toMatch(/is shorter/i)
        }
      })
    })

    describe(`Email`, () => {
      ///////////////////////////////////////////////////////////////////////////
      // TODO: 03/12/2021
      // VALIDATING THE FIELDS USING THIS LOGIC SKIPS THE VALID FIELDS, WHICH
      // I'M NOT SURE LONGTERM IS OK?
      ///////////////////////////////////////////////////////////////////////////
      it(`Requires an email`, async () => {
        try {
          await User.validate({email: undefined}, [`email`])
        }
        catch(err) {
          expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
          expect(err.errors[`email`].message).toMatch(/email is required/i)
        }
      })

      ///////////////////////////////////////////////////////////////////////////
      // TODO: 03/12/2021
      // This is not the best way to run the multiple tests.
      ///////////////////////////////////////////////////////////////////////////
      it(`Rejects an invalid email`, async () => {
        const validateEmail = async (email: string) => {
          try {
            await User.validate({email: email}, [`email`])
          }
          catch(err) {
            expect(err).toBeInstanceOf(mongoose.Error.ValidationError)
            expect(err.errors[`email`].message).toMatch(/not a valid email address/i)
          }
        }

        ['bob', 'invalid@email'].forEach( (email: string) => validateEmail(email))
      })
    }) 
  })

  describe(`CRUD Operations`, () => {
    beforeEach( async () => {
      await User.deleteMany({})
    })

    it(`Creates a user`, async () => {
      const user: IUser = new User({
        firstName:  `marv`,
        lastName:   `levy`,
        email:      `marv@bills.com`,
      })

      const result  = await user.save()
      const fetched = await User.findById(result._id)

      expect(fetched).not.toBeNull()
      expect(fetched!.firstName).toBe(user.firstName)
      expect(fetched!.lastName).toBe(user.lastName)
      expect(fetched!.email).toBe(user.email)
    })

    it(`Does not save user w/ invalid email`, async () => {
      let   user = new User({
        email:    'email@em.o', 
        password: `password`
      })
      
      await expect(user.save()).rejects.toThrowError(/not a valid email address/)
    })

    it(`Requires a unique email`, async () => {
      const user: IUser = new User({
        firstName:  `marv`,
        lastName:   `levy`,
        email:      `marv@bills.com`,
      })

      const dup: IUser = new User({
        firstName:  `bruce`,
        lastName:   `smith`,
        email:      `marv@bills.com`,
      })

      try {
        const first   = await user.save()
        const second  = await dup.save()
        console.log(`[debug] I should not get here`)
      }
      catch(err) {
        expect(err.constructor.name).toMatch(/MongoError/i)
        expect(err.message).toMatch(/duplicate key error/i)
      }
    })

    it.skip(`[ALTERNATIVE] Requires a unique email`, async () => {
      /////////////////////////////////////////////////////////////////////////
      // TODO: 03/13/2021
      //  - NEED TO FIGURE OUT HOW TO CENTRALIZE THE TEST DATA, SO IT IS
      //    NOT SO REDUNDANT TO CREATE TESTS.
      /////////////////////////////////////////////////////////////////////////
      const user: IUser = new User({
        firstName:  `marv`,
        lastName:   `levy`,
        email:      `marv@bills.com`,
      })

      const dup: IUser = new User({
        firstName:  `bruce`,
        lastName:   `smith`,
        email:      `bruce@bills.com`,
      })

      await user.save()
      await expect(dup.save()).rejects.toThrowError(/E11000 duplicate key error/i)
    })
  })
})