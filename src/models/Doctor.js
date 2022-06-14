const mongoose = require('mongoose')
const Schema = mongoose.Schema

const DocProfile = new Schema({
  userId: { type: Number, required: false, index: true },
  firstName: { type: String, required: false, index: true },
  lastName: { type: String, required: false, index: true },
  email: { type: String, required: true }, // unique: true
  countryCode: { type: String, required: false, index: true },
  mobile: { type: Number, required: false, index: true },
  refId: { type: String, default: null, index: true },
  profilePic: { type: String, default: null, required: false, index: true },
  gender: { type: String, default: 'male', required: false },
  address: { type: String, required: false, index: true },
  zipCode: { type: String, required: false, index: true },
  town: { type: String, required: false, index: true },
  country: { type: String, required: false, index: true },
  hospital: { type: String, required: false, index: true },
  birthday: { type: String, required: false, index: true },
  status: { type: Number, default: 0, index: true },
  role: { type: String, required: true, index: true },
  weight: { type: String, required: false, index: true },
  height: { type: String, required: false, index: true },
  intensity: { type: String, required: false, index: true },
  activities: {
    a1: { type: Boolean, default: true, index: true },
    a2: { type: Boolean, default: true, index: true },
    a3: { type: Boolean, default: true, index: true },
    a4: { type: Boolean, default: true, index: true },
    a5: { type: Boolean, default: true, index: true },
    a6: { type: Boolean, default: true, index: true },
    actOther: { type: String, index: true }
  },
  healthHistory: {
    h1: { type: Boolean, default: true, index: true },
    h2: { type: Boolean, default: true, index: true },
    h3: { type: Boolean, default: true, index: true },
    h4: { type: Boolean, default: true, index: true },
    h5: { type: Boolean, default: true, index: true },
    h6: { type: Boolean, default: true, index: true },
    h7: { type: Boolean, default: true, index: true },
    healthOther: { type: String, index: true }
  },
  otp: { type: Number, required: false },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now, index: true }
})
const Doctor = mongoose.model('Doctor', DocProfile)
module.exports = Doctor
