/*
 *  VITacademics
 *  Copyright (C) 2014  Aneesh Neelam <neelam.aneesh@gmail.com>
 *  Copyright (C) 2014  Karthik Balakrishnan <karthikb351@gmail.com>
 *  Copyright (C) 2014  Sreeram Boyapati <sreeram.boyapati2011@gmail.com>
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var express = require('express');
var favicon = require('serve-favicon');
var csrf = require('csurf');
var session = require('express-session');
var ga = require('node-ga');
var logger = require('morgan');
var path = require('path');

var newrelic;
if (process.env.NEWRELIC_APP_NAME && process.env.NEWRELIC_LICENSE) {
    newrelic = require('newrelic');
}

var log;
if (process.env.LOGENTRIES_TOKEN) {
    var logentries = require('node-logentries');
    log = logentries.logger({
                                token: process.env.LOGENTRIES_TOKEN
                            });
}

var routes = require(path.join(__dirname, 'routes', 'web', 'index'));
var test_routes = require(path.join(__dirname, 'routes', 'tests', 'index'));
var api_vellore = require(path.join(__dirname, 'routes', 'api', 'vellore', 'index'));
var api_vellore_login = require(path.join(__dirname, 'routes', 'api', 'vellore', 'login'));
var api_vellore_data = require(path.join(__dirname, 'routes', 'api', 'vellore', 'data'));
var api_vellore_friends = require(path.join(__dirname, 'routes', 'api', 'vellore', 'friends'));
var api_chennai = require(path.join(__dirname, 'routes', 'api', 'chennai', 'index'));
var api_chennai_login = require(path.join(__dirname, 'routes', 'api', 'chennai', 'login'));
var api_chennai_data = require(path.join(__dirname, 'routes', 'api', 'chennai', 'data'));
var api_chennai_friends = require(path.join(__dirname, 'routes', 'api', 'chennai', 'friends'));

var app = express();

if (newrelic) {
    app.locals.newrelic = newrelic;
}

var loggerLevel = process.env.LOGGER_LEVEL || 'dev';
app.use(logger(loggerLevel));

app.set('title', 'VITacademics');
app.use(express.static(path.join(__dirname, 'public')));
app.use(favicon(path.join(__dirname, 'public', 'images', 'favicon.png')));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

var secret = process.env.SECRET_KEY || 'randomsecretstring';
app.use(cookieParser(secret, {signed: true}));

// ***CSRF Protection***
//Initializing sessions (backend storage)
app.use(session({
                    secret: secret,
    resave: false,
    saveUninitialized: true
}));
app.use(csrf());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

var GoogleAnalytics = process.env.GOOGLE_ANALYTICS || 'UA-35429946-2';
app.use(ga(GoogleAnalytics, {
    safe: true
}));

// Allow cross-origin resource sharing
app.use(function(req, res, next) {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

app.use('/', routes);
app.use('/tests', test_routes);
app.use('/api/vellore', api_vellore);
app.use('/api/vellore/login', api_vellore_login);
app.use('/api/vellore/data', api_vellore_data);
app.use('/api/vellore/friends', api_vellore_friends);
app.use('/api/chennai', api_chennai);
app.use('/api/chennai/login', api_chennai_login);
app.use('/api/chennai/data', api_chennai_data);
app.use('/api/chennai/friends', api_chennai_friends);
//***
//
// catch 404 and forward to error handler
app.use(function (req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers
// development error handler, will print stacktrace
if (app.get('env') === 'development') {
    app.use(function (err, req, res, next) {
        if (log) {
            log.log('debug', {Error: err, Message: err.message});
        }
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            status: err.status,
            stack: err.stack,
            GoogleAnalytics: GoogleAnalytics
        });
    });
}

// production error handler, no stacktraces leaked to user
app.use(function (err, req, res, next) {
    if (log) {
        log.log('debug', {Error: err, Message: err.message});
    }
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        status: err.status,
        stack: '',
        GoogleAnalytics: GoogleAnalytics
    });
});

module.exports = app;
