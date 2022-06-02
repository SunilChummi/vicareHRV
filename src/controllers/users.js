const express = require('express')
const router = express.Router()
const User = require('../models/User')
const Doctor = require('../models/Doctor')
const Patient = require('../models/Patient')
const Alert = require('../models/Alerts')
const Counter = require('../models/Counter')
const Settings = require('../models/Settings')
const { body, validationResult } = require('express-validator')
// const jwt = require("jsonwebtoken");
const LocalStrategy = require('passport-local').Strategy
const passport = require('passport')
const authService = require('../services/authService')
const auth = require('../middleware/auth')
const paginator = require('../helpers/paginatorV2')
const moment = require('moment')
const fs = require('fs')
const path = require('path')
const mark = require('markup-js')
const bcrypt = require('bcryptjs')
const SALT_WORK_FACTOR = 10
const jwt = require('jsonwebtoken')
const AWS = require('aws-sdk');
const env = require('../config/environments/env.js')
const config = require(`../config/environments/${env.env}.js`)

let SES = new AWS.SES({
  accessKeyId: config.accessKeyId,
  secretAccessKey: config.secretAccessKey,
  region: config.region
});
// const SES = new AWS.SES(env.awsKeys)

router.post('/register', async function (req, res) {
  try {
    const checkUser = await User.findOne({ email: req.body.email })
    if (checkUser) {
      res.send({ code: 204, message: 'User with this email exist' })
    } else {
      const userId = await Counter.findOneAndUpdate({ purpose: 'user_id' }, { $inc: { seq: 1 }, purpose: 'user_id' }, {
        new: true,
        upsert: true
      }).exec()
      const otp = Math.floor(100000 + Math.random() * 900000)
      const messageBodyAttributes = {
        toEmailAddress: req.body.email,
        subject: "Health Traker - Account Verification OTP"
      };
      const templateBody = "<p>Hello User,</p><p>Your OTP for account verification is <b>"+ otp +".</b></p><p>Please use this in your mobile app to verify your account and continue.</p><br><p><i>Regards,</p><p><i>Team Health Traker</p>";
      const messageBody = mark.up(templateBody, messageBodyAttributes);
      const emailParams = {
          Destination: {
              ToAddresses: [
                req.body.email
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
            console.log("Registration Email error")
              console.log(err)
          } else {
              //console.log("Email sent successfully")
          }
      });
      const userObj = new User({ id: userId.seq, email: req.body.email, password: req.body.password, countryCode: req.body.countryCode, mobile: req.body.mobile, role: req.body.role, verified: 0, otp: otp })
      await userObj.save(async function (err, user) {
        if (err) {
          res.send({ code: err, message: 'Failed to save user' })
        } else {
          if (user) {
            const doctor = new Doctor({ userId: userId.seq, email: req.body.email, countryCode: req.body.countryCode, mobile: req.body.mobile, role: req.body.role })
            await doctor.save(async function (err, doctor) {
              if (err) {
                res.send({ code: err, message: 'Failed to save doctor' })
              } else {
                const setting = new Settings({ userId: userId.seq, newsLetter: req.body.newsLetter })
                await setting.save()
                res.send({ code: 200, message: 'Success', data: user })
              }
            })
          }
        }
      })
    }
  } catch (err) {
    res.send({ code: 204, success: false, message: "Failed to register" })
  }
})

router.post('/createProfile', async function (req, res, next) {
  const checkUser = await Doctor.findOne({ userId: req.body.userId })
  if (!checkUser) {
    res.send({ code: 204, message: 'User not found' })
  } else {
    let doctor
    let patient
    let generateRefId = await Counter.findOneAndUpdate({ purpose: 'ref_id' }, { $inc: { seq: 1 }, purpose: 'ref_id' }, {
      new: true,
      upsert: true
    }).exec()
    generateRefId = leftPad(generateRefId.seq, 4)
    /**
     * Function takes number converts into standard format
     */
    function leftPad (number, targetLength) {
      let output = number + ''
      while (output.length < targetLength) {
        output = '0' + output
      }
      return output
    }
    generateRefId = '2844-' + new Date().getFullYear() + '-' + generateRefId
    if (req.body.role === 'individual') {
      const patientUserId = await Counter.findOneAndUpdate({ purpose: 'user_id' }, { $inc: { seq: 1 }, purpose: 'user_id' }, {
        new: true,
        upsert: true
      }).exec()
      // get linking doctor ID
      let created
      let creatorName
      let refIdUsed
      let medicalContactObj
      if (req.body.refId) {
        refIdUsed = req.body.refId
        const creator = await Doctor.findOne({ refId: req.body.refId })
        if (creator) {
          created = creator.userId
          if (creator.lastName) {
            creatorName = creator.firstName + ' ' + creator.lastName
          } else {
            creatorName = creator.firstName
          }
          medicalContactObj = [{
            contactUserId: created,
            contactUserName: creatorName
          }]
        } else {
          refIdUsed = null
          created = req.body.userId
          medicalContactObj = []
        }
      } else {
        refIdUsed = null
        created = req.body.userId
        medicalContactObj = []
      }
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
      doctor = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        address: req.body.address,
        zipCode: req.body.zipCode,
        town: req.body.town,
        country: req.body.country,
        refId: generateRefId,
        birthday: req.body.birthday,
        weight: req.body.weight,
        height: req.body.height,
        activities: activityObject,
        healthHistory: diseaseObject,
        intensity: req.body.intensity,
        status: 1
      }
      patient = new Patient({
        userId: patientUserId.seq,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: checkUser.email,
        countryCode: checkUser.countryCode,
        mobile: checkUser.mobile,
        gender: req.body.gender,
        address: req.body.address,
        zipCode: req.body.zipCode,
        town: req.body.town,
        country: req.body.country,
        birthday: req.body.birthday,
        weight: req.body.weight,
        height: req.body.height,
        activities: activityObject,
        healthHistory: diseaseObject,
        intensity: req.body.intensity,
        status: 1,
        role: 'patient',
        createdBy: created,
        refIdUsed: refIdUsed,
        medicalContacts: medicalContactObj
      })
    } else {
      doctor = {
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        gender: req.body.gender,
        address: req.body.address,
        zipCode: req.body.zipCode,
        town: req.body.town,
        country: req.body.country,
        hospital: req.body.hospital,
        refId: generateRefId,
        status: 1
      }
    }
    Doctor.updateOne({ userId: req.body.userId }, doctor, async function (err, user) {
      if (err) {
        res.send({ code: 204, message: 'Failed to create profile' })
      } else {
        if (req.body.role === 'individual') {
          await patient.save()
          if (req.body.refId) {
            const alerts = new Alert({ from: patient.userId, to: patient.createdBy, notifyTo: patient.createdBy, priority: 3, type: 'incoming', description: patient.firstName + ' ' + patient.lastName + ' is trying to add you as Medical contact' })
            await alerts.save()
          }
        }
        res.send({ code: 200, message: 'Success', data: doctor })
      }
    })
  }
})

router.post('/createPatient', async function (req, res, next) {
  try {
    // const checkUser = await User.findOne({ email: req.body.email })
    const checkUser = null
    let created
    let creatorName
    req.body.createdBy = parseInt(req.body.createdBy)
    if (checkUser) {
      res.send({ code: 204, message: 'User email exist' })
    } else {
      const patientUserId = await Counter.findOneAndUpdate({ purpose: 'user_id' }, { $inc: { seq: 1 }, purpose: 'user_id' }, {
        new: true,
        upsert: true
      }).exec()
      // get linking doctor ID
      let refIdUsed
      let medicalContactObj
      if (req.body.refId) {
        refIdUsed = req.body.refId
        const creator = await Doctor.findOne({ refId: req.body.refId })
        if (creator) {
          created = creator.userId
          if (creator.lastName) {
            creatorName = creator.firstName + ' ' + creator.lastName
          } else {
            creatorName = creator.firstName
          }
          medicalContactObj = [{
            contactUserId: created,
            contactUserName: creatorName
          }]
        } else {
          const creator2 = await Doctor.findOne({ userId: req.body.createdBy })
          refIdUsed = null
          created = req.body.createdBy
          if (creator2.lastName) {
            creatorName = creator2.firstName + ' ' + creator2.lastName
          } else {
            creatorName = creator2.firstName
          }
          medicalContactObj = [{
            contactUserId: req.body.createdBy,
            contactUserName: creatorName,
            approved: 1
          }]
        }
      } else {
        const creator1 = await Doctor.findOne({ userId: req.body.createdBy })
        refIdUsed = null
        created = req.body.createdBy
        if (creator1.lastName) {
          creatorName = creator1.firstName + ' ' + creator1.lastName
        } else {
          creatorName = creator1.firstName
        }
        medicalContactObj = [{
          contactUserId: req.body.createdBy,
          contactUserName: creatorName,
          approved: 1
        }]
      }
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
      const patient = new Patient({
        userId: patientUserId.seq,
        firstName: req.body.firstName,
        lastName: req.body.lastName,
        email: req.body.email,
        countryCode: req.body.countryCode,
        mobile: req.body.mobile,
        gender: req.body.gender,
        address: req.body.address,
        zipCode: req.body.zipCode,
        town: req.body.town,
        country: req.body.country,
        birthday: req.body.birthday,
        weight: req.body.weight,
        height: req.body.height,
        activities: activityObject,
        healthHistory: diseaseObject,
        intensity: req.body.intensity,
        status: 1,
        role: 'patient',
        createdBy: created,
        refIdUsed: refIdUsed,
        medicalContacts: medicalContactObj
      })
      await patient.save(async function (err, data) {
        if (err) {
          res.send({ code: 204, message: 'Failed to save patient' })
        } else {
          if (req.body.refId) {
            const alerts = new Alert({ from: patient.userId, to: patient.createdBy, notifyTo: patient.createdBy, priority: 3, type: 'incoming', description: patient.firstName + ' ' + patient.lastName + ' is trying to add you as Medical contact' })
            await alerts.save()
          }
          res.send({ code: 200, message: 'Success' })
        }
      })
    }
  } catch (err) {
    res.send({ code: 204, success: false })
  }
})

router.post('/login', [(body('email')),
  body('password')
    .isLength({ min: 8 }).withMessage('Your password is less than 8 characters').trim()
], async function (req, res, next) {
  const errors = validationResult(req)
  if (!errors.isEmpty()) {
    res.status(200).json({ code: 204, message: 'Your password is less than 8 characters' })
    return
  }
  await User.findOne({ email: req.body.email }, function (err, user) {
    if (err) {
      res.send({ code: 204, message: 'Invalid Credentials' })
      return
    }
    if (!user) {
      res.send({ code: 204, message: 'Invalid Credentials' })
      return
    }
    if (user.verified === 0) {
      res.send({ code: 204, message: 'User is not verified yet' })
      return
    }
    User.comparePassword(req.body.password, user.password, async function (err1, isMatch) {
      if (err) {
        res.send({ code: 204, message: 'Invalid Credentials' })
      }
      if (isMatch) {
        const doctorData = await Doctor.findOne({ userId: user.id }).exec()
        /** Sign user JWT token */
        const payload = {
          email: user.email
        }
        const options = {
          expiresIn: '2400h'
        }
        const data = []
        jwt.sign(payload, env.jwtSecretKey, options, (err, token) => {
          if (err) {
            data.push(user)
            data.push(doctorData)
            res.send({ code: 200, message: 'Success', data: data })
          } else if (token) {
            user.token = token
            data.push(user)
            data.push(doctorData)
            res.send({ code: 200, message: 'Success', data: data })
          } else {
            data.push(user)
            data.push(doctorData)
            res.send({ code: 200, message: 'Success', data: data })
          }
        })
      } else {
        res.send({ code: 204, message: 'Invalid Credentials' })
      }
    })
  })
})

router.post('/verifyOTP', async function (req, res) {
  if (req.body.userId && req.body.otp) {
    const getOTP = await User.findOne({ id: req.body.userId, otp: req.body.otp })
    if (getOTP) {
      await User.updateOne({ id: req.body.userId }, { verified: 1 }).exec()
      await Doctor.updateOne({ userId: req.body.userId }, { status: 1 }).exec()
      res.send({ code: 200, message: 'Success' })
    } else {
      res.send({ code: 204, message: 'Invalid OTP' })
    }
  } else {
    res.send({ code: 204, message: 'Invalid OTP' })
  }
})

router.post('/resendOTP', async function (req, res) {
  if (req.body.userId) {
    const otp = Math.floor(100000 + Math.random() * 900000)
    const messageBodyAttributes = {
      toEmailAddress: req.body.email,
      subject: "Health Traker - Account Verification OTP"
    };
    const templateBody = "<p>Hello User,</p><p>Your OTP for account verification is <b>"+ otp +".</b></p><p>Please use this in your mobile app to verify your account and continue.</p><br><p><i>Regards,</p><p><i>Team Health Traker</p>";
    const messageBody = mark.up(templateBody, messageBodyAttributes);
    const emailParams = {
        Destination: {
            ToAddresses: [
              req.body.email
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
          console.log("Registration Email error")
            console.log(err)
        } else {
            //console.log("Email sent successfully")
        }
    });
    const newOTP = await User.updateOne({ id: req.body.userId }, { otp: otp }).exec()
    if (newOTP) {
      res.send({ code: 200, message: 'Success', otp: otp })
    } else {
      res.send({ code: 204, message: 'Invalid OTP' })
    }
  } else {
    res.send({ code: 204, message: 'Invalid OTP' })
  }
})

passport.use(new LocalStrategy({ usernameField: 'email' },
  // eslint-disable-next-line camelcase
  async function (email, password, done) {
    if (email) {
      await User.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(null, false, { error: 'Unknown User' })
        }
        if (!user) {
          return done(null, false, { error: 'Unknown User' })
        }
        if (user.status === false || user.deleted === true) {
          return done(null, false, { error: 'Please contact admin to activate your account' })
        }
        User.comparePassword(password, user.password, function (err, isMatch) {
          if (err) {
            return done(err, null)
          }
          if (isMatch) {
            return done(null, user)
          } else {
            return done(null, false)
          }
        })
      })
    } else {
      await User.findOne({ email: email }, function (err, user) {
        if (err) {
          return done(null, false, { error: 'Unknown User' })
        }
        if (!user) {
          return done(null, false, { error: 'Unknown User' })
        }
        // if (user.status === false || user.deleted === true) {
        //   return done(null, false, { error: 'Please contact admin to activate your account' })
        // }
        User.comparePassword(password, user.password, function (err, isMatch) {
          if (err) {
            return done(err, null)
          }
          if (isMatch) {
            return done(null, user)
          } else {
            return done(null, false)
          }
        })
      })
    }
    // return
  })
)

passport.serializeUser(function (user, done) {
  done(null, user)
})

passport.deserializeUser(function (user, done) {
  User.findOne({ _id: user._id }, function (err, user) {
    done(err, user)
  })
})


/**
 * Data validation.
 * @param  {String} data Phone number valdation.
 * @return {Promise<boolean>} True or False
 */
function validate (data) {
  if (!data || ((typeof data === 'string') ? data.trim() : data) === '') {
    return false
  } else {
    return true
  }
}

function validateEmail (email) {
  const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return regex.test(email)
}

module.exports = router
