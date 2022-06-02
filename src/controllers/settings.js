const express = require('express')
const router = express.Router()
const Brand = require('../models/Settings')
const authService = require('../services/authService')
const paginator = require('../helpers/paginatorV2')

router.get('/', authService.ensureAuthenticated, function (req, res, next) {
  const options = {
    page: req.query.page,
    limit: 10,
    sort: { createdAt: -1 }
  }
  Brand.paginate({ deleted: false }, options, function (err, brands) {
    if (err) {
      res.redirect('/dashboard')
    } else {
      if (req.query.page) {
        var currentPage = req.query.page
      } else {
        var currentPage = 1
      }
      res.render('brands/index', {
        brands: brands,
        paginator: paginator
      })
    }
  })
})

module.exports = router
