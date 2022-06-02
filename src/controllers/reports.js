const express = require('express')
const router = express.Router()
const env = require('../config/environments/env.js')
const config = require(`../config/environments/${env.env}.js`)
const Report = require('../models/Reports')
const Test = require('../models/Test')
const reportService = require('../services/reports')
var multer = require('multer')
var mime = require('mime-types')
const fs = require('fs')
var AWS = require('aws-sdk')
var request = require('request')
const mongoose = require('mongoose')
const ObjectId = mongoose.Types.ObjectId

AWS.config.update({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region
})
const s3 = new AWS.S3()

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const filesDir = './public/ecgfiles'
    if (!fs.existsSync(filesDir)) {
      fs.mkdirSync(filesDir)
    }
    cb(null, './public/ecgfiles')
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + file.originalname)
  }
})

var upload = multer({
  storage: storage
})

// upload.single('file')

router.post('/storeECG', upload.single('ecgfile1'), async function (req, res, next) {
  console.log('http://hrdayin20528main.myhrv.de/uploadhrdayinrr.php')
  console.log(req.file.path)
  const options = {
    method: 'POST',
    url: 'http://hrdayin20528main.myhrv.de/uploadhrdayinrr.php',
    headers: {
    },
    formData: {
      ecgfile1: {
        value: fs.createReadStream(req.file.path),
        options: {
          filename: req.file.filename,
          contentType: null
        }
      }
    }
  }
  request(options, async function (error, response) {
    if (error) {
      console.log("1")
      res.send({ code: 204, message: 'Failed to generate report11', error: error })
    } else {
      console.log("2")
      if (response.statusCode === 200) {
        const parsedData = JSON.parse(response.body)
        // console.log(req.file.path)
        const guid = parsedData.guid
        const extention = req.file.originalname.substr(req.file.originalname.indexOf('.'))
        // console.log(guid)
        // .fs.readFile(req.file.path, (err, data) => {
        // if (err) throw err
        // console.log('File uploaded to local')
        const params = {
          Bucket: 'healthtraker/ecgfiles', // pass your bucket name
          Key: guid + extention, // file will be saved as testBucket/contacts.csv
          Body: fs.createReadStream(req.file.path)
        }
        // console.log(params)
        s3.upload(params, async function (s3Err, data) {
          if (s3Err) throw s3Err
          // console.log('File uploaded successfully to S3')
          fs.unlink(req.file.path, (err) => {
            // file deleted from local
            // console.log('File deleted from local')
          })
          setTimeout(() => {
            const options = {
              uri: config.reportURL + 'results/' + guid + 'HRV.B.pdf',
              encoding: null
            }
            request(options, function (error, response, body) {
            // request.get(config.reportURL + 'results/' + guid + '.pdf', function (error, response, body) {
              if (!error && response.statusCode === 200) {
                // console.log('Received PDF file')
                // fs.writeFile('./public/test.pdf', body, err => {
                //   // file written successfully
                // })
                const params1 = {
                  Bucket: 'healthtraker/hrvfiles', // pass your bucket name
                  Key: guid + '.pdf', // file will be saved as testBucket/contacts.csv
                  Body: body,
                  ContentType: 'binary/octet-stream'
                }
                s3.putObject(params1, async function (s3Err, data) {
                  if (s3Err) throw s3Err
                  // console.log('Uploaded PDF file to S3')
                  // Store pointCare file to S3
                  const options1 = {
                    uri: config.reportURL + 'results/' + guid + '.poincare.A.jpg',
                    encoding: null
                  }
                  request(options1, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                      const params2 = {
                        Bucket: 'healthtraker/poincare', // pass your bucket name
                        Key: guid + '.jpg', // file will be saved as testBucket/contacts.csv
                        Body: body,
                        ContentType: 'binary/octet-stream'
                      }
                      s3.putObject(params2, async function (s3Err, data) {
                      })
                    }
                  })
                  // Store Status files to S3
                  const options2 = {
                    uri: config.reportURL + 'results/' + guid + '.status.A.jpg',
                    encoding: null
                  }
                  request(options2, function (error, response, body) {
                    if (!error && response.statusCode === 200) {
                      const params3 = {
                        Bucket: 'healthtraker/statusGraph', // pass your bucket name
                        Key: guid + '.jpg', // file will be saved as testBucket/contacts.csv
                        Body: body,
                        ContentType: 'binary/octet-stream'
                        // ContentEncoding: 'base64'
                      }
                      s3.putObject(params3, async function (s3Err, data) {
                      })
                    }
                  })
                  const testParams = {
                    status: 'completed',
                    guid: guid
                  }
                  await Test.updateOne({ _id: req.body.testId }, testParams).exec()
                  const allData = await reportService.allData(guid)
                  const recommendation = await reportService.recommendation(guid)
                  const reportParams = {
                    testId: req.body.testId,
                    guid: guid,
                    allData: allData.body,
                    recommendation: recommendation.body
                  }
                  const reports = new Report(reportParams)
                  await reports.save(function (err, data) {
                    if (err) {
                      res.send({ code: err, message: 'Error in saving' })
                    } else {
                      res.send({ code: 200, message: 'Success', data: data })
                    }
                  })
                })
              } else {
                res.send({ code: 204, message: 'Failed to generate report, PDF not generated', error: error })
              }
            })
          }, 4000)
        })
        // })
      } else {
        res.send({ code: 204, message: 'Failed to generate report22', error: error })
      }
    }
  })
})

router.post('/getAllReport', async function (req, res, next) {
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
  let data = []
  let resultText = ""
  if (reportData.length > 0) {
    for (const item in reportData) {
      if(reportData[item].reports.length > 0){
        data.push(reportData[item])
      }
    }
    let x, y, ari = 0;
    let frequency = "";
    x = data.length; // No.of reports

    if(x<20)
    {
        y = 20 - x;
    }
    else y = 1;

    for (let i = 0; i < data.length; i++) {
      ari = ari + parseFloat(data[i].reports[0].allData.ARI)
    }
    let avg = ari/data.length;
    if(x>=20 && avg>=70) {
        frequency = "Fortnight (2 weeks) basis";
    } else if(x>=20 && avg>=40) {
        frequency = "Weekly basis";
    } else if(x>=20 && avg > 20) {
        frequency = "Weekly basis";
    } else if (x >= 20 && avg < 20) {
      frequency = "Daily basis";
    } else {
      frequency = "Daily basis";
    }
    let PatientName = "User";
    if(data[0].patientName){
      PatientName = data[0].patientName
    }
    resultText = "<b>Hello "+PatientName+", you have completed taking “"+data.length+"”(number of " +
    "tests) assessments. VicareHRV recommends you to take “"+y+"” assessment preferably on " +
    "“"+frequency+"” in order to track your wellness data efficiently. AI Algorithm within the VicareHRV will be able to provide personalised recommendations to improve your health." +
    " We highly recommend you to consult doctors" +
   " and do not recommend any home remedies." +
    " Our recommendations are always related to improvement of lifestyle " +
    "habits."+
    "<p><small>Main intention of VicareHRV is to ensure that the health is tracked easily" +
    " on a regular basis, trend of health status is easily accessed, indicate health" +
    " concerns at an early stage (depending on the frequency of the usage of the" +
    "VicareHRV), provide certain recommendations to change the lifestyle and" +
    " suggest to consult doctors on need basis.</small></p></b>";
    res.send({ code: 200, message: 'Success', data: data, resultText: resultText })
  } else {
    res.send({ code: 204, message: 'Failed', data: [], resultText: "" })
  }
})

//Reports for doctor
router.post('/getAllDoctorReport', async function (req, res, next) {
  const userId = req.body.doctorId
  let params
  if (userId == 0 || userId == "0") {
    params = { }
  } else {
    params = { doctorId: userId.toString() }
  }
  const reportData = await Test.aggregate([
    { $match: params },
    { $sort: { created: -1 } },
    {
      $lookup: {
        from: 'reports',
        localField: 'guid', // field in the orders collection
        foreignField: 'guid', // field in the items collection
        as: 'reports'
      }
    }
  ]).exec()
  let data = []
  if (reportData.length > 0) {
    for (const item in reportData) {
      if(reportData[item].reports.length > 0){
        data.push(reportData[item])
      }
    }
    res.send({ code: 200, message: 'Success', data: data })
  } else {
    res.send({ code: 204, message: 'Failed', data: [] })
  }
})

router.post('/getReport', async function (req, res) {
  const reportData = await Test.aggregate([
    { $match: { _id: ObjectId(req.body._id) } },
    {
      $lookup: {
        from: 'reports',
        localField: 'guid', // field in the orders collection
        foreignField: 'guid', // field in the items collection
        as: 'reports'
      }
    }
  ]).exec()
  if (reportData.length > 0) {
    res.send({ code: 200, message: 'Success', data: reportData })
  } else {
    res.send({ code: 204, message: 'Failed', data: [] })
  }
})
module.exports = router
