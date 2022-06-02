const express = require('express')
const router = express.Router()
const Recorder = require('../models/Recorder')
const Recassoc = require('../models/Recassoc')

router.post('/linkDevice', async function (req, res) {
  Recorder.findOne({ rec_slno: req.body.ra_rec_slno }, function (err, rec) {
    if (err) {
      res.send({ code: 204, message: 'Failed' })
    } else if (!rec) {
      res.send({ code: 204, message: 'No Device found' })
    } else {
      Recassoc.findOne({ $and: [{ ra_rec_slno: req.body.ra_rec_slno }, { ra_status: 1 }] }, function (err2, recassoc) {
        if (err2) {
          res.send({ code: 204, message: 'Failed' })
        } else if (recassoc) {
          res.send({ code: 204, message: 'Already Associated' })
        } else {
          recassoc = new Recassoc(req.body)
          recassoc.save(function (err1, data) {
            if (err1) {
              res.send({ code: 204, message: 'Error in saving', err: err1 })
            } else {
              res.send({ code: 200, message: 'Success', data: data })
            }
          })
        }
      })
    }
  })
})

router.post('/getDeviceList', async function (req, res) {
  let params = {}
  if (req.body.doctor_id != 0) {
    params = { ra_userid: req.body.doctor_id }
  }
  Recassoc.find(params, function (err, rec) {
    if (err) {
      res.send({ code: 204, message: 'Error' })
    } else if (rec) {
      res.send({ code: 200, message: 'Success', data: rec })
    } else {
      res.send({ code: 200, message: 'No device found', data: [] })
    }
  })
})

router.get('/allDeviceAssociation', async function (req, res) {
  const Recassoc1 = await Recassoc.aggregate([
    { $match: { } },
    {
      $lookup: {
        from: 'doctors',
        localField: 'ra_userid', // field in the orders collection
        foreignField: 'userId', // field in the items collection
        as: 'doctor'
      }
    }
  ]).exec()
  if (Recassoc1.length > 0) {
    res.send({ code: 200, message: 'Success', data: Recassoc1 })
  } else {
    res.send({ code: 204, message: 'Failed', data: [] })
  }
})

router.post('/getAssociations', async function (req, res) {
  const Recassoc1 = await Recassoc.aggregate([
    { $match: { ra_rec_slno: req.body.rec_slno } },
    {
      $lookup: {
        from: 'doctors',
        localField: 'ra_userid', // field in the orders collection
        foreignField: 'userId', // field in the items collection
        as: 'doctor'
      }
    }
  ]).exec()
  if (Recassoc1.length > 0) {
    res.send({ code: 200, message: 'Success', data: Recassoc1 })
  } else {
    res.send({ code: 204, message: 'Failed', data: [] })
  }
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

router.post('/associationUpdate', async function (req, res) {
  Recassoc.find({ ra_rec_slno: req.body.ra_rec_slno }, async function (err, data) {
    if (err) {
      res.send({ code: 204, message: 'No Device found' })
      return false
    } else {
      let count = 0
      if (data.length > 0) {
        if (req.body.ra_status === 1) {
          for (const item in data) {
            if (data[item].ra_status === 1 && data[item]._id !== req.body._id) {
              count++
            }
          }
        }
        if (count > 0) {
          res.send({ code: 204, message: 'Association is already active' })
          return false
        }
        const rec = await Recassoc.updateOne({ _id: req.body._id }, { ra_status: req.body.ra_status, ra_mobile: req.body.ra_mobile, ra_valid_upto: req.body.ra_valid_upto, ra_email: req.body.ra_email, ra_contact_name: req.body.ra_contact_name }).exec()
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

module.exports = router
