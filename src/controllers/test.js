const express = require('express')
const router = express.Router()
const Test = require('../models/Test')

router.post('/createTest', async function (req, res) {
  let BMI = 0
  if (req.body.weight) {
    BMI = (parseInt(req.body.weight) / (parseInt(req.body.height) * parseInt(req.body.height))) * 10000
  }
  req.body.bmi = BMI.toFixed(2)
  const questions = {
    qText1: req.body.qText1,
    qAnswer1: req.body.qAnswer1,
    qText2: req.body.qText2,
    qAnswer2: req.body.qAnswer2,
    qText3: req.body.qText3,
    qAnswer3: req.body.qAnswer3
  }
  req.body.questions = questions
  const test = new Test(req.body)
  test.save(function (err, data) {
    if (err) {
      res.send({ code: 204, message: 'Error in saving' })
    } else {
      res.send({ code: 200, message: 'Success', data: data })
    }
  })
})

router.post('/getTest', async function (req, res) {
  Test.findOne({ _id: req.body.id }, function (err, data) {
    if (err) {
      res.send({ code: 204, message: 'No data found', data: {} })
    } else if (data) {
      res.send({ code: 200, message: 'Success', data: data })
    } else {
      res.send({ code: 200, message: 'No data found', data: {} })
    }
  })
})

router.get('/allTest', async function (req, res) {
  Test.find({ }, function (err, rec) {
    if (err) {
      res.send({ code: 204, message: 'Error', data: [] })
    } else if (rec) {
      res.send({ code: 200, message: 'Success', data: rec })
    } else {
      res.send({ code: 200, message: 'No Tests found', data: [] })
    }
  })
})

router.post('/patientTestList', async function (req, res) {
  Test.find({ patientId: req.body.patientId }, function (err, rec) {
    if (err) {
      res.send({ code: 204, message: 'Error', data: [] })
    } else if (rec) {
      res.send({ code: 200, message: 'Success', data: rec })
    } else {
      res.send({ code: 200, message: 'No Tests found', data: [] })
    }
  })
})

module.exports = router
