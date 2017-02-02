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
      proxy.table().then((cache) => {
        // Where do I get dependent service types?
        let realized = [];
        console.log(this.app.dependencies);
        let fullyRealized = false;
        let missingDepName = null;

        for(let d in this.app.dependencies) {
          let realizedDep = _.find(cache, {type:this.app.dependencies[d]});
          if(realizedDep) {
            if(realizedDep instanceof Array) {
              realized.push(realizedDep[0].type);
            } else {
              realized.push(realized.type);
            }
          } else {
            missingDepName = this.app.dependencies[d];
            break;
          }
        }

        console.log(_.isEmpty(_.xor(this.app.dependencies, realized)));
        if(!_.isEmpty(_.xor(this.app.dependencies, realized))) {
          fullyRealized = true;
        }

        if(fullyRealized) {
          next();
        } else {
          res.status(HttpStatus.SERVICE_UNAVAILABLE).send({
            errorMessage: `Missing dependency ${missingDepName}`
          });
        }
      }).catch((err) => {
        res.status(HttpStatus.INTERNAL_SERVER_ERROR).send({
          errorMessage: err.message
        });
      });
    }
  }

}

module.exports.RealizationCheckMiddleware = RealizationCheckMiddleware;
