var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var session = require('express-session');
var OAuth = require('oauth');


var routes = require('./routes/index');
var users = require('./routes/users');
var posts = require('./routes/posts');
var config = require('./config');
var user = {};
var oa;

var app = express();

//Passport-twitter
var passport = require('passport')
, TwitterStrategy = require('passport-twitter').Strategy;

passport.use(new TwitterStrategy({
  consumerKey: config.consumerKey,
  consumerSecret: config.consumerSecret,
  callbackURL: "http://localhost:3000/authn/twitter/callback"
  },
  function(token, tokenSecret, profile, done) {
  /*  User.findOrCreate(..., function(err, user) {
      if (err) { return done(err); }
      done(null, user);
    });*/
    user.token = token;
    user.tokenSecret  = tokenSecret;
    user.profile = profile;
    initTwitterOath();
    console.log(user);
    done(null, user);
  }
));



function initTwitterOath(){
  var sys = require('sys');
  var OAuth= require('oauth').OAuth;
  oa = new OAuth("https://twitter.com/oauth/request_token",
  "https://twitter.com/oauth/access_token",
  config.consumerKey, config.consumerSecret,
  "1.0A", "http://localhost:3000/authn/callback", "HMAC-SHA1");
}

function makeTweet(cb){
  oa.post(
    "https://api.twitter.com/1.1/statuses/update.json",
    user.Token, user.TokenSecret,
  {"status":"hackday anyone?"},
    function(error, data) {
      if(error) {
        console.log(require('sys').inspect(error));
      } else {
        console.log(data);
      }
      cb(error, data);
    }
  );
}

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(session({
  secret: process.env.SESSION_SECRET || 'secret',
  resave: false,
  saveUninitialized: false
}));
app.use(express.static(path.join(__dirname, 'public')));
app.use(passport.initialize());
app.use(passport.session());

passport.serializeUser(function(user, done) {
  done(null, user);
});

passport.deserializeUser(function(user, done) {
  done(null, user);
});





//Routes
app.use('/', routes);
app.use('/users', users);
app.use('/posts', posts);
app.get('/authn/twitter', passport.authenticate('twitter'));
app.get('/authn/twitter/callback',
  passport.authenticate('twitter', { successRedirect: '/',
  failureRedirect: '/login' }));
app.get('/twitter/tweet', function(req, res){
  makeTweet(function(error,data){
    if(error){
      console.log(require('sys').inspect(error));
      res.send('bad')
    } else {
      console.log(data);
    }
  });
  res.end('yay');
});


// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
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


module.exports = app;
