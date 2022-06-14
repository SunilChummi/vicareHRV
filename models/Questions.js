const mongoose = require('mongoose')
const Schema = mongoose.Schema

const QuestionSchema = new Schema({
  question: { type: String, required: true, index: true },
  answer1: { type: String, required: false, index: true },
  answer2: { type: String, required: false, index: true },
  answer3: { type: String, required: false, index: true },
  type: { type: String, default: 'checkbox', required: false, index: true },
  status: { type: Number, default: 1, index: true },
  createdAt: { type: Date, default: Date.now, index: true },
  updatedAt: { type: Date, default: Date.now }
})
const Question = mongoose.model('Question', QuestionSchema)
module.exports = Question
