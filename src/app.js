const express = require('express');
const bodyParser = require('body-parser');
const app = express();
app.use(express.json());
const path = require('path');
app.use(bodyParser.json());
const env = require(`./config/environments/env.js`);
const config = require(`./config/environments/${env.env}.js`);
const session = require('express-session');
const passport = require('passport');
const MongoStore = require('connect-mongo')(session);
const expressLayouts = require('express-ejs-layouts');
const dynamicMenu = require("./helpers/dynamicMenu");
const authService = require('./services/authService')
app.use(bodyParser.urlencoded({ extended: true}));
const expressValidator = require('express-validator');
const async = require('asyncawait/async');
const await = require('asyncawait/await');
const flash = require('express-flash');
const cors = require('cors');
const mongoose = require('mongoose');
mongoose.set('useCreateIndex', true);
mongoose.connect(config.mongoDBConnectionString, {useNewUrlParser: true, useUnifiedTopology: true});
const connection = mongoose.createConnection(config.mongoDBConnectionString, {useNewUrlParser: true, useUnifiedTopology: true});
app.use(cors());
app.use(session({
  key: 'ahmtmupsxNslxw',
  secret: 'ahmt0i785z3PVU6Xf7ukf2Wb',
  store: new MongoStore({ mongooseConnection: connection }),
  resave: true,
  saveUninitialized: true,
  proxy : true,
  secure: false,
  cookie: {
    secure: false,
    proxy: true
  }
}));

const User = require('./models/User')

app.use((req, res, next) => {
  req.session.reload(function(err) {
    req.session.user = req.user;
  });
  if (!req.session.passport){
    res.locals.notAuthenticated = req.session.guest;
  }else{
    res.locals.notAuthenticated = '';
  }
  res.locals.isAuthenticated = req.session.passport;
  res.locals.cartItems = 0;
  const ObjectId = require('mongodb').ObjectId
  next();
});

app.use(express.static('public'));
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.set('layout', 'layouts/layout');

app.use(expressLayouts);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());

app.get('/admin',function(req, res, next){
  res.redirect(301, "/users/sign_in");
});

let users = require('./controllers/users');
app.use('/users', users);

let patients = require('./controllers/patient');
app.use('/patients', patients);

let doctors = require('./controllers/doctor');
app.use('/doctors', doctors);

let recorders = require('./controllers/recorder');
app.use('/recorders', recorders);

let recassoc = require('./controllers/recassoc');
app.use('/recassoc', recassoc)

let questions = require('./controllers/questions');
app.use('/questions', questions)

let settings = require('./controllers/settings');
app.use('/settings', settings)

let alerts = require('./controllers/alerts');
app.use('/alerts', alerts)

let tests = require('./controllers/test');
app.use('/test', tests)

let reports = require('./controllers/reports');
app.use('/reports', reports)

let stats = require('./controllers/stats');
app.use('/stats', stats)

let testMessage = require('./controllers/testMessage');
app.use('/testMessage', testMessage)

module.exports = app;