const mongoose = require('mongoose')
const Schema = mongoose.Schema

const SettingSchema = new Schema({
  userId: { type: Number, required: false, index: true },
  newsLetter: { type: Number, default: 1, required: true, index: true },
  mobileAlert: { type: Number, default: 1, required: false, index: true },
  emailAlert: { type: Number, default: 1, required: false, index: true },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now }
})

const Settings = mongoose.model('Setting', SettingSchema)
module.exports = Settings
