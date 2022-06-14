const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RecAssocSchema = new Schema({
  ra_rec_slno: { type: String, required: true, index: true },
  ra_userid: { type: Number, required: true, index: true },
  ra_date: { type: Date, default: Date.now, index: true },
  ra_valid_upto: { type: Date, default: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), index: true },
  ra_mobile: { type: Number, required: false, index: true },
  ra_email: { type: String, required: false, index: true },
  ra_contact_name: { type: String, required: false, index: true },
  ra_status: { type: Number, default: 1, index: true },
  ra_credits: { type: Number, default: 100, index: true },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now }
})
const Recassoc = mongoose.model('Recassoc', RecAssocSchema)
module.exports = Recassoc
