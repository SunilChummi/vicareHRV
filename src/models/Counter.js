const mongoose = require('mongoose')
const Schema = mongoose.Schema

const CounterSchema = new Schema({
  _id: { type: String, required: true },
  purpose: { type: String, required: false },
  seq: { type: Number, default: 10000 }
})

CounterSchema.index({ _id: 1, seq: 1, purpose: 'userId' }, { unique: true })
const Counter = mongoose.model('Counter', CounterSchema)
module.exports = Counter
