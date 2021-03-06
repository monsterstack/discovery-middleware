'use strict';
const config = require('config');
const HttpStatus = require('http-status');
const _ = require('lodash');

class RealizationCheckMiddleware {
  constructor(app) {
    this.app = app;
  }

  dependenciesAreRealized() {
    return (req, res, next) => {
      let proxy = this.app.proxy;
      if (config.realizationDependencyCheck === false) {
        next();
      } else if(proxy) {
        proxy.table().then((cache) => {
          // Where do I get dependent service types?
          let realized = [];
          let fullyRealized = false;
          let missingType = null;
          for(let d in this.app.dependencies) {
            let typeToCheck = this.app.dependencies[d];
            let realizedDep = _.find(cache, {type:typeToCheck, status: 'Online'});
            if(realizedDep) {
              realized.push(realizedDep.type);
            } else {
              missingType = this.app.dependencies[d];
              break;
            }
          }

          if(_.isEmpty(_.xor(this.app.dependencies, realized))) {
            fullyRealized = true;
          }

          if(fullyRealized) {
            next();
          } else {
            res.status(HttpStatus.SERVICE_UNAVAILABLE).send({
              errorMessage: `Missing service dependency ${missingType}`
            });
          }
        }).catch((err) => {
          res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
            errorMessage: err.message
          });
        });
      } else {
        // No bound proxy.
        res.status(HttpStatus.SERVICE_UNAVAILABLE).send({
            errorMessage: `Missing service dependency - all`
        });
      }
    }
  }

}

module.exports.RealizationCheckMiddleware = RealizationCheckMiddleware;