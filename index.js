'use strict';
const HttpStatus = require('http-status');

class RealizationCheck {
  constructor(app) {
    this.app = app;

    this.dependencies = app.serviceDependencies || [];
  }

  dependenciesAreRealized() {
    let proxy = app.proxy;

    return (req, res, next) => {
      proxy.table().then((cache) => {
        // Where do I get dependent service types?
        let realized = [];

        for(let item in cache) {
          realized.push(cache[item].type);
        }

        let fullyRealized = true;
        let missing = null;
        for(let d in this.dependencies) {
          if(realized.indexOf(this.dependencies[d]) == -1) {
            fullyRealized = false;
            missing = this.dependencies[d];
            break;
          }
        }

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

module.exports = RealizationCheck;
