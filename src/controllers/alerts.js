const express = require('express')
const router = express.Router()
const authService = require('../services/authService')


router.get('/edit/:id', authService.ensureAuthenticated, async function (req, res, next) {
  if (req.params.id) {
    
  } else {
    req.flash('error', 'There was an error in retrieving brand information, please try again')
    res.redirect('/brands')
  }
})

module.exports = router
