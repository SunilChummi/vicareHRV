const express = require('express')
const router = express.Router()
const Recorder = require('../models/Recorder')

router.post('/addDevice', async function (req, res) {
  const query = req.body.rec_slno
  Recorder.findOne({ rec_slno: query }, function (err, rec) {
    if (err) {
      res.send({ code: 204, message: 'Failed' })
    } else if (rec) {
      res.send({ code: 204, message: 'Device exist' })
    } else {
      rec = new Recorder(req.body)
      rec.save(function (err, data) {
        if (err) {
          res.send({ code: 204, message: 'Error in saving' })
        } else {
          res.send({ code: 200, message: 'Success', data: data })
        }
      })
    }
  })
})

router.post('/getDevice', async function (req, res) {
  Recorder.findOne({ rec_slno: req.body.rec_slno }, function (err, rec) {
    if (err) {
      res.send({ code: 204, message: 'Error' })
    } else if (rec) {
      res.send({ code: 200, message: 'Success', data: rec })
    } else {
      res.send({ code: 200, message: 'No device found', data: [] })
    }
  })
})

router.get('/allDevice', async function (req, res) {
  Recorder.find({ }, function (err, rec) {
    if (err) {
      res.send({ code: 204, message: 'Error' })
    } else if (rec) {
      res.send({ code: 200, message: 'Success', data: rec })
    } else {
      res.send({ code: 200, message: 'No devices found', data: [] })
    }
  })
})

router.post('/deviceUpdate', async function (req, res) {
  Recorder.findOne({ rec_slno: req.body.rec_slno }, async function (err, data) {
    if (err) {
      res.send({ code: 204, message: 'No Device found' })
      return false
    } else {
      if (data) {
        const rec = await Recorder.updateOne({ rec_slno: req.body.rec_slno }, { rec_name: req.body.rec_name, rec_manufacturer: req.body.rec_manufacturer, rec_brandname: req.body.rec_brandname, rec_status: req.body.rec_status }).exec()
        if (!rec) {
          res.send({ code: 204, message: 'Something went wrong while updating the data' })
          return false
        } else {
          res.send({ code: 200, message: 'Updated Successfully' })
        }
      } else {
        res.send({ code: 204, message: 'No Device found' })
        return false
      }
    }
  })
})

router.post('/bulkUpload', async function (req, res) {
  const bulkData = req.body.bulkData
  if (bulkData) {
    const errorRecords = []
    for (const value of bulkData) {
      await Recorder.findOne({ rec_slno: value.rec_slno }, function (err, rec) {
        if (err) {
          errorRecords.push(value.rec_slno)
        } else if (rec) {
          errorRecords.push(value.rec_slno)
        } else {
          rec = new Recorder(value)
          rec.save(function (err, data) {
            if (err) {
              errorRecords.push(value.rec_slno)
            }
          })
        }
      })
    }
    res.send({ code: 200, message: 'Success', errorRecords: errorRecords })
  } else {
    res.send({ code: 204, message: 'No data provided' })
  }
})
module.exports = router