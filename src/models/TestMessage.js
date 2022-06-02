const mongoose = require('mongoose')
const Schema = mongoose.Schema

const MessageSchema = new Schema({
  message: { type: String, required: true, index: true },
  type: { type: String, default: 'test', index: true },
  status: { type: Number, default: 1, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
})
const TestMessage = mongoose.model('TestMessage', MessageSchema)
module.exports = TestMessage
