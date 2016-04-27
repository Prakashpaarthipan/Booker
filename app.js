var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var mongoose = require('mongoose');
mongoose.connect("mongodb://localhost/Booker")

// redis
var redis = require('redis');
global.pub = redis.createClient();
global.sub = redis.createClient();

var routes = require('./routes/index');


var book = require('./routes/book');
var api = require('./routes/api');

var app = express();

var http = require('http');
var server = http.createServer(app);
var io = require("socket.io").listen(server);
server.listen(8056);


io.on('connection', function(socket){
  console.log(io.engine.clientsCount + " client connected.");
  global.socket = socket;
  
  
  
  socket.on('disconnect', function(){
    console.log(io.engine.clientsCount + " client after disconnecct.");
  });
  
});




// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
// session
app.use(session({
    secret : 'this is my secret',
    resave: true,
    saveUninitialized: true  
}));
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);

var users = require('./routes/users');
app.use('/users', users);

var search = require('./routes/search');
app.use('/search', search);

app.use('/book', book);
app.use('/api', api);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

/**
 * Error handlers for API request
 */
app.use('/api', function(err, req, res, next){
    res.status(err.status || 500);
    res.json({message : err.message});
});

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err,
      loginInfo : {}
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




console.log('server running at port 3000');

module.exports = app;
