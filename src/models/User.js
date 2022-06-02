const mongoose = require('mongoose')
const Schema = mongoose.Schema
const bcrypt = require('bcryptjs')
const SALT_WORK_FACTOR = 10

const UserSchema = new Schema({
  id: { type: Number, required: false, index: true },
  token: { type: String, default: null },
  email: { type: String, required: false }, // unique: true
  password: { type: String, required: false },
  countryCode: { type: String, required: false, index: true },
  mobile: { type: Number, required: false, index: true },
  status: { type: Number, default: 0 },
  role: { type: String, required: false, index: true },
  otp: { type: Number, required: false },
  verified: { type: Number, required: false, index: true },
  created: { type: Date, default: Date.now, index: true },
  updated: { type: Date, default: Date.now, index: true }
})

UserSchema.pre('save', function (next) {
  const user = this
  bcrypt.genSalt(SALT_WORK_FACTOR, function (err, salt) {
    if (err) return next(err)
    bcrypt.hash(user.password, salt, function (err1, hash) {
      if (err1) return next(err1)
      user.password = hash
      next()
    })
  })
})
UserSchema.index({ location: '2dsphere' })

const User = mongoose.model('User', UserSchema)
module.exports = User
module.exports.comparePassword = function (candidatePassword, hash, callback) {
  bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
    if (err) throw err
    callback(null, isMatch)
  })
}

module.exports.hashThePassword = async function (newpassword) {
  const saltRounds = 10
  const hashedPassword = await new Promise((resolve, reject) => {
    bcrypt.hash(newpassword, saltRounds, function (err, hash) {
      if (err) reject(err)
      resolve(hash)
    })
  })
  return hashedPassword
}

module.exports.passwordValidate = function (req, form_method) {
  req.checkBody('password', 'Password can not be empty').notEmpty()
  req.checkBody('confirmPassword', 'Confirm Password can not be empty').notEmpty()
}

module.exports.validate = (data) => {
  if (!data || ((typeof data === 'string') ? data.trim() : data) === '') {
    return false
  } else {
    return true
  }
}

module.exports.validateEmail = (email) => {
  const regex = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/
  return regex.test(email)
}
