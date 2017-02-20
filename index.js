'use strict';
const HttpStatus = require('http-status');
const _ = require('lodash');

class RealizationCheckMiddleware {
  constructor(app) {
    this.app = app;
  }

  dependenciesAreRealized() {
    return (req, res, next) => {
      let proxy = this.app.proxy;
      console.log("Checking dependencies");
      if(proxy) {
        proxy.table().then((cache) => {
          // Where do I get dependent service types?
          let realized = [];
          let fullyRealized = false;
          let missingType = null;
          console.log('Service dependencies');
          console.log(this.app.dependencies);
          console.log('Cache');
          console.log(cache);
          for(let d in this.app.dependencies) {
            let typeToCheck = this.app.dependencies[d];
            console.log(`Checking for type ${typeToCheck}`);
            let realizedDep = _.find(cache, {type:typeToCheck, status: 'Online'});
            if(realizedDep) {
              console.log(realizedDep.type);
              realized.push(realizedDep.type);
            } else {
              console.log(`Missing type ${this.app.dependencies[d]}`);
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
