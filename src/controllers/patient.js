var express = require('express')
var router = express.Router()
const User = require('../models/User')
const Patient = require('../models/Patient')

router.get('/allPatientsList', async function (req, res) {
  const patients = await Patient.aggregate([
    { $match: { } },
    {
      $lookup: {
        from: 'doctors',
        localField: 'createdBy', // field in the orders collection
        foreignField: 'userId', // field in the items collection
        as: 'doctor'
      }
    }
  ]).exec()
  if (patients.length > 0) {
    res.send({ code: 200, message: 'Success', data: patients })
  } else {
    res.send({ code: 204, message: 'Failed', data: [] })
  }
})

router.post('/patientsList', async function (req, res) {
  req.body.doctor_id = parseInt(req.body.doctor_id)
  const patients = await Patient.aggregate([
    // { $match: [{ status: 1, createdBy: req.body.doctor_id }, { $or: { 'medicalContacts.contactUserId': req.body.doctor_id } }] },
    { $match: { $or: [{ createdBy: req.body.doctor_id }, { 'medicalContacts.contactUserId': req.body.doctor_id }] } },
    {
      $lookup: {
        from: 'doctors',
        localField: 'createdBy', // field in the orders collection
        foreignField: 'userId', // field in the items collection
        as: 'doctor'
      }
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        gender: 1,
        userId: 1,
        email: 1,
        countryCode: 1,
        mobile: 1,
        createdBy: 1,
        created: 1,
        status: 1,
        refIdUsed: 1,
        'doctor._id': 1,
        'doctor.refId': 1,
        'doctor.userId': 1,
        'doctor.firstName': 1,
        'doctor.lastName': 1,
        'doctor.email': 1
      }
    }
  ]).exec()
  if (patients.length > 0) {
    res.send({ code: 200, message: 'Success', data: patients })
  } else {
    res.send({ code: 204, message: 'Failed', data: [] })
  }
})

router.post('/adminPatientsList', async function (req, res) {
  let params
  if (req.body.doctor_id === 0) {
    params = { }
  } else {
    params = { $or: [{ createdBy: req.body.doctor_id }, { 'medicalContacts.contactUserId': req.body.doctor_id }] }
  }
  const patients = await Patient.aggregate([
    { $match: params },
    {
      $lookup: {
        from: 'doctors',
        localField: 'createdBy', // field in the orders collection
        foreignField: 'userId', // field in the items collection
        as: 'doctor'
      }
    },
    {
      $project: {
        firstName: 1,
        lastName: 1,
        gender: 1,
        userId: 1,
        email: 1,
        countryCode: 1,
        mobile: 1,
        createdBy: 1,
        created: 1,
        status: 1,
        refIdUsed: 1,
        'doctor._id': 1,
        'doctor.refId': 1,
        'doctor.userId': 1,
        'doctor.firstName': 1,
        'doctor.lastName': 1,
        'doctor.email': 1
      }
    }
  ]).exec()
  if (patients.length > 0) {
    res.send({ code: 200, message: 'Success', data: patients })
  } else {
    res.send({ code: 204, message: 'Failed', data: [] })
  }
})
router.post('/getPatient', async function (req, res) {
  const patient = await Patient.findOne({ status: 1, userId: req.body.patient_id }).exec()
  if (patient) {
    res.send({ code: 200, message: 'Success', data: patient })
  } else {
    res.send({ code: 204, message: 'Failed', data: [] })
  }
})

router.post('/patientUpdate', async function (req, res) {
  Patient.findOne({ userId: req.body.patient_id }, async function (err, data) {
    if (err) {
      res.send({ code: 204, message: 'No Patient found', data: {} })
      return false
    } else {
      if (data) {
        if (req.body.a1) {
          const activityObject = {
            a1: req.body.a1,
            a2: req.body.a2,
            a3: req.body.a3,
            a4: req.body.a4,
            a5: req.body.a5,
            a6: req.body.a6,
            actOther: req.body.actOther
          }
          const diseaseObject = {
            h1: req.body.h1,
            h2: req.body.h2,
            h3: req.body.h3,
            h4: req.body.h4,
            h5: req.body.h5,
            h6: req.body.h6,
            healthOther: req.body.healthOther
          }
          req.body.activities = activityObject
          req.body.healthHistory = diseaseObject
        }
        const patient = await Patient.updateOne({ userId: req.body.patient_id }, req.body).exec()
        if (!patient) {
          res.send({ code: 204, message: 'Something went wrong while updating the data' })
          return false
        } else {
          res.send({ code: 200, message: 'Updated Successfully' })
        }
      } else {
        res.send({ code: 204, message: 'No Patient found' })
        return false
      }
    }
  })
})

module.exports = router
