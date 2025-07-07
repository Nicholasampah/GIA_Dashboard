var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const bodyParser = require('body-parser');
const cors = require('cors');
const hbs = require('hbs');


// Import routes
const deliveryRoutes = require('./routes/deliveries');
const discrepancyRoutes = require('./routes/discrepancies');
const apiRoutes = require('./routes/api');

var app = express();

app.use(logger('combined'));


// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// Register Handlebars helpers
hbs.registerHelper('eq', function(a, b) {
  return a === b;
});

hbs.registerHelper('formatDate', function(date) {
  const moment = require('moment');
  return moment(date).format('YYYY-MM-DD');
});

hbs.registerHelper('formatDateTime', function(date) {
  const moment = require('moment');
  return moment(date).format('YYYY MMM DD, HH:mm');
});

hbs.registerHelper('formatDateInput', function(date) {
  if (!date) return '';
  const moment = require('moment');
  return moment(date).format('YYYY-MM-DD');
});

hbs.registerHelper('statusClass', function(status) {
  switch(status) {
    case 'Reported': return 'status-reported';
    case 'Open': return 'status-open';
    case 'Not Reported': return 'status-not-reported';
    default: return 'status-open';
  }
});

hbs.registerHelper('discrepancyClass', function(type) {
  return type.toLowerCase();
});

hbs.registerHelper('json', function(obj) {
  return JSON.stringify(obj);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Routes
app.use('/', deliveryRoutes);
app.use('/api', apiRoutes);
app.use('/discrepancies', discrepancyRoutes);

// catch 404 and forward to error handler
app.use((req, res) => {
  res.status(404).render('404', {
    title: 'Page Not Found',
    message: 'The page you are looking for does not exist.'
  });
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
