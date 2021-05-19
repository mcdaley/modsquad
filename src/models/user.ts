//-----------------------------------------------------------------------------
// glitch/src/models/user.ts
//-----------------------------------------------------------------------------
import mongoose from 'mongoose'

export interface IUser extends mongoose.Document {
  firstName:    string,
  lastName:     string,
  email:        string,
  //* employeeId?:  string,
  //* userName?:    string,
  //* phone?:       string,
  //* password:     string,
}

const UserSchema: mongoose.Schema = new mongoose.Schema({
  firstName: {
    type:       String,
    index:      false,
    required:   [true, 'First name is required'],
    minlength:  1,
    trim:       true,
  },
  lastName: {
    type:       String,
    index:      false,
    required:   [true, 'Last name is required'],
    minlength:  2,
    trim:       true,
  },
  email: {
    type:       String,
    index:      true,
    unique:     [true, 'Duplicate email'],
    required:   [true, 'User email is required'],
    validate:   {
      validator: function(email: string) {
        return /^\w+([\.-]?\w+)+@\w+([\.:]?\w+)+(\.[a-zA-Z0-9]{2,3})+$/.test(email)
      },
      message: (props: { value: string }) => `${props.value} is not a valid email address`
    },
  },
})

// Create the User model and export it
const  User: mongoose.Model<IUser> = mongoose.model('User', UserSchema)
export default User