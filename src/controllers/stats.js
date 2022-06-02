const express = require('express')
const router = express.Router()
const Test = require('../models/Test')
const Report = require('../models/Reports')
const Doctor = require('../models/Doctor')
const Patient = require('../models/Patient')
const Recorder = require('../models/Recorder')
const Recassoc = require('../models/Recassoc')
var moment = require('moment')

router.post('/dashboardStats', async function (req, res) {
  const stats = []
  if (req.body.userId === 0) {
    const [doctors, individuals, caretakers, patients, reports, devices, associations] = await Promise.all([
      Doctor.find({ role: 'doctor' }).countDocuments(),
      Doctor.find({ role: 'individual' }).countDocuments(),
      Doctor.find({ role: 'caretaker' }).countDocuments(),
      Patient.countDocuments(),
      Report.countDocuments(),
      Recorder.countDocuments(),
      Recassoc.countDocuments()
    ])
    stats.push({ doctors: doctors, individuals: individuals, caretakers: caretakers, patients: patients, reports: reports, devices: devices, associations: associations })
  } else {
    const [patients, reports, devices, associations] = await Promise.all([
      Patient.find({ createdBy: req.body.userId }).countDocuments(),
      Test.find({ doctorId: req.body.userId, status: 'completed' }).countDocuments(),
      Recorder.find({ ra_userid: req.body.userId }).countDocuments(),
      Recassoc.find({ ra_userid: req.body.userId }).countDocuments()
    ])
    stats.push({ patients: patients, reports: reports, devices: devices, associations: associations })
  }
  res.send({ code: 200, message: 'Success', data: stats })
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

router.get('/monthlyReport', async function (req, res) {
  const FIRST_MONTH = 1
  const LAST_MONTH = 12
  const MONTHS_ARRAY = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December' ]

  const TODAY = moment().toDate()
  const YEAR_BEFORE = moment().subtract(1, 'year').toDate()
  const reportData = await Report.aggregate([
    { $match: { } },
    { $group: { _id: { "year_month": { $substrCP: [ "$created", 0, 7 ] } }, count: { $sum: 1 } } },
    { $sort: { "_id.year_month": 1 } },
    { 
        $project: { 
            _id: 0, 
            count: 1, 
            month_year: { 
                $concat: [ 
                  { $arrayElemAt: [ MONTHS_ARRAY, { $subtract: [ { $toInt: { $substrCP: [ "$_id.year_month", 5, 2 ] } }, 1 ] } ] },
                  "-", 
                  { $substrCP: [ "$_id.year_month", 0, 4 ] }
                ] 
            }
        } 
    },
    { 
        $group: { 
            _id: null, 
            data: { $push: { k: "$month_year", v: "$count" } }
        } 
    },
    { 
        $addFields: { 
            start_year: { $substrCP: [ YEAR_BEFORE, 0, 4 ] }, 
            end_year: { $substrCP: [ TODAY, 0, 4 ] },
            months1: { $range: [ { $toInt: { $substrCP: [ YEAR_BEFORE, 5, 2 ] } }, { $add: [ LAST_MONTH, 1 ] } ] },
            months2: { $range: [ FIRST_MONTH, { $add: [ { $toInt: { $substrCP: [ TODAY, 5, 2 ] } }, 1 ] } ] }
        } 
    },
    { 
        $addFields: { 
            template_data: { 
                $concatArrays: [ 
                    { $map: { 
                        input: "$months1", as: "m1",
                        in: {
                            count: 0,
                            month_year: { 
                                $concat: [ { $arrayElemAt: [ MONTHS_ARRAY, { $subtract: [ "$$m1", 1 ] } ] }, "-",  "$start_year" ] 
                            }                                            
                        }
                    } }, 
                    { $map: { 
                        input: "$months2", as: "m2",
                        in: {
                            count: 0,
                            month_year: { 
                                $concat: [ { $arrayElemAt: [ MONTHS_ARRAY, { $subtract: [ "$$m2", 1 ] } ] }, "-",  "$end_year" ] 
                            }                                            
                        }
                    } }
                ] 
          }
        }
    },
    { 
        $addFields: { 
            data: { 
              $map: { 
                  input: "$template_data", as: "t",
                  in: {   
                      k: "$$t.month_year",
                      v: { 
                          $reduce: { 
                              input: "$data", initialValue: 0, 
                              in: {
                                  $cond: [ { $eq: [ "$$t.month_year", "$$this.k"] },
                                                { $add: [ "$$this.v", "$$value" ] },
                                                { $add: [ 0, "$$value" ] }
                                  ]
                              }
                          } 
                      }
                  }
                }
            }
        }
    },
    {
        $project: {
            data: { $arrayToObject: "$data" }, 
            _id: 0 
        } 
    }
  ] )
  res.send({ code: 200, message: 'Monthly stats found', data: reportData[0].data })
})

router.post('/patientARI', async function (req, res, next) {
  const userId = req.body.patientId
  let params
  if (userId === 0) {
    params = { }
  } else {
    params = { patientId: userId }
  }
  const reportData = await Test.aggregate([
    { $match: params },
    {
      $lookup: {
        from: 'reports',
        localField: 'guid', // field in the orders collection
        foreignField: 'guid', // field in the items collection
        as: 'reports'
      }
    }
  ]).exec()
  const data = []
  if (reportData.length > 0) {
    for (const item in reportData) {
      if (reportData[item].reports.length > 0 && data.length < 11) {
        const ariParams = {
          date: moment(reportData[item].reports[0].created).format('DD/MMM'),
          ari: (reportData[item].reports[0].allData) ? reportData[item].reports[0].allData.ARI : 0,
          RMSSDRR: (reportData[item].reports[0].allData) ? reportData[item].reports[0].allData.RMSSDRR : 0
        }
        data.push(ariParams)
      }
    }
    res.send({ code: 200, message: 'Success', data })
  } else {
    res.send({ code: 204, message: 'Failed', data: [] })
  }
})

module.exports = router
