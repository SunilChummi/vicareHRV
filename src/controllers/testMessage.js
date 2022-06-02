const express = require('express')
const router = express.Router()
const TestMessage = require('../models/TestMessage')

router.post('/addMessage', async function (req, res) {
  const msg = new TestMessage(req.body)
  msg.save(function (err, data) {
    if (err) {
      res.send({ code: 204, message: 'Error in saving' })
    } else {
      res.send({ code: 200, message: 'Success', data: data })
    }
  })
})

// router.post('/getQuestion', async function (req, res) {
//   Question.findOne({ _id: req.body.id }, function (err, qData) {
//     if (err) {
//       res.send({ code: 204, message: 'Error' })
//     } else if (qData) {
//       res.send({ code: 200, message: 'Success', data: qData })
//     } else {
//       res.send({ code: 200, message: 'No Question found', data: [] })
//     }
//   })
// })

router.get('/allMessages', async function (req, res) {
    TestMessage.find({ status: 1}, function (err, msgs) {
        console.log()
        if (err) {
            res.send({ code: 204, message: 'Error' })
        } else if (msgs) {
            res.send({ code: 200, message: 'Success', data: msgs })
        } else {
            res.send({ code: 200, message: 'No Question found', data: [] })
        }
    })
})

router.post('/updateMessage', async function (req, res) {
    TestMessage.findOne({ _id: req.body.id }, async function (err, data) {
        if (err) {
            res.send({ code: 204, message: 'No Message found' })
            return false
        } else {
            if (data) {
                const msg = await TestMessage.updateOne({ _id: req.body.id }, { message: req.body.message, status: req.body.status }).exec()
                if (!msg) {
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
