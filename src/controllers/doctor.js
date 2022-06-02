var express = require('express')
var router = express.Router()
const env = require('../config/environments/env.js')
const config = require(`../config/environments/${env.env}.js`)
const User = require('../models/User')
const Amount = require('../models/Amount')
const Doctor = require('../models/Doctor')
const AWS = require('aws-sdk');
const mark = require('markup-js');
const authService = require('../services/authService')

let SES = new AWS.SES({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region
});

// const paginator = require('../helpers/paginatorV2');
router.get('/doctorsList', async function (req, res, next) {
  const doctors = await Doctor.find({ }).exec()
  if (doctors.length > 0) {
    res.send({ code: 200, message: 'Success', data: doctors })
  } else {
    res.send({ code: 200, message: 'Success', data: [] })
  }
})

router.post('/getDoctor', async function (req, res, next) {
  const doctor = await Doctor.findOne({ userId: req.body.doctor_id }).exec()
  if (doctor) {
    res.send({ code: 200, message: 'Success', data: doctor })
  } else {
    res.send({ code: 200, message: 'Success', data: [] })
  }
})

router.post('/doctorUpdate', async function (req, res, next) {
  Doctor.findOne({ userId: req.body.doctor_id }, async function (err, data) {
    if (err) {
      res.send({ code: 204, message: 'No Doctor found', data: {} })
      return false
    } else {
      if (data) {
        const doc = await Doctor.updateOne({ userId: req.body.doctor_id }, req.body).exec()
        if (!doc) {
          res.send({ code: 204, message: 'Something went wrong while updating the data' })
          return false
        } else {
          res.send({ code: 200, message: 'Updated Successfully' })
        }
      } else {
        res.send({ code: 204, message: 'No Doctor found' })
        return false
      }
    }
  })
})

router.post('/individualUpdate', async function (req, res, next) {
  let doctor_id = req.body.individual_id
  let params = {
    "gender": req.body.gender,
    "firstName": req.body.firstName,
    "lastName": req.body.lastName,
    "address": req.body.address,
    "zipCode": req.body.zipCode,
    "town": req.body.town,
    "country": req.body.country,
    "email": req.body.email,
    "countryCode": req.body.countryCode,
    "mobile": req.body.mobile,
    "birthday": req.body.birthday,
    "weight": req.body.weight,
    "height": req.body.height,
    "activities": {
      "a1": req.body.a1,
      "a2": req.body.a2,
      "a3": req.body.a3,
      "a4": req.body.a4,
      "a5": req.body.a5,
      "a6": req.body.a6,
      "actOther": req.body.actOther
    },
    "healthHistory": {
      "h1": req.body.h1,
      "h2": req.body.h2,
      "h3": req.body.h3,
      "h4": req.body.h4,
      "h5": req.body.h5,
      "h6": req.body.h6,
      "h7": req.body.h7,
      "healthOther": req.body.healthOther
    }
}
  Doctor.findOne({ userId: doctor_id }, async function (err, data) {
    if (err) {
      res.send({ code: 204, message: 'User not found', data: {} })
      return false
    } else {
      if (data) {
        const doc = await Doctor.updateOne({ userId: doctor_id }, params).exec()
        if (!doc) {
          res.send({ code: 204, message: 'Something went wrong while updating the data' })
          return false
        } else {
          res.send({ code: 200, message: 'Updated Successfully' })
        }
      } else {
        res.send({ code: 204, message: 'User not found' })
        return false
      }
    }
  })
})

router.post('/sendResetOTP', async function (req, res, next) {
  const doctor = await Doctor.findOne({ email: req.body.email }).exec()
  if (doctor) {
    const otp = Math.floor(100000 + Math.random() * 900000)
    let params = {
      otp: otp
    }
    const messageBodyAttributes = {
      toEmailAddress: 'sreenidhig@gmail.com',
      subject: "Health Traker - Reset Password OTP"
    };
    const templateBody = "<p>Hello User,</p><p>Your OTP for resetting the password is <b>"+ otp +".</b></p><p>Please use this in your mobile app.</p><br><p><i>Regards,</p><p><i>Team Health Traker</p>";
    const messageBody = mark.up(templateBody, messageBodyAttributes);
    const emailParams = {
        Destination: {
            ToAddresses: [
                'sreenidhig@gmail.com'
            ]
        },
        Message: {
            Subject: {
                Data: messageBodyAttributes.subject,
                Charset: 'UTF-8'
            }
        },
        Source: "Health Traker" + '<' + 'sagre.sagre@yandex.com' + '>',
        ReplyToAddresses: [
            "Support" + '<' + 'sagre.sagre@yandex.com' + '>'
        ]
    };
    emailParams.Message.Body = {
        Html: {
            Data: messageBody,
            Charset: 'UTF-8'
        }
    };
    SES.sendEmail(emailParams, function (err, data) {
        if (err) {
          console.log("Reset password Email error")
            console.log(err)
        } else {
            //console.log("Email sent successfully")
        }
    });
    const doc = await Doctor.updateOne({ userId: doctor.userId }, params).exec()
    if(doc){
      res.send({ code: 200, message: 'OTP sent'})
    } else {
      res.send({ code: 204, message: 'Error sending OTP' })
    }
  } else {
    res.send({ code: 204, message: 'No user found' })
  }
})

router.post('/verifyResetOTP', async function (req, res, next) {
  const doctor = await Doctor.findOne({ email: req.body.email }).exec()
  let otp = parseInt(req.body.otp)
  if (doctor) {
    if(doctor.otp === otp){
      res.send({ code: 200, message: 'OTP matched' })
    } else {
      res.send({ code: 204, message: 'You have entered wrong OTP' })
    }
  } else {
    res.send({ code: 204, message: 'No user found' })
  }
})

router.post('/resetPassword', async function (req, res, next) {
  const doctor = await Doctor.findOne({ email: req.body.email }).exec()
  if (doctor) {
    const hashedPassword = await User.hashThePassword(req.body.password)
    let params = {
      password: hashedPassword
    }
    const user = await User.updateOne({ id: doctor.userId }, params).exec()
    if(user){
      res.send({ code: 200, message: 'Password changed successfully' })
    } else {
      res.send({ code: 204, message: 'Error in changing password' })
    }
  } else {
    res.send({ code: 204, message: 'No user found' })
  }
})

module.exports = router
