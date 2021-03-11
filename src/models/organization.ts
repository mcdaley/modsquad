//-----------------------------------------------------------------------------
// glitch/src/models/organization.ts
//-----------------------------------------------------------------------------
import mongoose from 'mongoose'

export interface IOrganization extends mongoose.Document {
  name:       string
  billingId:  string
}

const OrganizationSchema: mongoose.Schema = new mongoose.Schema({
  name: {
    type:     String, 
    required: [true, `Company name is required`]
  },
  billingId: {
    type:     String,
    unique:   [true, 'Duplicate billing ID']
  }
})

// Create the Organization model and export it
const Organization: mongoose.Model<IOrganization> = mongoose.model('Organization', OrganizationSchema)
export default Organization