'use strict';
const HttpStatus = require('http-status');
const _ = require('lodash');

class RealizationCheckMiddleware {
  constructor(app) {
    this.app = app;

    this.dependencies = app.dependencies || [];
  }

  dependenciesAreRealized() {
    return (req, res, next) => {
      let proxy = this.app.proxy;
      console.log("Checking dependencies");
      proxy.table().then((cache) => {
        // Where do I get dependent service types?
        let realized = [];
        console.log(this.dependencies);
        for(let d in this.dependencies) {
          let realizedDep = _.find(cache, {type:this.dependencies[d]});
          console.log(realizedDep);
        }

        let fullyRealized = false;
        let missing = null;


        if(fullyRealized) {
          next();
        } else {
          res.status(HttpStatus.SERVICE_UNAVAILABLE).send({
            errorMessage: `Missing dependency ${missing}`
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
