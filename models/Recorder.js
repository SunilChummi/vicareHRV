const mongoose = require('mongoose')
const Schema = mongoose.Schema

const RecorderSchema = new Schema({
  rec_slno: { type: String, required: true, index: true },
  rec_name: { type: String, required: false, index: true },
  rec_manufacturer: { type: String, required: false, index: true },
  rec_brandname: { type: String, required: true, index: true },
  rec_status: { type: Number, required: false, default: 1, index: true },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now }
})

const Recorder = mongoose.model('Recorder', RecorderSchema)

module.exports = Recorder
