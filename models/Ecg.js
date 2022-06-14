const mongoose = require('mongoose')
const Schema = mongoose.Schema
// let mongoosePaginate = require('mongoose-paginate-v2')

const EcgSchema = new Schema({
  ed_id: { type: Number, required: true, index: true },
  ed_docid: { type: Number, required: false, index: true },
  ed_patid: { type: Number, required: false, index: true },
  ed_recid: { type: Number, required: false, index: true },
  ed_duration: { type: Number, default: 1, required: false, index: true },
  ed_synced: { type: Number, default: 0, required: false, index: true },
  ed_filename: { type: String, required: false, index: true },
  dev_location: { type: String, required: false, index: true },
  ed_ecgfile: { type: String, required: false, index: true },
  isDeleted: { type: Number, default: 0, index: true },
  ed_status: { type: Number, default: 1, index: true },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now }
})

// BrandSchema.plugin(mongoosePaginate)

const Ecg = mongoose.model('Ecgdata', EcgSchema)

module.exports = Ecg
