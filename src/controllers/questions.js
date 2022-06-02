const express = require('express')
const router = express.Router()
const Question = require('../models/Questions')

router.post('/addQuestion', async function (req, res) {
  const ques = new Question(req.body)
  ques.save(function (err, data) {
    if (err) {
      res.send({ code: 204, message: 'Error in saving' })
    } else {
      res.send({ code: 200, message: 'Success', data: data })
    }
  })
})

router.post('/getQuestion', async function (req, res) {
  Question.findOne({ _id: req.body.id }, function (err, qData) {
    if (err) {
      res.send({ code: 204, message: 'Error' })
    } else if (qData) {
      res.send({ code: 200, message: 'Success', data: qData })
    } else {
      res.send({ code: 200, message: 'No Question found', data: [] })
    }
  })
})

router.get('/allQuestions', async function (req, res) {
  Question.find({ }, function (err, rec) {
    if (err) {
      res.send({ code: 204, message: 'Error' })
    } else if (rec) {
      res.send({ code: 200, message: 'Success', data: rec })
    } else {
      res.send({ code: 200, message: 'No Question found', data: [] })
    }
  })
})

router.post('/updateQuestion', async function (req, res) {
  Question.findOne({ _id: req.body.id }, async function (err, data) {
    if (err) {
      res.send({ code: 204, message: 'No Question found' })
      return false
    } else {
      if (data) {
        const question = await Question.updateOne({ _id: req.body.id }, { question: req.body.question, answer1: req.body.answer1, answer2: req.body.answer2, answer3: req.body.answer3, status: req.body.status }).exec()
        if (!question) {
          res.send({ code: 204, message: 'Something went wrong while updating the data' })
          return false
        } else {
          res.send({ code: 200, message: 'Updated Successfully' })
        }
      } else {
        res.send({ code: 204, message: 'No Question found' })
        return false
      }
    }
  })
})
module.exports = router
