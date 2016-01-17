var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var swaggerTools = require('swagger-tools');
var jsyaml = require('js-yaml');
var fs = require('fs');
var path = require("path");


module.exports = new Promise(function(resolve,reject){
  var app = express();
  
  // view engine setup
  app.set('views', path.join(__dirname, 'views'));
  app.set('view engine', 'jade');

  // The Swagger document (require it, build it programmatically, fetch it from a URL, ...)
  var spec = fs.readFileSync(path.join(__dirname,'swagger.yaml'), 'utf8');
  var swaggerDoc = jsyaml.safeLoad(spec);

  new Promise(function(resolve,reject){
    swaggerTools.initializeMiddleware(swaggerDoc, function (middleware) {
      resolve(middleware);
    });
  }).then(function(middleware){
    // Interpret Swagger resources and attach metadata to request - must be first in swagger-tools middleware chain
    app.use(middleware.swaggerMetadata());
    // Validate Swagger requests
    app.use(middleware.swaggerValidator());
    // Route validated requests to appropriate controller
    app.use(middleware.swaggerRouter({
      swaggerUi: '/swagger.json',
      controllers: "./controllers",
      useStubs: process.env.NODE_ENV === 'development' ? true : true // Conditionally turn on stubs (mock mode)
    }));
    // Serve the Swagger documents and Swagger UI
    app.use(middleware.swaggerUi());
  }).then(function(){
    var routes = require('./routes/index');
    var users = require('./routes/users');

    // uncomment after placing your favicon in /public
    //app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
    app.use(logger('dev'));
    app.use(bodyParser.json());
    app.use(bodyParser.urlencoded({ extended: false }));
    app.use(cookieParser());
    app.use(express.static(path.join(__dirname, 'public')));
    app.use('/', routes);
    app.use('/users', users);

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
    
  }).then(function(){
    resolve(app);
  })
});
