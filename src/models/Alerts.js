const mongoose = require('mongoose')
const Schema = mongoose.Schema

const AlertSchema = new Schema({
  from: { type: Number, required: false, index: true },
  to: { type: Number, default: 1, required: true, index: true },
  notifyTo: { type: Number, default: 1, required: true, index: true },
  priority: { type: Number, default: 1, required: false, index: true },
  type: { type: String, required: false, index: true },
  description: { type: String, required: false, index: true },
  status: { type: Number, default: 0, required: false, index: true },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now }
})

const Alerts = mongoose.model('Alerts', AlertSchema)
module.exports = Alerts
