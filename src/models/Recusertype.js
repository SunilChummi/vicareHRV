var mongoose = require('mongoose')
var Schema = mongoose.Schema
var mongoosePaginate = require('mongoose-paginate-v2')

var BrandSchema = new Schema({
  name: { type: String, required: true, index: true },
  imageType: { type: String, required: false, index: true },
  imageURL: { type: String, required: false, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now },
  status: { type: Boolean, default: true, index: true },
  deleted: { type: Boolean, default: false, index: true }
})

BrandSchema.plugin(mongoosePaginate)

const Brand = mongoose.model('Brand', BrandSchema)

module.exports = Brand
