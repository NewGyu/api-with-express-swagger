'use strict';

var url = require('url');


var Default = require('./DefaultService');


module.exports.getPetsById = function getPetsById (req, res, next) {
  Default.getPetsById(req.swagger.params, res, next);
};
