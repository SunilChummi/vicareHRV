const request = require('request')
const env = require('../config/environments/env.js')
const config = require(`../config/environments/${env.env}.js`)

module.exports.getGUID = function (path) {
  return new Promise((resolve, reject) => {
    request({
      method: 'POST',
      url: 'hrdayin20528main.myhrv.de/uploadhrdayinrr.php',
      body: {
        ecgfile1: ''
      },
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      json: true
    }, (err, body) => {
      if (err) {
        reject(err)
      } else {
        resolve(body)
      }
    })
  })
}

module.exports.allData = function (GUID) {
  // console.log('http://hrdayin20528main.myhrv.de/results/' + GUID + '.pdf')
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      url: config.reportURL + 'getresults.php/' + GUID + '/ResultSetComplete',
      headers: {
        'Content-Type': 'application/json'
      },
      json: true
    }, (err, success) => {
      if (err) {
        reject(err)
      } else {
        resolve(success)
      }
    })
  })
}

module.exports.recommendation = function (GUID) {
  return new Promise((resolve, reject) => {
    request({
      method: 'GET',
      url: config.reportURL + 'results/' + GUID + '.recom.txt',
      headers: {
        'Content-Type': 'application/json'
      },
      json: true
    }, (err, success) => {
      if (err) {
        reject(err)
      } else {
        resolve(success)
      }
    })
  })
}
