const mongoose = require('mongoose')
const Schema = mongoose.Schema

const TestSchema = new Schema({
  recorderSlNo: { type: String, required: true, index: true },
  patientId: { type: Number, required: true, index: true },
  patientName: { type: String, required: false, index: true },
  doctorId: { type: String, required: true, index: true },
  doctorName: { type: String, required: false, index: true },
  duration: { type: Number, default: 1, required: true, index: true },
  weight: { type: String, default: 1, required: false, index: true },
  height: { type: String, required: false, index: true },
  location: { type: String, required: false, index: true },
  bmi: { type: String, required: false, index: true },
  questions: {
    qText1: { type: String },
    qAnswer1: { type: String },
    qText2: { type: String },
    qAnswer2: { type: String },
    qText3: { type: String },
    qAnswer3: { type: String }
  },
  guid: { type: String, default: null, required: false, index: true },
  status: { type: String, default: 'in progress', required: false, index: true },
  created: { type: Date, default: Date.now, index: true }
})

const Test = mongoose.model('Test', TestSchema)
module.exports = Test
