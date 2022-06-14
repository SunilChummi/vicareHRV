var mongoose = require('mongoose')
var Schema = mongoose.Schema
var mongoosePaginate = require('mongoose-paginate-v2')

var BrandSchema = new Schema({
  hd_id: { type: Number, required: true, index: true },
  hd_ecgid: { type: Number, required: false, index: true },
  hd_guid: { type: Number, required: false, index: true },
  hd_synced: { type: Number, default: 0, required: false, index: true },
  hd_pdfname: { type: String, required: false, index: true },
  hd_imagename: { type: String, required: false, index: true },
  hd_doc_id: { type: Number, required: false, index: true },
  hd_patient_id: { type: Number, required: false, index: true },
  hd_ari: { type: String, required: false, index: true },
  hrv_ecg: { type: String, required: false, index: true },
  hrv_isDeleted: { type: Number, default: 0, index: true },
  created_at: { type: Date, default: Date.now, index: true },
  updated_at: { type: Date, default: Date.now }
})

BrandSchema.plugin(mongoosePaginate)

const Brand = mongoose.model('Hrvdata', BrandSchema)

module.exports = Brand
