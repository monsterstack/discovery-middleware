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
        let fullyRealized = false;

        for(let d in this.app.dependencies) {
          let realizedDep = _.find(cache, {type:this.app.dependencies[d]});
          if(realizedDep) {
            if(realizedDep instanceof Array) {
              realized.push(realizedDep[0].type);
            } else {
              realized.push(realized.type);
            }
          } else {
            console.log(this.app.dependencies[d]);
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
            errorMessage: `Missing service dependency`
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
