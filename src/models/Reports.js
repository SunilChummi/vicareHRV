const mongoose = require('mongoose')
const Schema = mongoose.Schema

const ReportSchema = new Schema({
  testId: { type: String, required: true, index: true },
  guid: { type: String, required: true, index: true },
  recommendation: { type: String, required: false },
  allData: { type: Object, required: false },
  status: { type: String, default: 'active', required: false },
  created: { type: Date, default: Date.now, index: true }
})
const Report = mongoose.model('Report', ReportSchema)
module.exports = Report
